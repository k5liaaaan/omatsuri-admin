const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'アクセストークンが必要です' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('認証エラー:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'トークンの有効期限が切れています' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '無効なトークンです' });
    } else {
      return res.status(401).json({ error: '認証に失敗しました' });
    }
  }
};

module.exports = auth;
