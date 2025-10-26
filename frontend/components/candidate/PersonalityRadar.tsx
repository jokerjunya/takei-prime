'use client'

import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PersonalityProfile } from '@/lib/types'

interface PersonalityRadarProps {
  candidateProfile: PersonalityProfile
  teamProfile?: PersonalityProfile
  showComparison?: boolean
}

export function PersonalityRadar({ 
  candidateProfile, 
  teamProfile,
  showComparison = false 
}: PersonalityRadarProps) {
  const data = [
    {
      dimension: '開放性\n(Openness)',
      candidate: candidateProfile.openness,
      team: teamProfile?.openness || 0,
      fullMark: 100,
    },
    {
      dimension: '誠実性\n(Conscientiousness)',
      candidate: candidateProfile.conscientiousness,
      team: teamProfile?.conscientiousness || 0,
      fullMark: 100,
    },
    {
      dimension: '外向性\n(Extraversion)',
      candidate: candidateProfile.extraversion,
      team: teamProfile?.extraversion || 0,
      fullMark: 100,
    },
    {
      dimension: '協調性\n(Agreeableness)',
      candidate: candidateProfile.agreeableness,
      team: teamProfile?.agreeableness || 0,
      fullMark: 100,
    },
    {
      dimension: '神経症傾向\n(Neuroticism)',
      candidate: 100 - candidateProfile.neuroticism, // 低い方が良いので反転
      team: teamProfile ? 100 - teamProfile.neuroticism : 0,
      fullMark: 100,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>性格プロファイル（Big Five）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            
            <Radar
              name="候補者"
              dataKey="candidate"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
            
            {showComparison && teamProfile && (
              <Radar
                name="チーム平均"
                dataKey="team"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.3}
              />
            )}
            
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* 性格特性の説明 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonalityDimension
            name="開放性"
            value={candidateProfile.openness}
            description="新しいアイデアや経験への開放性"
          />
          <PersonalityDimension
            name="誠実性"
            value={candidateProfile.conscientiousness}
            description="責任感、計画性、自己統制"
          />
          <PersonalityDimension
            name="外向性"
            value={candidateProfile.extraversion}
            description="社交性、活発性、積極性"
          />
          <PersonalityDimension
            name="協調性"
            value={candidateProfile.agreeableness}
            description="協力的、思いやり、信頼性"
          />
          <PersonalityDimension
            name="情緒安定性"
            value={100 - candidateProfile.neuroticism}
            description="感情の安定性、ストレス耐性"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function PersonalityDimension({ 
  name, 
  value, 
  description 
}: { 
  name: string
  value: number
  description: string 
}) {
  const getLevel = (val: number) => {
    if (val >= 75) return { label: '高い', color: 'text-green-700', bgColor: 'bg-green-100' }
    if (val >= 50) return { label: '中程度', color: 'text-blue-700', bgColor: 'bg-blue-100' }
    return { label: '低い', color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }

  const level = getLevel(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{name}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${level.bgColor} ${level.color} font-medium`}>
          {level.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

