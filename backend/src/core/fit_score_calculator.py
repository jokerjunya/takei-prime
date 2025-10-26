"""
Takei-prime Fitスコア計算エンジン

Fit = α × SkillMatch + β × Retention - γ × Friction
"""

from enum import Enum
from typing import List, Dict, Optional
from dataclasses import dataclass
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class PreferenceMode(Enum):
    """経営方針モード"""
    STABILITY = "stability"      # 離職最小化
    GROWTH = "growth"            # 若手育成
    DIVERSITY = "diversity"      # 多様性推進
    PRIORITY = "priority"        # 緊急PJ重視
    INNOVATION = "innovation"    # 異質補完


# Preferenceプリセットの重み定義
PREFERENCE_WEIGHTS = {
    PreferenceMode.STABILITY: {"alpha": 0.4, "beta": 0.5, "gamma": 0.1},
    PreferenceMode.GROWTH: {"alpha": 0.6, "beta": 0.2, "gamma": 0.2},
    PreferenceMode.DIVERSITY: {"alpha": 0.4, "beta": 0.4, "gamma": 0.2},
    PreferenceMode.PRIORITY: {"alpha": 0.7, "beta": 0.1, "gamma": 0.2},
    PreferenceMode.INNOVATION: {"alpha": 0.5, "beta": 0.3, "gamma": 0.2},
}

# Big Five 性格特性の次元
BIG_FIVE_DIMENSIONS = [
    'openness',          # 開放性
    'conscientiousness', # 誠実性
    'extraversion',      # 外向性
    'agreeableness',     # 協調性
    'neuroticism'        # 神経症傾向
]


@dataclass
class Skill:
    """スキル情報"""
    skill_id: str
    proficiency_level: int  # 1-5
    years_of_experience: float


@dataclass
class TeamRequirement:
    """チーム要求スキル"""
    skill_id: str
    required_level: int  # 1-5
    is_mandatory: bool
    priority: int  # 1: high, 2: medium, 3: low


@dataclass
class PersonalityProfile:
    """性格プロファイル (Big Five)"""
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float

    def to_vector(self) -> np.ndarray:
        """ベクトル表現に変換"""
        return np.array([
            self.openness,
            self.conscientiousness,
            self.extraversion,
            self.agreeableness,
            self.neuroticism
        ])


@dataclass
class FitScoreResult:
    """Fitスコア計算結果"""
    total_score: float
    skill_match_score: float
    retention_score: float
    friction_score: float
    confidence: float
    breakdown: Dict[str, any]


