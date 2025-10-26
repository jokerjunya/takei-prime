'use client'

import { useEffect, useState } from 'react'
import { getTeams, getCandidates } from '@/lib/data'
import { getOrganizationByDepartments } from '@/lib/organization'
import { calculateFitScore } from '@/lib/calculator'
import { OrganizationTreeView } from '@/components/organization/OrganizationTreeView'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Target, TrendingUp } from 'lucide-react'
import type { Team, Candidate } from '@/lib/types'
import type { Department } from '@/lib/organization'

interface TeamWithStats extends Team {
  avgFitScore: number
  culture: string
  strength: string
  risk: string
}

export default function DashboardPage() {
  const [departments, setDepartments] = useState<Array<{
    department: Department
    teams: Team[]
  }>>([])
  const [teamStats, setTeamStats] = useState<Map<string, {
    avgFitScore: number
    culture: string
    strength: string
    risk: string
  }>>(new Map())
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalTeams: 0,
    totalCandidates: 0,
    avgFitScore: 0,
    proposalCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [teamsData, candidatesData] = await Promise.all([
        getTeams(),
        getCandidates()
      ])

      // 各チームの平均Fitスコアを計算
      const statsMap = new Map()
      
      for (const team of teamsData) {
        // 最初の3候補者とのFitスコアを計算
        const sampleCandidates = candidatesData.slice(0, 3)
        const fitScores = await Promise.all(
          sampleCandidates.map(candidate => 
            calculateFitScore(candidate, team, 'stability')
          )
        )
        
        const avgFit = fitScores.reduce((sum, result) => sum + result.total_score, 0) / fitScores.length

        // チーム特性を生成
        statsMap.set(team.id, {
          avgFitScore: Math.round(avgFit * 10) / 10,
          culture: team.culture_profile.openness > 80 ? '挑戦志向' : 
                  team.culture_profile.agreeableness > 80 ? '協調志向' :
                  team.culture_profile.conscientiousness > 85 ? 'データ志向' : '成長志向',
          strength: team.culture_profile.extraversion > 70 ? 'コミュニケーション力' :
                   team.culture_profile.conscientiousness > 85 ? '実行力' : '分析力',
          risk: team.workload_average > 80 ? '高稼働率' :
               team.size > 20 ? 'コミュニケーション不足' : 'スキルギャップ'
        })
      }

      // 組織構造データを取得
      const departmentsData = await getOrganizationByDepartments(teamsData)

      // 統計情報を計算
      const allAvgScores = Array.from(statsMap.values()).map(s => s.avgFitScore)
      const totalAvgFit = allAvgScores.reduce((sum, score) => sum + score, 0) / allAvgScores.length

      setDepartments(departmentsData)
      setTeamStats(statsMap)
      setStats({
        totalDepartments: departmentsData.length,
        totalTeams: teamsData.length,
        totalCandidates: candidatesData.length,
        avgFitScore: Math.round(totalAvgFit * 10) / 10,
        proposalCount: 23
      })
      
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
        <p className="mt-2 text-gray-600">
          組織全体のチーム構成と配置状況を確認できます
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              総部署数
            </CardTitle>
            <Building2 className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDepartments}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.totalTeams}チーム</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              総候補者数
            </CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</div>
            <p className="text-xs text-gray-500 mt-1">現在の候補者</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              平均Fitスコア
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.avgFitScore}</div>
            <p className="text-xs text-gray-500 mt-1">全チーム平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              配置提案数
            </CardTitle>
            <Target className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.proposalCount}</div>
            <p className="text-xs text-gray-500 mt-1">今月の提案</p>
          </CardContent>
        </Card>
      </div>

      {/* 組織ツリービュー */}
      <OrganizationTreeView 
        departments={departments}
        teamStats={teamStats}
      />
    </div>
  )
}

