'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Search, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/lib/types'

interface CandidateMultiSelectProps {
  candidates: Candidate[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export function CandidateMultiSelect({
  candidates,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll
}: CandidateMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.current_position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            今月の採用候補を選択
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              全て選択
            </Button>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              クリア
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          選択中: <strong className="text-indigo-600">{selectedIds.size}人</strong>
          {selectedIds.size >= 3 && selectedIds.size <= 5 && (
            <span className="text-green-600 ml-2">✓ 推奨人数</span>
          )}
          {selectedIds.size > 5 && (
            <span className="text-amber-600 ml-2">⚠ 5人以下を推奨</span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {/* 検索 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="候補者を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* 候補者リスト */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCandidates.map((candidate) => {
            const isSelected = selectedIds.has(candidate.id)

            return (
              <div
                key={candidate.id}
                onClick={() => onToggle(candidate.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                )}
              >
                {/* チェックボックス */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* アバター */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {candidate.name.charAt(0)}
                </div>

                {/* 候補者情報 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{candidate.current_position}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>経験 {candidate.years_of_experience}年</span>
                    <span>スキル {candidate.skills.length}個</span>
                  </div>
                </div>

                {/* リモートワークバッジ */}
                <Badge variant="outline" className="flex-shrink-0">
                  {candidate.work_style_preferences.remote_preference === 'full_remote' && 'リモート'}
                  {candidate.work_style_preferences.remote_preference === 'hybrid' && 'ハイブリッド'}
                  {candidate.work_style_preferences.remote_preference === 'onsite' && 'オンサイト'}
                </Badge>
              </div>
            )
          })}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>条件に一致する候補者が見つかりません</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

