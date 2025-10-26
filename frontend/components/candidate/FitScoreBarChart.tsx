'use client'

import { cn } from '@/lib/utils'
import { getScoreColor, getScoreLabel } from '@/lib/types'
import type { Team } from '@/lib/types'

interface TeamScore {
  team: Team
  score: number
}

interface FitScoreBarChartProps {
  scores: TeamScore[]
  maxTeams?: number
  showLabels?: boolean
}

export function FitScoreBarChart({ 
  scores, 
  maxTeams = 5,
  showLabels = true 
}: FitScoreBarChartProps) {
  // スコア順にソート
  const sortedScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTeams)

  return (
    <div className="space-y-3">
      {sortedScores.map(({ team, score }, index) => {
        const colorClass = getScoreColor(score)
        
        // スコアに応じた背景色
        const bgColorClass = {
          'fit-excellent': 'bg-green-500',
          'fit-good': 'bg-blue-500',
          'fit-fair': 'bg-amber-500',
          'fit-poor': 'bg-red-500',
        }[colorClass]
        
        // スコアに応じたテキスト色
        const textColorClass = {
          'fit-excellent': 'text-green-700',
          'fit-good': 'text-blue-700',
          'fit-fair': 'text-amber-700',
          'fit-poor': 'text-red-700',
        }[colorClass]
        
        // ランキングバッジの色
        const rankBgColor = index === 0 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
          : 'bg-gray-100 text-gray-600 border-gray-300'

        return (
          <div key={team.id} className="group">
            <div className="flex items-center gap-3 mb-1.5">
              {/* ランキング */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
                rankBgColor
              )}>
                {index + 1}
              </div>
              
              {/* チーム名 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {team.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {team.department}
                </p>
              </div>
              
              {/* スコア数値 */}
              <div className="text-right">
                <p className={cn("text-lg font-bold", textColorClass)}>
                  {score.toFixed(1)}
                </p>
                {showLabels && (
                  <p className="text-xs text-gray-500">
                    {getScoreLabel(score)}
                  </p>
                )}
              </div>
            </div>
            
            {/* プログレスバー */}
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden group-hover:h-4 transition-all">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  bgColorClass
                )}
                style={{ width: `${score}%` }}
              >
                {/* グラデーション効果 */}
                <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20" />
              </div>
              
              {/* ホバー時のツールチップ */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-0.5 rounded">
                  {score.toFixed(1)}点
                </span>
              </div>
            </div>
          </div>
        )
      })}
      
      {scores.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Fitスコアを計算していません</p>
        </div>
      )}
    </div>
  )
}

// コンパクト版（1行表示）
export function FitScoreBarChartCompact({ scores, maxTeams = 8 }: FitScoreBarChartProps) {
  const sortedScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTeams)

  return (
    <div className="flex gap-1">
      {sortedScores.map(({ team, score }) => {
        const colorClass = getScoreColor(score)
        const bgColorClass = {
          'fit-excellent': 'bg-green-500',
          'fit-good': 'bg-blue-500',
          'fit-fair': 'bg-amber-500',
          'fit-poor': 'bg-red-500',
        }[colorClass]

        return (
          <div key={team.id} className="flex-1 group relative">
            <div className="h-10 bg-gray-200 rounded overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", bgColorClass)}
                style={{ height: `${score}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1 truncate text-gray-600 group-hover:text-gray-900">
              {team.name.slice(0, 6)}...
            </p>
            <p className="text-xs text-center font-bold text-gray-900">
              {score.toFixed(0)}
            </p>
            
            {/* ツールチップ */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                <p className="font-semibold">{team.name}</p>
                <p className="text-gray-300">Fitスコア: {score.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

