-- +goose Up
-- +goose StatementBegin

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- stations table
CREATE TABLE IF NOT EXISTS stations (
    id BIGSERIAL PRIMARY KEY,
    station_code VARCHAR(255) UNIQUE,
    organization_code VARCHAR(255) NOT NULL,
    line_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    prefecture_code INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- lines table
CREATE TABLE IF NOT EXISTS lines (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT NOT NULL,
    line_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_line FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS lines;
DROP TABLE IF EXISTS stations;
-- +goose StatementEnd
