'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Risk } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface RisksListProps {
  risks: Risk[]
}

export function RisksList({ risks }: RisksListProps) {
  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            リスク
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            重大なリスクは検出されませんでした
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          リスク
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {risks.map((risk, index) => (
            <li key={index} className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900">
                  {risk.aspect}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {risk.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


