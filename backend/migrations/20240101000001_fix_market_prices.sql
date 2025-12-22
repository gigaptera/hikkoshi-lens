-- +goose Up
-- +goose StatementBegin
DROP TABLE IF EXISTS market_prices CASCADE;

CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    station_id BIGINT UNIQUE NOT NULL,
    avg_rent_1r NUMERIC(10, 2),
    avg_rent_1ldk NUMERIC(10, 2),
    source TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_market FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS market_prices;
-- +goose StatementEnd
