# Omatsuri Nav

お祭りナビゲーションシステム - フルスタックWebアプリケーション

## 📋 プロジェクト概要

Omatsuri Navは、お祭り情報を管理・閲覧するためのWebアプリケーションです。

### 主な機能
- ユーザー認証（ログイン・アカウント作成）
- 地域マスター管理（都道府県・市区町村の登録・編集）
- 管理者機能（地域マスターの管理）
- お祭り登録・管理機能（複数日程対応）
- お祭り編集・削除機能
- お祭り非公開設定機能
- お祭り情報の検索・閲覧（今後実装予定）
- お気に入り機能（今後実装予定）

### 技術スタック
- **フロントエンド**: React 19 + TypeScript + Vite
- **バックエンド**: Node.js + Express.js + Prisma ORM
- **データベース**: SQLite（開発環境）
- **認証**: JWT（JSON Web Token）

## 📁 プロジェクト構造

```
omatsuri-nav/
├── frontend/                    # React フロントエンド
│   ├── src/
│   │   ├── components/         # Reactコンポーネント
│   │   ├── contexts/           # React Context
│   │   ├── App.tsx            # メインアプリケーション
│   │   └── index.css          # グローバルスタイル
│   ├── public/                 # 静的ファイル
│   ├── package.json
│   └── tsconfig.json
├── backend/                     # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/        # コントローラー
│   │   ├── middleware/         # ミドルウェア
│   │   ├── routes/            # ルート定義
│   │   ├── utils/             # ユーティリティ
│   │   └── index.js           # エントリーポイント
│   ├── config/                 # 環境設定（メール・URL など）
│   ├── prisma/                # データベース関連
│   │   ├── schema.prisma      # データベーススキーマ
│   │   └── dev.db            # SQLiteデータベース
│   ├── package.json
│   └── .env                   # 環境変数
├── package.json               # ワークスペース管理
└── README.md                  # プロジェクトドキュメント
```

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`backend/.env` と `frontend/.env` を作成してください。詳細は [SETUP.md](./SETUP.md) を参照してください。

### 3. データベースの初期化

```bash
cd backend
npm run db:generate
npm run db:push
```

### 4. 開発サーバーの起動

```bash
# ルートディレクトリで実行
npm run dev
```

### 5. アクセス確認

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555

## 📚 ドキュメント

詳細な情報は以下のドキュメントを参照してください：

- **[SETUP.md](./SETUP.md)** - 環境構築手順、開発ガイド、データベース管理、ユーザー管理、トラブルシューティング
- **[SPEC.md](./SPEC.md)** - API仕様、データベース構造、機能仕様、使用技術

## 📝 今後の実装予定

- [x] ユーザー認証機能
- [x] 地域マスター管理機能
- [x] 管理者機能
- [x] お祭り登録・管理機能（複数日程対応）
- [x] お祭り情報の編集・削除機能
- [x] お祭り非公開設定機能
- [ ] お祭り検索機能
- [ ] お気に入り機能
- [ ] 画像アップロード機能
- [ ] 地図連携機能

---