# テスト環境設定ガイド

## 前提条件

バックエンド API テストを実行するには、以下の設定が必要です:

### 1. .env ファイルの作成

`backend/`ディレクトリに`.env`ファイルを作成し、以下の環境変数を設定してください:

```bash
# backend/.env
DATABASE_URL=postgres://user:password@localhost:5432/hikkoshi_lens?sslmode=disable
PORT=8080
```

### 2. データベースの準備

テストは実際のデータベースに接続します。以下を確認してください:

1. **PostgreSQL が起動している**

   ```bash
   # macOSの場合
   brew services start postgresql

   # またはDockerを使用
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
   ```

2. **データベースが存在する**

   ```bash
   psql -U postgres
   CREATE DATABASE hikkoshi_lens;
   \q
   ```

3. **マイグレーションを実行済み**
   ```bash
   cd backend
   # マイグレーションコマンド(プロジェクトに応じて調整)
   ```

## テスト実行

### クイックスタート

```bash
cd backend

# .envファイルが存在することを確認
cat .env

# テスト実行
go test ./test/integration/...
```

### 詳細な実行方法

詳しくは TEST_README.md を参照してください。

## トラブルシューティング

### DATABASE_URL エラー

```
DATABASE_URL is not set. Please create a .env file with DATABASE_URL
```

**解決策**:

1. `backend/.env`ファイルを作成
2. `DATABASE_URL=postgres://...`を設定

### データベース接続エラー

```
Failed to connect to database: connection refused
```

**解決策**:

1. PostgreSQL が起動しているか確認
2. `DATABASE_URL`の接続情報が正しいか確認
3. ファイアウォールやネットワーク設定を確認
