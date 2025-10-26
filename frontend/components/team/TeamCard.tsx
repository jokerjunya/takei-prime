'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/lib/types'

interface TeamCardProps {
  id: string
  name: string
  department: string
  type: string
  avgFitScore: number
  memberCount: number
  culture: string
  strength: string
  risk: string
}

export function TeamCard({
  id,
  name,
  department,
  type,
  avgFitScore,
  memberCount,
  culture,
  strength,
  risk
}: TeamCardProps) {
  const scoreColor = getScoreColor(avgFitScore)
  
  const scoreColorClass = {
    'fit-excellent': 'text-green-600 bg-green-50 border-green-200',
    'fit-good': 'text-blue-600 bg-blue-50 border-blue-200',
    'fit-fair': 'text-amber-600 bg-amber-50 border-amber-200',
    'fit-poor': 'text-red-600 bg-red-50 border-red-200',
  }[scoreColor]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{department}</p>
          </div>
          <Badge variant="outline" className="ml-2">
            {type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 平均Fitスコア */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          scoreColorClass
        )}>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">平均Fitスコア</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">{avgFitScore}</span>
                <span className="text-sm opacity-60">/100</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 opacity-30" />
          </div>
        </div>

        {/* メンバー数 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{memberCount}人のメンバー</span>
        </div>

        {/* 文化・強み・リスク */}
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-16">文化:</span>
            <span className="text-gray-600">{culture}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-16">強み:</span>
            <span className="text-green-700">{strength}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-16">リスク:</span>
            <div className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="w-3 h-3" />
              <span>{risk}</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <Link href={`/teams/${id}`}>
          <Button variant="outline" className="w-full" size="sm">
            詳細を見る
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

