"""
Takei-prime Fitスコア計算デモ

デモデータを使用して、実際のFitスコア計算を実行します。
"""

import sys
import json
from pathlib import Path

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "backend"))

from src.core.fit_score_calculator import (
    FitScoreEngine,
    PreferenceMode,
    Skill,
    TeamRequirement,
    PersonalityProfile
)


def load_demo_data():
    """デモデータをロード"""
    data_dir = project_root / "data" / "demo"
    
    with open(data_dir / "candidates.json", "r", encoding="utf-8") as f:
        candidates = json.load(f)["candidates"]
    
    with open(data_dir / "teams.json", "r", encoding="utf-8") as f:
        teams = json.load(f)["teams"]
    
    with open(data_dir / "skills_master.json", "r", encoding="utf-8") as f:
        skills_master = json.load(f)["skills"]
    
    return candidates, teams, skills_master


def convert_candidate_to_objects(candidate_data):
    """候補者データをオブジェクトに変換"""
    skills = [
        Skill(
            skill_id=s["skill_id"],
            proficiency_level=s["proficiency_level"],
            years_of_experience=s["years_of_experience"]
        )
        for s in candidate_data["skills"]
    ]
    
    personality = PersonalityProfile(
        openness=candidate_data["personality_profile"]["openness"],
        conscientiousness=candidate_data["personality_profile"]["conscientiousness"],
        extraversion=candidate_data["personality_profile"]["extraversion"],
        agreeableness=candidate_data["personality_profile"]["agreeableness"],
        neuroticism=candidate_data["personality_profile"]["neuroticism"]
    )
    
    return skills, personality


def convert_team_to_objects(team_data):
    """チームデータをオブジェクトに変換"""
    requirements = [
        TeamRequirement(
            skill_id=req["skill_id"],
            required_level=req["required_level"],
            is_mandatory=req["is_mandatory"],
            priority=req["priority"]
        )
        for req in team_data["requirements"]
    ]
    
    culture = PersonalityProfile(
        openness=team_data["culture_profile"]["openness"],
        conscientiousness=team_data["culture_profile"]["conscientiousness"],
        extraversion=team_data["culture_profile"]["extraversion"],
        agreeableness=team_data["culture_profile"]["agreeableness"],
        neuroticism=team_data["culture_profile"]["neuroticism"]
    )
    
    return requirements, culture, team_data.get("workload_average", 70.0)


def get_skill_name(skill_id, skills_master):
    """スキルIDから名称を取得"""
    for skill in skills_master:
        if skill["id"] == skill_id:
            return skill["name"]
    return skill_id


def print_separator(char="=", length=80):
    """区切り線を表示"""
    print(char * length)


