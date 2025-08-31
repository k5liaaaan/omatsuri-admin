# Omatsuri Nav

お祭りナビゲーションシステム - フルスタックWebアプリケーション

## 📋 プロジェクト概要

Omatsuri Navは、お祭り情報を管理・閲覧するためのWebアプリケーションです。

### 主な機能
- ユーザー認証（ログイン・アカウント作成）
- 地域マスター管理（都道府県・市区町村の登録・編集）
- 管理者機能（地域マスターの管理）
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
│   ├── prisma/                # データベース関連
│   │   ├── schema.prisma      # データベーススキーマ
│   │   └── dev.db            # SQLiteデータベース
│   ├── package.json
│   └── .env                   # 環境変数
├── package.json               # ワークスペース管理
└── README.md                  # プロジェクトドキュメント
```

## 🚀 環境構築手順

### 前提条件
- Node.js 18以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd omatsuri-nav
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行（ワークスペース全体の依存関係をインストール）
npm install
```

### 3. 環境変数の設定

#### バックエンド環境変数
`backend/.env`ファイルを作成：

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

#### フロントエンド環境変数
`frontend/.env`ファイルを作成：

```env
VITE_API_URL=http://localhost:3001
```

### 4. データベースの初期化

```bash
cd backend

# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの同期
npm run db:push

# 管理者アカウントの作成（手動でデータベースに追加）
```

### 5. 開発サーバーの起動

```bash
# ルートディレクトリで実行（フロントエンドとバックエンドを同時に起動）
npm run dev
```

### 6. アクセス確認

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555

## 🛠️ 開発ガイド

### 開発サーバーの起動方法

#### 全体を同時に起動（推奨）
```bash
npm run dev
```

#### 個別に起動
```bash
# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ
npm run dev:backend
```

## 🗄️ データベース管理

### Prisma Studio（データベースGUIツール）

データベースの内容を視覚的に確認・編集できます：

```bash
cd backend
npm run db:studio
```

ブラウザで http://localhost:5555 にアクセスしてデータベースを管理できます。

### データベース情報

- **場所**: `backend/prisma/dev.db`
- **形式**: SQLite
- **スキーマ**: `backend/prisma/schema.prisma`

### データベース操作コマンド

```bash
cd backend

# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの同期
npm run db:push

# Prisma Studioの起動
npm run db:studio
```

## 👤 ユーザー管理

### デフォルトアカウント

#### 管理者アカウント
- **ユーザー名**: `admin`
- **パスワード**: `admin123`

### ユーザー作成

#### 管理者アカウントの作成
Prisma Studioを使用して手動でデータベースに追加：

```bash
cd backend
npm run db:studio
```

ブラウザで http://localhost:5555 にアクセスし、`users`テーブルで以下のデータを追加：
- `username`: `admin`
- `email`: `admin@example.com`
- `password`: `admin123`（bcryptでハッシュ化された値）
- `isAdmin`: `true`

#### 一般ユーザーの作成
ログイン画面の「アカウント作成」機能を使用するか、Prisma Studioで手動追加

### セキュリティ設定
- DBに登録されているユーザーのみログイン可能
- ログイン画面でアカウント作成も可能
- 管理者と一般ユーザーの2種類のユーザータイプ

## 🛠️ 使用技術

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速ビルドツール
- **React Router DOM** - クライアントサイドルーティング
- **Axios** - HTTPクライアント

### バックエンド
- **Node.js** - JavaScriptランタイム
- **Express.js** - Webアプリケーションフレームワーク
- **Prisma ORM** - データベースORM
- **SQLite** - 軽量データベース
- **JWT** - JSON Web Token認証
- **bcryptjs** - パスワードハッシュ化
- **express-validator** - 入力値検証
- **helmet** - セキュリティヘッダー
- **express-rate-limit** - レート制限
- **CORS** - クロスオリジンリソース共有
- **dotenv** - 環境変数管理

## 🔌 API エンドポイント

### 認証関連
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ユーザーログイン
- `GET /api/auth/profile` - ユーザープロフィール取得（認証必要）

### 地域マスター関連
- `GET /api/region/prefectures` - 都道府県一覧取得
- `GET /api/region/prefectures/:id` - 特定の都道府県取得
- `POST /api/region/prefectures` - 都道府県作成
- `GET /api/region/municipalities` - 市区町村一覧取得
- `GET /api/region/municipalities/:id` - 特定の市区町村取得
- `GET /api/region/prefectures/:prefectureId/municipalities` - 特定の都道府県の市区町村取得
- `POST /api/region/prefectures/:prefectureId/municipalities` - 市区町村作成（コード自動生成）
- `PUT /api/region/municipalities/:id` - 市区町村更新

### その他
- `GET /health` - ヘルスチェック
- `GET /api/test` - API動作確認

## 📜 利用可能なスクリプト

### ルートディレクトリ
- `npm run dev` - フロントエンドとバックエンドを同時に起動
- `npm run dev:frontend` - フロントエンドのみ起動
- `npm run dev:backend` - バックエンドのみ起動
- `npm run build` - フロントエンドをビルド

### バックエンドディレクトリ
- `npm run dev` - 開発サーバーの起動
- `npm run db:generate` - Prismaクライアントの生成
- `npm run db:push` - データベーススキーマの同期
- `npm run db:studio` - Prisma Studioの起動

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. ポートが既に使用されている場合
```bash
# Windows
taskkill /f /im node.exe

# macOS/Linux
pkill -f node
```

#### 2. データベースエラーが発生した場合
```bash
cd backend
rm -rf prisma/dev.db
npm run db:push
# 管理者アカウントはPrisma Studioで手動追加
```

#### 3. 依存関係のエラーが発生した場合
```bash
# ルートディレクトリで実行
rm -rf node_modules package-lock.json
npm install
```

#### 4. TypeScriptエラーが発生した場合
VSCode/Cursorで以下を実行：
1. `Ctrl+Shift+P` でコマンドパレットを開く
2. `TypeScript: Restart TS Server` を実行

## 🤝 開発の流れ

### 1. 新しい機能の開発
1. 新しいブランチを作成
2. 機能を実装
3. テストを実行
4. プルリクエストを作成

### 2. コードの品質
- TypeScriptの型チェックを通過すること
- ESLintのルールに従うこと
- 適切なコメントを記述すること

### 3. コミットメッセージ
- 日本語で分かりやすく記述
- 変更内容を簡潔に説明

## 📝 今後の実装予定

- [x] ユーザー認証機能
- [x] 地域マスター管理機能
- [x] 管理者機能
- [ ] お祭り情報のCRUD機能
- [ ] お祭り検索機能
- [ ] お気に入り機能
- [ ] 画像アップロード機能
- [ ] 地図連携機能

## 📞 サポート

問題が発生した場合は、以下の手順で対応してください：

1. このREADMEのトラブルシューティングを確認
2. エラーログを確認
3. チームメンバーに相談

---

**開発者**: Omatsuri Nav Team  
**最終更新**: 2025年8月

## 🔧 最近の更新内容

### 2025年8月
- ✅ 地域マスター管理機能の完成
- ✅ 市区町村コードの自動生成機能
- ✅ 管理者機能の実装
- ✅ URLベースのルーティング実装
- ✅ 一時的なスクリプトファイルの削除
- ✅ README.mdの更新