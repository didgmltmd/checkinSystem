import Tesseract from 'tesseract.js'
import type { Student } from '../types/student'

type WordBox = {
  text: string
  x: number
  y: number
  w: number
  h: number
  confidence: number
}

type OcrResult = {
  students: Student[]
  buildingId: number
  usedFallback: boolean
}

let workerPromise: Promise<Tesseract.Worker> | null = null

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await Tesseract.createWorker('kor+eng')
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
      })
      return worker
    })()
  }
  return workerPromise
}

const extractBuildingId = (fullText: string) => {
  const match = fullText.match(/([1-4])\s*관/)
  if (match) return Number(match[1])
  return null
}

const toWordBox = (w: any): WordBox | null => {
  const text = String(w.text ?? '').trim()
  if (!text) return null
  const bbox = w.bbox
  if (!bbox) return null
  return {
    text,
    x: (bbox.x0 + bbox.x1) / 2,
    y: (bbox.y0 + bbox.y1) / 2,
    w: bbox.x1 - bbox.x0,
    h: bbox.y1 - bbox.y0,
    confidence: Number(w.confidence ?? 0),
  }
}

const isRoomNumber = (text: string) => /^\d{3}$/.test(text) && Number(text) >= 100 && Number(text) <= 499

const isKoreanName = (text: string) => /^[가-힣]{2,4}$/.test(text)

const mapNamesToRooms = (words: WordBox[], width: number, height: number) => {
  const rooms = words.filter((w) => isRoomNumber(w.text))
  const names = words.filter((w) => isKoreanName(w.text))

  const maxDx = width * 0.06
  const maxDyPrimary = height * 0.2
  const maxDyFallback = height * 0.35

  const grouped: Record<string, WordBox[]> = {}

  for (const name of names) {
    let bestRoom: WordBox | null = null
    let bestScore = Number.POSITIVE_INFINITY

    for (const room of rooms) {
      const dy = name.y - room.y
      if (dy <= 0) continue
      const dx = Math.abs(name.x - room.x)
      if (dx > maxDx || dy > maxDyPrimary) continue
      const score = dx + dy * 0.2
      if (score < bestScore) {
        bestScore = score
        bestRoom = room
      }
    }

    if (!bestRoom) {
      for (const room of rooms) {
        const dy = name.y - room.y
        if (dy <= 0 || dy > maxDyFallback) continue
        const dx = Math.abs(name.x - room.x)
        if (dx > maxDx * 1.5) continue
        const score = dx + dy * 0.1
        if (score < bestScore) {
          bestScore = score
          bestRoom = room
        }
      }
    }

    if (!bestRoom) continue
    const roomId = bestRoom.text
    if (!grouped[roomId]) grouped[roomId] = []
    grouped[roomId].push(name)
  }

  return grouped
}

const buildStudents = (grouped: Record<string, WordBox[]>, buildingId: number) => {
  const students: Student[] = []
  const now = Date.now()

  Object.entries(grouped).forEach(([room, names]) => {
    const sorted = [...names].sort((a, b) => (a.y - b.y) || (a.x - b.x))
    sorted.forEach((nameWord, idx) => {
      const bed = idx + 1
      if (bed > 3) return
      students.push({
        id: `ocr-${now}-${room}-${bed}`,
        name: nameWord.text,
        room,
        building: buildingId,
        bed,
        isStaff: false,
        isCheckedIn: false,
        hasTBCert: false,
        paidKeyFee: false,
      })
    })
  })

  return students
}

export const extractStudentsFromImage = async (
  image: Blob | ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  fallbackBuildingId = 2,
): Promise<OcrResult> => {
  const worker = await getWorker()
  const result = await worker.recognize(image)
  const fullText = result.data.text || ''
  const detectedBuilding = extractBuildingId(fullText)
  const buildingId = detectedBuilding ?? fallbackBuildingId
  const usedFallback = detectedBuilding === null

  const words = (result.data.words || [])
    .map(toWordBox)
    .filter((w): w is WordBox => Boolean(w))
    .filter((w) => w.confidence >= 40)

  const width =
    result.data.imageSize?.width ??
    ('naturalWidth' in image ? image.naturalWidth : image.width) ??
    1
  const height =
    result.data.imageSize?.height ??
    ('naturalHeight' in image ? image.naturalHeight : image.height) ??
    1
  const grouped = mapNamesToRooms(words, width, height)
  const students = buildStudents(grouped, buildingId)

  return { students, buildingId, usedFallback }
}
