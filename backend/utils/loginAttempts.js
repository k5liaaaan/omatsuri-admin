const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ログイン試行回数の制限設定
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15分（ミリ秒）

// ログイン試行回数を記録
const recordLoginAttempt = async (username, success = false) => {
  try {
    const now = new Date();
    
    // 既存の試行記録を取得
    const existingAttempts = await prisma.loginAttempt.findMany({
      where: {
        username: username,
        createdAt: {
          gte: new Date(now.getTime() - LOCKOUT_DURATION)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 新しい試行を記録
    await prisma.loginAttempt.create({
      data: {
        username: username,
        success: success,
        ipAddress: 'unknown', // 必要に応じてIPアドレスも記録
        createdAt: now
      }
    });

    // 成功した場合は、過去の失敗試行をクリア
    if (success) {
      await prisma.loginAttempt.deleteMany({
        where: {
          username: username,
          success: false
        }
      });
    }

    return {
      attempts: existingAttempts.length + 1,
      isLocked: !success && existingAttempts.length >= MAX_LOGIN_ATTEMPTS - 1,
      remainingTime: 0
    };
  } catch (error) {
    console.error('ログイン試行記録エラー:', error);
    return { attempts: 0, isLocked: false, remainingTime: 0 };
  }
};

// ログイン試行回数をチェック
const checkLoginAttempts = async (username) => {
  try {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - LOCKOUT_DURATION);

    // 過去15分間の失敗試行を取得
    const failedAttempts = await prisma.loginAttempt.findMany({
      where: {
        username: username,
        success: false,
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    if (failedAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      // 最新の失敗試行から15分経過しているかチェック
      const latestAttempt = failedAttempts[0];
      const timeSinceLastAttempt = now.getTime() - latestAttempt.createdAt.getTime();
      const remainingTime = Math.max(0, LOCKOUT_DURATION - timeSinceLastAttempt);

      return {
        isLocked: remainingTime > 0,
        attempts: failedAttempts.length,
        remainingTime: remainingTime,
        message: remainingTime > 0 
          ? `ログイン試行回数が上限に達しました。${Math.ceil(remainingTime / 60000)}分後に再試行してください。`
          : null
      };
    }

    return {
      isLocked: false,
      attempts: failedAttempts.length,
      remainingTime: 0,
      message: null
    };
  } catch (error) {
    console.error('ログイン試行チェックエラー:', error);
    return { isLocked: false, attempts: 0, remainingTime: 0, message: null };
  }
};

// ログイン試行回数をリセット（ログアウト時など）
const resetLoginAttempts = async (username) => {
  try {
    await prisma.loginAttempt.deleteMany({
      where: {
        username: username,
        success: false
      }
    });
    console.log(`${username}のログイン試行回数をリセットしました`);
  } catch (error) {
    console.error('ログイン試行リセットエラー:', error);
  }
};

// 古いログイン試行記録をクリーンアップ（定期実行用）
const cleanupOldAttempts = async () => {
  try {
    const cutoffTime = new Date(Date.now() - LOCKOUT_DURATION);
    await prisma.loginAttempt.deleteMany({
      where: {
        createdAt: {
          lt: cutoffTime
        }
      }
    });
    console.log('古いログイン試行記録をクリーンアップしました');
  } catch (error) {
    console.error('ログイン試行クリーンアップエラー:', error);
  }
};

module.exports = {
  recordLoginAttempt,
  checkLoginAttempts,
  resetLoginAttempts,
  cleanupOldAttempts,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION
};
