const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // 管理者アカウントの作成
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      }
    });

    console.log('管理者アカウントが作成されました:', admin);

    // 都道府県データの作成
    const prefectures = [
      { code: '12', name: '千葉県' },
      { code: '13', name: '東京都' },
      { code: '14', name: '神奈川県' }
    ];

    for (const pref of prefectures) {
      const prefecture = await prisma.prefecture.create({
        data: pref
      });
      console.log('都道府県を作成しました:', prefecture);

      // 市区町村データの作成
      if (pref.code === '12') { // 千葉県
        const municipalities = [
          { code: '12101', name: '千葉市中央区', prefectureId: prefecture.id },
          { code: '12102', name: '千葉市花見川区', prefectureId: prefecture.id },
          { code: '12103', name: '千葉市稲毛区', prefectureId: prefecture.id },
          { code: '12104', name: '千葉市若葉区', prefectureId: prefecture.id },
          { code: '12105', name: '千葉市緑区', prefectureId: prefecture.id },
          { code: '12106', name: '千葉市美浜区', prefectureId: prefecture.id },
          { code: '12201', name: '柏市', prefectureId: prefecture.id }
        ];

        for (const mun of municipalities) {
          await prisma.municipality.create({
            data: mun
          });
          console.log('市区町村を作成しました:', mun.name);
        }
      }
    }

    console.log('初期データの作成が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
