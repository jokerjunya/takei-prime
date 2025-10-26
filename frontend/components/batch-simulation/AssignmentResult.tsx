'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Repeat,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/lib/types'
import Link from 'next/link'
import type { Assignment, TransferProposal } from '@/lib/batch-assignment'

interface AssignmentResultProps {
  assignments: Assignment[]
  transfers: TransferProposal[]
}

export function AssignmentResult({ assignments, transfers }: AssignmentResultProps) {
  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => {
        const relatedTransfer = transfers.find(
          t => t.from_team.id === assignment.team.id
        )
        const scoreColor = getScoreColor(assignment.fit_score)
        const textColorClass = {
          'fit-excellent': 'text-green-700',
          'fit-good': 'text-blue-700',
          'fit-fair': 'text-amber-700',
          'fit-poor': 'text-red-700',
        }[scoreColor]

        return (
          <Card key={assignment.candidate.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {assignment.candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assignment.candidate.current_position}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-4">
              {/* 配置先 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">配置先</p>
                  <p className="font-bold text-blue-900">{assignment.team.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{assignment.team.department}</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-gray-400" />
                
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Fitスコア</p>
                  <div className={cn("text-3xl font-bold", textColorClass)}>
                    {assignment.fit_score.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* 配置理由 */}
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">配置理由</p>
                  <p className="text-sm text-green-800">{assignment.reason}</p>
                </div>
              </div>

              {/* 玉突き異動提案 */}
              {relatedTransfer && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-5 h-5 text-amber-700" />
                    <h4 className="font-bold text-amber-900">💡 玉突き異動提案</h4>
                    <Badge className="bg-amber-200 text-amber-900 border-amber-400">
                      組織Fit +{relatedTransfer.fit_improvement.toFixed(1)}pt
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 p-3 bg-white rounded border border-amber-200">
                      <p className="font-semibold text-gray-900">{relatedTransfer.employee.name}</p>
                      <p className="text-xs text-gray-600">{relatedTransfer.from_team.name}</p>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-amber-600" />
                    
                    <div className="flex-1 p-3 bg-white rounded border border-amber-200">
                      <p className="font-semibold text-gray-900">{relatedTransfer.to_team.name}</p>
                      <p className="text-xs text-gray-600">{relatedTransfer.to_team.department}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-amber-800 mt-3">
                    📝 {relatedTransfer.reason}
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2 pt-2">
                <Link 
                  href={`/calculator?candidate=${assignment.candidate.id}&team=${assignment.team.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    詳細分析
                  </Button>
                </Link>
                <Link 
                  href={`/simulation?candidate=${assignment.candidate.id}&team=${assignment.team.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    個別シミュレーション
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

