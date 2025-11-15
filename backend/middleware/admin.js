// 管理者チェックミドルウェア
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }

  next();
};

module.exports = admin;

