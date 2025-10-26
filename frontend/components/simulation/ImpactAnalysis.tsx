'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react'

interface ImpactAnalysisProps {
  strengths: string[]
  risks: string[]
  recommendations: string[]
  retentionEstimate: number
}

export function ImpactAnalysis({ 
  strengths, 
  risks, 
  recommendations,
  retentionEstimate 
}: ImpactAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* 定着率予測 */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            定着率予測
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-bold text-indigo-600">
              {retentionEstimate}%
            </div>
            <div className="text-sm text-indigo-700">
              {retentionEstimate >= 85 && '非常に高い定着が期待できます'}
              {retentionEstimate >= 70 && retentionEstimate < 85 && '良好な定着が期待できます'}
              {retentionEstimate >= 60 && retentionEstimate < 70 && '適切なサポートで定着可能'}
              {retentionEstimate < 60 && '慎重な配置判断が必要です'}
            </div>
          </div>
          <div className="mt-4 w-full bg-white rounded-full h-4 border border-indigo-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
              style={{ width: `${retentionEstimate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 影響分析（3列） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 強み */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              強み
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">特筆すべき強みは検出されませんでした</p>
            )}
          </CardContent>
        </Card>

        {/* リスク */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              リスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risks.length > 0 ? (
              <ul className="space-y-3">
                {risks.map((risk, index) => (
                  <li key={index} className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">重大なリスクは検出されませんでした</p>
            )}
          </CardContent>
        </Card>

        {/* 推奨アクション */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              推奨アクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

