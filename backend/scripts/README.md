# スクリプトファイル

このディレクトリには、データベースの初期化やサンプルデータの投入に使用するスクリプトが含まれています。

## 利用可能なスクリプト

### 1. createAdmin.js
管理者アカウントと地域マスターデータを作成します。

```bash
npm run create-admin
```

**作成されるデータ:**
- 管理者アカウント（username: admin, password: admin123）
- 都道府県データ（千葉県、東京都、神奈川県）
- 市区町村データ（千葉市の各区域）

### 2. sampleFestivals.js
お祭りのサンプルデータ50件を作成します。

```bash
npm run create-sample-festivals
```

**作成されるデータ:**
- 千葉市各区域のお祭りデータ50件
- 各お祭りの開催日程情報
- 出店情報、協賛情報など

## 実行順序

1. まず `createAdmin.js` を実行して地域データを作成
2. その後 `sampleFestivals.js` を実行してお祭りデータを作成

```bash
# 1. 管理者と地域データの作成
npm run create-admin

# 2. お祭りサンプルデータの投入
npm run create-sample-festivals
```

## 注意事項

- 既存のデータは重複チェックされ、スキップされます
- 管理者ユーザーが存在しない場合は自動作成されます
- 千葉県の市区町村データが存在しない場合はエラーになります

## データの確認

作成されたデータは Prisma Studio で確認できます：

```bash
npm run db:studio
```

ブラウザで http://localhost:5555 にアクセスしてデータベースの内容を確認できます。