class SkillMatchCalculator:
    """スキルマッチスコア計算"""

    @staticmethod
    def calculate(
        candidate_skills: List[Skill],
        team_requirements: List[TeamRequirement]
    ) -> tuple[float, Dict]:
        """
        スキルマッチスコアを計算
        
        Returns:
            (score: 0-100, breakdown: 詳細情報)
        """
        # 1. 必須スキルチェック
        mandatory_reqs = [req for req in team_requirements if req.is_mandatory]
        mandatory_check = SkillMatchCalculator._check_mandatory_skills(
            candidate_skills, mandatory_reqs
        )
        
        if not mandatory_check["all_met"]:
            return 0.0, {
                "mandatory_check": mandatory_check,
                "reason": "必須スキル不足"
            }
        
        # 2. スキルレベルマッチング
        level_scores = []
        skill_details = []
        
        for req in team_requirements:
            candidate_skill = SkillMatchCalculator._find_skill(
                candidate_skills, req.skill_id
            )
            
            if candidate_skill:
                level_score = SkillMatchCalculator._calculate_level_match(
                    candidate_skill.proficiency_level,
                    req.required_level
                )
                
                # 経験年数ボーナス
                exp_bonus = min(candidate_skill.years_of_experience / 5.0, 1.0) * 10
                
                total_score = level_score + exp_bonus
                priority_weight = SkillMatchCalculator._get_priority_weight(req.priority)
                
                weighted_score = total_score * priority_weight
                level_scores.append(weighted_score)
                
                skill_details.append({
                    "skill_id": req.skill_id,
                    "candidate_level": candidate_skill.proficiency_level,
                    "required_level": req.required_level,
                    "level_score": level_score,
                    "experience_bonus": exp_bonus,
                    "weighted_score": weighted_score
                })
            else:
                # スキル不足
                level_scores.append(0)
                skill_details.append({
                    "skill_id": req.skill_id,
                    "candidate_level": 0,
                    "required_level": req.required_level,
                    "level_score": 0,
                    "reason": "スキル保有なし"
                })
        
        # 3. 加重平均
        if not level_scores:
            return 0.0, {"reason": "評価対象スキルなし"}
        
        final_score = sum(level_scores) / len(level_scores)
        
        return min(100.0, final_score), {
            "mandatory_check": mandatory_check,
            "skill_details": skill_details,
            "average_score": final_score
        }

    @staticmethod
    def _check_mandatory_skills(
        candidate_skills: List[Skill],
        mandatory_reqs: List[TeamRequirement]
    ) -> Dict:
        """必須スキルチェック"""
        missing_skills = []
        
        for req in mandatory_reqs:
            skill = SkillMatchCalculator._find_skill(candidate_skills, req.skill_id)
            if not skill:
                missing_skills.append(req.skill_id)
            elif skill.proficiency_level < req.required_level:
                missing_skills.append(f"{req.skill_id} (レベル不足)")
        
        return {
            "all_met": len(missing_skills) == 0,
            "missing_skills": missing_skills,
            "mandatory_count": len(mandatory_reqs)
        }

    @staticmethod
    def _find_skill(skills: List[Skill], skill_id: str) -> Optional[Skill]:
        """スキルIDでスキルを検索"""
        for skill in skills:
            if skill.skill_id == skill_id:
                return skill
        return None

    @staticmethod
    def _calculate_level_match(candidate_level: int, required_level: int) -> float:
        """レベルマッチスコア計算"""
        diff = candidate_level - required_level
        
        if diff >= 0:
            # 要求以上のレベル: 90-100点
            return min(90 + diff * 5, 100)
        else:
            # 要求未満のレベル: レベル差で減点
            return max(0, 70 + diff * 20)

    @staticmethod
    def _get_priority_weight(priority: int) -> float:
        """優先度による重み"""
        weights = {1: 1.0, 2: 0.7, 3: 0.5}
        return weights.get(priority, 0.5)


class RetentionCalculator:
    """リテンションスコア計算"""

    @staticmethod
    def calculate(
        candidate_personality: PersonalityProfile,
        team_culture: PersonalityProfile,
        manager_similarity: Optional[float] = None,
        workload_rate: float = 70.0,
        recent_move: bool = False
    ) -> tuple[float, Dict]:
        """
        リテンションスコアを計算
        
        Retention = 0.4·PersonalitySim + 0.2·MgrSim + 
                    0.2·(1−WorkloadRisk) + 0.2·(1−RecentMoveRisk)
        
        Returns:
            (score: 0-100, breakdown: 詳細情報)
        """
        # 1. 性格類似度 (Big Five)
        personality_sim = RetentionCalculator._calculate_personality_similarity(
            candidate_personality,
            team_culture
        )
        
        # 2. マネージャー類似度（未指定の場合は平均値50を使用）
        mgr_sim = manager_similarity if manager_similarity is not None else 50.0
        
        # 3. 稼働率リスク
        workload_risk = RetentionCalculator._calculate_workload_risk(workload_rate)
        
        # 4. 異動直後リスク
        recent_move_risk = 50.0 if recent_move else 0.0
        
        # 総合計算
        retention_score = (
            0.4 * personality_sim +
            0.2 * mgr_sim +
            0.2 * (100 - workload_risk) +
            0.2 * (100 - recent_move_risk)
        )
        
        breakdown = {
            "personality_similarity": personality_sim,
            "manager_similarity": mgr_sim,
            "workload_risk": workload_risk,
            "recent_move_risk": recent_move_risk,
            "weights": {
                "personality": 0.4,
                "manager": 0.2,
                "workload": 0.2,
                "recent_move": 0.2
            }
        }
        
        return retention_score, breakdown

    @staticmethod
    def _calculate_personality_similarity(
        candidate: PersonalityProfile,
        team: PersonalityProfile
    ) -> float:
        """
        Big Fiveベクトルのコサイン類似度を計算
        
        Returns:
            0-100のスコア
        """
        candidate_vec = candidate.to_vector().reshape(1, -1)
        team_vec = team.to_vector().reshape(1, -1)
        
        # コサイン類似度 (-1 to 1)
        similarity = cosine_similarity(candidate_vec, team_vec)[0][0]
        
        # 0-100スケールに正規化
        score = (similarity + 1) * 50
        
        return score

    @staticmethod
    def _calculate_workload_risk(workload_rate: float) -> float:
        """
        稼働率リスクを計算
        
        Args:
            workload_rate: チーム平均稼働率 (0-100)
        
        Returns:
            リスクスコア (0-100, 高いほどリスク大)
        """
        if workload_rate < 60:
            return 0  # 低稼働: リスクなし
        elif workload_rate < 80:
            return (workload_rate - 60) * 1.5  # 中稼働: 緩やかな増加
        else:
            return 30 + (workload_rate - 80) * 3.5  # 高稼働: 急激な増加


