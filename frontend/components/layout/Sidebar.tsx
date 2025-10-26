'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Building2, 
  Target, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'ホーム', href: '/dashboard', icon: Home },
  { name: '候補者', href: '/candidates', icon: Users },
  { name: 'チーム', href: '/teams', icon: Building2 },
  { name: '配置シミュレーション', href: '/simulation', icon: Target },
  { name: '一括配置', href: '/batch-simulation', icon: Users },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
  { name: '設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col bg-gradient-to-b from-indigo-900 to-indigo-950 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* ロゴ */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-800">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">Takei-prime</h1>
            <p className="text-xs text-indigo-300">AI配置レコメンド</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-indigo-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* ユーザープロファイル */}
      <div className="p-4 border-t border-indigo-800">
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-semibold">
            DU
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Demo User</p>
              <p className="text-xs text-indigo-300 truncate">demo@company.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

