# 画面表示に必要なコマンド

このドキュメントでは、アプリケーションの画面を表示するために必要なコマンドを説明します。

## 前提条件

- データベースがセットアップ済み（[データベース設定](./database.md)参照）
- 環境変数が設定済み（[環境変数設定](./environment.md)参照）

## パスについて

このドキュメントでは、アプリケーションディレクトリのパスとして `/opt/omatsuri-admin` を使用していますが、実際の環境に合わせて適切なパスに置き換えてください。

一般的なパスの例：
- `/opt/omatsuri-admin` - 例として記載
- `/var/www/omatsuri-admin` - Apache標準的な配置場所
- `/var/www/html/omatsuri-admin` - WebサーバーのDocumentRoot配下
- `/home/username/omatsuri-admin` - ユーザーディレクトリ配下
- その他、環境に応じた任意のパス

以降のコマンドでは、`<APP_ROOT>` を実際のアプリケーションのルートディレクトリパスに置き換えてください。

---

## 1. Node.jsのインストール

### Ubuntu/Debian の場合

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### CentOS/RHEL/Amazon Linux の場合

**CentOS 8+ / RHEL 8+ / Amazon Linux 2023 (dnf使用):**

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

**CentOS 7 / RHEL 7 (yum使用):**

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Node.jsのバージョン確認

```bash
node --version  # v18.x.x であることを確認
npm --version
```

---

## 2. バックエンドのセットアップと起動

### 2.1 依存関係のインストール

```bash
cd <APP_ROOT>/backend

# 依存関係のインストール（本番環境用）
npm ci --only=production

# Prismaクライアントの生成
npm run db:generate
```

### 2.2 PM2のインストール

プロセス管理ツールPM2をインストール：

```bash
sudo npm install -g pm2
```

### 2.3 PM2でアプリケーションを起動

```bash
cd <APP_ROOT>/backend

# PM2で起動
pm2 start src/index.js --name omatsuri-backend

# 自動起動の設定（サーバー再起動後も自動的に起動）
pm2 startup
# 表示されたコマンドを実行（sudo権限が必要）

# 現在のプロセス一覧を保存
pm2 save
```

### 2.4 PM2コマンドの確認

PM2で管理しているアプリケーションの状態を確認したり、管理するための基本的なコマンドです：

```bash
# プロセス状態の確認
# 実行中のプロセスの一覧と状態（実行中、停止中など）を表示
pm2 status

# ログの確認
# アプリケーションのログをリアルタイムで表示
pm2 logs omatsuri-backend

# プロセスの再起動
# アプリケーションを再起動（コード更新後などに使用）
pm2 restart omatsuri-backend

# プロセスの停止
# アプリケーションを停止（ただしPM2の管理下には残る）
pm2 stop omatsuri-backend

# プロセスの削除
# アプリケーションをPM2の管理下から完全に削除
pm2 delete omatsuri-backend
```

**補足**:
- `pm2 status` で表示される情報：プロセスID、CPU使用率、メモリ使用量、再起動回数など
- `pm2 logs` は `Ctrl+C` で終了できます
- コードを更新した場合は `pm2 restart` を実行してください

### 2.5 バックエンドの動作確認

#### 同一サーバー内からの確認

サーバー上（SSH接続した状態など）から直接アクセスして確認：

```bash
# ヘルスチェック
curl http://localhost:3001/health

# APIテスト
curl http://localhost:3001/api/test
```

**注意**: 
- `localhost`（127.0.0.1）は同一サーバー内からのアクセス用です
- バックエンドアプリケーションがポート3001でリッスンしている必要があります
- `pm2 status` でアプリケーションが起動していることを確認してください
- 同一サーバー内からなら、ファイアウォールの設定に関係なくアクセスできます

#### 外部からの確認

外部からアクセスする場合は、実際のドメインやIPアドレスを使用：

```bash
# ドメインを使用する場合
curl https://your-backend-domain.com/health
curl https://your-backend-domain.com/api/test

# IPアドレスを使用する場合
curl http://your-server-ip:3001/health
curl http://your-server-ip:3001/api/test
```

**注意**: 
- 外部から直接ポート3001でアクセスする場合は、ファイアウォールでポートを開放する必要があります
- セキュリティ上の理由から、通常はWebサーバー（Nginx/Apache）経由でアクセスすることを推奨します

---

## 3. フロントエンドのセットアップと表示

### 3.1 フロントエンドのビルド

```bash
cd <APP_ROOT>/frontend

# 環境変数ファイルの作成
echo "VITE_API_URL=https://your-backend-api-domain.com" > .env.production

# 依存関係のインストール
npm install

# ビルド
npm run build
```

**注意**: `VITE_API_URL` は本番環境のバックエンドAPIのURLに設定してください。バックエンドとフロントエンドが同一サーバーでWebサーバー経由でアクセスする場合は、`https://your-frontend-domain.com` を設定します。

