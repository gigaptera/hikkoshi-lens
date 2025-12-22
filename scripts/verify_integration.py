import pandas as pd
import json
import os
import mojimoji

def verify_integration():
    base_dir = os.getcwd()
    raw_rent_path = os.path.join(base_dir, 'data/processed/rent_marketprice.json')
    integrated_path = os.path.join(base_dir, 'data/processed/rent_market_price_integrated.json')
    station_code_path = os.path.join(base_dir, 'data/processed/stationcode.json')
    
    # Load Data
    df_raw = pd.read_json(raw_rent_path)
    df_integrated = pd.read_json(integrated_path)
    df_master = pd.read_json(station_code_path)
    
    # Check types
    if 'stationcode' in df_integrated.columns:
        df_integrated['stationcode'] = df_integrated['stationcode'].astype(str).str.zfill(6)
    if 'stationcode' in df_master.columns:
        df_master['stationcode'] = df_master['stationcode'].astype(str).str.zfill(6)
    
    print(f"Original Rent Data: {len(df_raw)}")
    print(f"Integrated Data: {len(df_integrated)}")
    
    # 1. Coverage Check
    # Integratedデータに含まれる original の (company, line, station) の組み合わせユニーク数
    integrated_keys = set(zip(df_integrated['company'], df_integrated['line'], df_integrated['station']))
    
    unmatched_rows = []
    matched_count = 0
    for idx, row in df_raw.iterrows():
        key = (row['company'], row['line'], row['station'])
        if key in integrated_keys:
            matched_count += 1
        else:
            unmatched_rows.append(row)
            
    print(f"Matched Original Records: {matched_count} / {len(df_raw)} ({matched_count/len(df_raw)*100:.1f}%)")
    print(f"Unmatched Records: {len(unmatched_rows)}")
    
    df_unmatched = pd.DataFrame(unmatched_rows)
    if not df_unmatched.empty:
        print("\n--- Top Unmatched Companies ---")
        print(df_unmatched['company'].value_counts().head(10))
        
        print("\n--- Top Unmatched Lines ---")
        print(df_unmatched['line'].value_counts().head(20))

        print("\n--- Sample Unmatched Records (Top Lines) ---")
        top_lines = df_unmatched['line'].value_counts().head(5).index
        print(df_unmatched[df_unmatched['line'].isin(top_lines)][['company', 'line', 'station']].drop_duplicates().head(20))

    # 2. Risk Check: Homonyms in Loose Match (Company=JR)
    # 統合データのstationcodeを使って、Masterデータから都道府県(あるいは近傍座標)を引ければよいが、
    # Masterには座標(coordinates)がある。SUUMOには prefecture がある。
    # これらが食い違っていないかチェックする。
    
    # Masterをマージ
    df_check = pd.merge(df_integrated, df_master[['stationcode', 'coordinates']], on='stationcode', how='left')
    
    # 座標から都道府県を推定するのは大変なので、
    # SUUMOデータの `prefecture` と、駅名の組み合わせで怪しいものを探す。
    # 例えば「福島」駅で、prefectureが「大阪府」なのに、なぜか「福島県」の座標の駅コードがついてないか？（逆も然り）
    # しかし stationcode.json には都道府県コードがない。
    # ここでは「同一 stationcode に紐付いた SUUMOデータの prefecture が混在している」ケースを探す。
    # (今回の統合データは drop_duplicates しているので、1つのstationcodeにつき1つの家賃データしかない。
    #  つまり、Mixedされているとしたら、平均化もされず「どれか一つ」が選ばれている状態。)
    
    # いや、normalize_rent_data.py のロジックでは drop_duplicates しているので、
    # 「大阪の福島」と「福島の福島」が両方 SUUMO にあった場合、
    # Loose Match で両方が 両方の駅コード に紐付く (2x2=4レコード生成)。
    # その後 drop_duplicates(subset=['stationcode']) されるので、
    # StationCode(大阪) には Rent(大阪) か Rent(福島) のどちらかが付く。
    # StationCode(福島) には Rent(大阪) か Rent(福島) のどちらかが付く。
    # 確率的に 50% で間違った家賃が付く！
    
    # これを確認するには、normalize_rent_data.py の途中経過を見る必要があるが、
    # 完成品の integrated json からは「stationcode」と「SUUMO由来のstation名」が見える。
    # SUUMOデータ側に prefecture があるか？ -> integrated.json には含めていない(前回のscript)。
    # なので、integrated.json の stationcode から Master の coordinates を引き、
    # 大まかな地域（北緯など）で検証する。
    
    print("\n--- Homonym Risk Check (JR Fukushima/Shiraishi/etc) ---")
    risky_stations = ["福島", "白石", "郡山"] # 郡山(福島/奈良), 白石(宮城/北海道), 福島(福島/大阪)
    
    for name in risky_stations:
        matches = df_check[df_check['station'] == name] # original station name
        if matches.empty:
            continue
        print(f"\nStation: {name}")
        for idx, row in matches.iterrows():
            # 緯度経度表示
            coords = row.get('coordinates', [])
            lat = coords[1] if isinstance(coords, list) and len(coords) > 1 else 0
            
            # 緯度から大まかな地域を判定
            region = "Unknown"
            if lat > 41: region = "Hokkaido"
            elif lat > 36: region = "Tohoku/Kanto"
            elif lat > 34: region = "Kansai/Chubu"
            else: region = "Kyushu/Shikoku"
            
            print(f"  Code: {row['stationcode']}, Line: {row['line']}, Rent: {row['rent']}, Lat: {lat:.1f} ({region})")

if __name__ == "__main__":
    verify_integration()
