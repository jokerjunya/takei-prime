/**
 * 組織構造データのローダー
 */

import type { Team } from './types'

export interface Department {
  id: string
  name: string
  type: 'department' | 'division'
  employee_count: number
  level: number
  teams: string[] // team IDの配列
}

export interface OrganizationStructure {
  id: string
  name: string
  total_employees: number
  founded: string
  industry: string
  description: string
  hierarchy: Department[]
}

let organizationCache: OrganizationStructure | null = null

/**
 * 組織構造データを取得
 */
export async function getOrganizationStructure(): Promise<OrganizationStructure> {
  if (organizationCache) return organizationCache

  const response = await fetch('/data/organization_structure.json')
  const data = await response.json()
  organizationCache = data.organization
  return organizationCache
}

/**
 * 部署とそのチームを取得
 */
export async function getDepartmentWithTeams(
  departmentId: string,
  allTeams: Team[]
): Promise<{ department: Department; teams: Team[] } | null> {
  const org = await getOrganizationStructure()
  const department = org.hierarchy.find(d => d.id === departmentId)
  
  if (!department) return null
  
  const teams = allTeams.filter(team => department.teams.includes(team.id))
  
  return { department, teams }
}

/**
 * 組織全体を部署別にグループ化
 */
export async function getOrganizationByDepartments(
  allTeams: Team[]
): Promise<Array<{ department: Department; teams: Team[] }>> {
  const org = await getOrganizationStructure()
  
  return org.hierarchy.map(department => ({
    department,
    teams: allTeams.filter(team => department.teams.includes(team.id))
  }))
}

