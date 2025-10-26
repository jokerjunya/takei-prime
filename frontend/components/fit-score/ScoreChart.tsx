'use client'

import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FitScoreBreakdown } from '@/lib/types'

interface ScoreChartProps {
  breakdown: FitScoreBreakdown
}

export function ScoreChart({ breakdown }: ScoreChartProps) {
  const data = [
    {
      dimension: 'SkillMatch',
      value: breakdown.skill_match,
      fullMark: 100,
    },
    {
      dimension: 'Retention',
      value: breakdown.retention,
      fullMark: 100,
    },
    {
      dimension: 'Friction',
      value: 100 - breakdown.friction, // 低い方が良いので反転
      fullMark: 100,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>スコア内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="スコア"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 space-y-3">
          <ScoreBreakdownItem
            label="SkillMatch"
            value={breakdown.skill_match}
            color="bg-skill-match"
            description="スキル・経験の一致度"
          />
          <ScoreBreakdownItem
            label="Retention"
            value={breakdown.retention}
            color="bg-retention"
            description="チーム文化・上司との相性"
          />
          <ScoreBreakdownItem
            label="Friction"
            value={breakdown.friction}
            color="bg-friction"
            description="異動・引継ぎリスク（低い方が良い）"
            inverted
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface ScoreBreakdownItemProps {
  label: string
  value: number
  color: string
  description: string
  inverted?: boolean
}

function ScoreBreakdownItem({ label, value, color, description, inverted }: ScoreBreakdownItemProps) {
  const displayValue = inverted ? 100 - value : value
  const percentage = value
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}


