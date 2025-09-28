#!/usr/bin/env node

/**
 * Asterasys 제품별 상위 채널 추출 스크립트
 *
 * 사용법:
 *   node scripts/extractAsterasysChannels.js --month=2025-08
 *   npm run youtube:channels -- --month=2025-08
 *
 * 월을 지정하지 않으면 config/latest-month.json 값을 사용합니다.
 */

import fs from 'fs'
import path from 'path'
import {
  ensureDirectory,
  getLatestMonth,
  getRawMonthPath,
  getYoutubeProcessedMonthPath,
  isValidMonth,
  monthExistsInRaw
} from '../src/lib/server/monthConfig.js'

const ASTERASYS_PRODUCTS = ['쿨소닉', '쿨페이즈', '리프테라']

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    const key = rawKey.trim()
    const value = rawValue === undefined ? true : rawValue.trim()
    acc[key] = value
    return acc
  }, {})
}

function ensureMonthAvailable(month) {
  if (!isValidMonth(month)) {
    throw new Error(`잘못된 월 형식입니다: ${month}. YYYY-MM 형식을 사용하세요.`)
  }

  if (!monthExistsInRaw(month)) {
    throw new Error(`원본 YouTube JSON을 찾을 수 없습니다: ${getRawMonthPath(month)}`)
  }
}

function findLatestScraperJson(rawMonthPath) {
  const files = fs
    .readdirSync(rawMonthPath)
    .filter((file) => file.startsWith('dataset_youtube-scraper_') && file.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    throw new Error(`dataset_youtube-scraper_*.json 파일을 찾을 수 없습니다: ${rawMonthPath}`)
  }

  return path.join(rawMonthPath, files[files.length - 1])
}

function normaliseNumber(value) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function buildProductStats(dataset, product) {
  const videos = dataset.filter((item) => item.input?.trim() === product)

  if (videos.length === 0) {
    return {
      totalStats: {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        shortsCount: 0,
        regularCount: 0,
        shortsRatio: 0
      },
      topChannels: []
    }
  }

  const channelMap = new Map()

  videos.forEach((video) => {
    const channelName = video.channelName || '알 수 없는 채널'
    const key = video.channelId || channelName

    if (!channelMap.has(key)) {
      channelMap.set(key, {
        channelId: video.channelId,
        channelName,
        channelUrl: video.channelUrl,
        videos: [],
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
      })
    }

    const channel = channelMap.get(key)
    const viewCount = normaliseNumber(video.viewCount)
    const likes = normaliseNumber(video.likes)
    const comments = normaliseNumber(video.commentsCount)

    channel.videos.push({
      title: video.title,
      url: video.url,
      views: viewCount,
      likes,
      comments,
      type: video.type,
      date: video.date
    })

    channel.totalViews += viewCount
    channel.totalLikes += likes
    channel.totalComments += comments
  })

  const totalVideos = videos.length
  const totalViews = videos.reduce((sum, video) => sum + normaliseNumber(video.viewCount), 0)
  const totalLikes = videos.reduce((sum, video) => sum + normaliseNumber(video.likes), 0)
  const totalComments = videos.reduce((sum, video) => sum + normaliseNumber(video.commentsCount), 0)
  const shortsCount = videos.filter((video) => video.type === 'shorts').length
  const regularCount = totalVideos - shortsCount
  const shortsRatio = totalVideos > 0 ? Number(((shortsCount / totalVideos) * 100).toFixed(1)) : 0

  const topChannels = Array.from(channelMap.values())
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5)
    .map((channel) => {
      const videosByViews = [...channel.videos].sort((a, b) => b.views - a.views)
      const bestVideo = videosByViews[0] || null
      return {
        channelName: channel.channelName,
        channelUrl: channel.channelUrl,
        channelId: channel.channelId,
        totalViews: channel.totalViews,
        videoCount: channel.videos.length,
        bestVideo
      }
    })

  return {
    totalStats: {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      shortsCount,
      regularCount,
      shortsRatio
    },
    topChannels
  }
}

function logProductSummary(product, stats) {
  console.log(`\n📊 ${product} 상위 채널 요약`)
  if (stats.topChannels.length === 0) {
    console.log('  ⚠️ 수집된 영상이 없습니다.')
    return
  }

  stats.topChannels.forEach((channel, index) => {
    console.log(`  ${index + 1}. ${channel.channelName || '알 수 없는 채널'}`)
    console.log(`     조회수: ${channel.totalViews.toLocaleString()}회 / 영상 ${channel.videoCount}개`)
    if (channel.bestVideo) {
      const title = channel.bestVideo.title || '제목 없음'
      console.log(`     대표 영상: ${title.slice(0, 60)}${title.length > 60 ? '…' : ''}`)
      console.log(`     대표 영상 조회수: ${channel.bestVideo.views.toLocaleString()}회`)
    }
  })

  const { totalStats } = stats
  console.log(`\n📈 ${product} 전체 통계`)
  console.log(`  총 비디오: ${totalStats.totalVideos}개`)
  console.log(`  총 조회수: ${totalStats.totalViews.toLocaleString()}회`)
  console.log(`  총 좋아요: ${totalStats.totalLikes.toLocaleString()}개`)
  console.log(`  총 댓글: ${totalStats.totalComments.toLocaleString()}개`)
  console.log(`  Shorts 비중: ${totalStats.shortsCount}개 (${totalStats.shortsRatio}%)`)
}

async function run() {
  try {
    const args = parseArgs(process.argv)
    const requestedMonth = typeof args.month === 'string' ? args.month : undefined
    const month = requestedMonth || getLatestMonth()

    if (!month) {
      throw new Error('--month=YYYY-MM 형식으로 월을 지정하거나 latest-month.json을 설정하세요.')
    }

    ensureMonthAvailable(month)

    const rawMonthPath = getRawMonthPath(month)
    const rawJsonPath = findLatestScraperJson(rawMonthPath)

    console.log('==========================================')
    console.log(' Asterasys YouTube 채널 데이터 추출 시작')
    console.log('==========================================')
    console.log(`📅 대상 월: ${month}`)
    console.log(`📁 원본 파일: ${path.relative(process.cwd(), rawJsonPath)}`)

    const dataset = JSON.parse(fs.readFileSync(rawJsonPath, 'utf8'))

    const results = {}
    ASTERASYS_PRODUCTS.forEach((product) => {
      const stats = buildProductStats(dataset, product)
      results[product] = stats
      logProductSummary(product, stats)
    })

    const outputDir = getYoutubeProcessedMonthPath(month)
    ensureDirectory(outputDir)
    const outputPath = path.join(outputDir, 'asterasys_channels_data.json')
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8')

    console.log('\n✅ 데이터 저장 완료: %s', path.relative(process.cwd(), outputPath))
  } catch (error) {
    console.error('❌ 채널 데이터 추출 실패:', error.message)
    process.exit(1)
  }
}

run()
