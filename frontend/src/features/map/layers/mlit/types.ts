/**
 * 国土交通省人口集中地区（DID）レイヤーの型定義
 * - MLIT APIから取得した人口集中地区データの型定義
 * - レイヤー固有の設定や状態の型定義
 */

import type { Map } from "mapbox-gl";
import type { FeatureCollection } from "geojson";

// Defined locally after removing external-apis/mlit.ts
export interface DIDProperties {
  A16_001?: string; // 都道府県コード
  A16_002?: string; // 都道府県名
  A16_003?: string; // 市区町村コード
  A16_004?: string; // 市区町村名
  A16_005?: number; // 人口総数
  A16_006?: number; // 面積
  A16_007?: number; // 前回人口総数
  A16_008?: number; // 前回面積
  A16_012?: number; // 人口総数（男）
  A16_013?: number; // 人口総数（女）
  A16_014?: number; // 世帯総数
  [key: string]: any;
}

export interface MLITDIDLayerConfig {
  sourceId: string;
  layerId: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

export interface MLITDIDLayerState {
  isVisible: boolean;
  isLoading: boolean;
  error: Error | null;
  setVisible: (isVisible: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// DIDPropertiesを使用
export type MLITDIDFeatureProperties = DIDProperties;

export type MLITDIDGeoJSON = FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  MLITDIDFeatureProperties
>;

export interface MLITDIDLayerAPI {
  initialize: (map: Map) => void;
  update: (map: Map, data: GeoJSON.FeatureCollection) => void;
  show: (map: Map) => void;
  hide: (map: Map) => void;
  remove: (map: Map) => void;
  loadDIDDataForMapView: (
    map: Map,
    center: {
      lat: number;
      lng: number;
    },
    zoom: number
  ) => Promise<void>;
}
