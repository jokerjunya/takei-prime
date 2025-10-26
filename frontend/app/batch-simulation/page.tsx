'use client'

import { useEffect, useState } from 'react'
import { getCandidates, getTeams, getEmployees } from '@/lib/data'
import { simulateBatchAssignment, type BatchAssignmentResult } from '@/lib/batch-assignment'
import { CandidateMultiSelect } from '@/components/batch-simulation/CandidateMultiSelect'
import { AssignmentResult } from '@/components/batch-simulation/AssignmentResult'
import { OrganizationImpactView } from '@/components/batch-simulation/OrganizationImpactView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Sparkles, 
  PlayCircle,
  CheckCircle2
} from 'lucide-react'
import type { Candidate, Team, Employee } from '@/lib/types'

export default function BatchSimulationPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<BatchAssignmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [candidatesData, teamsData, employeesData] = await Promise.all([
        getCandidates(),
        getTeams(),
        getEmployees()
      ])
      
      setCandidates(candidatesData)
      setTeams(teamsData)
      setEmployees(employeesData)
      
      // デフォルトで3人選択（デモ用）
      const defaultSelection = new Set([
        candidatesData[2]?.id,  // 鈴木一郎
        candidatesData[1]?.id,  // 佐藤花子
        candidatesData[4]?.id   // 伊藤健太
      ].filter(Boolean))
      
      setSelectedCandidateIds(defaultSelection)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleToggleCandidate = (id: string) => {
    const newSet = new Set(selectedCandidateIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedCandidateIds(newSet)
  }

  const handleSelectAll = () => {
    setSelectedCandidateIds(new Set(candidates.map(c => c.id)))
  }

  const handleClearAll = () => {
    setSelectedCandidateIds(new Set())
  }

  const handleCalculate = async () => {
    if (selectedCandidateIds.size === 0) return

    setCalculating(true)
    setResult(null)

    // 選択された候補者を取得
    const selectedCandidates = candidates.filter(c => selectedCandidateIds.has(c.id))

    // 計算を演出（2秒待機）
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 一括配置シミュレーション実行
    const simulationResult = await simulateBatchAssignment(
      selectedCandidates,
      teams,
      employees
    )

    setResult(simulationResult)
    setCalculating(false)
  }

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          今月採用分の一括配置シミュレーション
        </h1>
        <p className="text-lg text-gray-600">
          複数の候補者を最適に配置し、玉突き異動も含めて組織全体を最適化します
        </p>
      </div>

      {/* Step 1: 候補者選択 */}
      <CandidateMultiSelect
        candidates={candidates}
        selectedIds={selectedCandidateIds}
        onToggle={handleToggleCandidate}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      {/* 計算ボタン */}
      <div className="flex justify-center">
        <Button
          onClick={handleCalculate}
          disabled={selectedCandidateIds.size === 0 || calculating}
          size="lg"
          className="h-16 px-12 text-lg shadow-xl"
        >
          {calculating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
              最適配置を計算中...
            </>
          ) : (
            <>
              <PlayCircle className="w-6 h-6 mr-3" />
              最適配置を計算（{selectedCandidateIds.size}人）
            </>
          )}
        </Button>
      </div>

      {/* Step 2: 結果表示 */}
      {result && (
        <div className="space-y-8 animate-count-up">
          {/* 結果ヘッダー */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-8 h-8" />
              <h2 className="text-3xl font-bold">配置案が完成しました！</h2>
            </div>
            <p className="text-purple-100">
              {result.assignments.length}人の配置先と
              {result.transfers.length}件の玉突き異動を提案します
            </p>
          </div>

          {/* 組織全体への影響 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              組織全体への影響
            </h2>
            <OrganizationImpactView
              overallFitBefore={result.organization_impact.overall_fit_before}
              overallFitAfter={result.organization_impact.overall_fit_after}
              fitImprovement={result.organization_impact.fit_improvement}
              departmentsAffected={result.organization_impact.departments_affected}
              assignmentCount={result.assignments.length}
              transferCount={result.transfers.length}
            />
          </div>

          {/* 配置詳細 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              配置詳細
            </h2>
            <AssignmentResult
              assignments={result.assignments}
              transfers={result.transfers}
            />
          </div>

          {/* アクション */}
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setResult(null)}
            >
              条件を変更
            </Button>
            <Button size="lg">
              この配置案を保存
            </Button>
            <Button size="lg" variant="secondary">
              レポートをダウンロード
            </Button>
          </div>
        </div>
      )}

      {/* 初期表示時のヒント */}
      {!result && !calculating && (
        <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-700 text-lg mb-2">
              今月の採用候補を選択して、最適配置を計算してください
            </p>
            <p className="text-sm text-gray-600">
              AIが各候補者に最適なチームを提案し、玉突き異動も含めて組織全体を最適化します
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="p-4 bg-white rounded-lg">
                <p className="font-semibold text-sm text-gray-900 mb-1">✓ 貪欲法で最適配置</p>
                <p className="text-xs text-gray-600">各候補者を最もFitスコアが高いチームに配置</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="font-semibold text-sm text-gray-900 mb-1">✓ 玉突き異動の検討</p>
                <p className="text-xs text-gray-600">既存メンバーの異動で組織全体を最適化</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="font-semibold text-sm text-gray-900 mb-1">✓ 影響の可視化</p>
                <p className="text-xs text-gray-600">部署ごとのFitスコア変化を表示</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

