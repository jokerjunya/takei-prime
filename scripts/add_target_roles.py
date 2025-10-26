"""
候補者に応募職種(target_role)を追加するスクリプト
"""

import json
from pathlib import Path

# 職種マッピング（役職名から職種を推定）
ROLE_MAPPING = {
    'engineer': [
        'エンジニア', 'プログラマ', 'データサイエンティスト', 'ML', 'SRE',
        'フロントエンド', 'バックエンド', 'フルスタック', 'モバイル', 'IoT',
        'QA', 'テスト', 'セキュリティ', 'インフラ', 'データエンジニア', 'データアナリスト'
    ],
    'sales': [
        'セールス', '営業', 'インサイド', 'パートナー', 'エンタープライズ', 'SMB'
    ],
    'marketing': [
        'マーケ', 'マーケティング', '広報', 'PR', 'コンテンツ'
    ],
    'design': [
        'デザイン', 'デザイナー', 'UI', 'UX', 'グラフィック'
    ],
    'product': [
        'プロダクト', 'PM', 'プロジェクトマネージャー'
    ],
    'customer_success': [
        'カスタマーサクセス', 'CS', 'サポート', 'テクニカルサポート', 'トレーニング'
    ],
    'corporate': [
        '人事', '採用', '労務', '経理', '財務', '法務', '総務', '情報システム'
    ]
}

def detect_target_role(position: str) -> str:
    """役職名から応募職種を推定"""
    position_lower = position.lower()
    
    for role, keywords in ROLE_MAPPING.items():
        for keyword in keywords:
            if keyword.lower() in position_lower or keyword in position:
                return role
    
    return 'corporate'  # デフォルト

def main():
    data_dir = Path(__file__).parent.parent / "data" / "demo"
    
    # 候補者データを読み込み
    with open(data_dir / "candidates.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    candidates = data["candidates"]
    
    # 各候補者にtarget_roleを追加
    for candidate in candidates:
        target_role = detect_target_role(candidate["current_position"])
        candidate["target_role"] = target_role
        print(f"✅ {candidate['name']}: {candidate['current_position']} → {target_role}")
    
    # 保存
    with open(data_dir / "candidates.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 統計
    role_counts = {}
    for candidate in candidates:
        role = candidate["target_role"]
        role_counts[role] = role_counts.get(role, 0) + 1
    
    print(f"\n📊 職種別の候補者数:")
    for role, count in sorted(role_counts.items()):
        print(f"  {role}: {count}人")
    
    print(f"\n✨ {len(candidates)}人の候補者にtarget_roleを追加しました")

if __name__ == "__main__":
    main()

