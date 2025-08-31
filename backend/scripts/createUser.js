const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // コマンドライン引数からユーザー情報を取得
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('使用方法: node scripts/createUser.js <username> <password> [email]');
      console.log('例: node scripts/createUser.js john password123 john@example.com');
      return;
    }

    const username = args[0];
    const password = args[1];
    const email = args[2] || `${username}@example.com`;

    console.log('新しいユーザーを作成します...');
    console.log('ユーザー名:', username);
    console.log('メールアドレス:', email);
    console.log('');

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      console.log('ユーザーは既に存在します:', existingUser.username);
      return;
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    console.log('ユーザーが正常に作成されました:');
    console.log('ユーザー名:', newUser.username);
    console.log('メールアドレス:', newUser.email);
    console.log('作成日時:', newUser.createdAt);
    console.log('\nログイン情報:');
    console.log('ユーザー名:', username);
    console.log('パスワード:', password);

  } catch (error) {
    console.error('ユーザーの作成に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
