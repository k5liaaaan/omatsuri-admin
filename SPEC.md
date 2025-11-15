# 仕様書

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

## 🗄️ データベース構造

### 主要テーブル

#### users
- ユーザー管理テーブル
- フィールド: id, username, email, password, isAdmin, organizationName, createdAt, updatedAt

#### prefectures
- 都道府県マスターテーブル
- フィールド: id, code, name, createdAt, updatedAt

#### municipalities
- 市区町村マスターテーブル
- フィールド: id, code, name, prefectureId, createdAt, updatedAt

#### festivals
- お祭り基本情報テーブル
- フィールド: id, name, address, description, vendorInfo, sponsorInfo, userId, municipalityId, isPublished, createdAt, updatedAt

#### festival_schedules
- お祭り開催日程テーブル
- フィールド: id, festivalId, startDate, endDate, startTime, endTime, createdAt, updatedAt

#### login_attempts
- ログイン試行履歴テーブル
- フィールド: id, email, ipAddress, success, createdAt

#### pending_user_registrations
- 仮登録情報テーブル（メール認証用）
- フィールド: id, email, token, expiresAt, createdAt

#### pending_email_changes
- メールアドレス変更待ち情報テーブル
- フィールド: id, userId, newEmail, token, expiresAt, createdAt

### データベース情報
- **場所**: `backend/prisma/dev.db`
- **形式**: SQLite
- **スキーマ**: `backend/prisma/schema.prisma`

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

## 📋 機能仕様

### ユーザー認証
- メール認証による会員登録
- JWT トークンによる認証
- プロフィール編集（メールアドレス変更、パスワード変更、主催団体名変更）
- 管理者と一般ユーザーの権限管理

### 地域マスター管理
- 都道府県の登録・編集
- 市区町村の登録・編集（コード自動生成）
- 管理者のみ地域マスターの管理が可能

### お祭り管理
- お祭りの登録・編集・削除
- 複数日程の対応
- 公開・非公開の設定
- 管理者・主催者のみ編集・削除可能

### セキュリティ
- パスワードのハッシュ化（bcrypt）
- JWT トークンによる認証
- レート制限による不正アクセス防止
- セキュリティヘッダーの設定（helmet）

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

