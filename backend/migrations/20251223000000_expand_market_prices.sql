-- Recreate market_prices table to support 15 combinations and proper FK
DROP TABLE IF EXISTS market_prices;

CREATE TABLE market_prices (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT NOT NULL,
    building_type VARCHAR(50) NOT NULL, -- 'mansion', 'apart', 'detached'
    layout VARCHAR(50) NOT NULL,        -- '1r_1k_1dk', '1ldk_2k_2dk', '2ldk_3k_3dk', '3ldk_4k', 'others'
    avg_rent NUMERIC(10, 2) NOT NULL,
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_station_market FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    CONSTRAINT uq_station_building_layout UNIQUE (station_id, building_type, layout)
);

CREATE INDEX idx_market_prices_station_id ON market_prices(station_id);
