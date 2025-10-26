"""
チームに募集ポジション(recruiting_positions)を追加するスクリプト
"""

import json
from pathlib import Path

# チーム名から募集職種を推定
TEAM_ROLE_MAPPING = {
    'engineer': [
        'AI/ML', 'フロントエンド', 'バックエンド', 'モバイル', 'IoT', 'QA', 'テスト',
        'SRE', 'インフラ', 'データエンジニア', 'データ分析', 'セキュリティ', '開発'
    ],
    'sales': [
        '営業', 'セールス', 'エンタープライズ', '中堅', '中小', 'インサイド', 'パートナー', '海外'
    ],
    'marketing': [
        'マーケティング', 'マーケ', 'デジタル', 'コンテンツ', 'ブランディング', '広報'
    ],
    'design': [
        'デザイン', 'UI', 'UX', 'グラフィック'
    ],
    'product': [
        'プロダクトマネジメント', 'プロダクト', 'PM'
    ],
    'customer_success': [
        'カスタマーサクセス', 'カスタマー', 'サポート', 'テクニカルサポート', 'トレーニング'
    ],
    'corporate': [
        '人事', '採用', '労務', '経理', '財務', '法務', '総務', '情報システム',
        '経営企画', 'IR', '生産管理', '品質管理', '物流', '調達', '購買'
    ]
}

def detect_recruiting_role(team_name: str) -> str:
    """チーム名から募集職種を推定"""
    for role, keywords in TEAM_ROLE_MAPPING.items():
        for keyword in keywords:
            if keyword in team_name:
                return role
    return 'corporate'

def determine_levels(team_size: int) -> list:
    """チームサイズから募集レベルを決定"""
    if team_size > 20:
        # 大規模チーム: 全レベル募集
        return [
            {"level": "junior", "count": 2},
            {"level": "mid", "count": 1},
            {"level": "senior", "count": 1}
        ]
    elif team_size > 10:
        # 中規模チーム: mid中心
        return [
            {"level": "mid", "count": 1},
            {"level": "senior", "count": 1}
        ]
    else:
        # 小規模チーム: senior/lead重視
        return [
            {"level": "senior", "count": 1}
        ]

def main():
    data_dir = Path(__file__).parent.parent / "data" / "demo"
    
    # チームデータを読み込み
    with open(data_dir / "teams.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    teams = data["teams"]
    
    # 各チームにrecruiting_positionsを追加
    for team in teams:
        role = detect_recruiting_role(team["name"])
        levels = determine_levels(team["size"])
        
        recruiting_positions = []
        for level_info in levels:
            recruiting_positions.append({
                "role": role,
                "level": level_info["level"],
                "count": level_info["count"],
                "status": "open"
            })
        
        team["recruiting_positions"] = recruiting_positions
        
        print(f"✅ {team['name']}: {role} ({len(recruiting_positions)}ポジション)")
    
    # 保存
    with open(data_dir / "teams.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 統計
    role_counts = {}
    for team in teams:
        for pos in team["recruiting_positions"]:
            role = pos["role"]
            role_counts[role] = role_counts.get(role, 0) + 1
    
    print(f"\n📊 募集ポジション（職種別）:")
    for role, count in sorted(role_counts.items()):
        print(f"  {role}: {count}ポジション")
    
    print(f"\n✨ {len(teams)}チームにrecruiting_positionsを追加しました")

if __name__ == "__main__":
    main()

