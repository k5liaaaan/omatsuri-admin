
# システムのアップデート

## パッケージの更新
sudo dnf update -y

## 基本的なツールのインストール
sudo dnf install -y git

# Node.jsのインストール（Amazon Linux 2023の場合）

## Node.js 20をインストール
sudo dnf install -y nodejs npm

## バージョン確認
node --version
npm --version

# GitでSSH接続

## SSHキーの作成
ssh-keygen

## 鍵を閲覧しGitへ貼り付け
cat ~/.ssh/id_rsa.pub

## 疎通確認
ssh -T git@github.com

#アプリケーションのクローン

## アプリケーションディレクトリを作成
sudo mkdir -p /var/www
cd /var/www

## Gitリポジトリをクローン
sudo git clone git@github.com:k5liaaaan/omatsuri-admin.git

## 所有者を変更
sudo chown -R ec2-user:ec2-user /var/www/omatsuri-admin

# バックエンドのセットアップ

## 移動
cd /var/www/omatsuri-admin/backend

## 環境変数ファイルの作成
cp .env_server .env

## .envファイルを編集（データベース接続情報など）
vim .env

## 依存関係のインストール
npm install

cd /var/www/omatsuri-admin/backend

# PM2をインストール
sudo npm install -g pm2

# PM2でnpm startを実行
pm2 start npm --name omatsuri-backend -- start

# 状態を確認
pm2 status

# ログを確認
pm2 logs omatsuri-backend

# 自動起動の設定コマンドを表示
pm2 startup

# 表示されたコマンドを実行（sudo権限が必要）
# 例: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# 現在のプロセス一覧を保存
pm2 save

# バックエンドの動作確認
curl http://localhost:3001/health

# または
curl http://localhost:3001/api/test

# フロントエンドのビルド

cd /var/www/omatsuri-admin/frontend

## 環境変数の設定
mv .env.production_server .env
vim .env

## 依存関係のインストール
npm install

## ビルド
npm run build

#Webサーバー（Nginx）のインストールと設定

## Nginxをインストール
sudo dnf install -y nginx

## Nginx設定ファイルを作成
sudo vim /etc/nginx/conf.d/omatsuri-admin.conf

## Nginxを起動
sudo systemctl start nginx
sudo systemctl enable nginx

## 設定の確認
sudo nginx -t
sudo systemctl restart nginx

## ファイアウォール設定
Lightsailで完結

# Prismaマイグレーションの実行

## 
cd /var/www/omatsuri-admin/backend

# Prismaクライアントの生成
npm run db:generate

# データベーススキーマの同期（初回）
npm run db:push

# 47都道府県データを投入
npm run db:seed

## 管理者ユーザーの作成

# omatsuri-nav

cd /var/www/omatsuri-nav

# 依存関係のインストール
npm install

# 環境変数の設定（バックエンドAPIのURL）
echo "NEXT_PUBLIC_API_BASE_URL=http://43.207.80.192:8080" > .env.production

# ビルド（.env.productionが読み込まれる）
npm run build

# 起動（.env.productionが読み込まれる）
npm start