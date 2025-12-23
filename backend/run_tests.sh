#!/bin/bash

# バックエンドAPIテスト実行スクリプト

# カラー出力
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Hikkoshi Lens Backend API Tests ===${NC}\n"

# テスト前の環境確認
echo -e "${YELLOW}環境確認...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}エラー: .envファイルが見つかりません${NC}"
    echo "テストには.envファイルでDATABASE_URLを設定する必要があります"
    exit 1
fi

# データベース接続確認
echo -e "${GREEN}✓${NC} .envファイルが存在します\n"

# テストオプション設定
VERBOSE=""
COVERAGE=false
INTEGRATION_ONLY=false

# コマンドライン引数の処理
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE="-v"
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -i|--integration)
            INTEGRATION_ONLY=true
            shift
            ;;
        *)
            echo "不明なオプション: $1"
            echo "使用方法: ./run_tests.sh [-v] [-c] [-i]"
            echo "  -v, --verbose      : 詳細出力"
            echo "  -c, --coverage     : カバレッジレポート生成"
            echo "  -i, --integration  : 統合テストのみ実行"
            exit 1
            ;;
    esac
done

# テスト実行
if [ "$INTEGRATION_ONLY" = true ]; then
    echo -e "${YELLOW}統合テストのみ実行...${NC}\n"
    go test $VERBOSE ./test/integration/...
else
    echo -e "${YELLOW}全テスト実行...${NC}\n"
    if [ "$COVERAGE" = true ]; then
        echo -e "${YELLOW}カバレッジ測定を有効化${NC}\n"
        go test $VERBOSE -cover -coverprofile=coverage.out ./...
        
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}✓ テスト成功${NC}"
            echo -e "\n${YELLOW}カバレッジレポート生成中...${NC}"
            go tool cover -html=coverage.out -o coverage.html
            echo -e "${GREEN}✓ coverage.htmlを生成しました${NC}"
            
            # カバレッジサマリーを表示
            echo -e "\n${YELLOW}カバレッジサマリー:${NC}"
            go tool cover -func=coverage.out | grep total
        else
            echo -e "\n${RED}✗ テスト失敗${NC}"
            exit 1
        fi
    else
        go test $VERBOSE ./...
        
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}✓ すべてのテストが成功しました${NC}"
        else
            echo -e "\n${RED}✗ テストが失敗しました${NC}"
            exit 1
        fi
    fi
fi

echo ""
