const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { generateRegistrationToken } = require('../utils/token');
const { sendRegistrationEmail } = require('../utils/mailer');
const { frontendBaseUrl } = require('../config/app');
const { 
  recordLoginAttempt, 
  checkLoginAttempts, 
  resetLoginAttempts 
} = require('../utils/loginAttempts');

const prisma = new PrismaClient();

// バリデーションルール
const REGISTRATION_TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 1週間

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
];

const completeRegistrationValidation = [
  body('token')
    .notEmpty()
    .withMessage('トークンが無効です'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('ユーザー名は3文字以上20文字以下で入力してください')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('ユーザー名は英数字とアンダースコアのみ使用できます'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('パスワードは6文字以上で入力してください'),
  body('organizerName')
    .optional({ checkFalsy: true })
    .isLength({ max: 191 })
    .withMessage('主催団体名は191文字以内で入力してください')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('ユーザー名を入力してください'),
  body('password')
    .notEmpty()
    .withMessage('パスワードを入力してください')
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
      newEmail: true,
      expiresAt: true
    }
  });
};

// 仮登録メール送信
const register = async (req, res) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // ユーザーの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'このメールアドレスは既に登録されています'
      });
    }

    const expiresAt = new Date(Date.now() + REGISTRATION_TOKEN_VALIDITY_MS);
    const token = generateRegistrationToken();

    await prisma.pendingUserRegistration.upsert({
      where: { email: normalizedEmail },
      update: {
        token,
        expiresAt,
        completed: false,
        completedAt: null
      },
      create: {
        email: normalizedEmail,
        token,
        expiresAt
      }
    });

    const baseUrl = frontendBaseUrl.replace(/\/$/, '');
    const verificationUrl = `${baseUrl}/complete-registration?token=${encodeURIComponent(token)}`;

    try {
      await sendRegistrationEmail({
        to: normalizedEmail,
        verificationUrl,
        expiresAt
      });

      res.status(200).json({
        message: '確認用のメールを送信しました。メール内のリンクから本登録を完了してください。'
      });
    } catch (mailError) {
      console.error('Registration email send error:', mailError);
      return res.status(500).json({
        error: '確認メールの送信に失敗しました。時間をおいて再度お試しください。'
      });
    }
  } catch (error) {
    console.error('Registration (pending) error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 本登録完了
const completeRegistration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, username, password, organizerName } = req.body;
    const pending = await prisma.pendingUserRegistration.findUnique({
      where: { token }
    });

    if (!pending) {
      return res.status(400).json({ error: '登録情報が見つかりません。再度お手続きをお願いします。' });
    }

    if (pending.completed) {
      return res.status(400).json({ error: 'このトークンは既に使用されています。' });
    }

    const now = new Date();
    if (pending.expiresAt < now) {
      return res.status(400).json({ error: 'トークンの有効期限が切れています。再度仮登録を行ってください。' });
    }

    const normalizedUsername = username.trim();
    const normalizedOrganizerName = organizerName?.trim() || null;

    const [usernameExists, emailExists] = await Promise.all([
      prisma.user.findUnique({ where: { username: normalizedUsername } }),
      prisma.user.findUnique({ where: { email: pending.email } })
    ]);

    if (usernameExists) {
      return res.status(400).json({ error: 'ユーザー名は既に使用されています' });
    }

    if (emailExists) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username: normalizedUsername,
          email: pending.email,
          password: hashedPassword,
          organizerName: normalizedOrganizerName
        },
        select: {
          id: true,
          username: true,
          email: true,
          organizerName: true,
          isAdmin: true,
          createdAt: true
        }
      });

      await tx.pendingUserRegistration.update({
        where: { id: pending.id },
        data: {
          completed: true,
          completedAt: now
        }
      });

      return createdUser;
    });

    const jwtToken = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: {
        ...user,
        pendingEmailChange: null
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザーログイン
const login = async (req, res) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // ログイン試行回数をチェック
    const attemptCheck = await checkLoginAttempts(username);
    if (attemptCheck.isLocked) {
      return res.status(429).json({ 
        error: attemptCheck.message || 'ログイン試行回数が上限に達しました。しばらく時間をおいてから再試行してください。'
      });
    }

    // ユーザーの検索
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      // 失敗したログイン試行を記録
      await recordLoginAttempt(username, false);
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      // 失敗したログイン試行を記録
      await recordLoginAttempt(username, false);
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    // 成功したログイン試行を記録（失敗試行をクリア）
    await recordLoginAttempt(username, true);

    // JWTトークンの生成
    const token = generateToken({ 
      userId: user.id, 
      username: user.username,
      isAdmin: user.isAdmin
    });

    const pendingEmailChange = await getActivePendingEmailChange(user.id);

    res.json({
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        organizerName: user.organizerName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        pendingEmailChange: pendingEmailChange
          ? {
              email: pendingEmailChange.newEmail,
              expiresAt: pendingEmailChange.expiresAt
            }
          : null
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー情報の取得
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const pendingEmailChange = await getActivePendingEmailChange(user.id);

    res.json({
      user: {
        ...user,
        pendingEmailChange: pendingEmailChange
          ? {
              email: pendingEmailChange.newEmail,
              expiresAt: pendingEmailChange.expiresAt
            }
          : null
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ログアウト
const logout = async (req, res) => {
  try {
    const username = req.user.username;
    
    // ログイン試行回数をリセット
    await resetLoginAttempts(username);
    
    res.json({ 
      message: 'ログアウトしました',
      note: 'ログイン試行回数がリセットされました'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

module.exports = {
  register,
  completeRegistration,
  login,
  getProfile,
  logout,
  registerValidation,
  completeRegistrationValidation,
  loginValidation
};
