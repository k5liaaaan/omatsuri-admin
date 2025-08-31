const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 管理者アカウントの情報
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123' // 本番環境では強力なパスワードを使用してください
    };

    console.log('管理者アカウントを作成します...');
    console.log('ユーザー名:', adminData.username);
    console.log('メールアドレス:', adminData.email);
    console.log('パスワード:', adminData.password);
    console.log('');

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      }
    });

    if (existingUser) {
      console.log('管理者アカウントは既に存在します:', existingUser.username);
      return;
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(adminData.password);

    // 管理者ユーザーを作成
    const adminUser = await prisma.user.create({
      data: {
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    console.log('管理者アカウントが作成されました:');
    console.log('ユーザー名:', adminUser.username);
    console.log('メールアドレス:', adminUser.email);
    console.log('作成日時:', adminUser.createdAt);
    console.log('\nログイン情報:');
    console.log('ユーザー名: admin');
    console.log('パスワード: admin123');

  } catch (error) {
    console.error('管理者アカウントの作成に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
createAdminUser();
