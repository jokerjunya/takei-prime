import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Users, Building2, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Takei-prime
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          「説明できるAI」で"人が辞めない組織設計"を実現する
        </p>
        <Link href="/fit-score/result">
          <Button size="lg" className="px-8">
            デモを見る
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <Calculator className="w-8 h-8 text-violet-600 mb-2" />
            <CardTitle>Fitスコア計算</CardTitle>
            <CardDescription>
              候補者とチームの相性を数値化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              スキル・性格・チーム文化を統合的に分析し、最適な配置を提案します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="w-8 h-8 text-cyan-600 mb-2" />
            <CardTitle>説明可能AI</CardTitle>
            <CardDescription>
              強み・リスク・対策を自動生成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              単なる数値ではなく、「なぜ」を説明。人事・マネージャーがそのまま使える言葉で提示。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>経営方針対応</CardTitle>
            <CardDescription>
              5つのPreferenceプリセット
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              離職最小化、若手育成、多様性推進など、状況に応じた最適化軸を選択可能。
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Fit = α × SkillMatch + β × Retention - γ × Friction
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">SkillMatch</h3>
            <p className="text-violet-100">
              スキル・経験の一致度<br />
              → 成果が出る配置
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Retention</h3>
            <p className="text-violet-100">
              チーム文化・上司との相性<br />
              → 長く働ける配置
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Friction</h3>
            <p className="text-violet-100">
              異動・引継ぎリスク<br />
              → リスクを対策付きで説明
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


