const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 公開用: お祭り一覧取得（isVisible=true、ページネーション・フィルタ対応）
const getPublicFestivals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { prefectureId, municipalityId, month, orderBy } = req.query;

    // where 句の組み立て（公開のみ）
    const whereClause = {
      isVisible: true,
      ...(municipalityId ? { municipalityId: parseInt(municipalityId) } : {}),
      ...(prefectureId
        ? { municipality: { prefectureId: parseInt(prefectureId) } }
        : {}),
      ...(month
        ? {
            schedules: {
              some: {
                // YYYY-MM の前方一致（SQLite のため文字列の like を利用）
                date: {
                  startsWith: month
                }
              }
            }
          }
        : {})
    };

    // total count（重複排除のため distinct）
    const totalCount = await prisma.festival.count({ where: whereClause });

    // 並び順: nearest（最も近い開催日） or newest（作成日）
    let orderByClause = [{ createdAt: 'desc' }];
    if (orderBy === 'nearest') {
      // schedules の date 昇順で近いものを優先（SQLite では集約が難しいため2段階並び）
      orderByClause = [
        { schedules: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
    } else if (orderBy === 'newest') {
      orderByClause = [{ createdAt: 'desc' }];
    }

    const festivals = await prisma.festival.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        municipality: { include: { prefecture: true } },
        organizer: { select: { id: true, username: true } },
        schedules: { orderBy: { date: 'asc' } }
      },
      orderBy: orderByClause
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      festivals,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('公開お祭り一覧取得エラー:', error);
    res.status(500).json({ error: 'お祭り一覧の取得に失敗しました' });
  }
};

// 公開用: お祭り詳細取得（isVisible=true）
const getPublicFestivalById = async (req, res) => {
  try {
    const { id } = req.params;

    const festival = await prisma.festival.findFirst({
      where: { id: parseInt(id), isVisible: true },
      include: {
        municipality: { include: { prefecture: true } },
        organizer: { select: { id: true, username: true } },
        schedules: { orderBy: { date: 'asc' } }
      }
    });

    if (!festival) {
      return res.status(404).json({ error: 'お祭りが見つかりません' });
    }

    res.json(festival);
  } catch (error) {
    console.error('公開お祭り詳細取得エラー:', error);
    res.status(500).json({ error: 'お祭り詳細の取得に失敗しました' });
  }
};

module.exports = { getPublicFestivals, getPublicFestivalById };


