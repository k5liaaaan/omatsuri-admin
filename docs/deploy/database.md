# データベース設定

このドキュメントでは、PostgreSQLデータベースのセットアップ手順を説明します。

## 前提条件

- Linuxサーバー（Ubuntu 22.04、CentOS 7/8+、RHEL 7/8+、Amazon Linux 2023 など）
- sudo権限

## パスについて

このドキュメントでは、`<APP_ROOT>` をアプリケーションのルートディレクトリパスとして使用しています。実際の環境に合わせて適切なパスに置き換えてください（例: `/opt/omatsuri-admin`、`/var/www/omatsuri-admin` など）。

---

## 1. PostgreSQLのインストール

### Ubuntu/Debian の場合

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### CentOS/RHEL の場合

**CentOS 8+ / RHEL 8+ (dnf使用):**

```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**CentOS 7 / RHEL 7 (yum使用):**

```bash
# 標準リポジトリからインストール（PostgreSQL 9.2）
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**PostgreSQL 12を使用する場合（推奨）:**

```bash
# PostgreSQL公式リポジトリの追加
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# PostgreSQL 12のインストール
sudo yum install -y postgresql12-server postgresql12-contrib

# データベースクラスターの初期化
sudo /usr/pgsql-12/bin/postgresql-12-setup initdb

# PostgreSQLサービスの起動と自動起動設定
sudo systemctl start postgresql-12
sudo systemctl enable postgresql-12
```

**注意**: PostgreSQL 12をインストールした場合、以降のコマンドは `postgresql` の代わりに `postgresql-12` を使用してください。

### Amazon Linux 2023 の場合

```bash
sudo dnf install -y postgresql15 postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. データベースとユーザーの作成

PostgreSQLに接続してデータベースとユーザーを作成：

```bash
sudo -u postgres psql
```

PostgreSQLコンソールで以下を実行：

```sql
-- データベースの作成
CREATE DATABASE omatsuri_db;

-- ユーザーの作成（パスワードは適宜変更してください）
CREATE USER omatsuri_user WITH ENCRYPTED PASSWORD 'your-secure-password';

-- 権限の付与
GRANT ALL PRIVILEGES ON DATABASE omatsuri_db TO omatsuri_user;

-- データベースに接続
\c omatsuri_db

-- スキーマの権限を付与（PostgreSQL 9.x以降）
GRANT ALL ON SCHEMA public TO omatsuri_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO omatsuri_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO omatsuri_user;

-- 終了
\q
```

---

## 3. PostgreSQLの接続設定

リモート接続が必要な場合、`postgresql.conf` と `pg_hba.conf` を編集：

### `postgresql.conf` の編集

**Ubuntu/Debian:**
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**CentOS/RHEL (dnf使用、PostgreSQL 10以降):**
```bash
sudo nano /var/lib/pgsql/data/postgresql.conf
```

**CentOS/RHEL (yum使用、PostgreSQL 12を公式リポジトリからインストールした場合):**
```bash
sudo nano /var/lib/pgsql/12/data/postgresql.conf
```

**CentOS 7 (yum使用、標準リポジトリのPostgreSQL):**
```bash
sudo nano /var/lib/pgsql/data/postgresql.conf
```

以下の設定を変更：
```
listen_addresses = 'localhost'  # または '*'（リモート接続が必要な場合）
```

### `pg_hba.conf` の編集

**Ubuntu/Debian:**
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**CentOS/RHEL (dnf使用、PostgreSQL 10以降):**
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

**CentOS/RHEL (yum使用、PostgreSQL 12を公式リポジトリからインストールした場合):**
```bash
sudo nano /var/lib/pgsql/12/data/pg_hba.conf
```

**CentOS 7 (yum使用、標準リポジトリのPostgreSQL):**
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

**設定内容:**

ローカル接続の場合、ファイルの末尾に追加：
```
host    omatsuri_db    omatsuri_user    127.0.0.1/32    md5
```

リモート接続の場合（セキュリティに注意）：
```
host    omatsuri_db    omatsuri_user    YOUR_APP_SERVER_IP/32    md5
```

**注意**: 既存の `local` または `host` 設定がある場合は、それらを参考にしてください。

設定変更後、PostgreSQLを再起動：

```bash
# 標準のPostgreSQL
sudo systemctl restart postgresql

# PostgreSQL 12の場合
sudo systemctl restart postgresql-12
```

---

## 4. 接続情報の確認

接続をテスト：

```bash
psql -h localhost -U omatsuri_user -d omatsuri_db
```

接続情報を記録：
- **ホスト**: `localhost`（またはPostgreSQLサーバーのIP）
- **ポート**: `5432`（デフォルト）
- **データベース名**: `omatsuri_db`
- **ユーザー名**: `omatsuri_user`
- **パスワード**: 設定したパスワード

---

## 5. Prismaスキーマの更新

本番環境用にPrismaスキーマを更新します。

### 5.1 `backend/prisma/schema.prisma` の修正

`backend/prisma/schema.prisma` を編集して、データソースをPostgreSQLに変更：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**注意**: `provider` を `sqlite` から `postgresql` に変更してください。

### 5.2 必要なパッケージのインストール

PostgreSQL用のパッケージをインストール：

```bash
cd backend
npm install pg
npm install --save-dev @types/pg
```

### 5.3 Prismaクライアントの再生成

```bash
cd backend
npm run db:generate
```

---

## 6. データベースのマイグレーション

### 6.1 データベース接続の確認

環境変数を設定後、データベースに接続できるか確認：

```bash
cd <APP_ROOT>/backend

# 環境変数を読み込む
export $(grep -v '^#' .env | xargs)

# Prismaで接続テスト
npx prisma db pull
```

または、直接PostgreSQLに接続してテスト：

```bash
psql -h localhost -U omatsuri_user -d omatsuri_db
```

### 6.2 マイグレーションの実行

本番データベースにスキーマを適用：

#### 方法1: マイグレーションを使用（推奨）

既存のマイグレーションファイルがある場合：

```bash
cd <APP_ROOT>/backend

# 環境変数を読み込む
export $(grep -v '^#' .env | xargs)

# マイグレーションの実行
npx prisma migrate deploy
```

#### 方法2: スキーマを直接プッシュ

マイグレーションファイルがない場合、または開発環境の場合：

```bash
cd <APP_ROOT>/backend

# 環境変数を読み込む
export $(grep -v '^#' .env | xargs)

# スキーマを直接プッシュ
npm run db:push
```

**注意**: 本番環境では `prisma migrate deploy` を使用することを推奨します。

### 6.3 シードデータの投入

都道府県マスターデータを投入：

```bash
cd <APP_ROOT>/backend

# 環境変数を読み込む
export $(grep -v '^#' .env | xargs)

# シードデータの投入
npm run db:seed
```

---

## 参考

- [環境変数設定](./environment.md) - `.env`ファイルの設定方法
- [デプロイ手順](../DEPLOY.md) - 全体のデプロイ手順

