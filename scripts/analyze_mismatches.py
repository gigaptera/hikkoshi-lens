import pandas as pd
import mojimoji
import os
import re
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Re-use Normalization Logic ---
COMPANY_MAPPING_TABLE = {
    "北海道旅客鉄道": "jr", "東日本旅客鉄道": "jr", "東海旅客鉄道": "jr", "西日本旅客鉄道": "jr", "四国旅客鉄道": "jr", "九州旅客鉄道": "jr",
    "わたらせ渓谷鐵道": "わたらせ渓谷鉄道", "信楽高原鐵道": "信楽高原鉄道", "小湊鐵道": "小湊鉄道", "真岡鐵道": "真岡鉄道", "和歌山電鐵": "わかやま電鉄",
    "一畑電車": "一畑電気鉄道", "上毛電気鉄道": "上毛電鉄", "京福電気鉄道": "京福電鉄", "京阪電気鉄道": "京阪電鉄", "南海電気鉄道": "南海電鉄",
    "山陽電気鉄道": "山陽電鉄", "新京成電鉄": "新京成電鉄", "熊本電気鉄道": "熊本電鉄", "筑豊電気鉄道": "筑豊電鉄", "阪神電気鉄道": "阪神電鉄",
    "銚子電気鉄道": "銚子電鉄", "高松琴平電気鉄道": "高松琴平電鉄",
    "首都圏新都市鉄道":"つくばエクスプレス", "上田電鉄":"上田交通", "東京地下鉄": "東京メトロ", "大阪市高速電気軌道": "osakametro",
    "アイジーアールいわて銀河鉄道": "igrいわて銀河鉄道", "willertrains": "京都丹後鉄道", "東海交通事業": "jr東海交通事業",
    "横浜シーサイドライン": "横浜新都市交通", "松本電鉄": "アルピコ交通",
    "東京都": "都営地下鉄", "京都市": "京都市交通局", "仙台市": "仙台市営地下鉄", "名古屋市": "名古屋市営地下鉄", "札幌市": "札幌市営地下鉄",
    "函館市": "函館市電", "横浜市": "横浜市営地下鉄", "神戸市": "神戸市営地下鉄", "福岡市": "福岡市営地下鉄", "熊本市": "熊本市交通局", "鹿児島市": "鹿児島市交通局",
    "一般社団法人札幌市交通事業振興公社": "札幌市交通事業振興公社", "一般社団法人神戸住環境整備公社": "神戸住環境整備公社", "一般財団法人青函トンネル記念館": "青函トンネル記念館",
}

LINE_MAPPING_TABLE = {
    "JR山手線": "山手線", "JR京浜東北線": "京浜東北線", "JR中央線快速": "中央線", "中央本線": "中央線", "丸ノ内線(方南町支線)": "丸ノ内線",
}

def normalize_string(text: str) -> str:
    if not isinstance(text, str): return ""
    text = mojimoji.zen_to_han(text, kana=False)
    text = text.lower()
    text = text.replace(' ', '').replace('　', '')
    return text

def normalize_line_name(text: str) -> str:
    text = normalize_string(text)
    text = re.sub(r'^(jr|ｊｒ)', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    return text

def apply_normalization_mapping(df: pd.DataFrame, company_map: dict = None, line_map: dict = None) -> pd.DataFrame:
    df_mapped = df.copy()
    if company_map and 'norm_company' in df_mapped.columns:
        df_mapped['norm_company'] = df_mapped['norm_company'].map(company_map).fillna(df_mapped['norm_company'])
    if line_map and 'norm_line' in df_mapped.columns:
        df_mapped['norm_line'] = df_mapped['norm_line'].map(line_map).fillna(df_mapped['norm_line'])
    return df_mapped

def analyze_mismatches():
    base_dir = os.getcwd()
    station_code_path = os.path.join(base_dir, 'data/processed/stationcode.json')
    rent_price_path = os.path.join(base_dir, 'data/processed/rent_marketprice.json')

    # Load Data
    try:
        df_station = pd.read_json(station_code_path)
        df_rent = pd.read_json(rent_price_path)
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        return

    # Preparing Station Data (Master)
    rename_map_station = {'station_name': 'station', 'line_name': 'line', 'company_name': 'company'}
    df_station_renamed = df_station.rename(columns=rename_map_station)
    
    for col in ['company', 'station']:
        if col in df_station_renamed.columns:
            df_station_renamed[f'norm_{col}'] = df_station_renamed[col].apply(normalize_string)
    if 'line' in df_station_renamed.columns:
        df_station_renamed[f'norm_line'] = df_station_renamed['line'].apply(normalize_line_name)

    df_station_norm = apply_normalization_mapping(df_station_renamed, COMPANY_MAPPING_TABLE, LINE_MAPPING_TABLE)
    
    # Create a set of valid keys (company, line, station)
    master_keys = set(zip(df_station_norm['norm_company'], df_station_norm['norm_line'], df_station_norm['norm_station']))

    # Preparing Rent Data (Source)
    for col in ['company', 'station']:
        if col in df_rent.columns:
            df_rent[f'norm_{col}'] = df_rent[col].apply(normalize_string)
    if 'line' in df_rent.columns:
        df_rent[f'norm_line'] = df_rent['line'].apply(normalize_line_name)

    df_rent_norm = apply_normalization_mapping(df_rent, COMPANY_MAPPING_TABLE, LINE_MAPPING_TABLE)

    # Check matches
    unmatched_records = []
    
    for idx, row in df_rent_norm.iterrows():
        key = (row['norm_company'], row['norm_line'], row['norm_station'])
        if key not in master_keys:
            unmatched_records.append(row)

    df_unmatched = pd.DataFrame(unmatched_records)
    
    if df_unmatched.empty:
        print("Perfect match! No unmatched records.")
        return

    print(f"Total Rent Records: {len(df_rent)}")
    print(f"Unmatched Records: {len(df_unmatched)}")
    print(f"Mismatch Rate: {len(df_unmatched)/len(df_rent)*100:.1f}%")
    
    print("\n--- Top Unmatched Companies ---")
    print(df_unmatched['company'].value_counts().head(10))

    print("\n--- Top Unmatched Lines ---")
    print(df_unmatched['line'].value_counts().head(10))

    # Output to CSV for inspection
    output_csv = os.path.join(base_dir, 'data/processed/unmatched_rent_analysis.csv')
    df_unmatched[['company', 'line', 'station', 'norm_company', 'norm_line', 'norm_station']].to_csv(output_csv, index=False)
    print(f"\nUnmatched details saved to: {output_csv}")

if __name__ == "__main__":
    analyze_mismatches()
