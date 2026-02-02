import React, { useMemo, useState } from 'react'
import { X, Check, FileCheck, CreditCard, User } from 'lucide-react'
import type { Student } from '../types/student'

interface StudentModalProps {
  student: Student
  onClose: () => void
  onUpdateStatus: (id: string, field: keyof Student, value: Student[keyof Student]) => void
}

const BEDS = [1, 2, 3] as const

export const StudentModal: React.FC<StudentModalProps> = ({
  student,
  onClose,
  onUpdateStatus,
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState(() => ({
    name: student.name,
    room: student.room,
    building: student.building,
    bed: student.bed,
  }))

  const headerSubtitle = useMemo(
    () => `${student.building}관 ${student.room}호 ${student.bed}번 침대`,
    [student.building, student.room, student.bed],
  )

  const handleSaveEdit = () => {
    onUpdateStatus(student.id, 'name', editData.name)
    onUpdateStatus(student.id, 'room', editData.room)
    onUpdateStatus(student.id, 'building', editData.building)
    onUpdateStatus(student.id, 'bed', editData.bed)
    setIsEditMode(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#1E293B] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">{student.name} 사생 정보</h3>
            <p className="text-gray-400 text-sm font-bold">{headerSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${
                isEditMode ? 'bg-blue-600' : 'hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {isEditMode ? (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2">
                <p className="text-xs text-blue-700 font-black mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> 데이터 수정 모드
                </p>
                <p className="text-[11px] text-blue-600 font-bold leading-tight">
                  이미지 인식 오류나 오탈자가 있을 경우 직접 수정할 수 있습니다.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1">이름</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-black focus:ring-2 focus:ring-blue-500"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">호실</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-black focus:ring-2 focus:ring-blue-500"
                      value={editData.room}
                      onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">침대 번호</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-black focus:ring-2 focus:ring-blue-500"
                      value={editData.bed}
                      onChange={(e) =>
                        setEditData({ ...editData, bed: Number(e.target.value) })
                      }
                    >
                      {BEDS.map((n) => (
                        <option key={n} value={n}>
                          {n}번 침대
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-100"
              >
                사생 정보 수정 완료
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-black text-gray-800">입사 여부</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(student.id, 'isCheckedIn', true)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      student.isCheckedIn
                        ? 'bg-[#4CAF50] border-[#388E3C] text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-green-200'
                    }`}
                  >
                    입사완료
                  </button>
                  <button
                    onClick={() => onUpdateStatus(student.id, 'isCheckedIn', false)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      !student.isCheckedIn
                        ? 'bg-gray-800 border-black text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    미입사
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4 text-orange-600" />
                  <span className="font-black text-gray-800">결핵진단서</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(student.id, 'hasTBCert', true)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      student.hasTBCert
                        ? 'bg-orange-500 border-orange-700 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-orange-200'
                    }`}
                  >
                    제출완료
                  </button>
                  <button
                    onClick={() => onUpdateStatus(student.id, 'hasTBCert', false)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      !student.hasTBCert
                        ? 'bg-gray-800 border-black text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    미제출
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="font-black text-gray-800">캡스키 비용</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(student.id, 'paidKeyFee', true)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      student.paidKeyFee
                        ? 'bg-purple-600 border-purple-800 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-purple-200'
                    }`}
                  >
                    납부완료
                  </button>
                  <button
                    onClick={() => onUpdateStatus(student.id, 'paidKeyFee', false)}
                    className={`py-3 rounded-lg font-black text-sm transition-all border-2 ${
                      !student.paidKeyFee
                        ? 'bg-gray-800 border-black text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    미납부
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-black hover:bg-black transition-colors"
          >
            {isEditMode ? '수정 취소' : '확인 및 닫기'}
          </button>
        </div>
      </div>
    </div>
  )
}
