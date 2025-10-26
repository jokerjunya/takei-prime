'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeamCard } from '@/components/team/TeamCard'
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  TrendingUp,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Department } from '@/lib/organization'
import type { Team } from '@/lib/types'

interface DepartmentCardProps {
  department: Department
  teams: Team[]
  teamStats: Map<string, { avgFitScore: number; culture: string; strength: string; risk: string }>
  defaultExpanded?: boolean
}

export function DepartmentCard({ 
  department, 
  teams,
  teamStats,
  defaultExpanded = false 
}: DepartmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // 部署の平均Fitスコアを計算
  const departmentAvgFit = teams.length > 0
    ? teams.reduce((sum, team) => {
        const stats = teamStats.get(team.id)
        return sum + (stats?.avgFitScore || 0)
      }, 0) / teams.length
    : 0

  const getDepartmentIcon = () => {
    if (department.name.includes('営業')) return '💼'
    if (department.name.includes('開発')) return '💻'
    if (department.name.includes('マーケ')) return '📢'
    if (department.name.includes('デザイン')) return '🎨'
    if (department.name.includes('人事')) return '👥'
    if (department.name.includes('経営')) return '📊'
    if (department.name.includes('製造')) return '🏭'
    if (department.name.includes('財務') || department.name.includes('経理')) return '💰'
    if (department.name.includes('法務')) return '⚖️'
    if (department.name.includes('情報')) return '🖥️'
    if (department.name.includes('総務')) return '🏢'
    if (department.name.includes('カスタマー')) return '🤝'
    if (department.name.includes('物流')) return '📦'
    return '🏢'
  }

  return (
    <div className="space-y-3">
      {/* 部署ヘッダーカード */}
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-lg",
          isExpanded && "border-indigo-300 shadow-md"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* 展開/折りたたみアイコン */}
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-6 h-6 text-indigo-600" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* 部署アイコン */}
              <div className="text-4xl flex-shrink-0">
                {getDepartmentIcon()}
              </div>

              {/* 部署情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {department.name}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-semibold",
                    department.type === 'division' 
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {department.type === 'division' ? '本部' : '部'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{department.employee_count}人</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>{teams.length}チーム</span>
                  </div>
                </div>
              </div>

              {/* 部署平均Fitスコア */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">平均Fit</span>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {departmentAvgFit.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  / 100
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* 展開ヒント */}
        {!isExpanded && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ChevronRight className="w-4 h-4" />
              <span>クリックして{teams.length}チームを表示</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* チーム一覧（展開時のみ） */}
      {isExpanded && (
        <div className="ml-12 space-y-4 animate-accordion-down">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <div className="h-8 w-0.5 bg-indigo-300" />
            <span className="font-medium">{teams.length}チーム</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team) => {
              const stats = teamStats.get(team.id)
              if (!stats) return null

              return (
                <div key={team.id} className="relative">
                  {/* 接続線 */}
                  <div className="absolute -left-12 top-1/2 w-12 h-0.5 bg-indigo-200" />
                  
                  <TeamCard
                    id={team.id}
                    name={team.name}
                    department={team.department}
                    type="成果重視型"
                    avgFitScore={stats.avgFitScore}
                    memberCount={team.size}
                    culture={stats.culture}
                    strength={stats.strength}
                    risk={stats.risk}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

