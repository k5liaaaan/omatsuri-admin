const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 千葉市のサンプルお祭りデータ50件
const sampleFestivals = [
  {
    name: "千葉市中央区 春の桜祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央1-1-1",
    content: "桜の開花を祝う春の祭典。屋台やステージイベントが楽しめます。",
    foodStalls: "焼きそば、たこ焼き、綿あめ、フランクフルト",
    sponsors: "千葉市中央区商店街連合会",
    schedules: [
      { date: "2024-04-15", startTime: "10:00", endTime: "18:00" },
      { date: "2024-04-16", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "花見川区 夏祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川1-2-3",
    content: "夏の風物詩、花火大会と盆踊りが楽しめる祭りです。",
    foodStalls: "かき氷、焼き鳥、ビール、かき氷",
    sponsors: "花見川区自治会連合",
    schedules: [
      { date: "2024-08-15", startTime: "17:00", endTime: "21:00" }
    ]
  },
  {
    name: "稲毛区 秋の収穫祭",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛1-3-4",
    content: "地元農産物の収穫を祝う祭り。新鮮野菜の直売もあります。",
    foodStalls: "野菜炒め、地元野菜サラダ、手作りパン",
    sponsors: "稲毛区農業協同組合",
    schedules: [
      { date: "2024-10-20", startTime: "09:00", endTime: "16:00" }
    ]
  },
  {
    name: "若葉区 新緑祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉1-4-5",
    content: "新緑の季節を楽しむ自然豊かな祭り。ハイキングコースも設置。",
    foodStalls: "山菜料理、自然薯料理、地ビール",
    sponsors: "若葉区観光協会",
    schedules: [
      { date: "2024-05-12", startTime: "08:00", endTime: "17:00" }
    ]
  },
  {
    name: "緑区 緑の祭典",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑1-5-6",
    content: "環境保護をテーマにしたエコ祭り。リサイクル工作教室も開催。",
    foodStalls: "オーガニック野菜料理、エコ弁当",
    sponsors: "緑区環境保護団体",
    schedules: [
      { date: "2024-06-08", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "美浜区 海の祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜1-6-7",
    content: "海の幸を味わう祭り。新鮮な魚介類のBBQが楽しめます。",
    foodStalls: "海鮮BBQ、刺身、海鮮丼、ビール",
    sponsors: "美浜区漁業協同組合",
    schedules: [
      { date: "2024-07-20", startTime: "11:00", endTime: "19:00" }
    ]
  },
  {
    name: "中央区 七夕祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央2-1-8",
    content: "短冊に願いを込める七夕祭り。天の川をイメージしたイルミネーションも。",
    foodStalls: "そうめん、かき氷、綿あめ",
    sponsors: "中央区商工会",
    schedules: [
      { date: "2024-07-07", startTime: "16:00", endTime: "21:00" }
    ]
  },
  {
    name: "花見川区 花火大会",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川2-2-9",
    content: "夏の夜空を彩る大花火大会。約3000発の花火が打ち上げられます。",
    foodStalls: "焼きそば、たこ焼き、かき氷、ビール",
    sponsors: "花見川区観光振興会",
    schedules: [
      { date: "2024-08-10", startTime: "18:00", endTime: "21:30" }
    ]
  },
  {
    name: "稲毛区 音楽祭",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛2-3-10",
    content: "地元アーティストによる音楽祭。ジャンルを問わず様々な音楽が楽しめます。",
    foodStalls: "軽食、ドリンク、スイーツ",
    sponsors: "稲毛区文化振興会",
    schedules: [
      { date: "2024-09-15", startTime: "13:00", endTime: "20:00" }
    ]
  },
  {
    name: "若葉区 スポーツ祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉2-4-11",
    content: "地域住民が参加するスポーツイベント。各種競技大会も開催。",
    foodStalls: "スポーツドリンク、軽食、バナナ",
    sponsors: "若葉区体育協会",
    schedules: [
      { date: "2024-10-05", startTime: "09:00", endTime: "17:00" }
    ]
  },
  {
    name: "緑区 ハロウィン祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑2-5-12",
    content: "仮装コンテストやトリックオアトリートが楽しめるハロウィンイベント。",
    foodStalls: "ハロウィンケーキ、パンプキンスープ、お菓子",
    sponsors: "緑区子ども会連合",
    schedules: [
      { date: "2024-10-31", startTime: "16:00", endTime: "20:00" }
    ]
  },
  {
    name: "美浜区 イルミネーション祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜2-6-13",
    content: "冬の夜空を彩るイルミネーション祭り。約10万個のLEDが輝きます。",
    foodStalls: "ホットドリンク、温かい料理、スイーツ",
    sponsors: "美浜区商工会",
    schedules: [
      { date: "2024-12-15", startTime: "17:00", endTime: "22:00" },
      { date: "2024-12-16", startTime: "17:00", endTime: "22:00" }
    ]
  },
  {
    name: "中央区 新年祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央3-1-14",
    content: "新年を祝う伝統的な祭り。獅子舞や餅つき大会も開催。",
    foodStalls: "お雑煮、おしるこ、甘酒",
    sponsors: "中央区伝統文化保存会",
    schedules: [
      { date: "2025-01-03", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "花見川区 梅まつり",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川3-2-15",
    content: "梅の開花を祝う春の祭り。梅酒の試飲会も開催。",
    foodStalls: "梅干し、梅酒、梅ジュース、梅料理",
    sponsors: "花見川区梅生産組合",
    schedules: [
      { date: "2025-02-20", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "稲毛区 チューリップ祭り",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛3-3-16",
    content: "色とりどりのチューリップが咲き誇る春の祭り。写真撮影スポットも多数。",
    foodStalls: "花見弁当、チューリップケーキ、ハーブティー",
    sponsors: "稲毛区花き生産組合",
    schedules: [
      { date: "2025-04-10", startTime: "09:00", endTime: "17:00" }
    ]
  },
  {
    name: "若葉区 新緑ハイキング祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉3-4-17",
    content: "新緑の山道を歩くハイキング祭り。自然観察会も同時開催。",
    foodStalls: "山菜料理、自然薯料理、山の幸弁当",
    sponsors: "若葉区自然保護協会",
    schedules: [
      { date: "2025-05-05", startTime: "08:00", endTime: "16:00" }
    ]
  },
  {
    name: "緑区 環境フェア",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑3-5-18",
    content: "環境問題を学ぶ体験型フェア。エコ工作教室やリサイクル展示も。",
    foodStalls: "オーガニック料理、エコ弁当、自然派スイーツ",
    sponsors: "緑区環境保護団体",
    schedules: [
      { date: "2025-06-15", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "美浜区 海開き祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜3-6-19",
    content: "海水浴シーズンの開始を祝う祭り。海の安全祈願も行います。",
    foodStalls: "海鮮料理、BBQ、冷たいドリンク",
    sponsors: "美浜区海水浴場組合",
    schedules: [
      { date: "2025-07-01", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "中央区 夏祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央4-1-20",
    content: "夏の風物詩、盆踊りと屋台が楽しめる伝統的な祭り。",
    foodStalls: "焼きそば、たこ焼き、かき氷、ビール",
    sponsors: "中央区祭り実行委員会",
    schedules: [
      { date: "2025-08-15", startTime: "17:00", endTime: "21:00" }
    ]
  },
  {
    name: "花見川区 秋祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川4-2-21",
    content: "秋の収穫を祝う祭り。神輿の巡行も行われます。",
    foodStalls: "秋の味覚料理、新米おにぎり、栗料理",
    sponsors: "花見川区神社連合",
    schedules: [
      { date: "2025-09-23", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "稲毛区 文化祭",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛4-3-22",
    content: "地域の文化を紹介する祭り。伝統工芸の展示や体験コーナーも。",
    foodStalls: "伝統料理、手作りお菓子、地元特産品",
    sponsors: "稲毛区文化振興会",
    schedules: [
      { date: "2025-10-12", startTime: "10:00", endTime: "17:00" }
    ]
  },
  {
    name: "若葉区 紅葉祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉4-4-23",
    content: "紅葉の美しさを楽しむ祭り。紅葉狩りツアーも開催。",
    foodStalls: "紅葉弁当、秋の味覚料理、温かい飲み物",
    sponsors: "若葉区観光協会",
    schedules: [
      { date: "2025-11-15", startTime: "09:00", endTime: "16:00" }
    ]
  },
  {
    name: "緑区 クリスマス祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑4-5-24",
    content: "クリスマスを祝う祭り。サンタクロースの登場やプレゼント交換も。",
    foodStalls: "クリスマスケーキ、ホットワイン、温かい料理",
    sponsors: "緑区子ども会連合",
    schedules: [
      { date: "2025-12-24", startTime: "16:00", endTime: "21:00" }
    ]
  },
  {
    name: "美浜区 大晦日祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜4-6-25",
    content: "一年の締めくくりを祝う祭り。除夜の鐘とカウントダウンも。",
    foodStalls: "年越しそば、おせち料理、甘酒",
    sponsors: "美浜区商工会",
    schedules: [
      { date: "2025-12-31", startTime: "20:00", endTime: "01:00" }
    ]
  },
  {
    name: "中央区 初詣祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央5-1-26",
    content: "新年の初詣を祝う祭り。おみくじやお守りの授与も。",
    foodStalls: "甘酒、おしるこ、縁起物料理",
    sponsors: "中央区神社連合",
    schedules: [
      { date: "2026-01-01", startTime: "06:00", endTime: "18:00" }
    ]
  },
  {
    name: "花見川区 節分祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川5-2-27",
    content: "節分の豆まきと恵方巻きの祭り。鬼の面をかぶった豆まきも。",
    foodStalls: "恵方巻き、豆料理、節分弁当",
    sponsors: "花見川区神社連合",
    schedules: [
      { date: "2026-02-03", startTime: "14:00", endTime: "18:00" }
    ]
  },
  {
    name: "稲毛区 ひな祭り",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛5-3-28",
    content: "ひな人形の展示と女の子の成長を祝う祭り。",
    foodStalls: "ひなあられ、ちらし寿司、ひな祭りケーキ",
    sponsors: "稲毛区婦人会",
    schedules: [
      { date: "2026-03-03", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "若葉区 桜まつり",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉5-4-29",
    content: "桜の開花を祝う春の祭り。夜桜のライトアップも楽しめます。",
    foodStalls: "花見弁当、桜餅、春の味覚料理",
    sponsors: "若葉区観光協会",
    schedules: [
      { date: "2026-04-05", startTime: "10:00", endTime: "20:00" }
    ]
  },
  {
    name: "緑区 ゴールデンウィーク祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑5-5-30",
    content: "ゴールデンウィークを楽しむ大型祭り。様々なイベントが開催されます。",
    foodStalls: "多様な屋台料理、ドリンク、スイーツ",
    sponsors: "緑区商工会",
    schedules: [
      { date: "2026-05-03", startTime: "10:00", endTime: "18:00" },
      { date: "2026-05-04", startTime: "10:00", endTime: "18:00" },
      { date: "2026-05-05", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "美浜区 海の日祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜5-6-31",
    content: "海の日を祝う祭り。海の安全祈願と海の幸を味わうイベント。",
    foodStalls: "海鮮料理、BBQ、海の幸弁当",
    sponsors: "美浜区漁業協同組合",
    schedules: [
      { date: "2026-07-20", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "中央区 盆踊り大会",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央6-1-32",
    content: "夏の風物詩、盆踊り大会。老若男女が参加できる楽しい祭り。",
    foodStalls: "盆踊り弁当、冷たいドリンク、かき氷",
    sponsors: "中央区盆踊り保存会",
    schedules: [
      { date: "2026-08-13", startTime: "18:00", endTime: "21:00" },
      { date: "2026-08-14", startTime: "18:00", endTime: "21:00" },
      { date: "2026-08-15", startTime: "18:00", endTime: "21:00" }
    ]
  },
  {
    name: "花見川区 敬老の日祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川6-2-33",
    content: "敬老の日を祝う祭り。高齢者の方々を讃えるイベントが開催。",
    foodStalls: "和食料理、お茶、和菓子",
    sponsors: "花見川区高齢者福祉協会",
    schedules: [
      { date: "2026-09-21", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "稲毛区 スポーツの日祭り",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛6-3-34",
    content: "スポーツの日を祝う祭り。各種スポーツ体験会も開催。",
    foodStalls: "スポーツドリンク、軽食、バナナ",
    sponsors: "稲毛区体育協会",
    schedules: [
      { date: "2026-10-12", startTime: "09:00", endTime: "17:00" }
    ]
  },
  {
    name: "若葉区 文化の日祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉6-4-35",
    content: "文化の日を祝う祭り。伝統文化の展示や体験会も開催。",
    foodStalls: "伝統料理、和菓子、日本茶",
    sponsors: "若葉区文化振興会",
    schedules: [
      { date: "2026-11-03", startTime: "10:00", endTime: "17:00" }
    ]
  },
  {
    name: "緑区 勤労感謝の日祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑6-5-36",
    content: "勤労感謝の日を祝う祭り。働く人々に感謝を込めたイベント。",
    foodStalls: "感謝弁当、温かい料理、ドリンク",
    sponsors: "緑区労働組合連合",
    schedules: [
      { date: "2026-11-23", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "美浜区 冬至祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜6-6-37",
    content: "冬至を祝う祭り。かぼちゃ料理やゆず湯の体験も。",
    foodStalls: "かぼちゃ料理、ゆず料理、温かいスープ",
    sponsors: "美浜区農協",
    schedules: [
      { date: "2026-12-22", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "中央区 年末祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央7-1-38",
    content: "年末を祝う祭り。一年の感謝を込めたイベント。",
    foodStalls: "年末料理、おせち料理、甘酒",
    sponsors: "中央区商工会",
    schedules: [
      { date: "2026-12-30", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "花見川区 新春祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川7-2-39",
    content: "新春を祝う祭り。獅子舞や餅つき大会も開催。",
    foodStalls: "お雑煮、おしるこ、甘酒",
    sponsors: "花見川区祭り実行委員会",
    schedules: [
      { date: "2027-01-02", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "稲毛区 成人の日祭り",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛7-3-40",
    content: "成人の日を祝う祭り。新成人の皆さんをお祝いするイベント。",
    foodStalls: "お祝い料理、ケーキ、ドリンク",
    sponsors: "稲毛区青年会議所",
    schedules: [
      { date: "2027-01-13", startTime: "10:00", endTime: "17:00" }
    ]
  },
  {
    name: "若葉区 建国記念の日祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉7-4-41",
    content: "建国記念の日を祝う祭り。日本の歴史と文化を学ぶイベント。",
    foodStalls: "和食料理、日本茶、和菓子",
    sponsors: "若葉区歴史文化保存会",
    schedules: [
      { date: "2027-02-11", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "緑区 バレンタインデー祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑7-5-42",
    content: "バレンタインデーを祝う祭り。チョコレート作り体験も。",
    foodStalls: "チョコレート、スイーツ、ドリンク",
    sponsors: "緑区商工会",
    schedules: [
      { date: "2027-02-14", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "美浜区 ホワイトデー祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜7-6-43",
    content: "ホワイトデーを祝う祭り。お返しのプレゼント作り体験も。",
    foodStalls: "スイーツ、お菓子、ドリンク",
    sponsors: "美浜区商工会",
    schedules: [
      { date: "2027-03-14", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "中央区 春分の日祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央8-1-44",
    content: "春分の日を祝う祭り。自然の恵みに感謝するイベント。",
    foodStalls: "春の味覚料理、自然派スイーツ、ハーブティー",
    sponsors: "中央区自然保護協会",
    schedules: [
      { date: "2027-03-20", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "花見川区 入学式祭り",
    municipalityName: "千葉市花見川区",
    address: "千葉市花見川区花見川8-2-45",
    content: "入学式を祝う祭り。新入生の皆さんをお祝いするイベント。",
    foodStalls: "お祝い料理、ケーキ、ドリンク",
    sponsors: "花見川区教育委員会",
    schedules: [
      { date: "2027-04-08", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "稲毛区 みどりの日祭り",
    municipalityName: "千葉市稲毛区",
    address: "千葉市稲毛区稲毛8-3-46",
    content: "みどりの日を祝う祭り。自然環境保護をテーマにしたイベント。",
    foodStalls: "オーガニック料理、自然派スイーツ、ハーブティー",
    sponsors: "稲毛区環境保護団体",
    schedules: [
      { date: "2027-05-04", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "若葉区 こどもの日祭り",
    municipalityName: "千葉市若葉区",
    address: "千葉市若葉区若葉8-4-47",
    content: "こどもの日を祝う祭り。子どもの成長を願うイベント。",
    foodStalls: "子どもの好きな料理、スイーツ、ドリンク",
    sponsors: "若葉区子ども会連合",
    schedules: [
      { date: "2027-05-05", startTime: "10:00", endTime: "17:00" }
    ]
  },
  {
    name: "緑区 母の日祭り",
    municipalityName: "千葉市緑区",
    address: "千葉市緑区緑8-5-48",
    content: "母の日を祝う祭り。お母さんに感謝を込めたイベント。",
    foodStalls: "お母さんの好きな料理、スイーツ、ドリンク",
    sponsors: "緑区婦人会",
    schedules: [
      { date: "2027-05-14", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "美浜区 父の日祭り",
    municipalityName: "千葉市美浜区",
    address: "千葉市美浜区美浜8-6-49",
    content: "父の日を祝う祭り。お父さんに感謝を込めたイベント。",
    foodStalls: "お父さんの好きな料理、ビール、ドリンク",
    sponsors: "美浜区商工会",
    schedules: [
      { date: "2027-06-18", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    name: "中央区 夏至祭り",
    municipalityName: "千葉市中央区",
    address: "千葉市中央区中央9-1-50",
    content: "夏至を祝う祭り。一年で最も昼が長い日を祝うイベント。",
    foodStalls: "夏の味覚料理、冷たいドリンク、かき氷",
    sponsors: "中央区自然保護協会",
    schedules: [
      { date: "2027-06-21", startTime: "10:00", endTime: "18:00" }
    ]
  }
];

async function createSampleFestivals() {
  try {
    console.log('サンプルお祭りデータの作成を開始します...');

    // 管理者ユーザーを取得（存在しない場合は作成）
    let adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          isAdmin: true
        }
      });
      console.log('管理者ユーザーを作成しました');
    }

    // 千葉県の市区町村データを取得
    const municipalities = await prisma.municipality.findMany({
      where: {
        prefecture: {
          name: '千葉県'
        }
      }
    });

    if (municipalities.length === 0) {
      console.log('千葉県の市区町村データが見つかりません。先にcreateAdmin.jsを実行してください。');
      return;
    }

    // 市区町村名からIDを取得する関数
    const getMunicipalityId = (municipalityName) => {
      const municipality = municipalities.find(m => m.name === municipalityName);
      return municipality ? municipality.id : municipalities[0].id; // 見つからない場合は最初の市区町村を使用
    };

    let createdCount = 0;
    let skippedCount = 0;

    for (const festivalData of sampleFestivals) {
      try {
        // 既存のお祭りをチェック
        const existingFestival = await prisma.festival.findFirst({
          where: {
            name: festivalData.name,
            municipalityId: getMunicipalityId(festivalData.municipalityName)
          }
        });

        if (existingFestival) {
          console.log(`スキップ: ${festivalData.name} (既に存在)`);
          skippedCount++;
          continue;
        }

        // お祭りを作成
        const festival = await prisma.festival.create({
          data: {
            name: festivalData.name,
            municipalityId: getMunicipalityId(festivalData.municipalityName),
            address: festivalData.address,
            content: festivalData.content,
            foodStalls: festivalData.foodStalls,
            sponsors: festivalData.sponsors,
            organizerId: adminUser.id
          }
        });

        // スケジュールを作成
        for (const schedule of festivalData.schedules) {
          await prisma.festivalSchedule.create({
            data: {
              festivalId: festival.id,
              date: schedule.date,
              startTime: schedule.startTime,
              endTime: schedule.endTime
            }
          });
        }

        console.log(`作成完了: ${festivalData.name}`);
        createdCount++;

      } catch (error) {
        console.error(`エラー: ${festivalData.name} - ${error.message}`);
      }
    }

    console.log(`\nサンプルお祭りデータの作成が完了しました！`);
    console.log(`作成されたお祭り: ${createdCount}件`);
    console.log(`スキップされたお祭り: ${skippedCount}件`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  createSampleFestivals();
}

module.exports = { createSampleFestivals, sampleFestivals };
