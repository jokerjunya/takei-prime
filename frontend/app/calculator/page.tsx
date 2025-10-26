'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCandidates, getTeams } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import type { Candidate, Team, PreferenceMode, FitScoreResult } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator, Users, Building2, ArrowRight } from 'lucide-react'
import { ScoreCard } from '@/components/fit-score/ScoreCard'
import { ScoreChart } from '@/components/fit-score/ScoreChart'

export default function CalculatorPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [selectedMode, setSelectedMode] = useState<PreferenceMode>('stability')
  const [result, setResult] = useState<FitScoreResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [candidatesData, teamsData] = await Promise.all([
        getCandidates(),
        getTeams()
      ])
      setCandidates(candidatesData)
      setTeams(teamsData)
      
      // デフォルト選択
      if (candidatesData.length > 0) {
        setSelectedCandidateId(candidatesData[2].id) // 鈴木一郎
      }
      if (teamsData.length > 0) {
        setSelectedTeamId(teamsData[0].id) // AI/MLチーム
      }
      
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCalculate = async () => {
    if (!selectedCandidateId || !selectedTeamId) return
    
    setCalculating(true)
    
    const candidate = candidates.find(c => c.id === selectedCandidateId)
    const team = teams.find(t => t.id === selectedTeamId)
    
    if (candidate && team) {
      // 計算を遅延させて「計算中」感を演出
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const fitScore = await calculateFitScore(candidate, team, selectedMode)
      setResult(fitScore)
    }
    
    setCalculating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId)
  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <Calculator className="w-16 h-16 text-violet-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Fitスコア計算
        </h1>
        <p className="text-gray-600">
          候補者とチームを選択して、配置の適合性を分析します
        </p>
      </div>

      {/* 選択フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>計算条件を選択</CardTitle>
          <CardDescription>
            候補者、チーム、経営方針モードを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 候補者選択 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              候補者
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
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-900">{selectedCandidate.name}</p>
                <p className="text-blue-700">{selectedCandidate.current_position}</p>
                <p className="text-blue-600 mt-1">
                  スキル数: {selectedCandidate.skills.length}個 | 経験: {selectedCandidate.years_of_experience}年
                </p>
              </div>
            )}
          </div>

          {/* チーム選択 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              配置先チーム
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
              <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm">
                <p className="font-medium text-amber-900">{selectedTeam.name}</p>
                <p className="text-amber-700">{selectedTeam.department}</p>
                <p className="text-amber-600 mt-1">
                  チームサイズ: {selectedTeam.size}人 | 稼働率: {selectedTeam.workload_average}%
                </p>
              </div>
            )}
          </div>

          {/* Preferenceモード選択 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">経営方針モード</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['stability', 'growth', 'diversity', 'priority', 'innovation'] as PreferenceMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedMode === mode 
                      ? 'bg-violet-600 text-white ring-2 ring-violet-600 ring-offset-2' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {mode === 'stability' && 'Stability'}
                  {mode === 'growth' && 'Growth'}
                  {mode === 'diversity' && 'Diversity'}
                  {mode === 'priority' && 'Priority'}
                  {mode === 'innovation' && 'Innovation'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedMode === 'stability' && '離職最小化（安定重視）- 定着率向上を優先'}
              {selectedMode === 'growth' && '若手育成（成長重視）- スキル獲得・育成を優先'}
              {selectedMode === 'diversity' && '多様性推進（バランス重視）- チームの多様性を優先'}
              {selectedMode === 'priority' && '緊急PJ重視（スキル重視）- 即戦力が必要な場合'}
              {selectedMode === 'innovation' && '異質補完（イノベーション重視）- 新しいアイデア創出'}
            </p>
          </div>

          {/* 計算ボタン */}
          <Button 
            onClick={handleCalculate} 
            disabled={!selectedCandidateId || !selectedTeamId || calculating}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {calculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                計算中...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Fitスコアを計算
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 計算結果 */}
      {result && (
        <div className="space-y-6 animate-count-up">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">計算完了！</h2>
            <p className="text-violet-100">
              {result.candidate.name} × {result.team.name} のFitスコアを算出しました
            </p>
          </div>

          {/* スコア表示 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <ScoreCard
                score={result.total_score}
                title="総合Fitスコア"
                description={`信頼度: ${(result.confidence * 100).toFixed(0)}%`}
                showGrade={true}
              />
            </div>
            <ScoreCard
              score={result.breakdown.skill_match}
              title="SkillMatch"
            />
            <ScoreCard
              score={result.breakdown.retention}
              title="Retention"
            />
          </div>

          <ScoreChart breakdown={result.breakdown} />

          {/* 詳細を見るボタン */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => router.push('/fit-score/result')}
            >
              詳細な分析結果を見る
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


