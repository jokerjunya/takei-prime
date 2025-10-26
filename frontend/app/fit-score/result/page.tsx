'use client'

import { useEffect, useState } from 'react'
import { ScoreCard } from '@/components/fit-score/ScoreCard'
import { ScoreChart } from '@/components/fit-score/ScoreChart'
import { StrengthsList } from '@/components/fit-score/StrengthsList'
import { RisksList } from '@/components/fit-score/RisksList'
import { RecommendationsList } from '@/components/fit-score/RecommendationsList'
import { getCandidates, getTeams } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import type { FitScoreResult } from '@/lib/types'
import { ArrowLeft, Users, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FitScoreResultPage() {
  const [result, setResult] = useState<FitScoreResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDemo() {
      // デモ用: 候補者「鈴木 一郎」とチーム「AI/MLプロダクト開発チーム」で計算
      const candidates = await getCandidates()
      const teams = await getTeams()
      
      const candidate = candidates.find(c => c.id === 'cand_003') // 鈴木 一郎
      const team = teams.find(t => t.id === 'team_001') // AI/MLチーム
      
      if (candidate && team) {
        const fitScore = await calculateFitScore(candidate, team, 'stability')
        setResult(fitScore)
      }
      
      setLoading(false)
    }
    
    loadDemo()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">計算中...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">データを読み込めませんでした</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div>
        <Link href="/calculator">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            計算画面に戻る
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fitスコア計算結果
            </h1>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>候補者: <strong className="text-gray-900">{result.candidate.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>チーム: <strong className="text-gray-900">{result.team.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(result.calculated_at).toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 総合スコア */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <ScoreCard
            score={result.total_score}
            title="総合Fitスコア"
            description={`経営方針: ${result.preference_mode.toUpperCase()} | 信頼度: ${(result.confidence * 100).toFixed(0)}%`}
            showGrade={true}
          />
        </div>
        <ScoreCard
          score={result.breakdown.skill_match}
          title="SkillMatch"
          description="スキル・経験の一致度"
        />
        <ScoreCard
          score={result.breakdown.retention}
          title="Retention"
          description="チーム文化・上司との相性"
        />
      </div>

      {/* スコア詳細 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreChart breakdown={result.breakdown} />
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 rounded-lg border border-violet-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">スコア解釈</h3>
            {result.total_score >= 80 && (
              <p className="text-sm text-gray-700">
                ⭐️ <strong>非常に高い適合性</strong><br />
                この配置は成功確率が高く、候補者が即戦力として活躍し、長期的に定着する可能性が高いです。
              </p>
            )}
            {result.total_score >= 60 && result.total_score < 80 && (
              <p className="text-sm text-gray-700">
                ✅ <strong>良好な適合性</strong><br />
                一部リスクはあるものの、適切な対策により成功可能です。配置後のフォローが重要です。
              </p>
            )}
            {result.total_score >= 40 && result.total_score < 60 && (
              <p className="text-sm text-gray-700">
                ⚠️ <strong>中程度の適合性</strong><br />
                リスク軽減策の実施が重要です。配置前に十分な検討が必要です。
              </p>
            )}
            {result.total_score < 40 && (
              <p className="text-sm text-gray-700">
                ❌ <strong>低い適合性</strong><br />
                慎重な判断が必要です。他の候補者やチームとの組み合わせも検討してください。
              </p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">候補者プロファイル</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>職種:</strong> {result.candidate.current_position}</p>
              <p><strong>経験年数:</strong> {result.candidate.years_of_experience}年</p>
              <p><strong>保有スキル:</strong> {result.candidate.skills.length}個</p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">チーム情報</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>部署:</strong> {result.team.department}</p>
              <p><strong>チームサイズ:</strong> {result.team.size}人</p>
              <p><strong>平均稼働率:</strong> {result.team.workload_average}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 強み・リスク・対策 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StrengthsList strengths={result.strengths} />
        <RisksList risks={result.risks} />
        <RecommendationsList recommendations={result.recommendations} />
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center gap-4 pt-8 border-t">
        <Link href="/calculator">
          <Button size="lg">
            他の組み合わせで計算
          </Button>
        </Link>
        <Button size="lg" variant="outline">
          レポートをダウンロード
        </Button>
      </div>
    </div>
  )
}


