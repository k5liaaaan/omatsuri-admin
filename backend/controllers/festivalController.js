const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// お祭り一覧取得
const getFestivals = async (req, res) => {
  try {
    const festivals = await prisma.festival.findMany({
      include: {
        municipality: {
          include: {
            prefecture: true
          }
        },
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json(festivals);
  } catch (error) {
    console.error('お祭り一覧取得エラー:', error);
    res.status(500).json({ error: 'お祭り一覧の取得に失敗しました' });
  }
};

// お祭り登録
const createFestival = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      municipalityId,
      address,
      content,
      foodStalls,
      sponsors
    } = req.body;

    const organizerId = req.user.id; // 認証ミドルウェアから取得

    // バリデーション
    if (!startDate || !endDate || !municipalityId || !address || !content) {
      return res.status(400).json({ error: '必須項目が不足しています' });
    }

    // 日付の妥当性チェック
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ error: '終了日時は開始日時より後である必要があります' });
    }

    // 市区町村の存在確認
    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId }
    });

    if (!municipality) {
      return res.status(400).json({ error: '指定された市区町村が見つかりません' });
    }

    const festival = await prisma.festival.create({
      data: {
        startDate: start,
        endDate: end,
        municipalityId,
        address,
        content,
        foodStalls: foodStalls || null,
        sponsors: sponsors || null,
        organizerId
      },
      include: {
        municipality: {
          include: {
            prefecture: true
          }
        },
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(festival);
  } catch (error) {
    console.error('お祭り登録エラー:', error);
    res.status(500).json({ error: 'お祭りの登録に失敗しました' });
  }
};

// ユーザーが登録したお祭り一覧取得
const getUserFestivals = async (req, res) => {
  try {
    const userId = req.user.id;

    const festivals = await prisma.festival.findMany({
      where: {
        organizerId: userId
      },
      include: {
        municipality: {
          include: {
            prefecture: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json(festivals);
  } catch (error) {
    console.error('ユーザーお祭り一覧取得エラー:', error);
    res.status(500).json({ error: 'お祭り一覧の取得に失敗しました' });
  }
};

module.exports = {
  getFestivals,
  createFestival,
  getUserFestivals
};
