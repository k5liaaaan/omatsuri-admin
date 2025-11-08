const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// お祭り一覧取得（ページネーション対応）
const getFestivals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 認証されたユーザー情報を取得
    const user = req.user;
    let whereClause = {};

    // 管理者でない場合は、自分のお祭りのみ表示
    if (user && !user.isAdmin) {
      whereClause = {
        organizerId: user.userId
      };
    }

    // 総件数を取得
    const totalCount = await prisma.festival.count({
      where: whereClause
    });

    // ページネーション適用でお祭り一覧を取得
    const festivals = await prisma.festival.findMany({
      where: whereClause,
      skip,
      take: limit,
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

    // ページネーション情報を計算
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      festivals,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
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
      name,
      municipalityId,
      address,
      content,
      foodStalls,
      sponsors,
      schedules,
      isVisible
    } = req.body;

    const organizerId = req.user?.userId; // 認証ミドルウェアから取得

    // 認証チェック
    if (!organizerId) {
      console.error('認証エラー: ユーザーIDが取得できません');
      return res.status(401).json({ error: '認証が必要です' });
    }

    // バリデーション
    if (!name || !municipalityId || !address || !content || !schedules || schedules.length === 0) {
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

    const visibilityFlag = (() => {
      if (typeof isVisible === 'boolean') {
        return isVisible;
      }
      if (typeof isVisible === 'string') {
        if (isVisible.toLowerCase() === 'true') return true;
        if (isVisible.toLowerCase() === 'false') return false;
      }
      return true;
    })();

    // トランザクションでお祭りと日程を作成
    const festival = await prisma.$transaction(async (tx) => {
      // お祭り基本情報を作成
      const newFestival = await tx.festival.create({
        data: {
          name,
          municipalityId: parseInt(municipalityId),
          address,
          content,
          foodStalls: foodStalls || null,
          sponsors: sponsors || null,
          organizerId,
          isVisible: visibilityFlag
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

// お祭り詳細取得
const getFestivalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const festival = await prisma.festival.findUnique({
      where: { id: parseInt(id) },
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

    if (!festival) {
      return res.status(404).json({ error: 'お祭りが見つかりません' });
    }

    res.json(festival);
  } catch (error) {
    console.error('お祭り詳細取得エラー:', error);
    res.status(500).json({ error: 'お祭り詳細の取得に失敗しました' });
  }
};

// お祭り削除
const deleteFestival = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // お祭りの存在確認と権限チェック
    const festival = await prisma.festival.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!festival) {
      return res.status(404).json({ error: 'お祭りが見つかりません' });
    }

    // 権限チェック（管理者または主催者のみ削除可能）
    if (!isAdmin && festival.organizerId !== userId) {
      return res.status(403).json({ error: 'このお祭りを削除する権限がありません' });
    }

    // トランザクションでお祭りと関連データを削除
    await prisma.$transaction(async (tx) => {
      // スケジュールを削除
      await tx.festivalSchedule.deleteMany({
        where: { festivalId: parseInt(id) }
      });

      // お祭りを削除
      await tx.festival.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({ message: 'お祭りが正常に削除されました' });
  } catch (error) {
    console.error('お祭り削除エラー:', error);
    res.status(500).json({ error: 'お祭りの削除に失敗しました' });
  }
};

// お祭り非公開設定
const unpublishFestival = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // お祭りの存在確認と権限チェック
    const festival = await prisma.festival.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!festival) {
      return res.status(404).json({ error: 'お祭りが見つかりません' });
    }

    // 権限チェック（管理者または主催者のみ非公開設定可能）
    if (!isAdmin && festival.organizerId !== userId) {
      return res.status(403).json({ error: 'このお祭りを非公開にする権限がありません' });
    }

    // 既に非公開の場合はエラー
    if (!festival.isVisible) {
      return res.status(400).json({ error: 'このお祭りは既に非公開になっています' });
    }

    // 非公開設定
    await prisma.festival.update({
      where: { id: parseInt(id) },
      data: { isVisible: false }
    });

    res.json({ message: 'お祭りを非公開に設定しました' });
  } catch (error) {
    console.error('お祭り非公開設定エラー:', error);
    res.status(500).json({ error: 'お祭りの非公開設定に失敗しました' });
  }
};

// お祭り更新
const updateFestival = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    const {
      name,
      municipalityId,
      address,
      content,
      foodStalls,
      sponsors,
      schedules,
      isVisible
    } = req.body;

    // お祭りの存在確認と権限チェック
    const existingFestival = await prisma.festival.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!existingFestival) {
      return res.status(404).json({ error: 'お祭りが見つかりません' });
    }

    // 権限チェック（管理者または主催者のみ更新可能）
    if (!isAdmin && existingFestival.organizerId !== userId) {
      return res.status(403).json({ error: 'このお祭りを編集する権限がありません' });
    }

    // バリデーション
    if (!name || !municipalityId || !address || !content || !schedules || schedules.length === 0) {
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

    const visibilityFlag = (() => {
      if (typeof isVisible === 'boolean') {
        return isVisible;
      }
      if (typeof isVisible === 'string') {
        if (isVisible.toLowerCase() === 'true') return true;
        if (isVisible.toLowerCase() === 'false') return false;
      }
      return existingFestival.isVisible;
    })();

    // トランザクションでお祭りと日程を更新
    const updatedFestival = await prisma.$transaction(async (tx) => {
      // 既存のスケジュールを削除
      await tx.festivalSchedule.deleteMany({
        where: { festivalId: parseInt(id) }
      });

      // お祭り基本情報を更新
      const festival = await tx.festival.update({
        where: { id: parseInt(id) },
        data: {
          name,
          municipalityId: parseInt(municipalityId),
          address,
          content,
          foodStalls: foodStalls || null,
          sponsors: sponsors || null,
          isVisible: visibilityFlag
        }
      });

      // 新しい日程情報を作成
      const scheduleData = schedules.map(schedule => ({
        festivalId: parseInt(id),
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }));

      await tx.festivalSchedule.createMany({
        data: scheduleData
      });

      // 更新されたお祭り情報を返す
      return await tx.festival.findUnique({
        where: { id: parseInt(id) },
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

    res.json(updatedFestival);
  } catch (error) {
    console.error('お祭り更新エラー:', error);
    res.status(500).json({ error: 'お祭りの更新に失敗しました' });
  }
};

module.exports = {
  getFestivals,
  createFestival,
  getUserFestivals,
  getFestivalById,
  deleteFestival,
  unpublishFestival,
  updateFestival
};
