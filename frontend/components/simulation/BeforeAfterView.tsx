'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PersonalityProfile } from '@/lib/types'

interface BeforeAfterViewProps {
  before: {
    culture: PersonalityProfile
    balance_index: number
    member_count: number
  }
  after: {
    culture: PersonalityProfile
    balance_index: number
    member_count: number
  }
  diff: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
    balance_index: number
  }
}

export function BeforeAfterView({ before, after, diff }: BeforeAfterViewProps) {
  // レーダーチャート用データ
  const chartData = [
    {
      dimension: '開放性',
      before: before.culture.openness,
      after: after.culture.openness,
      fullMark: 100
    },
    {
      dimension: '誠実性',
      before: before.culture.conscientiousness,
      after: after.culture.conscientiousness,
      fullMark: 100
    },
    {
      dimension: '外向性',
      before: before.culture.extraversion,
      after: after.culture.extraversion,
      fullMark: 100
    },
    {
      dimension: '協調性',
      before: before.culture.agreeableness,
      after: after.culture.agreeableness,
      fullMark: 100
    },
    {
      dimension: '情緒安定性',
      before: 100 - before.culture.neuroticism,
      after: 100 - after.culture.neuroticism,
      fullMark: 100
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Before */}
      <Card className="border-2 border-gray-300">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            現在のチーム構成
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {before.member_count}人のメンバー
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Big Five数値 */}
          <div className="space-y-3 mb-6">
            <DimensionBar
              label="開放性"
              value={before.culture.openness}
              diff={0}
            />
            <DimensionBar
              label="誠実性"
              value={before.culture.conscientiousness}
              diff={0}
            />
            <DimensionBar
              label="外向性"
              value={before.culture.extraversion}
              diff={0}
            />
            <DimensionBar
              label="協調性"
              value={before.culture.agreeableness}
              diff={0}
            />
            <DimensionBar
              label="情緒安定性"
              value={100 - before.culture.neuroticism}
              diff={0}
            />
          </div>

          {/* バランス指数 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">バランス指数</span>
              <span className="text-2xl font-bold text-gray-900">
                {before.balance_index.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gray-500 transition-all duration-500"
                style={{ width: `${before.balance_index}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {before.balance_index >= 70 && '多様性とバランスが良好'}
              {before.balance_index >= 50 && before.balance_index < 70 && 'バランスは普通'}
              {before.balance_index < 50 && '偏りがある、または多様性不足'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* After */}
      <Card className="border-2 border-indigo-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            候補者追加後のシミュレーション
          </CardTitle>
          <p className="text-sm text-indigo-700 mt-1">
            {after.member_count}人のメンバー（+1人）
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Big Five数値（変化付き） */}
          <div className="space-y-3 mb-6">
            <DimensionBar
              label="開放性"
              value={after.culture.openness}
              diff={diff.openness}
            />
            <DimensionBar
              label="誠実性"
              value={after.culture.conscientiousness}
              diff={diff.conscientiousness}
            />
            <DimensionBar
              label="外向性"
              value={after.culture.extraversion}
              diff={diff.extraversion}
            />
            <DimensionBar
              label="協調性"
              value={after.culture.agreeableness}
              diff={diff.agreeableness}
            />
            <DimensionBar
              label="情緒安定性"
              value={100 - after.culture.neuroticism}
              diff={-diff.neuroticism}  // neuroticism は低い方が良いので符号反転
            />
          </div>

          {/* バランス指数（変化付き） */}
          <div className="pt-4 border-t border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-indigo-900">バランス指数</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">
                  {after.balance_index.toFixed(1)}
                </span>
                <DiffBadge diff={diff.balance_index} />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${after.balance_index}%` }}
              />
            </div>
            <p className="text-xs text-indigo-700 mt-2">
              {after.balance_index >= 70 && '多様性とバランスが良好'}
              {after.balance_index >= 50 && after.balance_index < 70 && 'バランスは普通'}
              {after.balance_index < 50 && '偏りがある、または多様性不足'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* レーダーチャート（比較） */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Big Five 変化の可視化</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#666', fontSize: 13 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              
              <Radar
                name="現在"
                dataKey="before"
                stroke="#6b7280"
                fill="#6b7280"
                fillOpacity={0.3}
              />
              
              <Radar
                name="追加後"
                dataKey="after"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
              />
              
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ========================================
// サブコンポーネント
// ========================================

interface DimensionBarProps {
  label: string
  value: number
  diff: number
}

function DimensionBar({ label, value, diff }: DimensionBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {value.toFixed(1)}
          </span>
          {diff !== 0 && <DiffBadge diff={diff} />}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-700",
            diff > 0 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
            diff < 0 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
            "bg-gray-400"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function DiffBadge({ diff }: { diff: number }) {
  if (Math.abs(diff) < 0.5) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
        <Minus className="w-3 h-3" />
        ±0
      </span>
    )
  }

  const isPositive = diff > 0

  return (
    <span className={cn(
      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold",
      isPositive 
        ? "bg-blue-100 text-blue-700" 
        : "bg-amber-100 text-amber-700"
    )}>
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? '+' : ''}{diff.toFixed(1)}
    </span>
  )
}

