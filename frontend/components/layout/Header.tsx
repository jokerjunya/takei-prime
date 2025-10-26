'use client'

import { Bell, Search, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* 組織情報 */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">テックイノベーション株式会社</h2>
          <p className="text-xs text-gray-500">43 Teams / 620 Employees</p>
        </div>
      </div>

      {/* 検索バー */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="候補者、チーム、スキルを検索..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </Button>

        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
          DU
        </div>
      </div>
    </header>
  )
}

