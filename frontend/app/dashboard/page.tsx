'use client'

import { useEffect, useState } from 'react'
import { getTeams, getCandidates } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import { TeamCard } from '@/components/team/TeamCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Target, TrendingUp } from 'lucide-react'
import type { Team, Candidate } from '@/lib/types'

interface TeamWithStats extends Team {
  avgFitScore: number
  culture: string
  strength: string
  risk: string
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<TeamWithStats[]>([])
  const [stats, setStats] = useState({
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

      // 各チームの平均Fitスコアを計算（簡易版：最初の3候補者で計算）
      const teamsWithStats: TeamWithStats[] = await Promise.all(
        teamsData.map(async (team) => {
          // 最初の3候補者とのFitスコアを計算
          const sampleCandidates = candidatesData.slice(0, 3)
          const fitScores = await Promise.all(
            sampleCandidates.map(candidate => 
              calculateFitScore(candidate, team, 'stability')
            )
          )
          
          const avgFit = fitScores.reduce((sum, result) => sum + result.total_score, 0) / fitScores.length

          // チームの特性を生成（デモ用）
          const teamTypes = ['成果重視型', 'バランス型', '協調重視型', '革新型', '安定型']
          const cultures = ['挑戦志向', '協調志向', '自律志向', '成長志向', 'データ志向']
          const strengths = ['行動力', '分析力', 'コミュニケーション力', '企画力', '実行力']
          const risks = ['短期離職の傾向', '過度な稼働率', 'スキルギャップ', 'コミュニケーション不足', '世代間ギャップ']

          return {
            ...team,
            avgFitScore: Math.round(avgFit * 10) / 10,
            culture: cultures[Math.floor(Math.random() * cultures.length)],
            strength: strengths[Math.floor(Math.random() * strengths.length)],
            risk: risks[Math.floor(Math.random() * risks.length)]
          }
        })
      )

      // 統計情報を計算
      const totalAvgFit = teamsWithStats.reduce((sum, team) => sum + team.avgFitScore, 0) / teamsWithStats.length

      setTeams(teamsWithStats)
      setStats({
        totalTeams: teamsData.length,
        totalCandidates: candidatesData.length,
        avgFitScore: Math.round(totalAvgFit * 10) / 10,
        proposalCount: 23 // デモ用固定値
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
              総チーム数
            </CardTitle>
            <Building2 className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalTeams}</div>
            <p className="text-xs text-gray-500 mt-1">アクティブなチーム</p>
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

      {/* チーム一覧 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">チーム一覧</h2>
          <p className="text-sm text-gray-500">
            {teams.length}チーム
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              id={team.id}
              name={team.name}
              department={team.department}
              type="成果重視型"
              avgFitScore={team.avgFitScore}
              memberCount={team.size}
              culture={team.culture}
              strength={team.strength}
              risk={team.risk}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

