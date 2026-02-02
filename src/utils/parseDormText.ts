import type { Student } from '../types/student'

type ParseResult = {
  students: Student[]
  buildingId: number
  usedFallback: boolean
  skippedLines: number
}

const isRoomNumber = (value: string) => /^\d{3}$/.test(value)
const isKoreanName = (value: string) => /^[가-힣]{2,4}$/.test(value)

const extractBuildingId = (text: string) => {
  const match = text.match(/([1-4])\s*관/)
  if (match) return Number(match[1])
  return null
}

export const parseDormText = (rawText: string, fallbackBuilding = 2): ParseResult => {
  const lines = rawText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const detectedBuilding = extractBuildingId(rawText)
  const buildingId = detectedBuilding ?? fallbackBuilding
  const usedFallback = detectedBuilding === null

  const students: Student[] = []
  let currentRoom: string | null = null
  let currentBed = 1
  let skippedLines = 0
  const now = Date.now()

  for (const line of lines) {
    if (/^입사자\s*\d+/.test(line)) {
      currentRoom = null
      currentBed = 1
      continue
    }

    if (/^[123]$/.test(line)) {
      continue
    }

    const tokens = line.split(/\s+/).filter(Boolean)
    for (const token of tokens) {
      if (isRoomNumber(token)) {
        currentRoom = token
        currentBed = 1
        continue
      }
      if (isKoreanName(token) && currentRoom) {
        const bed = currentBed
        if (bed <= 3) {
          students.push({
            id: `text-${now}-${currentRoom}-${bed}`,
            name: token,
            room: currentRoom,
            building: buildingId,
            bed,
            isStaff: false,
            isCheckedIn: false,
            hasTBCert: false,
            paidKeyFee: false,
          })
          currentBed += 1
        }
        continue
      }
      if (!isKoreanName(token) && !isRoomNumber(token)) {
        skippedLines += 1
      }
    }
  }

  return { students, buildingId, usedFallback, skippedLines }
}
