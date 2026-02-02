import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { BuildingGrid } from './components/BuildingGrid'
import { ManagePanel } from './components/ManagePanel'
import { motion, AnimatePresence } from 'motion/react'
import { toast, Toaster } from 'sonner'
import type { Student } from './types/student'
import { supabase } from './lib/supabaseClient'

type StudentRow = {
  id: string
  name: string
  room: string
  building: number
  bed: number
  is_staff: boolean
  is_checked_in: boolean
  has_tb_cert: boolean
  paid_key_fee: boolean
}

const fromRow = (row: StudentRow): Student => ({
  id: row.id,
  name: row.name,
  room: row.room,
  building: row.building,
  bed: row.bed,
  isStaff: row.is_staff,
  isCheckedIn: row.is_checked_in,
  hasTBCert: row.has_tb_cert,
  paidKeyFee: row.paid_key_fee,
})

const toRow = (student: Student): StudentRow => ({
  id: student.id,
  name: student.name,
  room: student.room,
  building: student.building,
  bed: student.bed,
  is_staff: student.isStaff,
  is_checked_in: student.isCheckedIn,
  has_tb_cert: student.hasTBCert,
  paid_key_fee: student.paidKeyFee,
})

export default function App() {
  const [currentTab, setCurrentTab] = useState('all')
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('students')
        .select(
          'id,name,room,building,bed,is_staff,is_checked_in,has_tb_cert,paid_key_fee',
        )
        .order('building', { ascending: true })
        .order('room', { ascending: true })
        .order('bed', { ascending: true })
      if (error) {
        toast.error('학생 데이터를 불러오지 못했습니다.')
        return
      }
      setStudents((data as StudentRow[]).map(fromRow))
    }
    void load()
  }, [])

  const handleImportData = useCallback(async (importedStudents: Student[]) => {
    setStudents((prev) => {
      const existingKeys = new Set(prev.map((s) => `${s.building}-${s.room}-${s.bed}`))
      const newOnes = importedStudents.filter(
        (s) => !existingKeys.has(`${s.building}-${s.room}-${s.bed}`),
      )
      return [...prev, ...newOnes]
    })

    const rows = importedStudents.map((s) => toRow({ ...s, id: crypto.randomUUID() }))

    const { error } = await supabase.from('students').insert(rows)
    if (error) {
      toast.error(`데이터 저장에 실패했습니다: ${error.message}`)
      return
    }
    toast.success(`${importedStudents.length}명의 사생 데이터가 등록되었습니다.`)
  }, [])

  const handleUpdateStatus = async (
    id: string,
    field: keyof Student,
    value: Student[keyof Student],
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === id) {
          return { ...student, [field]: value }
        }
        return student
      }),
    )
    const column =
      field === 'isStaff'
        ? 'is_staff'
        : field === 'isCheckedIn'
          ? 'is_checked_in'
          : field === 'hasTBCert'
            ? 'has_tb_cert'
            : field === 'paidKeyFee'
              ? 'paid_key_fee'
              : field
    const { error } = await supabase.from('students').update({ [column]: value }).eq('id', id)
    if (error) {
      toast.error('업데이트에 실패했습니다.')
    }
  }

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    const student: Student = {
      ...newStudent,
      id: crypto.randomUUID(),
    }
    setStudents((prev) => [...prev, student])
    const { error } = await supabase.from('students').insert(toRow(student))
    if (error) {
      toast.error(`등록에 실패했습니다: ${error.message}`)
      return
    }
    toast.success('새로운 사생이 등록되었습니다.')
  }

  const handleDeleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) {
      toast.error(`삭제에 실패했습니다: ${error.message}`)
      return
    }
    toast.error('사생 정보가 삭제되었습니다.')
  }

  const handleReset = async () => {
    setStudents([])
    const { error } = await supabase.from('students').delete().neq('id', '')
    if (error) {
      toast.error(`초기화에 실패했습니다: ${error.message}`)
      return
    }
    toast.success('데이터가 초기화되었습니다.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
      <Toaster position="top-right" richColors />
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'all' && <Dashboard students={students} />}

            {(currentTab === '1' ||
              currentTab === '2' ||
              currentTab === '3' ||
              currentTab === '4') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentTab}관 상세 관리
                  </h2>
                </div>
                <BuildingGrid
                  buildingId={Number(currentTab)}
                  students={students}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}

            {currentTab === 'manage' && (
              <ManagePanel
                students={students}
                onAddStudent={handleAddStudent}
                onReset={handleReset}
                onDeleteStudent={handleDeleteStudent}
                onImportData={handleImportData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
