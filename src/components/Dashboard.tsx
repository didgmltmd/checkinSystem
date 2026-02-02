import React, { useMemo } from 'react'
import {
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react'
import type { Student } from '../types/student'

interface DashboardProps {
  students: Student[]
}

const BUILDINGS = [1, 2, 3, 4] as const

const BUILDING_FLOORS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [1, 2, 3, 4],
  3: [2, 3, 4],
  4: [1, 2, 3, 4, 5],
}

export const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const totals = useMemo(() => {
    const total = students.length
    const checkedIn = students.filter((s) => s.isCheckedIn).length
    const tbCertDone = students.filter((s) => s.hasTBCert).length
    const keyFeeDone = students.filter((s) => s.paidKeyFee).length
    return { total, checkedIn, pending: total - checkedIn, tbCertDone, keyFeeDone }
  }, [students])

  const buildingStats = useMemo(() => {
    return BUILDINGS.map((buildingId) => {
      const bStudents = students.filter((s) => s.building === buildingId)
      const floors = (BUILDING_FLOORS[buildingId] ?? []).map((floor) => {
        const fStudents = bStudents.filter((s) => s.room.startsWith(floor.toString()))
        return {
          floor,
          total: fStudents.length,
          checkedIn: fStudents.filter((s) => s.isCheckedIn).length,
        }
      })
      return {
        name: `${buildingId}관`,
        total: bStudents.length,
        checkedIn: bStudents.filter((s) => s.isCheckedIn).length,
        tbCert: bStudents.filter((s) => s.hasTBCert).length,
        keyFee: bStudents.filter((s) => s.paidKeyFee).length,
        floors,
      }
    })
  }, [students])

  const recentCheckedIn = useMemo(() => {
    return students
      .filter((s) => s.isCheckedIn)
      .sort((a, b) => {
        if (a.building !== b.building) return a.building - b.building
        if (a.room !== b.room) return a.room.localeCompare(b.room)
        return a.bed - b.bed
      })
      .slice(0, 8)
  }, [students])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">전체 인원</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{totals.total}명</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">입사 완료</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{totals.checkedIn}명</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">미입사</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{totals.pending}명</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">서류/비용 완료</span>
            <div className="flex gap-1">
              <FileText className="w-4 h-4 text-orange-500" />
              <CreditCard className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600">
            진단서: {totals.tbCertDone}명 / 캡스키: {totals.keyFeeDone}명
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">관별 현황 요약</h3>
          <div className="space-y-4">
            {buildingStats.map((stat) => (
              <div key={stat.name} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{stat.name}</span>
                  <span>
                    {stat.checkedIn} / {stat.total} 입사
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.checkedIn / (stat.total || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>결핵진단서: {stat.tbCert}건</span>
                  <span>캡스키비용: {stat.keyFee}건</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">최근 입사 현황 정보</h3>
          {recentCheckedIn.length === 0 ? (
            <div className="text-sm text-gray-500 flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-lg">
              <LayoutDashboard className="w-12 h-12 mb-2 text-gray-300" />
              <p>입사 완료된 사생이 아직 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCheckedIn.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                >
                  <div className="font-bold text-gray-700">
                    {student.building}관 {student.room}호 · {student.bed}번
                  </div>
                  <div className="font-black text-gray-900">{student.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
