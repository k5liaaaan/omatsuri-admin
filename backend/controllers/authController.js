const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { 
  recordLoginAttempt, 
  checkLoginAttempts, 
  resetLoginAttempts 
} = require('../utils/loginAttempts');

const prisma = new PrismaClient();

// バリデーションルール
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('ユーザー名は3文字以上20文字以下で入力してください')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('ユーザー名は英数字とアンダースコアのみ使用できます'),
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('パスワードは6文字以上で入力してください')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('ユーザー名を入力してください'),
  body('password')
    .notEmpty()
    .withMessage('パスワードを入力してください')
];

// ユーザー登録
const register = async (req, res) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // ユーザーの重複チェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'ユーザー名またはメールアドレスが既に使用されています' 
      });
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true
      }
    });

    // JWTトークンの生成
    const token = generateToken({ 
      userId: user.id, 
      username: user.username,
      isAdmin: user.isAdmin
    });

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
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

    res.json({
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
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
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({ user });

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
  login,
  getProfile,
  logout,
  registerValidation,
  loginValidation
};
