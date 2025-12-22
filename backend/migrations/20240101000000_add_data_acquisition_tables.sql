-- +goose Up
-- +goose StatementBegin

-- 1. station_details: 駅の属性情報
CREATE TABLE IF NOT EXISTS station_details (
    station_id BIGINT PRIMARY KEY,
    daily_passengers INTEGER, -- 乗降客数
    description TEXT, -- 駅周辺の特徴など
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 2. market_prices: 家賃・地価相場
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    station_id BIGINT UNIQUE NOT NULL,
    avg_rent_1r NUMERIC(10, 2), -- ワンルーム家賃相場 (万円)
    avg_rent_1ldk NUMERIC(10, 2), -- 1LDK家賃相場 (万円)
    source TEXT, -- データソース (e.g., 'SUUMO', 'MLIT')
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_market FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 3. facilities: 周辺施設カウント
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    station_id BIGINT UNIQUE NOT NULL,
    supermarkets_count INTEGER DEFAULT 0,
    convenience_stores_count INTEGER DEFAULT 0,
    hospitals_count INTEGER DEFAULT 0,
    drugstores_count INTEGER DEFAULT 0,
    restaurants_count INTEGER DEFAULT 0,
    gyms_count INTEGER DEFAULT 0,
    parks_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_facilities FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 4. crime_stats: 治安データ (行政区単位 or 詳細エリア)
CREATE TABLE IF NOT EXISTS crime_stats (
    id SERIAL PRIMARY KEY,
    municipality_code VARCHAR(10) NOT NULL, -- 行政区コード (JIS X 0402)
    area_name VARCHAR(100), -- エリア名 (e.g., 東京都世田谷区)
    total_crimes INTEGER, -- 犯罪認知総数
    violent_crimes INTEGER, -- 粗暴犯数
    crime_rate NUMERIC(10, 5), -- 犯罪発生率 (件/人)
    data_year INTEGER, -- データ年
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (municipality_code, data_year)
);

-- 5. disaster_risks: 災害リスク
CREATE TABLE IF NOT EXISTS disaster_risks (
    id SERIAL PRIMARY KEY,
    station_id BIGINT UNIQUE NOT NULL,
    flood_risk_level INTEGER DEFAULT 0, -- 洪水リスク (0:なし, 1:注意, 2:警戒, 3:危険)
    landslide_risk_level INTEGER DEFAULT 0, -- 土砂災害リスク
    earthquake_risk_level INTEGER DEFAULT 0, -- 地震リスク
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_risks FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS disaster_risks;
DROP TABLE IF EXISTS crime_stats;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS market_prices;
DROP TABLE IF EXISTS station_details;
-- +goose StatementEnd
