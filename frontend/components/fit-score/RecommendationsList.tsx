'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Recommendation } from '@/lib/types'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            対策
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            特別な対策は不要です
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          対策
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-blue-900">
                    {rec.action}
                  </h4>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    rec.priority === 'high' && "bg-red-100 text-red-700",
                    rec.priority === 'medium' && "bg-amber-100 text-amber-700",
                    rec.priority === 'low' && "bg-gray-100 text-gray-700"
                  )}>
                    {rec.priority === 'high' && '優先度: 高'}
                    {rec.priority === 'medium' && '優先度: 中'}
                    {rec.priority === 'low' && '優先度: 低'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  期待効果: {rec.expected_impact}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


