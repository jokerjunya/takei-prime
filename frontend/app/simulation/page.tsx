'use client'

import { useEffect, useState } from 'react'
import { getCandidates, getTeams } from '@/lib/data'
import { simulateTeamWithCandidate, type SimulationResult } from '@/lib/simulation'
import { BeforeAfterView } from '@/components/simulation/BeforeAfterView'
import { ImpactAnalysis } from '@/components/simulation/ImpactAnalysis'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, Users, Building2, Sparkles, PlayCircle } from 'lucide-react'
import type { Candidate, Team } from '@/lib/types'

export default function SimulationPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [candidatesData, teamsData] = await Promise.all([
        getCandidates(),
        getTeams()
      ])
      setCandidates(candidatesData)
      setTeams(teamsData)
      
      // デフォルト選択
      if (candidatesData.length > 0) setSelectedCandidateId(candidatesData[2].id) // 鈴木一郎
      if (teamsData.length > 0) setSelectedTeamId(teamsData[13].id) // AI/ML開発チーム
      
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSimulate = async () => {
    if (!selectedCandidateId || !selectedTeamId) return
    
    setSimulating(true)
    
    const candidate = candidates.find(c => c.id === selectedCandidateId)
    const team = teams.find(t => t.id === selectedTeamId)
    
    if (candidate && team) {
      // シミュレーション実行を視覚的に演出
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = simulateTeamWithCandidate(team, candidate)
      setSimulation(result)
    }
    
    setSimulating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId)
  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          配置シミュレーション
        </h1>
        <p className="text-lg text-gray-600">
          候補者を追加したときのチーム構成の変化を予測します
        </p>
      </div>

      {/* 選択フォーム */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            シミュレーション条件
          </CardTitle>
          <CardDescription>
            候補者とチームを選択して、配置後の影響をシミュレーションします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 候補者選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                候補者を選択
              </label>
              <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                <SelectTrigger>
                  <SelectValue placeholder="候補者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.current_position} ({candidate.years_of_experience}年)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCandidate && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 text-sm">{selectedCandidate.name}</p>
                  <p className="text-blue-700 text-sm">{selectedCandidate.current_position}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-blue-600">
                    <span>経験: {selectedCandidate.years_of_experience}年</span>
                    <span>スキル: {selectedCandidate.skills.length}個</span>
                  </div>
                  {/* 性格プレビュー */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-800 font-medium mb-1.5">性格プロファイル</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>開放性: {selectedCandidate.personality_profile.openness}</span>
                      <span>誠実性: {selectedCandidate.personality_profile.conscientiousness}</span>
                      <span>外向性: {selectedCandidate.personality_profile.extraversion}</span>
                      <span>協調性: {selectedCandidate.personality_profile.agreeableness}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* チーム選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                配置先チームを選択
              </label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="チームを選択" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} - {team.department} ({team.size}人)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeam && (
                <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-900 text-sm">{selectedTeam.name}</p>
                  <p className="text-purple-700 text-sm">{selectedTeam.department}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-purple-600">
                    <span>現在: {selectedTeam.size}人</span>
                    <span>稼働率: {selectedTeam.workload_average}%</span>
                  </div>
                  {/* 文化プレビュー */}
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-purple-800 font-medium mb-1.5">チーム文化（平均）</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>開放性: {selectedTeam.culture_profile.openness}</span>
                      <span>誠実性: {selectedTeam.culture_profile.conscientiousness}</span>
                      <span>外向性: {selectedTeam.culture_profile.extraversion}</span>
                      <span>協調性: {selectedTeam.culture_profile.agreeableness}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* シミュレーション実行ボタン */}
          <Button 
            onClick={handleSimulate} 
            disabled={!selectedCandidateId || !selectedTeamId || simulating}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {simulating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                シミュレーション実行中...
              </>
            ) : (
              <>
                <PlayCircle className="w-6 h-6 mr-3" />
                シミュレーションを実行
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* シミュレーション結果 */}
      {simulation && selectedCandidate && selectedTeam && (
        <div className="space-y-6 animate-count-up">
          {/* 見出し */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">シミュレーション結果</h2>
            <p className="text-indigo-100">
              {selectedCandidate.name} を {selectedTeam.name} に配置した場合の影響分析
            </p>
          </div>

          {/* Before/After比較 */}
          <BeforeAfterView 
            before={simulation.before}
            after={simulation.after}
            diff={simulation.diff}
          />

          {/* 影響分析 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              AIによる影響分析
            </h2>
            <ImpactAnalysis 
              strengths={simulation.impact_analysis.strengths}
              risks={simulation.impact_analysis.risks}
              recommendations={simulation.impact_analysis.recommendations}
              retentionEstimate={simulation.impact_analysis.retention_estimate}
            />
          </div>

          {/* アクションボタン */}
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setSimulation(null)}
            >
              条件を変更
            </Button>
            <Button size="lg">
              この配置案を保存
            </Button>
          </div>
        </div>
      )}

      {/* 初回表示時のヒント */}
      {!simulation && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="py-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              候補者とチームを選択してシミュレーションを実行してください
            </p>
            <p className="text-sm text-gray-500">
              チーム構成の変化、Big Fiveの変化、定着率予測などを確認できます
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

