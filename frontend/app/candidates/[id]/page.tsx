'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getCandidate, getTeams, getSkills, getSkill } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PersonalityRadar } from '@/components/candidate/PersonalityRadar'
import { FitScoreBarChart } from '@/components/candidate/FitScoreBarChart'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase,
  Calendar,
  MapPin,
  TrendingUp,
  Target
} from 'lucide-react'
import Link from 'next/link'
import type { Candidate, Team } from '@/lib/types'

export default function CandidateDetailPage() {
  const params = useParams()
  const candidateId = params.id as string
  
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [teamScores, setTeamScores] = useState<Array<{ team: Team; score: number }>>([])
  const [skillNames, setSkillNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [candidateData, teamsData] = await Promise.all([
        getCandidate(candidateId),
        getTeams()
      ])

      if (!candidateData) {
        setLoading(false)
        return
      }

      // 全チームとのFitスコアを計算
      const scores = await Promise.all(
        teamsData.map(async (team) => ({
          team,
          score: (await calculateFitScore(candidateData, team, 'stability')).total_score
        }))
      )

      // スキル名を取得
      const names: Record<string, string> = {}
      for (const skill of candidateData.skills) {
        const skillData = await getSkill(skill.skill_id)
        if (skillData) {
          names[skill.skill_id] = skillData.name
        }
      }

      setCandidate(candidateData)
      setTeamScores(scores.sort((a, b) => b.score - a.score))
      setSkillNames(names)
      setLoading(false)
    }

    loadData()
  }, [candidateId])

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

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">候補者が見つかりませんでした</p>
        <Link href="/candidates">
          <Button className="mt-4">候補者一覧に戻る</Button>
        </Link>
      </div>
    )
  }

  const topTeam = teamScores[0]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div>
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            候補者一覧に戻る
          </Button>
        </Link>
        
        <div className="flex items-start gap-6">
          {/* アバター */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
            {candidate.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-xl text-gray-600 mt-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {candidate.current_position}
            </p>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>経験 {candidate.years_of_experience}年</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>スキル {candidate.skills.length}個</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{candidate.education.university}</span>
              </div>
            </div>
          </div>

          {/* 最高適合スコア */}
          {topTeam && (
            <div className="text-right bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
              <p className="text-sm text-indigo-700 font-medium mb-1">最高適合チーム</p>
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {topTeam.score.toFixed(0)}
              </div>
              <p className="text-sm text-indigo-900 font-medium">
                {topTeam.team.name}
              </p>
              <Link href={`/calculator?candidate=${candidate.id}&team=${topTeam.team.id}`}>
                <Button size="sm" className="mt-3 w-full">
                  <Target className="w-4 h-4 mr-2" />
                  詳細分析
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">連絡先</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{candidate.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">学歴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">学位: </span>
              <strong className="text-gray-900">{candidate.education.degree}</strong>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">専攻: </span>
              <strong className="text-gray-900">{candidate.education.major}</strong>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">大学: </span>
              <strong className="text-gray-900">{candidate.education.university}</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ワークスタイル</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {candidate.work_style_preferences.remote_preference === 'full_remote' && 'フルリモート希望'}
                {candidate.work_style_preferences.remote_preference === 'hybrid' && 'ハイブリッド希望'}
                {candidate.work_style_preferences.remote_preference === 'onsite' && 'オンサイト希望'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              コミュニケーション: {
                candidate.work_style_preferences.communication_style === 'written_preferred' ? '文書優先' :
                candidate.work_style_preferences.communication_style === 'verbal_preferred' ? '口頭優先' :
                candidate.work_style_preferences.communication_style === 'visual_preferred' ? 'ビジュアル優先' : 'バランス型'
              }
            </p>
            <p className="text-xs text-gray-600">
              業務ペース: {candidate.work_style_preferences.work_pace === 'steady' ? '安定型' : '集中型'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 性格プロファイル */}
      <PersonalityRadar candidateProfile={candidate.personality_profile} />

      {/* スキル一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>保有スキル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidate.skills.map((skill) => (
              <div 
                key={skill.skill_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {skillNames[skill.skill_id] || skill.skill_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    経験 {skill.years_of_experience}年
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-6 rounded-sm ${
                        level <= skill.proficiency_level
                          ? 'bg-indigo-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* おすすめチーム（Fitスコア棒グラフ） */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              おすすめチーム（トップ10）
            </CardTitle>
            <p className="text-sm text-gray-500">
              全{teamScores.length}チーム中
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <FitScoreBarChart scores={teamScores} maxTeams={10} />
          
          {/* トップチームへのクイックアクション */}
          {topTeam && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <p className="text-sm font-medium mb-2">💡 AIレコメンド</p>
              <p className="text-base mb-3">
                <strong>{topTeam.team.name}</strong>が最も適合しています（{topTeam.score.toFixed(1)}点）
              </p>
              <div className="flex gap-2">
                <Link href={`/teams/${topTeam.team.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full" size="sm">
                    チーム詳細
                  </Button>
                </Link>
                <Link 
                  href={`/calculator?candidate=${candidate.id}&team=${topTeam.team.id}`}
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full" size="sm">
                    詳細分析
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