def demo_calculation(
    candidate,
    team,
    skills_master,
    preference_mode=PreferenceMode.STABILITY
):
    """デモ計算を実行"""
    
    print_separator()
    print(f"🎯 Fitスコア計算デモ")
    print_separator()
    
    print(f"\n【候補者】: {candidate['name']}")
    print(f"  職種: {candidate['current_position']}")
    print(f"  経験年数: {candidate['years_of_experience']}年")
    print(f"  スキル数: {len(candidate['skills'])}個")
    
    print(f"\n【チーム】: {team['name']}")
    print(f"  部署: {team['department']}")
    print(f"  チームサイズ: {team['size']}人")
    print(f"  リモートポリシー: {team['remote_policy']}")
    print(f"  平均稼働率: {team['workload_average']}%")
    
    print(f"\n【経営方針モード】: {preference_mode.value.upper()}")
    
    # データ変換
    candidate_skills, candidate_personality = convert_candidate_to_objects(candidate)
    team_requirements, team_culture, workload = convert_team_to_objects(team)
    
    # Fitスコア計算
    engine = FitScoreEngine(preference_mode)
    result = engine.calculate_fit_score(
        candidate_skills=candidate_skills,
        team_requirements=team_requirements,
        candidate_personality=candidate_personality,
        team_culture=team_culture,
        workload_rate=workload,
        recent_move=False,
        move_count_last_year=0,
        handover_load=20.0,
        manager_change=False
    )
    
    # 結果表示
    print_separator("-")
    print(f"\n📊 【計算結果】")
    print_separator("-")
    
    print(f"\n総合Fitスコア: {result.total_score}/100")
    print(f"  ├ SkillMatch  : {result.skill_match_score}/100")
    print(f"  ├ Retention   : {result.retention_score}/100")
    print(f"  ├ Friction    : {result.friction_score}/100")
    print(f"  └ 信頼度      : {result.confidence:.2f}")
    
    # スキルマッチ詳細
    print(f"\n📝 【SkillMatch詳細】")
    skill_details = result.breakdown.get("skill_match_detail", {}).get("skill_details", [])
    
    for detail in skill_details:
        skill_name = get_skill_name(detail["skill_id"], skills_master)
        candidate_level = detail.get("candidate_level", 0)
        required_level = detail.get("required_level", 0)
        weighted_score = detail.get("weighted_score", 0)
        
        status = "✅" if candidate_level >= required_level else "⚠️"
        print(f"  {status} {skill_name}: Lv{candidate_level} / 要求Lv{required_level} → スコア{weighted_score:.1f}")
    
    # Retention詳細
    print(f"\n💼 【Retention詳細】")
    retention_detail = result.breakdown.get("retention_detail", {})
    print(f"  ・性格類似度       : {retention_detail.get('personality_similarity', 0):.1f}/100")
    print(f"  ・マネージャー適合性 : {retention_detail.get('manager_similarity', 0):.1f}/100")
    print(f"  ・稼働率リスク     : {retention_detail.get('workload_risk', 0):.1f}/100 (低いほど良)")
    print(f"  ・異動直後リスク    : {retention_detail.get('recent_move_risk', 0):.1f}/100 (低いほど良)")
    
    # Friction詳細
    print(f"\n⚡ 【Friction詳細】")
    friction_detail = result.breakdown.get("friction_detail", {})
    print(f"  ・異動回数スコア    : {friction_detail.get('move_count_score', 0):.1f}/100")
    print(f"  ・引き継ぎ負荷     : {friction_detail.get('handover_load_score', 0):.1f}/100")
    print(f"  ・上司交代スコア    : {friction_detail.get('manager_change_score', 0):.1f}/100")
    print(f"  ・性格摩擦        : {friction_detail.get('personality_friction', 0):.1f}/100")
    
    # 解釈
    print(f"\n💡 【解釈】")
    if result.total_score >= 80:
        print(f"  ⭐️ 非常に高い適合性！この配置は成功確率が高いです。")
    elif result.total_score >= 60:
        print(f"  ✅ 良好な適合性。一部リスクはあるものの、対策により成功可能。")
    elif result.total_score >= 40:
        print(f"  ⚠️  中程度の適合性。リスク軽減策が重要です。")
    else:
        print(f"  ❌ 低い適合性。慎重な判断が必要です。")
    
    # 強み・リスク提案（簡易版）
    print(f"\n🟢 【強み】")
    if result.skill_match_score >= 80:
        print(f"  ・必要なスキルを高水準で保有し、即戦力として活躍可能")
    if result.retention_score >= 80:
        print(f"  ・チーム文化に合う性格特性を持ち、長期的に定着しやすい")
    
    print(f"\n🟠 【リスク】")
    if result.skill_match_score < 60:
        print(f"  ・一部スキルが不足。育成・サポートが必要")
    if result.friction_score > 40:
        print(f"  ・配置時の摩擦が予想される。丁寧なオンボーディングが重要")
    
    print(f"\n🔵 【対策】")
    if result.retention_score < 70:
        print(f"  ・週次1on1でコミュニケーション機会を確保")
        print(f"  ・チームとの相性を高めるオンボーディングプログラム実施")
    if workload > 80:
        print(f"  ・高稼働率によるバーンアウトリスク対策（業務量調整）")
    
    print_separator()
    
    return result