---

## 3. Webサーバーの設定

フロントエンドを表示するためのWebサーバー設定を行います。**NginxとApacheのどちらでも動作します。**

- [3-1. Nginxを使用する場合](#3-1-nginxを使用する場合)
- [3-2. Apacheを使用する場合](#3-2-apacheを使用する場合)

---

### 3-1. Nginxを使用する場合

#### 3.1.1 Nginx設定ファイルの作成

**Ubuntu/Debianの場合**: `/etc/nginx/sites-available/omatsuri-frontend` を作成

**CentOS/RHEL/Amazon Linuxの場合**: `/etc/nginx/conf.d/omatsuri-frontend.conf` を作成

```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    
    root <APP_ROOT>/frontend/dist;
    index index.html;

    # 静的ファイルのキャッシュ設定
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA用のルーティング設定
    location / {
        try_files $uri $uri/ /index.html;
    }

    # APIリクエストをバックエンドにプロキシ
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3.1.3 設定ファイルの有効化

```bash
# Ubuntu/Debianの場合
sudo ln -s /etc/nginx/sites-available/omatsuri-frontend /etc/nginx/sites-enabled/
sudo nginx -t  # 設定ファイルの構文チェック
sudo systemctl restart nginx

# CentOS/RHEL/Amazon Linuxの場合
sudo nginx -t  # 設定ファイルの構文チェック
sudo systemctl restart nginx
```

---

### 3-2. Apacheを使用する場合

#### 3.2.1 Apache設定ファイルの作成

**Ubuntu/Debianの場合**: `/etc/apache2/sites-available/omatsuri-frontend.conf` を作成

**CentOS/RHEL/Amazon Linuxの場合**: `/etc/httpd/conf.d/omatsuri-frontend.conf` を作成

```apache
<VirtualHost *:80>
    ServerName your-frontend-domain.com
    DocumentRoot <APP_ROOT>/frontend/dist

    <Directory <APP_ROOT>/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA用のルーティング設定
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 静的ファイルのキャッシュ設定
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>

    # APIリクエストをバックエンドにプロキシ
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

#### 3.2.2 必要なモジュールの有効化（Ubuntu/Debianの場合）

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod expires
```

#### 3.2.3 設定ファイルの有効化

```bash
# Ubuntu/Debianの場合
sudo a2ensite omatsuri-frontend.conf
sudo apache2ctl configtest  # 設定ファイルの構文チェック
sudo systemctl restart apache2

# CentOS/RHEL/Amazon Linuxの場合
sudo httpd -t  # 設定ファイルの構文チェック
sudo systemctl restart httpd
```


---

## 4. 動作確認

### 4.1 バックエンドの確認

```bash
# プロセス状態の確認
pm2 status

# ログの確認
pm2 logs omatsuri-backend

# ヘルスチェック
curl http://localhost:3001/health
```

### 4.2 フロントエンドの確認

```bash
# ブラウザでアクセス
# http://your-frontend-domain.com または https://your-frontend-domain.com
```

### 4.3 全体の確認

- ブラウザでフロントエンドにアクセス
- ページが正常に表示されるか確認
- ブラウザの開発者ツールでAPI通信のエラーがないか確認
- ログイン機能が動作するか確認

---

## 5. デプロイ後のコマンド一覧

### バックエンドの管理

```bash
# 起動
pm2 start omatsuri-backend

# 停止
pm2 stop omatsuri-backend

# 再起動
pm2 restart omatsuri-backend

# ログ確認
pm2 logs omatsuri-backend

# 状態確認
pm2 status
```

### フロントエンドの再ビルド

```bash
cd <APP_ROOT>/frontend
npm run build

# Webサーバーの再起動は不要（静的ファイルを更新するだけ）
```

### Nginxの管理（Nginxを使用している場合）

```bash
# 起動
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 再起動
sudo systemctl restart nginx

# 状態確認
sudo systemctl status nginx

# 設定ファイルの構文チェック
sudo nginx -t
```

### Apacheの管理（Apacheを使用している場合）

```bash
# Ubuntu/Debian
# 起動
sudo systemctl start apache2

# 停止
sudo systemctl stop apache2

# 再起動
sudo systemctl restart apache2

# 状態確認
sudo systemctl status apache2

# 設定ファイルの構文チェック
sudo apache2ctl configtest

# CentOS/RHEL/Amazon Linux
# 起動
sudo systemctl start httpd

# 停止
sudo systemctl stop httpd

# 再起動
sudo systemctl restart httpd

# 状態確認
sudo systemctl status httpd

# 設定ファイルの構文チェック
sudo httpd -t
```

---

## 参考

- [データベース設定](./database.md) - データベースのセットアップ
- [環境変数設定](./environment.md) - 環境変数の設定方法
- [トラブルシューティング](./troubleshooting.md) - 問題が発生した場合の対処法

