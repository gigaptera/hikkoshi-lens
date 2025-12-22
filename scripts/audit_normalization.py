import pandas as pd
import os
import json

def audit_results():
    base_dir = os.getcwd()
    integrated_path = os.path.join(base_dir, 'data/processed/rent_market_price_integrated.json')
    
    if not os.path.exists(integrated_path):
        print(f"File not found: {integrated_path}")
        return

    df = pd.read_json(integrated_path)
    print(f"Total Integrated Records: {len(df)}")
    
    # Check sample records for verification
    # 特にJR系や、表記揺れが起きやすい私鉄を抽出してみる
    
    print("\n--- JR Sample ---")
    jr_sample = df[df['company'].str.contains('JR', na=False, case=False)].head(5)
    print(jr_sample[['company', 'line', 'station', 'stationcode']])

    print("\n--- Metro/Subway Sample ---")
    metro_sample = df[df['company'].str.contains('地下鉄|メトロ|都営', na=False, case=False)].head(5)
    print(metro_sample[['company', 'line', 'station', 'stationcode']])

    print("\n--- Private Railway Sample ---")
    private_sample = df[~df['company'].str.contains('JR|地下鉄|メトロ|都営', na=False, case=False)].head(5)
    print(private_sample[['company', 'line', 'station', 'stationcode']])

    # Unmatched/Lost Data Check?
    # 元の家賃データ数と比較すべきだが、ここでは結合済みデータの中身を見る。
    
if __name__ == "__main__":
    audit_results()
