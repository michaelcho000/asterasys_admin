import fs from 'fs'
import {
  getGeneratedMonthPath,
  getProcessedMonthPath,
  getRawMonthPath,
  getYoutubeProcessedMonthPath,
  monthExistsInGenerated,
  monthExistsInProcessed,
  monthExistsInRaw,
  monthExistsInYoutubeProcessed,
  resolveMonth
} from './monthConfig.js'

const TYPE_TO_CONFIG = {
  raw: {
    getPath: getRawMonthPath,
    exists: monthExistsInRaw
  },
  processed: {
    getPath: getProcessedMonthPath,
    exists: monthExistsInProcessed
  },
  generated: {
    getPath: getGeneratedMonthPath,
    exists: monthExistsInGenerated
  },
  youtubeProcessed: {
    getPath: getYoutubeProcessedMonthPath,
    exists: monthExistsInYoutubeProcessed
  }
}

export function resolveRequestMonth(request, options = {}) {
  const { required = [], fallbackToLatest = true } = options
  const { searchParams } = new URL(request.url)
  const requestedMonth = searchParams.get('month')
  const month = resolveMonth(requestedMonth, { fallbackToLatest })

  if (!month) {
    return {
      ok: false,
      error: {
        code: 'NO_MONTH',
        message: '월 정보를 찾을 수 없습니다. latest-month.json을 확인하거나 ?month=YYYY-MM을 지정하세요.'
      }
    }
  }

  const paths = {}
  const missing = []

  required.forEach((type) => {
    const config = TYPE_TO_CONFIG[type]
    if (!config) return

    const monthPath = config.getPath(month)
    const exists = config.exists ? config.exists(month) : fs.existsSync(monthPath)
    paths[type] = monthPath

    if (!exists) {
      missing.push({ type, path: monthPath })
    }
  })

  return {
    ok: missing.length === 0,
    month,
    requestedMonth,
    paths,
    missing
  }
}