class FrictionCalculator:
    """フリクションスコア計算"""

    @staticmethod
    def calculate(
        move_count_last_year: int = 0,
        handover_load: float = 0.0,
        manager_change: bool = False,
        personality_distance: float = 50.0
    ) -> tuple[float, Dict]:
        """
        フリクションスコアを計算
        
        Friction = 0.35·MoveCount + 0.25·HandoverLoad + 
                   0.2·ManagerChange + 0.2·(1−PersonalitySim)
        
        Returns:
            (score: 0-100, breakdown: 詳細情報)
        """
        # 1. 異動回数スコア
        move_score = FrictionCalculator._calculate_move_score(move_count_last_year)
        
        # 2. 引き継ぎ負荷スコア（0-100）
        handover_score = min(handover_load, 100.0)
        
        # 3. 上司交代スコア
        manager_change_score = 50.0 if manager_change else 0.0
        
        # 4. 性格距離（100 - 類似度）
        personality_friction = 100.0 - personality_distance
        
        # 総合計算
        friction_score = (
            0.35 * move_score +
            0.25 * handover_score +
            0.2 * manager_change_score +
            0.2 * personality_friction
        )
        
        breakdown = {
            "move_count_score": move_score,
            "handover_load_score": handover_score,
            "manager_change_score": manager_change_score,
            "personality_friction": personality_friction,
            "weights": {
                "move_count": 0.35,
                "handover": 0.25,
                "manager_change": 0.2,
                "personality": 0.2
            }
        }
        
        return friction_score, breakdown

    @staticmethod
    def _calculate_move_score(move_count: int) -> float:
        """
        異動回数からスコアを計算
        
        Args:
            move_count: 直近1年の異動回数
        
        Returns:
            スコア (0-100)
        """
        if move_count == 0:
            return 0
        elif move_count == 1:
            return 30
        elif move_count == 2:
            return 60
        else:
            return min(100, 60 + (move_count - 2) * 20)


