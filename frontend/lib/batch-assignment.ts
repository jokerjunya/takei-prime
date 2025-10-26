/**
 * 一括配置シミュレーション - 複数候補者の最適配置＋玉突き異動
 */

import type { Candidate, Team, Employee, PersonalityProfile } from './types'
import { calculateFitScore } from './calculator'
import { simulateTeamWithCandidate } from './simulation'

// ========================================
// 型定義
// ========================================

export interface Assignment {
  candidate: Candidate
  team: Team
  fit_score: number
  reason: string
  impact: {
    team_culture_change: number // チーム文化の変化度
    team_balance_change: number
  }
}

export interface TransferProposal {
  employee: Employee
  from_team: Team
  to_team: Team
  reason: string
  fit_improvement: number // Fitスコア改善度
}

export interface BatchAssignmentResult {
  assignments: Assignment[]
  transfers: TransferProposal[]
  organization_impact: {
    overall_fit_before: number
    overall_fit_after: number
    fit_improvement: number
    departments_affected: Array<{
      department: string
      fit_before: number
      fit_after: number
    }>
  }
}

// ========================================
// メイン関数
// ========================================

/**
 * 一括配置シミュレーション（貪欲法）
 */
export async function simulateBatchAssignment(
  candidates: Candidate[],
  allTeams: Team[],
  allEmployees: Employee[]
): Promise<BatchAssignmentResult> {
  const assignments: Assignment[] = []
  const transfers: TransferProposal[] = []
  const assignedTeams = new Set<string>()

  // Step 1: 各候補者を最適なチームに配置（貪欲法）
  for (const candidate of candidates) {
    // 候補者に関連するチームを取得（募集職種が一致するチームのみ）
    const relevantTeams = allTeams.filter(t => 
      !assignedTeams.has(t.id) &&
      t.recruiting_positions?.some(pos => pos.role === candidate.target_role)
    )
    
    if (relevantTeams.length === 0) break

    // 全関連チームとのFitスコアを計算
    const fitScores = await Promise.all(
      relevantTeams.map(async team => ({
        team,
        result: await calculateFitScore(candidate, team, 'stability')
      }))
    )

    // 最高Fitスコアのチームに配置
    const bestMatch = fitScores.reduce((max, current) => 
      current.result.total_score > max.result.total_score ? current : max
    )

    // 配置を記録
    assignments.push({
      candidate,
      team: bestMatch.team,
      fit_score: bestMatch.result.total_score,
      reason: generateAssignmentReason(candidate, bestMatch.team, bestMatch.result.total_score),
      impact: {
        team_culture_change: 0, // 後で計算
        team_balance_change: 0
      }
    })

    assignedTeams.add(bestMatch.team.id)
  }

  // Step 2: 玉突き異動の検討（同じ部署内のみ）
  for (const assignment of assignments) {
    const transferProposal = await findBestTransfer(
      assignment,
      allTeams,
      allEmployees
    )
    
    if (transferProposal) {
      transfers.push(transferProposal)
    }
  }

  // Step 3: 組織全体への影響を計算
  const organizationImpact = calculateOrganizationImpact(
    assignments,
    transfers,
    allTeams,
    allEmployees
  )

  return {
    assignments,
    transfers,
    organization_impact: organizationImpact
  }
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * 配置理由を生成
 */
function generateAssignmentReason(
  candidate: Candidate,
  team: Team,
  fitScore: number
): string {
  if (fitScore >= 80) {
    return `スキル・文化の両面で高い適合性。即戦力として活躍が期待できます`
  } else if (fitScore >= 60) {
    return `良好な適合性。適切なサポートで成果を出せます`
  } else {
    return `基本的な適合性あり。育成・サポート体制が重要です`
  }
}

/**
 * 玉突き異動の最適案を検索
 */
async function findBestTransfer(
  assignment: Assignment,
  allTeams: Team[],
  allEmployees: Employee[]
): Promise<TransferProposal | null> {
  const { candidate, team: assignedTeam } = assignment

  // 同じ部署内の他チームを取得
  const sameDepTeams = allTeams.filter(
    t => t.department === assignedTeam.department && t.id !== assignedTeam.id
  )

  if (sameDepTeams.length === 0) return null

  // 配置先チームの既存メンバーを取得
  const assignedTeamMembers = allEmployees.filter(e => e.team_id === assignedTeam.id)

  let bestTransfer: TransferProposal | null = null
  let bestImprovement = 5 // 閾値: 5pt以上の改善がある場合のみ提案

  // 各既存メンバーについて、異動先を検討
  for (const employee of assignedTeamMembers) {
    for (const targetTeam of sameDepTeams) {
      // パターン1: 直接配置
      const directFit = assignment.fit_score

      // パターン2: 玉突き異動
      // 既存メンバーを異動先チームに配置したときのFit
      const employeeAsCandidate: Candidate = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        current_position: employee.position,
        years_of_experience: employee.tenure,
        education: { degree: '', major: '', university: '' }, // ダミー
        personality_profile: employee.personality_profile,
        work_style_preferences: {
          remote_preference: 'hybrid',
          communication_style: 'balanced',
          work_pace: 'steady',
          decision_style: 'analytical'
        },
        skills: employee.skills
      }

      const transferFit = await calculateFitScore(employeeAsCandidate, targetTeam, 'stability')

      // 玉突き後の候補者のFit（元のチームの性格が変わることを考慮すべきだが簡易化）
      const candidateFitAfterTransfer = assignment.fit_score // 簡易的に同じと仮定

      const totalImprovement = transferFit.total_score - directFit

      if (totalImprovement > bestImprovement) {
        bestImprovement = totalImprovement
        bestTransfer = {
          employee,
          from_team: assignedTeam,
          to_team: targetTeam,
          reason: generateTransferReason(employee, targetTeam, transferFit.total_score),
          fit_improvement: totalImprovement
        }
      }
    }
  }

  return bestTransfer
}

