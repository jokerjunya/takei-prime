'use client'

import { useEffect, useState } from 'react'
import { getTeams, getCandidates } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import { TeamCard } from '@/components/team/TeamCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Plus, Search, Filter, Download } from 'lucide-react'
import type { Team, Candidate } from '@/lib/types'

interface TeamWithAvgScore extends Team {
  avgFitScore: number
  culture: string
  strength: string
  risk: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithAvgScore[]>([])
  const [filteredTeams, setFilteredTeams] = useState<TeamWithAvgScore[]>([])
  const [loading, setLoading] = useState(true)
  
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedPolicy, setSelectedPolicy] = useState('all')

  useEffect(() => {
    async function loadData() {
      const [teamsData, candidatesData] = await Promise.all([
        getTeams(),
        getCandidates()
      ])

      // 各チームの平均Fitスコアを計算
      const teamsWithScores: TeamWithAvgScore[] = await Promise.all(
        teamsData.map(async (team) => {
          // サンプル候補者（最初の5人）とのFitスコアを計算
          const sampleCandidates = candidatesData.slice(0, 5)
          const fitScores = await Promise.all(
            sampleCandidates.map(candidate => 
              calculateFitScore(candidate, team, 'stability')
            )
          )
          
          const avgFit = fitScores.reduce((sum, result) => sum + result.total_score, 0) / fitScores.length

          // チーム特性を生成
          const cultures = ['挑戦志向', '協調志向', '自律志向', '成長志向', 'データ志向', '安定志向']
          const strengths = ['行動力', '分析力', 'コミュニケーション力', '企画力', '実行力', '専門性']
          const risks = ['高稼働率', '世代間ギャップ', 'スキルギャップ', '文化の硬直性', '離職傾向']

          return {
            ...team,
            avgFitScore: Math.round(avgFit * 10) / 10,
            culture: team.culture_profile.openness > 80 ? '挑戦志向' : 
                    team.culture_profile.agreeableness > 80 ? '協調志向' :
                    team.culture_profile.conscientiousness > 85 ? 'データ志向' : '成長志向',
            strength: team.culture_profile.extraversion > 70 ? 'コミュニケーション力' :
                     team.culture_profile.conscientiousness > 85 ? '実行力' : '分析力',
            risk: team.workload_average > 80 ? '高稼働率' :
                 team.size > 20 ? 'コミュニケーション不足' : 'スキルギャップ'
          }
        })
      )

      setTeams(teamsWithScores)
      setFilteredTeams(teamsWithScores)
      setLoading(false)
    }

    loadData()
  }, [])

  // フィルター適用
  useEffect(() => {
    let filtered = [...teams]

    // 名前検索
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 部署フィルター
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(t => t.department === selectedDepartment)
    }

    // リモートポリシーフィルター
    if (selectedPolicy !== 'all') {
      filtered = filtered.filter(t => t.remote_policy === selectedPolicy)
    }

    setFilteredTeams(filtered)
  }, [searchQuery, selectedDepartment, selectedPolicy, teams])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('all')
    setSelectedPolicy('all')
  }

  // 部署一覧を取得
  const departments = Array.from(new Set(teams.map(t => t.department)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">チームデータを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            チーム一覧
          </h1>
          <p className="mt-2 text-gray-600">
            全{teams.length}チームの配置状況とおすすめ候補者を確認できます
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            レポート出力
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            チームを追加
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">フィルター</h3>
            {(searchQuery || selectedDepartment !== 'all' || selectedPolicy !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="ml-auto"
              >
                クリア
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="チーム名・部署で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* 部署フィルター */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="部署で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての部署</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* リモートポリシー */}
            <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
              <SelectTrigger>
                <SelectValue placeholder="働き方" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="full_remote">フルリモート</SelectItem>
                <SelectItem value="hybrid">ハイブリッド</SelectItem>
                <SelectItem value="onsite">オンサイト</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 結果表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredTeams.length}チームを表示中
          {filteredTeams.length !== teams.length && (
            <span className="text-indigo-600 font-semibold ml-2">
              （{teams.length}チーム中）
            </span>
          )}
        </p>
      </div>

      {/* チームカード一覧 */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">条件に一致するチームが見つかりませんでした</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleClearFilters}
          >
            フィルターをクリア
          </Button>
        </div>
      )}
    </div>
  )
}

