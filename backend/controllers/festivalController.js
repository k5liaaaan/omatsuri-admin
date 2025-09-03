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
        },
        schedules: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
    console.log('=== お祭り登録開始 ===');
    console.log('リクエストボディ:', req.body);
    console.log('認証ユーザー:', req.user);
    console.log('ユーザーID:', req.user?.id);
    
    const {
      municipalityId,
      address,
      content,
      foodStalls,
      sponsors,
      schedules
    } = req.body;

    const organizerId = req.user?.userId; // 認証ミドルウェアから取得

    // 認証チェック
    if (!organizerId) {
      console.error('認証エラー: ユーザーIDが取得できません');
      return res.status(401).json({ error: '認証が必要です' });
    }

    // バリデーション
    if (!municipalityId || !address || !content || !schedules || schedules.length === 0) {
      return res.status(400).json({ error: '必須項目が不足しています' });
    }

    // 日程のバリデーション
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.date || !schedule.startTime || !schedule.endTime) {
        return res.status(400).json({ 
          error: `日程 ${i + 1} の開催日、開始時間、終了時間は必須です` 
        });
      }

      // 時間の妥当性チェック
      if (schedule.startTime >= schedule.endTime) {
        return res.status(400).json({ 
          error: `日程 ${i + 1} の開始時間は終了時間より前である必要があります` 
        });
      }
    }

    // 市区町村の存在確認
    const municipality = await prisma.municipality.findUnique({
      where: { id: parseInt(municipalityId) }
    });

    if (!municipality) {
      return res.status(400).json({ error: '指定された市区町村が見つかりません' });
    }

    // トランザクションでお祭りと日程を作成
    const festival = await prisma.$transaction(async (tx) => {
      // お祭り基本情報を作成
      const newFestival = await tx.festival.create({
        data: {
          municipalityId: parseInt(municipalityId),
          address,
          content,
          foodStalls: foodStalls || null,
          sponsors: sponsors || null,
          organizerId
        }
      });

      // 日程情報を作成
      const scheduleData = schedules.map(schedule => ({
        festivalId: newFestival.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }));

      await tx.festivalSchedule.createMany({
        data: scheduleData
      });

      // 作成されたお祭り情報を返す
      return await tx.festival.findUnique({
        where: { id: newFestival.id },
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
          },
          schedules: {
            orderBy: {
              date: 'asc'
            }
          }
        }
      });
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
    const userId = req.user.userId;

    const festivals = await prisma.festival.findMany({
      where: {
        organizerId: userId
      },
      include: {
        municipality: {
          include: {
            prefecture: true
          }
        },
        schedules: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
