# 環境変数の設定

このドキュメントでは、アプリケーションで使用する環境変数の設定方法を説明します。

## パスについて

このドキュメントでは、`<APP_ROOT>` をアプリケーションのルートディレクトリパスとして使用しています。実際の環境に合わせて適切なパスに置き換えてください（例: `/opt/omatsuri-admin`、`/var/www/omatsuri-admin` など）。

---

## 1. バックエンド環境変数ファイルの作成

### 方法1: ひな型ファイルから作成（推奨）

リポジトリに含まれている `.env_server` ファイルを使用：

```bash
cd <APP_ROOT>/backend
cp .env_server .env
# ファイルを編集して各設定値を変更
nano .env
```

### 方法2: 手動で作成

サーバー上のアプリケーションディレクトリに `.env` ファイルを作成：

```bash
sudo nano <APP_ROOT>/backend/.env
```

以下の内容を設定：

```env
NODE_ENV=production
PORT=3001

# データベース接続
DATABASE_URL=postgresql://omatsuri_user:your-secure-password@localhost:5432/omatsuri_db

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRES_IN=365d

# フロントエンドURL
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_BASE_URL=https://your-frontend-domain.com

# メール設定
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-smtp-username
MAIL_PASS=your-smtp-password
MAIL_FROM=no-reply@example.com

# メール設定（任意、デフォルト値を使用する場合は省略可）
# MAIL_REPLY_TO=support@example.com
# MAIL_SUBJECT_REGISTRATION=【おまつり管理】メールアドレスの確認について
# MAIL_BODY_REGISTRATION=カスタム本文（{{verificationUrl}} と {{expiresAt}} を含める）
```

**重要**: 
- `DATABASE_URL` の形式: `postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]`
- `JWT_SECRET` は強力なランダム文字列に変更してください
- パスワードやシークレットに特殊文字が含まれる場合、URLエンコードが必要な場合があります

---

## 2. 環境変数ファイルのセキュリティ設定

`.env` ファイルの権限を制限：

```bash
chmod 600 <APP_ROOT>/backend/.env
chown app-user:app-user <APP_ROOT>/backend/.env
```

**セキュリティ注意事項**:
- `.env` ファイルはGitにコミットしない（`.gitignore` に含まれていることを確認）
- ファイルの読み取り権限は所有者のみに制限
- 定期的にパスワードやシークレットをローテーション

---

## 3. 環境変数の確認

環境変数が正しく読み込まれるか確認：

```bash
cd <APP_ROOT>/backend
source .env
echo $DATABASE_URL
echo $JWT_SECRET
```

**注意**: `source .env` は確認用です。アプリケーションは `dotenv` パッケージにより自動的に読み込みます。

---

## 4. 必要な環境変数の一覧

### バックエンド必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | PostgreSQL接続URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT署名用シークレット | `your-secret-key`（強力なランダム文字列） |
| `PORT` | サーバーポート | `3001` |
| `FRONTEND_URL` | フロントエンドURL（CORS用） | `https://example.com` |
| `FRONTEND_BASE_URL` | フロントエンドベースURL | `https://example.com` |

### バックエンド推奨環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|------------|
| `NODE_ENV` | 実行環境 | `production` |
| `JWT_EXPIRES_IN` | JWT有効期限 | `365d` |

### メール設定（必須）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `MAIL_HOST` | SMTPホスト | `smtp.example.com` |
| `MAIL_PORT` | SMTPポート | `587` |
| `MAIL_SECURE` | SSL/TLS使用 | `false`（ポート587）または `true`（ポート465） |
| `MAIL_USER` | SMTPユーザー名 | `user@example.com` |
| `MAIL_PASS` | SMTPパスワード | `password` |
| `MAIL_FROM` | 送信者メールアドレス | `no-reply@example.com` |

### メール設定（任意）

| 変数名 | 説明 | デフォルト値 |
|--------|------|------------|
| `MAIL_REPLY_TO` | 返信先メールアドレス | なし |
| `MAIL_SUBJECT_REGISTRATION` | 登録メール件名 | デフォルトメッセージ |
| `MAIL_BODY_REGISTRATION` | 登録メール本文 | デフォルトメッセージ |
| `MAIL_SUBJECT_EMAIL_CHANGE` | メール変更件名 | デフォルトメッセージ |
| `MAIL_BODY_EMAIL_CHANGE` | メール変更本文 | デフォルトメッセージ |

### フロントエンド環境変数

ビルド時に設定する環境変数（`.env.production` ファイルに記載）：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_API_URL` | バックエンドAPI URL | `https://api.example.com` または `http://localhost:3001` |

**注意**: フロントエンドの環境変数は、ビルド時に `.env.production` ファイルから読み込まれます。変更した場合は、フロントエンドを再ビルドする必要があります。

---

## 5. 環境変数の変更方法

### バックエンド環境変数の変更

1. `.env` ファイルを編集：
   ```bash
   nano <APP_ROOT>/backend/.env
   ```

2. アプリケーションを再起動：
   ```bash
   pm2 restart omatsuri-backend
   ```

### フロントエンド環境変数の変更

#### 方法1: ひな型ファイルから作成（推奨）

リポジトリに含まれている `.env.production_server` ファイルを使用：

```bash
cd <APP_ROOT>/frontend
cp .env.production_server .env.production
# ファイルを編集して各設定値を変更
nano .env.production
```

#### 方法2: 手動で編集

1. `.env.production` ファイルを編集：
   ```bash
   nano <APP_ROOT>/frontend/.env.production
   ```

2. フロントエンドを再ビルド：
   ```bash
   cd <APP_ROOT>/frontend
   npm run build
   ```

---

## 参考

- [データベース設定](./database.md) - データベース接続情報の設定
- [画面表示に必要なコマンド](./frontend.md) - アプリケーションの起動方法
- [トラブルシューティング](./troubleshooting.md) - 環境変数関連の問題解決

