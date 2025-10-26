/**
 * デモデータローダー
 */

import type { Candidate, Team, SkillMaster, Employee } from './types'

// データファイルのパス（publicディレクトリ）
const DATA_BASE_URL = '/data'

let candidatesCache: Candidate[] | null = null
let teamsCache: Team[] | null = null
let skillsCache: SkillMaster[] | null = null

/**
 * 候補者データを取得
 */
export async function getCandidates(): Promise<Candidate[]> {
  if (candidatesCache) return candidatesCache

  const response = await fetch(`${DATA_BASE_URL}/candidates.json`)
  const data = await response.json()
  candidatesCache = data.candidates
  return candidatesCache
}

/**
 * 候補者を1件取得
 */
export async function getCandidate(id: string): Promise<Candidate | null> {
  const candidates = await getCandidates()
  return candidates.find(c => c.id === id) || null
}

/**
 * チームデータを取得
 */
export async function getTeams(): Promise<Team[]> {
  if (teamsCache) return teamsCache

  const response = await fetch(`${DATA_BASE_URL}/teams.json`)
  const data = await response.json()
  teamsCache = data.teams
  return teamsCache
}

/**
 * チームを1件取得
 */
export async function getTeam(id: string): Promise<Team | null> {
  const teams = await getTeams()
  return teams.find(t => t.id === id) || null
}

/**
 * スキルマスターを取得
 */
export async function getSkills(): Promise<SkillMaster[]> {
  if (skillsCache) return skillsCache

  const response = await fetch(`${DATA_BASE_URL}/skills_master.json`)
  const data = await response.json()
  skillsCache = data.skills
  return skillsCache
}

/**
 * スキルIDから名称を取得
 */
export async function getSkillName(skillId: string): Promise<string> {
  const skills = await getSkills()
  const skill = skills.find(s => s.id === skillId)
  return skill?.name || skillId
}

/**
 * スキルIDから詳細を取得
 */
export async function getSkill(skillId: string): Promise<SkillMaster | null> {
  const skills = await getSkills()
  return skills.find(s => s.id === skillId) || null
}

/**
 * 従業員データを取得
 */
let employeesCache: Employee[] | null = null

export async function getEmployees(): Promise<Employee[]> {
  if (employeesCache) return employeesCache

  const response = await fetch(`${DATA_BASE_URL}/employees.json`)
  const data = await response.json()
  employeesCache = data.employees
  return employeesCache
}

/**
 * チームの従業員を取得
 */
export async function getEmployeesByTeam(teamId: string): Promise<Employee[]> {
  const employees = await getEmployees()
  return employees.filter(e => e.team_id === teamId)
}

/**
 * 部署の従業員を取得
 */
export async function getEmployeesByDepartment(department: string): Promise<Employee[]> {
  const employees = await getEmployees()
  return employees.filter(e => e.department === department)
}

/**
 * キャッシュクリア
 */
export function clearCache() {
  candidatesCache = null
  teamsCache = null
  skillsCache = null
  employeesCache = null
}


