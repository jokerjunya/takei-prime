'use client'

import { DepartmentCard } from './DepartmentCard'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import type { Department } from '@/lib/organization'
import type { Team } from '@/lib/types'

interface OrganizationTreeViewProps {
  departments: Array<{
    department: Department
    teams: Team[]
  }>
  teamStats: Map<string, { avgFitScore: number; culture: string; strength: string; risk: string }>
}

export function OrganizationTreeView({ 
  departments,
  teamStats 
}: OrganizationTreeViewProps) {
  const [expandAll, setExpandAll] = useState(false)

  return (
    <div className="space-y-6">
      {/* コントロール */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">組織構成</h2>
          <p className="text-sm text-gray-600 mt-1">
            {departments.length}部署、
            {departments.reduce((sum, d) => sum + d.teams.length, 0)}チーム
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandAll(!expandAll)}
        >
          {expandAll ? (
            <>
              <Minimize2 className="w-4 h-4 mr-2" />
              全て折りたたむ
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-2" />
              全て展開
            </>
          )}
        </Button>
      </div>

      {/* 組織ツリー */}
      <div className="space-y-6">
        {departments.map(({ department, teams }) => (
          <DepartmentCard
            key={department.id}
            department={department}
            teams={teams}
            teamStats={teamStats}
            defaultExpanded={expandAll}
          />
        ))}
      </div>
    </div>
  )
}

