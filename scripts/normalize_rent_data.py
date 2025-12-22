import pandas as pd
import json
import os
import re
import mojimoji

# 追加のマッピング定義
COMPANY_MAPPING_TABLE = {
    "北海道旅客鉄道": "jr", "東日本旅客鉄道": "jr", "東海旅客鉄道": "jr", "西日本旅客鉄道": "jr", "四国旅客鉄道": "jr", "九州旅客鉄道": "jr",
    "東京都": "都営地下鉄", "東京地下鉄": "東京メトロ", "大阪市高速電気軌道": "osakametro",
    "名古屋市": "名古屋市営地下鉄", "札幌市": "札幌市営地下鉄", "京都市": "京都市営地下鉄",
    "福岡市": "福岡市営地下鉄", "横浜市": "横浜市営地下鉄", "神戸市": "神戸市営地下鉄", "仙台市": "仙台市営地下鉄",
    "一般社団法人札幌市交通事業振興公社": "札幌市電",
    "首都圏新都市鉄道": "つくばエクスプレス", # Master: 首都圏新都市鉄道 -> つくばエクスプレス
    
    # 私鉄系
    "南海電鉄": "南海電気鉄道", "京阪電鉄": "京阪電気鉄道", "阪神電鉄": "阪神電気鉄道", "阪急電鉄": "阪急電鉄",
    "山陽電鉄": "山陽電気鉄道", "近鉄": "近畿日本鉄道", "名鉄": "名古屋鉄道", "西鉄": "西日本鉄道",
    "京急": "京浜急行電鉄", "東急": "東急電鉄", "小田急": "小田急電鉄", "京王": "京王電鉄", 
    "西武": "西武鉄道", "東武": "東武鉄道", "京成": "京成電鉄", "相鉄": "相模鉄道",
}

def normalize_string(text):
    if not isinstance(text, str): return ""
    text = mojimoji.zen_to_han(text, kana=False)
    text = text.lower()
    text = text.replace(' ', '').replace('　', '')
    return text

def normalize_line_name(text):
    text = normalize_string(text)
    text = re.sub(r'^(jr|ｊｒ)', '', text)
    text = re.sub(r'^(地下鉄)', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    if text.endswith('本線'): text = text[:-2] + '線'
    return text

def main():
    base_dir = os.getcwd()
    rent_path = os.path.join(base_dir, 'data/processed/rent_marketprice.json')
    station_path = os.path.join(base_dir, 'data/processed/stationcode.json')
    output_path = os.path.join(base_dir, 'data/processed/rent_market_price_integrated.json')

    try:
        df_rent = pd.read_json(rent_path)
        df_station = pd.read_json(station_path)
        if 'stationcode' in df_station.columns:
             df_station['stationcode'] = df_station['stationcode'].astype(str).str.zfill(6)
    except ValueError as e:
        print(f"Error loading JSON: {e}")
        return

    # Normalize
    df_rent['norm_company'] = df_rent['company'].apply(normalize_string).map(COMPANY_MAPPING_TABLE).fillna(df_rent['company'].apply(normalize_string))
    df_rent['norm_line'] = df_rent['line'].apply(normalize_line_name)
    df_rent['norm_station'] = df_rent['station'].apply(normalize_string)
    
    df_station['norm_company'] = df_station['company'].apply(normalize_string).map(COMPANY_MAPPING_TABLE).fillna(df_station['company'].apply(normalize_string))
    df_station['norm_line'] = df_station['line'].apply(normalize_line_name)
    df_station['norm_station'] = df_station['station'].apply(normalize_string)

    # Debug TX
    print("\n--- Debug: TX (Akihabara) ---")
    print("Master:")
    # 元の会社名で検索しないと、norm_companyが合ってるかわからない
    print(df_station[df_station['station'] == '秋葉原'][['company', 'line', 'norm_company', 'norm_line']])
    print("Rent:")
    print(df_rent[(df_rent['station'] == '秋葉原') & (df_rent['company'] == 'つくばエクスプレス')][['company', 'line', 'norm_company', 'norm_line']])

    # Strict Match
    df_merged_strict = pd.merge(
        df_rent,
        df_station[['norm_company', 'norm_line', 'norm_station', 'stationcode']],
        on=['norm_company', 'norm_line', 'norm_station'],
        how='inner'
    )
    print(f"\nStrict Match: {len(df_merged_strict)}")

    # Unmatched
    df_rent_with_match = pd.merge(
        df_rent,
        df_station[['norm_company', 'norm_line', 'norm_station', 'stationcode']],
        on=['norm_company', 'norm_line', 'norm_station'],
        how='left',
        indicator=True
    )
    df_unmatched = df_rent_with_match[df_rent_with_match['_merge'] == 'left_only'].drop(columns=['_merge', 'stationcode'])
    print(f"Unmatched: {len(df_unmatched)}")
    
    # Loose Match
    if len(df_unmatched) > 0:
        df_station_loose = df_station[['norm_company', 'norm_station', 'stationcode']]
        
        # Debug Loose Match for TX
        print("Checking Loose Match for TX Akihabara:")
        tx_master = df_station_loose[(df_station_loose['norm_station'] == '秋葉原') & (df_station_loose['norm_company'] == 'つくばエクスプレス')]
        print(tx_master)
        
        df_merged_loose = pd.merge(
            df_unmatched,
            df_station_loose,
            on=['norm_company', 'norm_station'],
            how='inner'
        )
        print(f"Loose Match: {len(df_merged_loose)}")
        
        cols = ['stationcode', 'rent', 'company', 'line', 'station']
        final_df = pd.concat([df_merged_strict[cols], df_merged_loose[cols]])
    else:
        final_df = df_merged_strict[['stationcode', 'rent', 'company', 'line', 'station']]

    final_df = final_df.drop_duplicates(subset=['stationcode'])
    print(f"Final Count: {len(final_df)}")

    out_records = final_df.to_dict(orient='records')
    with open(output_path, 'w') as f:
        json.dump(out_records, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
