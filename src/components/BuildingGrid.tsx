import React, { useMemo, useState } from 'react'
import type { Student } from '../types/student'
import { StudentModal } from './StudentModal'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

interface BuildingGridProps {
  buildingId: number
  students: Student[]
  onUpdateStatus: (id: string, field: keyof Student, value: boolean) => void
}

type Floor = 1 | 2 | 3 | 4 | 5

const BUILDING_FLOORS: Record<number, Floor[]> = {
  1: [1, 2, 3],
  2: [1, 2, 3, 4],
  3: [2, 3, 4],
  4: [1, 2, 3, 4, 5],
}

const ROOM_RULES: Record<
  number,
  Record<Floor, { start: number; count: number; exclude?: Set<string> }>
> = {
  1: {
    1: { start: 101, count: 13 },
    2: { start: 201, count: 17 },
    3: { start: 301, count: 17 },
  },
  2: {
    1: { start: 101, count: 21, exclude: new Set(['115']) },
    2: { start: 201, count: 22, exclude: new Set(['205', '215']) },
    3: { start: 301, count: 22, exclude: new Set(['305', '315']) },
    4: { start: 401, count: 14, exclude: new Set(['405']) },
  },
  3: {
    2: { start: 201, count: 22 },
    3: { start: 301, count: 24 },
    4: { start: 401, count: 24 },
  },
  4: {
    1: { start: 101, count: 15 },
    2: { start: 201, count: 15 },
    3: { start: 301, count: 15 },
    4: { start: 401, count: 15 },
    5: { start: 501, count: 15 },
  },
}

const getRoomNumbers = (buildingId: number, floor: Floor) => {
  const rule = ROOM_RULES[buildingId]?.[floor]
  if (!rule) return []
  const { start, count, exclude } = rule
  return Array.from({ length: count }, (_, i) => (start + i).toString()).filter(
    (room) => !exclude?.has(room),
  )
}

