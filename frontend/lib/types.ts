/**
 * Takei-prime 型定義
 */

// ========================================
// 基本型
// ========================================

export type PreferenceMode = 'stability' | 'growth' | 'diversity' | 'priority' | 'innovation'

export interface Skill {
  skill_id: string
  proficiency_level: number // 1-5
  years_of_experience: number
}

export interface PersonalityProfile {
  openness: number // 0-100
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface WorkStylePreferences {
  remote_preference: 'full_remote' | 'hybrid' | 'onsite'
  communication_style: 'written_preferred' | 'verbal_preferred' | 'balanced' | 'visual_preferred'
  work_pace: 'steady' | 'burst'
  decision_style: 'analytical' | 'intuitive' | 'collaborative' | 'data_driven' | 'creative' | 'adaptive'
}

export interface Education {
  degree: string
  major: string
  university: string
}

// ========================================
// 候補者
// ========================================

export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  current_position: string
  years_of_experience: number
  education: Education
  personality_profile: PersonalityProfile
  work_style_preferences: WorkStylePreferences
  skills: Skill[]
}

// ========================================
// チーム
// ========================================

export interface TeamRequirement {
  skill_id: string
  required_level: number // 1-5
  is_mandatory: boolean
  priority: number // 1: high, 2: medium, 3: low
}

export interface TeamCultureProfile extends PersonalityProfile {
  openness_variance: number
  conscientiousness_variance: number
  extraversion_variance: number
  agreeableness_variance: number
  neuroticism_variance: number
}

export interface Team {
  id: string
  name: string
  department: string
  description: string
  manager_id: string
  size: number
  location: string
  remote_policy: 'full_remote' | 'hybrid' | 'onsite'
  culture_profile: TeamCultureProfile
  current_challenges: string[]
  workload_average: number // 0-100
  requirements: TeamRequirement[]
}

// ========================================
// Fitスコア
// ========================================

export interface FitScoreBreakdown {
  skill_match: number
  retention: number
  friction: number
}

export interface Strength {
  aspect: string
  score: number
  description: string
}

export interface Risk {
  aspect: string
  score: number
  description: string
}

export interface Recommendation {
  action: string
  priority: 'high' | 'medium' | 'low'
  expected_impact: string
}

export interface FitScoreResult {
  total_score: number
  breakdown: FitScoreBreakdown
  confidence: number
  strengths: Strength[]
  risks: Risk[]
  recommendations: Recommendation[]
  candidate: Candidate
  team: Team
  preference_mode: PreferenceMode
  calculated_at: string
}

// ========================================
// スキルマスター
// ========================================

export type SkillCategory = 'technical' | 'soft' | 'domain'

export interface SkillMaster {
  id: string
  name: string
  category: SkillCategory
  subcategory: string
  description: string
}

// ========================================
// 従業員
// ========================================

export type EmployeeLevel = 'junior' | 'mid' | 'senior' | 'lead'

export interface Employee {
  id: string
  name: string
  team_id: string
  department: string
  position: string
  level: EmployeeLevel
  tenure: number // 在籍年数
  personality_profile: PersonalityProfile
  skills: Skill[]
  email: string
}

// ========================================
// Preferenceプリセット
// ========================================

export interface PreferenceWeights {
  alpha: number // SkillMatch重み
  beta: number  // Retention重み
  gamma: number // Friction重み
}

export interface PreferenceModeConfig {
  mode: PreferenceMode
  name: string
  description: string
  theme: string
  weights: PreferenceWeights
  use_case: string
}

export const PREFERENCE_MODES: Record<PreferenceMode, PreferenceModeConfig> = {
  stability: {
    mode: 'stability',
    name: 'Stability',
    description: '離職最小化',
    theme: '安定重視配置',
    weights: { alpha: 0.4, beta: 0.5, gamma: 0.1 },
    use_case: '定着率向上、チーム安定化を優先したい場合'
  },
  growth: {
    mode: 'growth',
    name: 'Growth',
    description: '若手育成',
    theme: '成長・リスキル型',
    weights: { alpha: 0.6, beta: 0.2, gamma: 0.2 },
    use_case: 'スキル獲得、育成を優先したい場合'
  },
  diversity: {
    mode: 'diversity',
    name: 'Diversity',
    description: '多様性推進',
    theme: 'チーム構成多様化',
    weights: { alpha: 0.4, beta: 0.4, gamma: 0.2 },
    use_case: 'チームの多様性を高めたい場合'
  },
  priority: {
    mode: 'priority',
    name: 'Priority',
    description: '緊急PJ重視',
    theme: '重点プロジェクト集中',
    weights: { alpha: 0.7, beta: 0.1, gamma: 0.2 },
    use_case: '急ぎのプロジェクトに即戦力が必要な場合'
  },
  innovation: {
    mode: 'innovation',
    name: 'Innovation',
    description: '異質補完',
    theme: '新しい発想創出',
    weights: { alpha: 0.5, beta: 0.3, gamma: 0.2 },
    use_case: '新しいアイデア、イノベーションを生み出したい場合'
  }
}

// ========================================
// ユーティリティ型
// ========================================

export function getScoreColor(score: number): string {
  if (score >= 80) return 'fit-excellent'
  if (score >= 60) return 'fit-good'
  if (score >= 40) return 'fit-fair'
  return 'fit-poor'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return '非常に良い'
  if (score >= 60) return '良好'
  if (score >= 40) return '普通'
  return '要検討'
}

export function getScoreGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}


