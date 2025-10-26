'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTeam, getCandidates } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreChart } from '@/components/fit-score/ScoreChart'
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Wifi, 
  TrendingUp,
  Target,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import type { Team, Candidate, FitScoreResult } from '@/lib/types'

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string
  
  const [team, setTeam] = useState<Team | null>(null)
  const [recommendations, setRecommendations] = useState<Array<{
    candidate: Candidate
    fitScore: FitScoreResult
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [teamData, candidatesData] = await Promise.all([
        getTeam(teamId),
        getCandidates()
      ])

      if (!teamData) {
        setLoading(false)
        return
      }

      // 全候補者とのFitスコアを計算
      const fitScores = await Promise.all(
        candidatesData.map(async (candidate) => ({
          candidate,
          fitScore: await calculateFitScore(candidate, teamData, 'stability')
        }))
      )

      // スコア順にソート（上位5人）
      const topRecommendations = fitScores
        .sort((a, b) => b.fitScore.total_score - a.fitScore.total_score)
        .slice(0, 5)

      setTeam(teamData)
      setRecommendations(topRecommendations)
      setLoading(false)
    }

    loadData()
  }, [teamId])

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

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">チームが見つかりませんでした</p>
        <Link href="/dashboard">
          <Button className="mt-4">ホームに戻る</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="text-base">
                {team.department}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{team.size}人</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{team.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wifi className="w-4 h-4" />
                <span>
                  {team.remote_policy === 'full_remote' && 'フルリモート'}
                  {team.remote_policy === 'hybrid' && 'ハイブリッド'}
                  {team.remote_policy === 'onsite' && 'オンサイト'}
                </span>
              </div>
            </div>
            <p className="mt-4 text-gray-600">{team.description}</p>
          </div>
        </div>
      </div>

      {/* 統計・文化プロファイル */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* チーム統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              チーム統計
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">メンバー数</p>
              <p className="text-2xl font-bold text-gray-900">{team.size}人</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">平均稼働率</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{team.workload_average}%</p>
                {team.workload_average > 80 && (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">リモートポリシー</p>
              <p className="text-lg font-semibold text-gray-900">
                {team.remote_policy === 'full_remote' && 'フルリモート'}
                {team.remote_policy === 'hybrid' && 'ハイブリッド'}
                {team.remote_policy === 'onsite' && 'オンサイト'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 文化プロファイル */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              チーム文化プロファイル
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreChart 
              breakdown={{
                skill_match: team.culture_profile.openness,
                retention: team.culture_profile.conscientiousness,
                friction: 100 - team.culture_profile.extraversion
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* 現在の課題 */}
      {team.current_challenges && team.current_challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              現在の課題
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {team.current_challenges.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* おすすめ候補者 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            おすすめ候補者（トップ5）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map(({ candidate, fitScore }, index) => (
              <div 
                key={candidate.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.current_position}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      経験: {candidate.years_of_experience}年 | スキル: {candidate.skills.length}個
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">
                    {fitScore.total_score.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500">Fitスコア</p>
                  <Link href={`/calculator?candidate=${candidate.id}&team=${team.id}`}>
                    <Button size="sm" variant="outline" className="mt-2">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 必要スキル */}
      <Card>
        <CardHeader>
          <CardTitle>必要スキル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {team.requirements.map((req) => (
              <Badge 
                key={req.skill_id}
                variant={req.is_mandatory ? 'default' : 'outline'}
                className="text-sm"
              >
                {req.skill_id} 
                {req.is_mandatory && ' (必須)'}
                {' '}Lv{req.required_level}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

