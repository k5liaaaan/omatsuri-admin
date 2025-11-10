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

## 🚀 環境構築手順

### 前提条件
- Node.js 18以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd omatsuri-admin
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
FRONTEND_BASE_URL=http://localhost:5173

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-smtp-username
MAIL_PASS=your-smtp-password
MAIL_FROM=no-reply@example.com
# 任意設定
# MAIL_REPLY_TO=support@example.com
# MAIL_SUBJECT_REGISTRATION=【おまつり管理】メールアドレスの確認について
# MAIL_BODY_REGISTRATION=カスタム本文（{{verificationUrl}} と {{expiresAt}} を含めてください）
# MAIL_SUBJECT_EMAIL_CHANGE=【おまつり管理】新しいメールアドレスの確認
# MAIL_BODY_EMAIL_CHANGE=カスタム本文（{{verificationUrl}} と {{expiresAt}} を含めてください）
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

#### 主要テーブル
- **users** - ユーザー管理
- **prefectures** - 都道府県マスター
- **municipalities** - 市区町村マスター
- **festivals** - お祭り基本情報
- **festival_schedules** - お祭り開催日程
- **login_attempts** - ログイン試行履歴
- **pending_user_registrations** - 仮登録情報（メール認証用）
- **pending_email_changes** - メールアドレス変更待ち情報

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

### サンプルデータの投入

#### お祭りサンプルデータ（50件）

千葉県千葉市の各区域を対象としたお祭りサンプルデータ50件を投入できます：

```bash
cd backend

# お祭りサンプルデータの投入
npm run create-sample-festivals
```

**注意**: このコマンドは以下の条件で実行されます：
- 千葉県の市区町村データが既に存在すること
- 管理者ユーザーが存在すること（存在しない場合は自動作成）
- 既存のお祭りデータは重複チェックされ、スキップされます

#### サンプルデータの内容

- **地域**: 千葉市の各区域（中央区、花見川区、稲毛区、若葉区、緑区、美浜区）
- **祭りの種類**: 季節の祭り、伝統行事、現代的なイベントなど
- **データ項目**: 祭り名、住所、内容、出店情報、協賛情報、開催日程
- **期間**: 2024年〜2027年の年間を通じた祭りデータ

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
ログイン画面で「仮登録メールを送信する」を選択し、メールに記載されたリンクから本登録を完了します。開発用途で直接追加したい場合は Prisma Studio から `users` テーブルへ手動登録してください。

### 会員登録フロー
1. ログイン画面でメールアドレスを入力し、`POST /api/auth/register` により仮登録メールを送信します。
2. 届いたメールのリンク（例：`http://localhost:5173/complete-registration?token=...`）から本登録ページへアクセスします。
3. ユーザー名・パスワード・お祭り主催団体名（任意）を入力して `POST /api/auth/complete-registration` を呼び出し、本登録を完了します。
4. 登録完了後は自動でログイン状態となり、ダッシュボードへ遷移します。

- トークンの有効期限は 1 週間です。期限切れの場合は再度仮登録を実施してください。
- 認証メールの設定は `backend/config/mail.js` で管理しています。`.env` に設定した SMTP 情報／件名／本文テンプレートを利用し、`{{verificationUrl}}` と `{{expiresAt}}` プレースホルダーが本文内で展開されます。

### プロフィール編集フロー
1. ログイン後、ダッシュボードの「プロフィールを編集」ボタンから `/profile/edit` にアクセスします。
2. 以下の項目を変更できます（いずれか1項目以上の変更が必須。送信時は現在のパスワード入力が必要）  
   - 新しいメールアドレス（確認メール送信 → `POST /api/auth/confirm-email-change` で確定）  
   - 主催団体名（即時反映。空欄にすると未登録扱い）  
   - パスワード（新しいパスワード＋確認用パスワード）
3. メール変更が保留中の間は、ダッシュボードと編集ページに「確認中」のステータスが表示されます。確認リンクの有効期限は 1 週間です。

### セキュリティ設定
- DBに登録されているユーザーのみログイン可能
- ログイン画面からの新規登録はメール認証必須
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
- `POST /api/auth/register` - 仮登録メール送信（メールアドレスのみ）
- `POST /api/auth/complete-registration` - 本登録完了（トークン・ユーザー名・パスワード・主催団体名）
- `POST /api/auth/login` - ユーザーログイン
- `GET /api/auth/profile` - ユーザープロフィール取得（認証必要）
- `PATCH /api/user/profile` - プロフィール更新（認証必要）
- `POST /api/auth/confirm-email-change` - メールアドレス変更の確定（確認リンク用）

### 地域マスター関連
- `GET /api/region/prefectures` - 都道府県一覧取得
- `GET /api/region/prefectures/:id` - 特定の都道府県取得
- `POST /api/region/prefectures` - 都道府県作成
- `GET /api/region/municipalities` - 市区町村一覧取得
- `GET /api/region/municipalities/:id` - 特定の市区町村取得
- `GET /api/region/prefectures/:prefectureId/municipalities` - 特定の都道府県の市区町村取得
- `POST /api/region/prefectures/:prefectureId/municipalities` - 市区町村作成（コード自動生成）
- `PUT /api/region/municipalities/:id` - 市区町村更新

### お祭り関連
- `GET /api/festivals` - お祭り一覧取得（認証必要）
- `GET /api/festivals/:id` - お祭り詳細取得
- `POST /api/festivals` - お祭り登録（認証必要）
- `PUT /api/festivals/:id` - お祭り更新（認証必要）
- `DELETE /api/festivals/:id` - お祭り削除（認証必要）
- `PATCH /api/festivals/:id/unpublish` - お祭り非公開設定（認証必要）
- `GET /api/festivals/my` - ユーザーが登録したお祭り一覧取得（認証必要）

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
- [x] お祭り登録・管理機能（複数日程対応）
- [x] お祭り情報の編集・削除機能
- [x] お祭り非公開設定機能
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
**最終更新**: 2025年9月

## 🔧 最近の更新内容

### 2025年9月（最新）
- ✅ お祭り編集機能の実装（登録フォームの流用）
- ✅ お祭り削除機能の実装（物理削除、確認ポップアップ付き）
- ✅ お祭り非公開設定機能の実装
- ✅ 公開状態の視覚的表示（詳細ページ・一覧ページ）
- ✅ 権限管理の強化（管理者・主催者のみ編集・削除可能）
- ✅ 編集時の地域情報自動取得機能
- ✅ 編集・新規登録でのキャンセル遷移先の分岐

### 2025年9月（前期）
- ✅ お祭り登録・管理機能の実装
- ✅ 複数日程対応のDB設計
- ✅ 都道府県・市区町村の段階的選択UI
- ✅ トランザクション処理による安全なデータ保存
- ✅ 日程のバリデーション機能

### 2025年8月
- ✅ 地域マスター管理機能の完成
- ✅ 市区町村コードの自動生成機能
- ✅ 管理者機能の実装
- ✅ URLベースのルーティング実装
- ✅ 一時的なスクリプトファイルの削除
- ✅ README.mdの更新