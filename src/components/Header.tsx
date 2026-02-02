import React from 'react'
import { LayoutDashboard, Building2, Users } from 'lucide-react'

interface HeaderProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
}

const TABS = [
  { id: 'all', label: '전체 현황', shortLabel: '전체', icon: LayoutDashboard },
  { id: '1', label: '1관', shortLabel: '1', icon: Building2 },
  { id: '2', label: '2관', shortLabel: '2', icon: Building2 },
  { id: '3', label: '3관', shortLabel: '3', icon: Building2 },
  { id: '4', label: '4관', shortLabel: '4', icon: Building2 },
  { id: 'manage', label: '데이터 관리', shortLabel: '관리', icon: Users },
] as const

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">기숙사 입사 관리 시스템</h1>
          </div>
          <nav className="flex space-x-1 sm:space-x-4">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = currentTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
