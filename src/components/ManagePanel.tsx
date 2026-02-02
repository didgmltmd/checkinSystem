import React, { useState } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import type { Student } from '../types/student'
import { toast } from 'sonner'
import { parseDormText } from '../utils/parseDormText'

interface ManagePanelProps {
  students: Student[]
  onAddStudent: (student: Omit<Student, 'id'>) => void
  onReset: () => void
  onDeleteStudent: (id: string) => void
  onImportData: (students: Student[]) => void
}

const BUILDINGS = [1, 2, 3, 4] as const
const BEDS = [1, 2, 3] as const

export const ManagePanel: React.FC<ManagePanelProps> = ({
  students,
  onAddStudent,
  onReset,
  onDeleteStudent,
  onImportData,
}) => {
  const [rawText, setRawText] = useState('')
  const [importBuilding, setImportBuilding] = useState(2)
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    building: 2,
    bed: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.room) return
    onAddStudent({
      ...formData,
      isStaff: false,
      isCheckedIn: false,
      hasTBCert: false,
      paidKeyFee: false,
    })
    setFormData({ ...formData, name: '' })
  }

  const handleTextImport = () => {
    if (!rawText.trim()) {
      toast.error('텍스트를 먼저 붙여넣어 주세요.')
      return
    }
    const { students: parsedStudents, buildingId, usedFallback, skippedLines } = parseDormText(
      rawText,
      importBuilding,
    )
    if (parsedStudents.length === 0) {
      toast.error('인식된 사생 정보가 없습니다. 텍스트 형식을 확인해주세요.')
      return
    }
    if (usedFallback) {
      toast.message(`관 정보를 인식하지 못해 ${buildingId}관으로 저장했습니다.`)
    }
    if (skippedLines > 0) {
      toast.message(`일부 줄(${skippedLines}개)은 분석에서 제외되었습니다.`)
    }
    onImportData(parsedStudents)
    setRawText('')
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">텍스트로 사생 일괄 등록</h3>
              <p className="text-blue-100 font-bold">
                배치표 내용을 텍스트로 복사해 붙여넣으면 관/호실/침대에 맞게 자동 등록됩니다.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-black text-gray-700">관 선택</label>
            <select
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold"
              value={importBuilding}
              onChange={(e) => setImportBuilding(Number(e.target.value))}
            >
              {BUILDINGS.map((n) => (
                <option key={n} value={n}>
                  {n}관
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full min-h-[240px] p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="배치표 텍스트를 여기에 붙여넣어 주세요."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button
            onClick={handleTextImport}
            className="w-full py-4 bg-gray-900 text-white font-black rounded-lg hover:bg-black transition-colors shadow-lg"
          >
            텍스트로 일괄 등록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-black">개별 사생 등록</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">이름</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">관</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: Number(e.target.value) })}
                >
                  {BUILDINGS.map((n) => (
                    <option key={n} value={n}>
                      {n}관
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">호실</label>
                <input
                  type="text"
                  required
                  placeholder="예: 201"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">침대 번호</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.bed}
                onChange={(e) => setFormData({ ...formData, bed: Number(e.target.value) })}
              >
                {BEDS.map((n) => (
                  <option key={n} value={n}>
                    {n}번 침대
                  </option>
                ))}
              </select>
            </div>
            <button className="w-full py-4 bg-gray-900 text-white font-black rounded-lg hover:bg-black transition-colors shadow-lg">
              사생 추가하기
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={onReset}
              className="w-full py-4 bg-white border-2 border-red-200 text-red-600 font-black rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              전체 데이터 초기화
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black">사생 명단 관리</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-black rounded-full">
                {students.length}명
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-sm font-black text-gray-500">관/호실</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-gray-500">침대</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-gray-500">이름</th>
                  <th className="text-right py-4 px-4 text-sm font-black text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400 font-bold">
                      등록된 사생이 없습니다. 텍스트 붙여넣기나 직접 추가를 이용해주세요.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-4 px-4 font-bold text-gray-700">
                        {student.building}관 {student.room}호
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-500">
                        {student.bed}번
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900">
                        {student.name}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