class FitScoreEngine:
    """Fitスコア計算エンジン"""

    def __init__(self, preference_mode: PreferenceMode = PreferenceMode.STABILITY):
        self.preference_mode = preference_mode
        self.weights = PREFERENCE_WEIGHTS[preference_mode]

    def calculate_fit_score(
        self,
        # SkillMatch用
        candidate_skills: List[Skill],
        team_requirements: List[TeamRequirement],
        # Retention用
        candidate_personality: PersonalityProfile,
        team_culture: PersonalityProfile,
        manager_similarity: Optional[float] = None,
        workload_rate: float = 70.0,
        recent_move: bool = False,
        # Friction用
        move_count_last_year: int = 0,
        handover_load: float = 0.0,
        manager_change: bool = False
    ) -> FitScoreResult:
        """
        総合Fitスコアを計算
        
        Fit = α × SkillMatch + β × Retention - γ × Friction
        """
        # 1. SkillMatch計算
        skill_match, skill_breakdown = SkillMatchCalculator.calculate(
            candidate_skills,
            team_requirements
        )
        
        # 2. Retention計算
        retention, retention_breakdown = RetentionCalculator.calculate(
            candidate_personality,
            team_culture,
            manager_similarity,
            workload_rate,
            recent_move
        )
        
        # 3. Friction計算
        friction, friction_breakdown = FrictionCalculator.calculate(
            move_count_last_year,
            handover_load,
            manager_change,
            100.0 - retention_breakdown["personality_similarity"]  # 類似度の逆
        )
        
        # 4. 総合計算
        alpha = self.weights["alpha"]
        beta = self.weights["beta"]
        gamma = self.weights["gamma"]
        
        total_score = (
            alpha * skill_match +
            beta * retention -
            gamma * friction
        )
        
        # 0-100にクリップ
        total_score = max(0, min(100, total_score))
        
        # 信頼度計算（データ充実度に基づく）
        confidence = self._calculate_confidence(
            candidate_skills,
            team_requirements,
            candidate_personality
        )
        
        return FitScoreResult(
            total_score=round(total_score, 2),
            skill_match_score=round(skill_match, 2),
            retention_score=round(retention, 2),
            friction_score=round(friction, 2),
            confidence=round(confidence, 2),
            breakdown={
                "preference_mode": self.preference_mode.value,
                "weights": self.weights,
                "skill_match_detail": skill_breakdown,
                "retention_detail": retention_breakdown,
                "friction_detail": friction_breakdown
            }
        )

    def _calculate_confidence(
        self,
        candidate_skills: List[Skill],
        team_requirements: List[TeamRequirement],
        personality: PersonalityProfile
    ) -> float:
        """
        計算結果の信頼度を算出
        
        Returns:
            0.0-1.0の信頼度
        """
        confidence_factors = []
        
        # スキルデータの充実度
        if len(candidate_skills) >= 5:
            confidence_factors.append(1.0)
        elif len(candidate_skills) >= 3:
            confidence_factors.append(0.8)
        else:
            confidence_factors.append(0.5)
        
        # チーム要求の明確さ
        if len(team_requirements) >= 5:
            confidence_factors.append(1.0)
        elif len(team_requirements) >= 3:
            confidence_factors.append(0.8)
        else:
            confidence_factors.append(0.6)
        
        # 性格データの有無
        if personality:
            confidence_factors.append(1.0)
        else:
            confidence_factors.append(0.5)
        
        return sum(confidence_factors) / len(confidence_factors)


# 使用例
if __name__ == "__main__":
    # サンプルデータ
    candidate_skills = [
        Skill("sk_001", 5, 7.5),  # Python
        Skill("sk_007", 4, 4.0),   # 機械学習
        Skill("sk_009", 4, 6.0),   # SQL
    ]
    
    team_reqs = [
        TeamRequirement("sk_001", 4, True, 1),   # Python必須
        TeamRequirement("sk_007", 4, True, 1),   # ML必須
        TeamRequirement("sk_009", 3, True, 2),   # SQL必須
    ]
    
    candidate_personality = PersonalityProfile(75, 80, 45, 60, 35)
    team_culture = PersonalityProfile(80, 75, 50, 65, 40)
    
    # Fitスコア計算
    engine = FitScoreEngine(PreferenceMode.STABILITY)
    result = engine.calculate_fit_score(
        candidate_skills=candidate_skills,
        team_requirements=team_reqs,
        candidate_personality=candidate_personality,
        team_culture=team_culture,
        workload_rate=75.0,
        recent_move=False,
        move_count_last_year=0,
        handover_load=20.0,
        manager_change=False
    )
    
    print(f"総合Fitスコア: {result.total_score}/100")
    print(f"├ SkillMatch: {result.skill_match_score}/100")
    print(f"├ Retention: {result.retention_score}/100")
    print(f"├ Friction: {result.friction_score}/100")
    print(f"└ 信頼度: {result.confidence}")


