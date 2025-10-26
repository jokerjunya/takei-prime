'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'
import type { SkillMaster } from '@/lib/types'

interface CandidateFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedSkill: string
  onSkillChange: (value: string) => void
  minExperience: string
  onMinExperienceChange: (value: string) => void
  remotePreference: string
  onRemotePreferenceChange: (value: string) => void
  onClearFilters: () => void
  skills: SkillMaster[]
}

export function CandidateFilters({
  searchQuery,
  onSearchChange,
  selectedSkill,
  onSkillChange,
  minExperience,
  onMinExperienceChange,
  remotePreference,
  onRemotePreferenceChange,
  onClearFilters,
  skills
}: CandidateFiltersProps) {
  const hasFilters = searchQuery || selectedSkill !== 'all' || minExperience !== 'all' || remotePreference !== 'all'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">フィルター</h3>
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="w-4 h-4 mr-1" />
              クリア
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="名前で検索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* スキルフィルター */}
          <Select value={selectedSkill} onValueChange={onSkillChange}>
            <SelectTrigger>
              <SelectValue placeholder="スキルで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのスキル</SelectItem>
              {skills.slice(0, 15).map((skill) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 経験年数フィルター */}
          <Select value={minExperience} onValueChange={onMinExperienceChange}>
            <SelectTrigger>
              <SelectValue placeholder="経験年数" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="3">3年以上</SelectItem>
              <SelectItem value="5">5年以上</SelectItem>
              <SelectItem value="7">7年以上</SelectItem>
              <SelectItem value="10">10年以上</SelectItem>
            </SelectContent>
          </Select>

          {/* リモートワーク */}
          <Select value={remotePreference} onValueChange={onRemotePreferenceChange}>
            <SelectTrigger>
              <SelectValue placeholder="働き方" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="full_remote">フルリモート</SelectItem>
              <SelectItem value="hybrid">ハイブリッド</SelectItem>
              <SelectItem value="onsite">オンサイト</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

