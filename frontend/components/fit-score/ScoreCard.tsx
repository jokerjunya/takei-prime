'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getScoreColor, getScoreGrade, getScoreLabel } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScoreCardProps {
  score: number
  title: string
  description?: string
  showGrade?: boolean
  className?: string
}

export function ScoreCard({ 
  score, 
  title, 
  description, 
  showGrade = false,
  className 
}: ScoreCardProps) {
  const colorClass = getScoreColor(score)
  const label = getScoreLabel(score)
  const grade = getScoreGrade(score)
  
  // スコアに応じた背景色
  const bgColorClass = {
    'fit-excellent': 'bg-green-50 border-green-200',
    'fit-good': 'bg-blue-50 border-blue-200',
    'fit-fair': 'bg-amber-50 border-amber-200',
    'fit-poor': 'bg-red-50 border-red-200',
  }[colorClass]
  
  // スコアに応じたテキスト色
  const textColorClass = {
    'fit-excellent': 'text-green-600',
    'fit-good': 'text-blue-600',
    'fit-fair': 'text-amber-600',
    'fit-poor': 'text-red-600',
  }[colorClass]

  return (
    <Card className={cn(bgColorClass, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className={cn("text-5xl font-bold tracking-tight animate-count-up", textColorClass)}>
              {score.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">/ 100</p>
          </div>
          {showGrade && (
            <div className={cn("text-4xl font-bold opacity-20", textColorClass)}>
              {grade}
            </div>
          )}
        </div>
        <p className={cn("text-sm font-medium mt-3", textColorClass)}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


