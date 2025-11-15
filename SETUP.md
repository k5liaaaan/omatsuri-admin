# 環境構築手順

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

# 47都道府県データの自動投入（初回環境構築時に自動実行）
npm run db:seed

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

# マイグレーションの実行（スキーマ変更時）
npm run db:migrate

# 47都道府県データの投入（環境構築時・データリセット時）
npm run db:seed

# Prisma Studioの起動
npm run db:studio
```

### 都道府県マスターデータ

環境構築時に自動的に日本の47都道府県データがデータベースに投入されます：

```bash
cd backend
npm run db:seed
```

このコマンドにより、以下の47都道府県が自動的に作成されます：
- 北海道（01）から沖縄県（47）まで
- 既に存在する都道府県はスキップされ、重複エラーは発生しません

**注意**: `prisma migrate reset` コマンドを実行すると、自動的にシードが実行されます（`prisma.seed`設定により）。

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
npm run db:seed  # 47都道府県データを投入
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

## 📞 サポート

問題が発生した場合は、以下の手順で対応してください：

1. このドキュメントのトラブルシューティングを確認
2. エラーログを確認
3. チームメンバーに相談

