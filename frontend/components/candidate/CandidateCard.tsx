'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FitScoreBarChart } from './FitScoreBarChart'
import { 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  ArrowRight,
  Target,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import type { Candidate, Team } from '@/lib/types'

interface CandidateCardProps {
  candidate: Candidate
  teamScores: Array<{ team: Team; score: number }>
  showFullDetails?: boolean
}

export function CandidateCard({ 
  candidate, 
  teamScores,
  showFullDetails = false 
}: CandidateCardProps) {
  // トップチームを取得
  const topTeam = teamScores.length > 0 
    ? teamScores.reduce((max, current) => current.score > max.score ? current : max)
    : null

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:border-indigo-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {/* アバター */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {candidate.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {candidate.current_position}
                  </p>
                </div>
              </div>
            </div>
            
            {/* トップスコアバッジ */}
            {topTeam && (
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-gray-500">最高適合</span>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {topTeam.score.toFixed(0)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {topTeam.team.name}
                </p>
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                経験 <strong className="text-gray-900">{candidate.years_of_experience}年</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                スキル <strong className="text-gray-900">{candidate.skills.length}個</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 truncate">
                {candidate.education.university}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {candidate.work_style_preferences.remote_preference === 'full_remote' && 'フルリモート'}
                {candidate.work_style_preferences.remote_preference === 'hybrid' && 'ハイブリッド'}
                {candidate.work_style_preferences.remote_preference === 'onsite' && 'オンサイト'}
              </Badge>
            </div>
          </div>

          {/* Fitスコア棒グラフ */}
          {teamScores.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Fitスコア（チーム別トップ5）
                </h4>
              </div>
              <FitScoreBarChart scores={teamScores} maxTeams={5} />
            </div>
          )}

          {/* AIインサイト */}
          {topTeam && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900">
                💡 <strong>{topTeam.team.name}</strong>で高い適合性。
                {topTeam.score >= 80 && '即戦力として活躍が期待できます。'}
                {topTeam.score >= 60 && topTeam.score < 80 && '良好な配置候補です。'}
                {topTeam.score < 60 && 'サポート体制を整えることで成功可能です。'}
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 pt-2">
            <Link href={`/candidates/${candidate.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                詳細プロフィール
              </Button>
            </Link>
            {topTeam && (
              <Link 
                href={`/calculator?candidate=${candidate.id}&team=${topTeam.team.id}`}
                className="flex-1"
              >
                <Button className="w-full" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  詳細分析
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* 連絡先（オプション） */}
          {showFullDetails && (
            <div className="pt-3 border-t border-gray-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