const chunk = <T,>(items: T[], size: number) => {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

export const BuildingGrid: React.FC<BuildingGridProps> = ({
  buildingId,
  students,
  onUpdateStatus,
}) => {
  const [floorGoals, setFloorGoals] = useState<Record<string, string>>({})
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleGoalChange = (floor: Floor, value: string) => {
    setFloorGoals((prev) => ({ ...prev, [`${buildingId}-${floor}`]: value }))
  }

  const bStudents = useMemo(
    () => students.filter((s) => s.building === buildingId),
    [students, buildingId],
  )

  const floors = BUILDING_FLOORS[buildingId] ?? []

  const checkedInCount = useMemo(
    () => bStudents.filter((s) => s.isCheckedIn).length,
    [bStudents],
  )

  const statsByFloor = useMemo(() => {
    const map = new Map<Floor, { total: number; checkedIn: number; tbCert: number; keyFee: number }>()
    floors.forEach((floor) => {
      const floorStudents = bStudents.filter((s) => s.room.startsWith(floor.toString()))
      map.set(floor, {
        total: floorStudents.length,
        checkedIn: floorStudents.filter((s) => s.isCheckedIn).length,
        tbCert: floorStudents.filter((s) => s.hasTBCert).length,
        keyFee: floorStudents.filter((s) => s.paidKeyFee).length,
      })
    })
    return map
  }, [bStudents, floors])

  const studentsByFloor = useMemo(() => {
    const map = new Map<Floor, Student[]>()
    floors.forEach((floor) => {
      map.set(
        floor,
        bStudents.filter((s) => s.room.startsWith(floor.toString())),
      )
    })
    return map
  }, [bStudents, floors])

  const studentBySlot = useMemo(() => {
    const map = new Map<string, Student>()
    bStudents.forEach((student) => {
      map.set(`${student.room}-${student.bed}`, student)
    })
    return map
  }, [bStudents])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    const found = bStudents.filter((s) => s.name.includes(query))
    if (found.length > 0) {
      setSelectedStudents(found)
      setSearchQuery('')
    } else {
      toast.error('해당 이름의 사생을 찾을 수 없습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="사생 이름을 입력하세요 (예: 이단우)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            검색하기
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-12 overflow-x-auto min-w-[1200px]">
        <div className="bg-[#F9F9F9] p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-xl font-black text-gray-800">
                2026년 1학기 {buildingId}관 현황 요약
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                전체 {checkedInCount} / {bStudents.length} 명 (
                {bStudents.length > 0
                  ? Math.round((checkedInCount / bStudents.length) * 100)
                  : 0}
                %)
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-[#4CAF50] border border-gray-400 rounded-sm"></div>
                <span className="text-xs font-bold text-gray-700">입사완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-white border border-gray-400 rounded-sm"></div>
                <span className="text-xs font-bold text-gray-700">미입사</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {floors.map((floor) => {
              const stats = statsByFloor.get(floor)
              if (!stats || stats.total === 0) return null
              return (
                <div
                  key={floor}
                  className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-gray-700">{floor}층</span>
                    <span className="text-xs font-bold text-blue-600">
                      {stats.checkedIn}/{stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${(stats.checkedIn / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="층별 특이사항/목표"
                    className="text-[10px] border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-blue-300 outline-none font-bold"
                    value={floorGoals[`${buildingId}-${floor}`] || ''}
                    onChange={(e) => handleGoalChange(floor, e.target.value)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {floors.map((floor) => {
          const stats = statsByFloor.get(floor)
          const floorStudents = studentsByFloor.get(floor) ?? []
          const roomNumbers = getRoomNumbers(buildingId, floor)
          if (!stats || roomNumbers.length === 0) return null

          return (
            <div key={floor} className="flex gap-10 items-start">
              <div className="flex flex-col items-center w-28 flex-shrink-0 pt-8">
                <div className="w-full h-14 flex items-center justify-center bg-[#D9D9D9] border border-gray-400 rounded-md font-extrabold text-xl text-gray-700 shadow-sm relative overflow-hidden">
                  {floor}층
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-400/20">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${(stats.checkedIn / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-[13px] font-black text-blue-700">
                  {stats.checkedIn} / {stats.total} 명
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                  Checked In
                </div>
              </div>

              <div className="flex-1 space-y-10">
                {chunk(roomNumbers, 10).map((rowRooms, rowIdx) => (
                  <div key={`${floor}-${rowIdx}`} className="grid grid-cols-10 gap-x-3">
                    {rowRooms.map((roomNum) => (
                      <div key={roomNum} className="space-y-1.5">
                        <div className="text-center font-extrabold text-sm text-gray-800 mb-2">
                          {roomNum}
                        </div>
                        {[1, 2, 3].map((bedNum) => {
                          const student = studentBySlot.get(`${roomNum}-${bedNum}`)
                          const isCheckedIn = Boolean(student?.isCheckedIn)

                          const bgColor = isCheckedIn ? 'bg-[#4CAF50]' : 'bg-white'
                          const textColor = isCheckedIn ? 'text-white' : 'text-gray-900'
                          const borderColor = isCheckedIn ? 'border-[#388E3C]' : 'border-gray-400'

                          return (
                            <div key={bedNum} className="flex gap-1.5 h-10 items-center">
                              <span className="text-[12px] text-[#4CAF50] font-black w-4 text-center">
                                {bedNum}
                              </span>
                              {student ? (
                                <button
                                  onClick={() => setSelectedStudents([student])}
                                  className={`flex-1 h-full px-2 border-2 ${borderColor} ${bgColor} ${textColor} flex items-center justify-center text-[13px] font-black transition-all active:scale-95 shadow-sm rounded-sm`}
                                >
                                  {student.name}
                                </button>
                              ) : (
                                <div className="flex-1 h-full bg-[#F5F5F5] border border-dashed border-gray-300 rounded-sm"></div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedStudents.map((student) => (
        <StudentModal
          key={student.id}
          student={student}
          onClose={() => setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id))}
          onUpdateStatus={(id, field, value) => {
            onUpdateStatus(id, field, value)
            setSelectedStudents((prev) =>
              prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
            )
          }}
        />
      ))}
    </div>
  )
}
