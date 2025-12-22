package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
}

func Load() (*Config, error) {
	// .envファイルがあれば読み込む (エラーは無視して環境変数優先)
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 開発環境のデフォルト値 (必要に応じて)
	if dbURL == "" {
		log.Println("Warning: DATABASE_URL is not set")
	}

	return &Config{
		DatabaseURL: dbURL,
		Port:        port,
	}, nil
}