def compare_preference_modes(candidate, team, skills_master):
    """Preferenceモード比較"""
    print_separator("=")
    print("🔄 Preferenceモード比較")
    print_separator("=")
    
    modes = [
        PreferenceMode.STABILITY,
        PreferenceMode.GROWTH,
        PreferenceMode.DIVERSITY,
        PreferenceMode.PRIORITY,
        PreferenceMode.INNOVATION
    ]
    
    mode_descriptions = {
        PreferenceMode.STABILITY: "離職最小化（安定重視）",
        PreferenceMode.GROWTH: "若手育成（成長重視）",
        PreferenceMode.DIVERSITY: "多様性推進（バランス重視）",
        PreferenceMode.PRIORITY: "緊急PJ重視（スキル重視）",
        PreferenceMode.INNOVATION: "異質補完（イノベーション重視）"
    }
    
    results = []
    
    for mode in modes:
        candidate_skills, candidate_personality = convert_candidate_to_objects(candidate)
        team_requirements, team_culture, workload = convert_team_to_objects(team)
        
        engine = FitScoreEngine(mode)
        result = engine.calculate_fit_score(
            candidate_skills=candidate_skills,
            team_requirements=team_requirements,
            candidate_personality=candidate_personality,
            team_culture=team_culture,
            workload_rate=workload
        )
        
        results.append((mode, result))
        
        print(f"\n【{mode.value.upper()}】: {mode_descriptions[mode]}")
        print(f"  総合スコア: {result.total_score}/100")
        print(f"  ├ SkillMatch: {result.skill_match_score}/100 (重み: {engine.weights['alpha']})")
        print(f"  ├ Retention : {result.retention_score}/100 (重み: {engine.weights['beta']})")
        print(f"  └ Friction  : {result.friction_score}/100 (重み: {engine.weights['gamma']})")
    
    # 最適モード推薦
    best_mode, best_result = max(results, key=lambda x: x[1].total_score)
    
    print(f"\n💡 【推薦】")
    print(f"  最高スコアモード: {best_mode.value.upper()} ({mode_descriptions[best_mode]})")
    print(f"  スコア: {best_result.total_score}/100")
    
    print_separator()


if __name__ == "__main__":
    # デモデータロード
    print("📁 デモデータをロード中...")
    candidates, teams, skills_master = load_demo_data()
    print(f"✅ 候補者: {len(candidates)}人、チーム: {len(teams)}チーム、スキル: {len(skills_master)}種類\n")
    
    # ケース1: データサイエンティスト × AI/MLチーム
    print("=" * 80)
    print("ケース1: データサイエンティスト → AI/MLプロダクト開発チーム")
    print("=" * 80)
    
    candidate_suzuki = next(c for c in candidates if c["id"] == "cand_003")  # 鈴木一郎
    team_aiml = next(t for t in teams if t["id"] == "team_001")  # AI/MLチーム
    
    demo_calculation(candidate_suzuki, team_aiml, skills_master, PreferenceMode.STABILITY)
    
    # ケース2: フロントエンドエンジニア × フロントエンド開発チーム
    print("\n\n")
    print("=" * 80)
    print("ケース2: フロントエンドエンジニア → フロントエンド開発チーム")
    print("=" * 80)
    
    candidate_sato = next(c for c in candidates if c["id"] == "cand_002")  # 佐藤花子
    team_frontend = next(t for t in teams if t["id"] == "team_002")  # フロントエンドチーム
    
    demo_calculation(candidate_sato, team_frontend, skills_master, PreferenceMode.GROWTH)
    
    # ケース3: プロジェクトマネージャー × プロダクトマネジメントチーム
    print("\n\n")
    print("=" * 80)
    print("ケース3: プロジェクトマネージャー → プロダクトマネジメントチーム")
    print("=" * 80)
    
    candidate_takahashi = next(c for c in candidates if c["id"] == "cand_004")  # 高橋美咲
    team_pm = next(t for t in teams if t["id"] == "team_008")  # PMチーム
    
    demo_calculation(candidate_takahashi, team_pm, skills_master, PreferenceMode.PRIORITY)
    
    # Preferenceモード比較
    print("\n\n")
    compare_preference_modes(candidate_suzuki, team_aiml, skills_master)
    
    print("\n✨ デモ計算完了！")


