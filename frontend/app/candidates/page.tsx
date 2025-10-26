'use client'

import { useEffect, useState } from 'react'
import { getCandidates, getTeams, getSkills } from '@/lib/data'
import { calculateFitScore } from '@/lib/calculator'
import { CandidateCard } from '@/components/candidate/CandidateCard'
import { CandidateFilters } from '@/components/candidate/CandidateFilters'
import { Button } from '@/components/ui/button'
import { Users, Plus, Download } from 'lucide-react'
import type { Candidate, Team, SkillMaster } from '@/lib/types'

interface CandidateWithScores {
  candidate: Candidate
  teamScores: Array<{ team: Team; score: number }>
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateWithScores[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithScores[]>([])
  const [skills, setSkills] = useState<SkillMaster[]>([])
  const [loading, setLoading] = useState(true)
  
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [minExperience, setMinExperience] = useState('all')
  const [remotePreference, setRemotePreference] = useState('all')

  useEffect(() => {
    async function loadData() {
      const [candidatesData, teamsData, skillsData] = await Promise.all([
        getCandidates(),
        getTeams(),
        getSkills()
      ])

      // 各候補者について全チームとのFitスコアを計算
      const candidatesWithScores: CandidateWithScores[] = []
      
      for (const candidate of candidatesData) {
        const teamScores = await Promise.all(
          teamsData.map(async (team) => ({
            team,
            score: (await calculateFitScore(candidate, team, 'stability')).total_score
          }))
        )
        
        candidatesWithScores.push({
          candidate,
          teamScores: teamScores.sort((a, b) => b.score - a.score)
        })
      }

      setCandidates(candidatesWithScores)
      setFilteredCandidates(candidatesWithScores)
      setSkills(skillsData)
      setLoading(false)
    }

    loadData()
  }, [])

  // フィルター適用
  useEffect(() => {
    let filtered = [...candidates]

    // 名前検索
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // スキルフィルター
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(c =>
        c.candidate.skills.some(s => s.skill_id === selectedSkill)
      )
    }

    // 経験年数フィルター
    if (minExperience !== 'all') {
      const minYears = parseInt(minExperience)
      filtered = filtered.filter(c => c.candidate.years_of_experience >= minYears)
    }

    // リモートワークフィルター
    if (remotePreference !== 'all') {
      filtered = filtered.filter(c =>
        c.candidate.work_style_preferences.remote_preference === remotePreference
      )
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, selectedSkill, minExperience, remotePreference, candidates])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedSkill('all')
    setMinExperience('all')
    setRemotePreference('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">候補者データを読み込んでいます...</p>
          <p className="text-sm text-gray-500 mt-2">全チームとのFitスコアを計算中</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            候補者一覧
          </h1>
          <p className="mt-2 text-gray-600">
            全{candidates.length}人の候補者とチームの適合性を確認できます
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            CSVエクスポート
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            候補者を追加
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <CandidateFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSkill={selectedSkill}
        onSkillChange={setSelectedSkill}
        minExperience={minExperience}
        onMinExperienceChange={setMinExperience}
        remotePreference={remotePreference}
        onRemotePreferenceChange={setRemotePreference}
        onClearFilters={handleClearFilters}
        skills={skills}
      />

      {/* 結果表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCandidates.length}人の候補者を表示中
          {filteredCandidates.length !== candidates.length && (
            <span className="text-indigo-600 font-semibold ml-2">
              （{candidates.length}人中）
            </span>
          )}
        </p>
      </div>

      {/* 候補者カード一覧 */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCandidates.map(({ candidate, teamScores }) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              teamScores={teamScores}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">条件に一致する候補者が見つかりませんでした</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleClearFilters}
          >
            フィルターをクリア
          </Button>
        </div>
      )}
    </div>
  )
}

