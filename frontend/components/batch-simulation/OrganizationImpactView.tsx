'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationImpactViewProps {
  overallFitBefore: number
  overallFitAfter: number
  fitImprovement: number
  departmentsAffected: Array<{
    department: string
    fit_before: number
    fit_after: number
  }>
  assignmentCount: number
  transferCount: number
}

export function OrganizationImpactView({
  overallFitBefore,
  overallFitAfter,
  fitImprovement,
  departmentsAffected,
  assignmentCount,
  transferCount
}: OrganizationImpactViewProps) {
  const isImprovement = fitImprovement > 0

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cn(
          "border-2",
          isImprovement ? "border-green-300 bg-green-50" : "border-gray-300"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">全社平均Fitスコア</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {overallFitBefore.toFixed(1)}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className={cn(
                "text-3xl font-bold",
                isImprovement ? "text-green-600" : "text-gray-900"
              )}>
                {overallFitAfter.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {isImprovement ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-semibold",
                isImprovement ? "text-green-700" : "text-red-700"
              )}>
                {fitImprovement > 0 ? '+' : ''}{fitImprovement.toFixed(1)}pt
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">配置数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">
              {assignmentCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">玉突き異動</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">
              {transferCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">件の提案</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">影響部署数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              {departmentsAffected.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">部署</p>
          </CardContent>
        </Card>
      </div>

      {/* 部署別影響 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            部署別への影響
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentsAffected.map((dept) => {
              const change = dept.fit_after - dept.fit_before

              return (
                <div key={dept.department} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{dept.department}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {dept.fit_before.toFixed(1)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {dept.fit_after.toFixed(1)}
                    </span>
                    
                    {change !== 0 && (
                      <span className={cn(
                        "text-sm font-semibold px-2 py-1 rounded",
                        change > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}