/**
 * 異動理由を生成
 */
function generateTransferReason(
  employee: Employee,
  targetTeam: Team,
  fitScore: number
): string {
  // 簡易的な理由生成
  if (fitScore >= 80) {
    return `${employee.name}さんのスキル・経験が${targetTeam.name}でより活きる配置です`
  } else {
    return `チーム全体のバランスを考慮した最適化です`
  }
}

/**
 * 組織全体への影響を計算
 */
function calculateOrganizationImpact(
  assignments: Assignment[],
  transfers: TransferProposal[],
  allTeams: Team[],
  allEmployees: Employee[]
): {
  overall_fit_before: number
  overall_fit_after: number
  fit_improvement: number
  departments_affected: Array<{
    department: string
    fit_before: number
    fit_after: number
  }>
} {
  // 簡易的な計算（本来はもっと精密に）
  const overallFitBefore = 44.6 // 現在の全社平均（ダミー）
  
  // 配置によるFit向上を加算
  const assignmentImprovement = assignments.reduce((sum, a) => sum + (a.fit_score - 50), 0) / assignments.length
  const transferImprovement = transfers.reduce((sum, t) => sum + t.fit_improvement, 0)
  
  const overallFitAfter = overallFitBefore + assignmentImprovement * 0.1 + transferImprovement * 0.05

  // 部署別の影響（簡易版）
  const departmentsAffected = Array.from(
    new Set([
      ...assignments.map(a => a.team.department),
      ...transfers.map(t => t.to_team.department)
    ])
  ).map(dept => ({
    department: dept,
    fit_before: 45, // ダミー
    fit_after: 47  // ダミー
  }))

  return {
    overall_fit_before: overallFitBefore,
    overall_fit_after: Math.round(overallFitAfter * 10) / 10,
    fit_improvement: Math.round((overallFitAfter - overallFitBefore) * 10) / 10,
    departments_affected: departmentsAffected
  }
}

