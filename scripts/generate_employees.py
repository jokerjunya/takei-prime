"""
既存チームデータから従業員データを生成するスクリプト
"""

import json
import random
from pathlib import Path

# 日本人の名前サンプル
FIRST_NAMES_MALE = [
    "太郎", "健", "誠", "翔", "拓也", "大輔", "浩二", "健太", "隆", "勇気",
    "翔太", "大樹", "純", "亮", "航", "竜也", "啓介", "雄一", "龍", "智也"
]

FIRST_NAMES_FEMALE = [
    "花子", "美咲", "愛", "さくら", "優子", "麻衣", "彩", "恵", "沙織", "直美",
    "梨花", "由美", "真理子", "舞", "彩香", "奈々", "美穂", "理恵", "愛美", "恵子"
]

LAST_NAMES = [
    "田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤",
    "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "清水", "山崎",
    "森", "池田", "橋本", "阿部", "石川", "前田", "藤田", "後藤", "長谷川", "近藤"
]

POSITIONS = {
    "junior": ["ジュニア", "アソシエイト", "スタッフ"],
    "mid": ["", "シニア"],
    "senior": ["シニア", "リード", "エキスパート"],
    "lead": ["マネージャー", "リーダー", "チーフ"]
}

def generate_personality_around_average(avg_profile, variance_profile):
    """チーム平均の周辺に性格プロファイルを生成"""
    return {
        "openness": max(0, min(100, int(random.gauss(avg_profile["openness"], variance_profile["openness_variance"])))),
        "conscientiousness": max(0, min(100, int(random.gauss(avg_profile["conscientiousness"], variance_profile["conscientiousness_variance"])))),
        "extraversion": max(0, min(100, int(random.gauss(avg_profile["extraversion"], variance_profile["extraversion_variance"])))),
        "agreeableness": max(0, min(100, int(random.gauss(avg_profile["agreeableness"], variance_profile["agreeableness_variance"])))),
        "neuroticism": max(0, min(100, int(random.gauss(avg_profile["neuroticism"], variance_profile["neuroticism_variance"]))))
    }

def generate_skills_for_team(team, num_skills=3):
    """チームの必要スキルから従業員のスキルを生成"""
    skills = []
    
    # チームの必要スキルからランダムに選択
    requirements = team.get("requirements", [])
    if requirements:
        selected_reqs = random.sample(requirements, min(num_skills, len(requirements)))
        for req in selected_reqs:
            level = req["required_level"] + random.choice([-1, 0, 0, 1])  # 要求レベル±1
            level = max(1, min(5, level))
            skills.append({
                "skill_id": req["skill_id"],
                "proficiency_level": level,
                "years_of_experience": random.uniform(1.0, 8.0)
            })
    
    return skills

def generate_employees_for_team(team, team_index):
    """1チーム分の従業員を生成"""
    employees = []
    team_size = team["size"]
    
    # 1チームあたり3-5人のサンプル（全員は多すぎるので）
    sample_size = min(5, max(3, team_size // 4))
    
    for i in range(sample_size):
        # 名前生成
        last_name = random.choice(LAST_NAMES)
        if random.random() > 0.5:
            first_name = random.choice(FIRST_NAMES_MALE)
        else:
            first_name = random.choice(FIRST_NAMES_FEMALE)
        
        name = f"{last_name} {first_name}"
        
        # 従業員ID
        emp_id = f"emp_{team_index:03d}_{i+1:02d}"
        
        # 役職レベル
        level_prob = random.random()
        if level_prob < 0.1:
            level = "lead"
        elif level_prob < 0.3:
            level = "senior"
        elif level_prob < 0.7:
            level = "mid"
        else:
            level = "junior"
        
        # 役職名
        position_prefix = random.choice(POSITIONS[level])
        
        # 在籍年数
        tenure_map = {"junior": (0.5, 3), "mid": (2, 6), "senior": (5, 10), "lead": (7, 15)}
        tenure = round(random.uniform(*tenure_map[level]), 1)
        
        # 性格プロファイル（チーム平均の周辺に生成）
        personality = generate_personality_around_average(
            team["culture_profile"],
            team["culture_profile"]
        )
        
        # スキル
        skills = generate_skills_for_team(team, num_skills=random.randint(3, 6))
        
        employee = {
            "id": emp_id,
            "name": name,
            "team_id": team["id"],
            "department": team["department"],
            "position": position_prefix,
            "level": level,
            "tenure": tenure,
            "personality_profile": personality,
            "skills": skills,
            "email": f"{last_name.lower()}.{first_name.lower()}@company.com"
        }
        
        employees.append(employee)
    
    return employees

def main():
    # チームデータを読み込み
    data_dir = Path(__file__).parent.parent / "data" / "demo"
    
    with open(data_dir / "teams.json", "r", encoding="utf-8") as f:
        teams_data = json.load(f)
    
    teams = teams_data["teams"]
    
    # 全従業員を生成
    all_employees = []
    
    for index, team in enumerate(teams, 1):
        team_employees = generate_employees_for_team(team, index)
        all_employees.extend(team_employees)
        print(f"✅ {team['name']}: {len(team_employees)}人生成")
    
    # 保存
    output_data = {
        "metadata": {
            "total_employees": len(all_employees),
            "generation_date": "2025-10-26",
            "note": "チームの文化プロファイルを基に生成した既存従業員データ"
        },
        "employees": all_employees
    }
    
    with open(data_dir / "employees.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✨ 合計 {len(all_employees)}人の従業員データを生成しました")
    print(f"📁 保存先: {data_dir / 'employees.json'}")

if __name__ == "__main__":
    main()

