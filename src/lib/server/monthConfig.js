import fs from 'fs'
import path from 'path'

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const CONFIG_PATH = path.join(process.cwd(), 'config', 'latest-month.json')

const rawBasePath = path.join(process.cwd(), 'data', 'raw')
const processedBasePath = path.join(process.cwd(), 'data', 'processed')
const generatedBasePath = path.join(process.cwd(), 'data', 'raw', 'generated')
const youtubeProcessedBasePath = path.join(process.cwd(), 'data', 'processed', 'youtube')

export function isValidMonth(value) {
  return typeof value === 'string' && MONTH_REGEX.test(value)
}

export function getLatestMonth() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const content = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    if (isValidMonth(content?.month)) {
      return content.month
    }
    return null
  } catch (error) {
    console.warn('[monthConfig] Failed to read latest-month.json:', error.message)
    return null
  }
}

export function setLatestMonth(month) {
  if (!isValidMonth(month)) {
    throw new Error(`Invalid month format: ${month}`)
  }

  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ month }, null, 2), 'utf8')
}

export function listMonthDirectories(basePath) {
  try {
    if (!fs.existsSync(basePath)) return []
    return fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && isValidMonth(entry.name))
      .map((entry) => entry.name)
      .sort()
  } catch (error) {
    console.warn(`[monthConfig] Failed to list month directories under ${basePath}:`, error.message)
    return []
  }
}

export function getAvailableRawMonths() {
  return listMonthDirectories(rawBasePath)
}

export function getAvailableProcessedMonths() {
  return listMonthDirectories(processedBasePath)
}

export function resolveMonth(requestedMonth, options = {}) {
  const { fallbackToLatest = true } = options
  if (isValidMonth(requestedMonth)) {
    return requestedMonth
  }
  if (!fallbackToLatest) return null
  return getLatestMonth()
}

export function getRawMonthPath(month) {
  return path.join(rawBasePath, month)
}

export function getProcessedMonthPath(month) {
  return path.join(processedBasePath, month)
}

export function getGeneratedMonthPath(month) {
  return path.join(generatedBasePath, month)
}

export function getYoutubeProcessedMonthPath(month) {
  return path.join(youtubeProcessedBasePath, month)
}

export function ensureDirectory(pathToCheck) {
  if (!fs.existsSync(pathToCheck)) {
    fs.mkdirSync(pathToCheck, { recursive: true })
  }
}

export function ensureMonthlyDirectories(month) {
  ensureDirectory(getProcessedMonthPath(month))
  ensureDirectory(getGeneratedMonthPath(month))
  ensureDirectory(getYoutubeProcessedMonthPath(month))
}

export function monthExistsInRaw(month) {
  if (!isValidMonth(month)) return false
  return fs.existsSync(getRawMonthPath(month))
}

export function monthExistsInProcessed(month) {
  if (!isValidMonth(month)) return false
  return fs.existsSync(getProcessedMonthPath(month))
}

export function monthExistsInGenerated(month) {
  if (!isValidMonth(month)) return false
  return fs.existsSync(getGeneratedMonthPath(month))
}

export function monthExistsInYoutubeProcessed(month) {
  if (!isValidMonth(month)) return false
  return fs.existsSync(getYoutubeProcessedMonthPath(month))
}
