# トラブルシューティング

このドキュメントでは、デプロイ時に発生する可能性のある問題と解決方法を説明します。

## パスについて

このドキュメントでは、`<APP_ROOT>` をアプリケーションのルートディレクトリパスとして使用しています。実際の環境に合わせて適切なパスに置き換えてください（例: `/opt/omatsuri-admin`、`/var/www/omatsuri-admin` など）。

---

## データベース接続エラー

**症状**: `Can't reach database server` などのエラー

**確認項目**:

1. PostgreSQLが起動しているか確認:
   ```bash
   sudo systemctl status postgresql
   # または
   sudo systemctl status postgresql-12
   ```

2. `DATABASE_URL` の値が正しいか確認:
   ```bash
   cd <APP_ROOT>/backend
   cat .env | grep DATABASE_URL
   ```

3. 接続情報をテスト:
   ```bash
   psql -h localhost -U omatsuri_user -d omatsuri_db
   ```

4. `pg_hba.conf` の設定を確認（ローカル接続が許可されているか）

5. ファイアウォールでポート5432がブロックされていないか確認

---

## 環境変数が読み込まれない

**症状**: 環境変数の値が `undefined` またはデフォルト値が使用される

**確認項目**:

1. `.env` ファイルが存在し、正しい場所にあるか確認:
   ```bash
   ls -la <APP_ROOT>/backend/.env
   ```

2. `.env` ファイルの権限を確認:
   ```bash
   ls -l <APP_ROOT>/backend/.env
   # 600 である必要がある
   ```

3. 環境変数の形式が正しいか確認（余分なスペースや引用符がないか）

4. アプリケーションを再起動:
   ```bash
   pm2 restart omatsuri-backend
   ```

---

## マイグレーションエラー

**症状**: マイグレーション実行時にエラーが発生

**確認項目**:

1. データベース接続が確立されているか確認

2. Prismaスキーマが正しく更新されているか確認:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. `prisma migrate deploy` を使用（本番環境では `migrate dev` ではなく）

4. 既存のマイグレーションファイルがあるか確認:
   ```bash
   ls -la <APP_ROOT>/backend/prisma/migrations/
   ```

5. マイグレーションロックの問題がある場合、データベースに直接接続して確認

---

## アプリケーションが起動しない

**症状**: PM2でプロセスが起動しない、またはすぐにクラッシュする

**確認項目**:

1. ログを確認:
   ```bash
   pm2 logs omatsuri-backend --lines 100
   ```

2. Node.jsのバージョンを確認（v18以上である必要がある）:
   ```bash
   node --version
   ```

3. 依存関係がインストールされているか確認:
   ```bash
   cd <APP_ROOT>/backend
   ls -la node_modules/
   ```

4. ポート3001が既に使用されていないか確認:
   ```bash
   sudo netstat -tlnp | grep 3001
   # または
   sudo lsof -i :3001
   ```

5. 環境変数が正しく設定されているか確認

---

## Webサーバーエラー（Nginx/Apache）

**症状**: フロントエンドが表示されない、502エラーが発生

### Nginxを使用している場合

**確認項目**:

1. Nginxのエラーログを確認:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Nginx設定ファイルの構文を確認:
   ```bash
   sudo nginx -t
   ```

3. Nginxが起動しているか確認:
   ```bash
   sudo systemctl status nginx
   ```

### Apacheを使用している場合

**確認項目**:

1. Apacheのエラーログを確認:
   ```bash
   # Ubuntu/Debian
   sudo tail -f /var/log/apache2/error.log
   
   # CentOS/RHEL/Amazon Linux
   sudo tail -f /var/log/httpd/error_log
   ```

2. Apache設定ファイルの構文を確認:
   ```bash
   # Ubuntu/Debian
   sudo apache2ctl configtest
   
   # CentOS/RHEL/Amazon Linux
   sudo httpd -t
   ```

3. Apacheが起動しているか確認:
   ```bash
   # Ubuntu/Debian
   sudo systemctl status apache2
   
   # CentOS/RHEL/Amazon Linux
   sudo systemctl status httpd
   ```

4. 必要なモジュールが有効になっているか確認（Ubuntu/Debian）:
   ```bash
   sudo apache2ctl -M | grep -E '(rewrite|proxy|headers|expires)'
   ```

### 共通の確認項目

1. 静的ファイルのパスが正しいか確認:
   ```bash
   ls -la <APP_ROOT>/frontend/dist/
   ```

2. ファイルの権限を確認:
   ```bash
   ls -la <APP_ROOT>/frontend/dist/
   # Webサーバーのユーザー（www-data、apache、nginxなど）が読み取り可能である必要がある
   ```

3. バックエンドAPIが正常に動作しているか確認（localhost:3001）

---

## メール送信エラー

**症状**: ユーザー登録メールが送信されない

**確認項目**:

1. SMTP設定が正しいか確認（`.env` ファイル）

2. SMTPサーバーに接続できるか確認:
   ```bash
   telnet smtp.example.com 587
   ```

3. メール設定の環境変数が正しく読み込まれているか確認

4. アプリケーションログでエラーメッセージを確認:
   ```bash
   pm2 logs omatsuri-backend
   ```

---

## 定期的なメンテナンス

### データベースバックアップ

```bash
# バックアップの実行
pg_dump -h localhost -U omatsuri_user -d omatsuri_db > /backup/omatsuri_db_$(date +%Y%m%d).sql

# 圧縮
gzip /backup/omatsuri_db_$(date +%Y%m%d).sql

# 古いバックアップの削除（30日以上経過したもの）
find /backup -name "omatsuri_db_*.sql.gz" -mtime +30 -delete
```

### ログローテーション

PM2のログローテーション設定:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### システム更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS 8+ / RHEL 8+ / Amazon Linux 2023 (dnf使用)
sudo dnf update -y

# CentOS 7 / RHEL 7 (yum使用)
sudo yum update -y
```

---

## セキュリティのベストプラクティス

1. **データベース接続**:
   - PostgreSQLはローカルホストでのみ接続を許可（`pg_hba.conf`で設定）
   - リモート接続が必要な場合、ファイアウォールで特定のIPからのみ許可
   - データベースユーザーのパスワードは強力なものを使用

2. **環境変数**:
   - `.env` ファイルの権限を600に設定（`chmod 600 .env`）
   - 機密情報をGitにコミットしない
   - 定期的にパスワードやシークレットをローテーション

3. **HTTPS**:
   - フロントエンドとAPIはHTTPSを使用（Let's Encryptなど）
   - SSL証明書の自動更新を設定

4. **ログ管理**:
   - アプリケーションログを適切な場所に保存
   - ログローテーションを設定
   - 機密情報がログに出力されないように注意

5. **バックアップ**:
   - データベースの定期バックアップを設定
   - バックアップファイルの保管場所を確保

6. **ファイアウォール設定**:
   - 必要なポートのみ開放（SSH、HTTP、HTTPS）
   - データベースポート（5432）は外部からアクセス不可に

7. **プロセス管理**:
   - PM2やsystemdを使用してプロセスの監視と自動再起動を設定
   - ログの監視を実施

8. **システム更新**:
   - OSとソフトウェアを定期的に更新
   - セキュリティパッチを適用

---

## 参考

- [データベース設定](./database.md) - データベースのセットアップ
- [画面表示に必要なコマンド](./frontend.md) - アプリケーションの起動方法
- [環境変数設定](./environment.md) - 環境変数の設定方法

