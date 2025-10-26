'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Strength } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

interface StrengthsListProps {
  strengths: Strength[]
}

export function StrengthsList({ strengths }: StrengthsListProps) {
  if (strengths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            強み
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            特筆すべき強みは検出されませんでした
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          強み
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {strengths.map((strength, index) => (
            <li key={index} className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900">
                  {strength.aspect}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {strength.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


