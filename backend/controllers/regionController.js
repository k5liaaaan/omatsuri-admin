const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 都道府県一覧を取得
const getPrefectures = async (req, res) => {
  try {
    const prefectures = await prisma.prefecture.findMany({
      include: {
        municipalities: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      data: prefectures
    });
  } catch (error) {
    console.error('都道府県取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '都道府県の取得に失敗しました'
    });
  }
};

// 特定の都道府県を取得
const getPrefectureById = async (req, res) => {
  try {
    const { id } = req.params;
    const prefecture = await prisma.prefecture.findUnique({
      where: { id: parseInt(id) },
      include: {
        municipalities: true
      }
    });

    if (!prefecture) {
      return res.status(404).json({
        success: false,
        message: '都道府県が見つかりません'
      });
    }

    res.json({
      success: true,
      data: prefecture
    });
  } catch (error) {
    console.error('都道府県取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '都道府県の取得に失敗しました'
    });
  }
};

// 市区町村一覧を取得
const getMunicipalities = async (req, res) => {
  try {
    const municipalities = await prisma.municipality.findMany({
      include: {
        prefecture: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      data: municipalities
    });
  } catch (error) {
    console.error('市区町村取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '市区町村の取得に失敗しました'
    });
  }
};

// 特定の都道府県の市区町村を取得
const getMunicipalitiesByPrefecture = async (req, res) => {
  try {
    const { prefectureId } = req.params;
    const municipalities = await prisma.municipality.findMany({
      where: {
        prefectureId: parseInt(prefectureId)
      },
      include: {
        prefecture: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      data: municipalities
    });
  } catch (error) {
    console.error('市区町村取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '市区町村の取得に失敗しました'
    });
  }
};

// 都道府県を作成
const createPrefecture = async (req, res) => {
  try {
    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: '都道府県コードと名前は必須です'
      });
    }

    const prefecture = await prisma.prefecture.create({
      data: {
        code,
        name
      }
    });

    res.status(201).json({
      success: true,
      data: prefecture
    });
  } catch (error) {
    console.error('都道府県作成エラー:', error);
    res.status(500).json({
      success: false,
      message: '都道府県の作成に失敗しました'
    });
  }
};

// 市区町村を作成
const createMunicipality = async (req, res) => {
  try {
    const { prefectureId } = req.params;
    const { name } = req.body;

    // バリデーション
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '市区町村名は必須です'
      });
    }

    // 都道府県の存在確認
    const prefecture = await prisma.prefecture.findUnique({
      where: { id: parseInt(prefectureId) }
    });

    if (!prefecture) {
      return res.status(404).json({
        success: false,
        message: '都道府県が見つかりません'
      });
    }

    // その都道府県の市区町村数を取得して次の番号を決定
    const municipalityCount = await prisma.municipality.count({
      where: { prefectureId: parseInt(prefectureId) }
    });

    // 市区町村コードを自動生成（都道府県コード + 3桁の連番）
    const nextNumber = municipalityCount + 1;
    const generatedCode = `${prefecture.code}${String(nextNumber).padStart(3, '0')}`;

    // 市区町村を作成
    const municipality = await prisma.municipality.create({
      data: {
        code: generatedCode,
        name,
        prefectureId: parseInt(prefectureId)
      },
      include: {
        prefecture: true
      }
    });

    res.status(201).json({
      success: true,
      message: '市区町村が正常に作成されました',
      data: municipality
    });
  } catch (error) {
    console.error('Error creating municipality:', error);
    res.status(500).json({
      success: false,
      message: '市区町村の作成に失敗しました'
    });
  }
};

// 市区町村を取得（ID指定）
const getMunicipalityById = async (req, res) => {
  try {
    const { id } = req.params;

    const municipality = await prisma.municipality.findUnique({
      where: { id: parseInt(id) },
      include: {
        prefecture: true
      }
    });

    if (!municipality) {
      return res.status(404).json({
        success: false,
        message: '市区町村が見つかりません'
      });
    }

    res.json({
      success: true,
      data: municipality
    });
  } catch (error) {
    console.error('Error fetching municipality:', error);
    res.status(500).json({
      success: false,
      message: '市区町村の取得に失敗しました'
    });
  }
};

// 市区町村を更新
const updateMunicipality = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // バリデーション
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '市区町村名は必須です'
      });
    }

    // 市区町村の存在確認
    const existingMunicipality = await prisma.municipality.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMunicipality) {
      return res.status(404).json({
        success: false,
        message: '市区町村が見つかりません'
      });
    }

    // 市区町村を更新（コードは変更不可）
    const municipality = await prisma.municipality.update({
      where: { id: parseInt(id) },
      data: {
        name
      },
      include: {
        prefecture: true
      }
    });

    res.json({
      success: true,
      message: '市区町村が正常に更新されました',
      data: municipality
    });
  } catch (error) {
    console.error('Error updating municipality:', error);
    res.status(500).json({
      success: false,
      message: '市区町村の更新に失敗しました'
    });
  }
};

// 市区町村リクエストを作成
const createMunicipalityRequest = async (req, res) => {
  try {
    const { prefectureId, name } = req.body;

    // バリデーション
    if (!prefectureId || !name) {
      return res.status(400).json({
        success: false,
        message: '都道府県と市区町村名は必須です'
      });
    }

    // 都道府県の存在確認
    const prefecture = await prisma.prefecture.findUnique({
      where: { id: parseInt(prefectureId) }
    });

    if (!prefecture) {
      return res.status(404).json({
        success: false,
        message: '都道府県が見つかりません'
      });
    }

    // 市区町村リクエストを作成
    const request = await prisma.municipalityRequest.create({
      data: {
        prefectureId: parseInt(prefectureId),
        name: name.trim()
      },
      include: {
        prefecture: true
      }
    });

    res.status(201).json({
      success: true,
      message: '市区町村追加リクエストを送信しました',
      data: request
    });
  } catch (error) {
    console.error('市区町村リクエスト作成エラー:', error);
    res.status(500).json({
      success: false,
      message: '市区町村リクエストの作成に失敗しました'
    });
  }
};

// 市区町村リクエスト一覧を取得（管理者のみ）
const getMunicipalityRequests = async (req, res) => {
  try {
    const requests = await prisma.municipalityRequest.findMany({
      include: {
        prefecture: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('市区町村リクエスト取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '市区町村リクエストの取得に失敗しました'
    });
  }
};

module.exports = {
  getPrefectures,
  getPrefectureById,
  getMunicipalities,
  getMunicipalitiesByPrefecture,
  createPrefecture,
  createMunicipality,
  getMunicipalityById,
  updateMunicipality,
  createMunicipalityRequest,
  getMunicipalityRequests
};
