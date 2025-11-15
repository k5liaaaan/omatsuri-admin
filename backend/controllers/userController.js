const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateRegistrationToken } = require('../utils/token');
const { sendEmailChangeConfirmation } = require('../utils/mailer');
const { frontendBaseUrl } = require('../config/app');

const prisma = new PrismaClient();

const EMAIL_CHANGE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 1週間

const profileUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('現在のパスワードを入力してください'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください'),
  body('organizerName')
    .optional({ checkFalsy: true })
    .isLength({ max: 191 })
    .withMessage('主催団体名は191文字以内で入力してください'),
  body('newPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('新しいパスワードは6文字以上で入力してください'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (req.body.newPassword && !value) {
        throw new Error('新しいパスワード（確認）を入力してください');
      }
      if (req.body.newPassword && value !== req.body.newPassword) {
        throw new Error('新しいパスワードが一致しません');
      }
      return true;
    })
];

const getActivePendingEmailChange = async (userId) => {
  return prisma.pendingEmailChange.findFirst({
    where: {
      userId,
      completed: false,
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      id: true,
      newEmail: true,
      expiresAt: true,
      token: true
    }
  });
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { email, organizerName, newPassword, currentPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: '現在のパスワードが正しくありません' });
    }

    let emailChangeRequested = false;
    let newEmailNormalized = null;
    let organizerNameChanged = false;
    let passwordChanged = false;
    let normalizedOrganizerName = user.organizerName ?? null;

    if (email && email.trim().toLowerCase() !== user.email) {
      newEmailNormalized = email.trim().toLowerCase();
      emailChangeRequested = true;
    }

    if (typeof organizerName === 'string') {
      const trimmed = organizerName.trim();
      normalizedOrganizerName = trimmed.length > 0 ? trimmed : null;
      if ((user.organizerName ?? null) !== normalizedOrganizerName) {
        organizerNameChanged = true;
      }
    }

    if (newPassword) {
      passwordChanged = true;
    }

    if (!emailChangeRequested && !organizerNameChanged && !passwordChanged) {
      return res.status(400).json({ error: '変更内容を入力してください' });
    }

    const updates = {};
    if (organizerNameChanged) {
      updates.organizerName = normalizedOrganizerName;
    }

    if (passwordChanged) {
      updates.password = await hashPassword(newPassword);
    }

    let pendingEmailChangeRecord = null;
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      if (organizerNameChanged || passwordChanged) {
        await tx.user.update({
          where: { id: userId },
          data: updates
        });
      }

      if (emailChangeRequested) {
        const emailExists = await tx.user.findUnique({
          where: { email: newEmailNormalized }
        });
        if (emailExists) {
          throw new Error('EMAIL_ALREADY_IN_USE');
        }

        await tx.pendingEmailChange.updateMany({
          where: {
            userId,
            completed: false
          },
          data: {
            completed: true,
            completedAt: now
          }
        });

        const expiresAt = new Date(Date.now() + EMAIL_CHANGE_VALIDITY_MS);
        const token = generateRegistrationToken();
        pendingEmailChangeRecord = await tx.pendingEmailChange.create({
          data: {
            userId,
            newEmail: newEmailNormalized,
            token,
            expiresAt
          },
          select: {
            id: true,
            newEmail: true,
            expiresAt: true,
            token: true
          }
        });
      }

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          organizerName: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        updatedUser
      };
    });

    if (pendingEmailChangeRecord) {
      const baseUrl = frontendBaseUrl.replace(/\/$/, '');
      const verificationUrl = `${baseUrl}/confirm-email-change?token=${encodeURIComponent(pendingEmailChangeRecord.token)}`;
      try {
        await sendEmailChangeConfirmation({
          to: pendingEmailChangeRecord.newEmail,
          verificationUrl,
          expiresAt: pendingEmailChangeRecord.expiresAt
        });
      } catch (mailError) {
        console.error('Email change confirmation send error:', mailError);
        await prisma.pendingEmailChange.update({
          where: { id: pendingEmailChangeRecord.id },
          data: {
            completed: true,
            completedAt: new Date()
          }
        });
        return res.status(500).json({
          error: 'メールアドレス確認メールの送信に失敗しました。時間をおいて再度お試しください。'
        });
      }
    }

    const activePendingEmail = pendingEmailChangeRecord
      ? {
          email: pendingEmailChangeRecord.newEmail,
          expiresAt: pendingEmailChangeRecord.expiresAt
        }
      : await getActivePendingEmailChange(userId).then((record) => record && ({
          email: record.newEmail,
          expiresAt: record.expiresAt
        }));

    res.json({
      message: 'プロフィールを更新しました',
      user: result.updatedUser,
      pendingEmailChange: activePendingEmail
        ? {
            email: activePendingEmail.email,
            expiresAt: activePendingEmail.expiresAt
          }
        : null,
      emailChangeRequested: Boolean(pendingEmailChangeRecord)
    });
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_IN_USE') {
      return res.status(400).json({ error: '入力されたメールアドレスは既に使用されています' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

const confirmEmailChange = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'トークンが無効です' });
    }

    const pending = await prisma.pendingEmailChange.findUnique({
      where: { token }
    });

    if (!pending) {
      return res.status(400).json({ error: 'メール変更情報が見つかりません。再度お手続きをお願いします。' });
    }

    if (pending.completed) {
      return res.status(400).json({ error: 'このトークンは既に使用されています。' });
    }

    const now = new Date();
    if (pending.expiresAt < now) {
      return res.status(400).json({ error: 'トークンの有効期限が切れています。再度変更手続きを行ってください。' });
    }

    const emailExists = await prisma.user.findUnique({
      where: { email: pending.newEmail }
    });
    if (emailExists) {
      return res.status(400).json({ error: 'このメールアドレスは既に使用されています。別のメールアドレスをご利用ください。' });
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: pending.userId },
        data: {
          email: pending.newEmail
        }
      });

      await tx.pendingEmailChange.update({
        where: { id: pending.id },
        data: {
          completed: true,
          completedAt: now
        }
      });

      return tx.user.findUnique({
        where: { id: pending.userId },
        select: {
          id: true,
          username: true,
          email: true,
          organizerName: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    res.json({
      message: 'メールアドレスを更新しました',
      user
    });
  } catch (error) {
    console.error('Confirm email change error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー一覧取得（管理者のみ）
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        organizerName: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'ユーザー一覧の取得に失敗しました' });
  }
};

// ユーザー削除（管理者のみ）
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '無効なユーザーIDです' });
    }

    // 自分自身を削除しようとしている場合はエラー
    if (userId === req.user.userId) {
      return res.status(400).json({ error: '自分自身を削除することはできません' });
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 管理者アカウントは削除できない
    if (user.isAdmin) {
      return res.status(400).json({ error: '管理者アカウントは削除できません' });
    }

    // ユーザーを削除（関連データもCASCADEで削除される）
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      message: 'ユーザーを削除しました'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'ユーザーの削除に失敗しました' });
  }
};

module.exports = {
  profileUpdateValidation,
  updateProfile,
  confirmEmailChange,
  getUsers,
  deleteUser
};

