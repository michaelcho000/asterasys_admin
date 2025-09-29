import { CSVParser } from '@/lib/data-processing/csvParser'

const ASTERASYS_PRODUCTS = new Set(['리프테라', '쿨소닉', '쿨페이즈'])

const TECHNOLOGY_ALIAS = {
  고주파: 'RF',
  초음파: 'HIFU'
}

const TECHNOLOGY_LABEL = {
  RF: '고주파',
  HIFU: '초음파'
}

function normalizeTechnology(value) {
  if (!value) {
    return { key: 'UNKNOWN', label: '기타' }
  }

  const label = value.trim()
  const key = TECHNOLOGY_ALIAS[label] || label

  return {
    key,
    label: TECHNOLOGY_LABEL[key] || label
  }
}

function calculateParticipation(comments = 0, replies = 0, posts = 0) {
  if (!posts) return 0
  return (comments + replies) / posts
}

function safeDivide(numerator = 0, denominator = 0, multiplier = 1) {
  if (!denominator) return null
  return (numerator / denominator) * multiplier
}

function postsPerThousandSearch(posts = 0, searchVolume = 0) {
  return safeDivide(posts, searchVolume, 1000)
}

function getMonthSalesColumn(month) {
  if (!month || typeof month !== 'string') return null
  const monthPart = month.split('-')[1]
  if (!monthPart) return null
  const numeric = parseInt(monthPart, 10)
  if (Number.isNaN(numeric)) return null
  return `${numeric}월 판매량`
}

function parseSalesRecords(parser, month) {
  const records = parser.parseCSV('asterasys_total_data - sale.csv')
  const monthlyColumn = getMonthSalesColumn(month)

  return records
    .map((record) => {
      const keyword = record['키워드']?.trim() || ''
      if (!keyword) return null

      const group = record['그룹']?.trim() || ''
      const totalSales = parser.parseNumber(record['총 판매량'])
      const monthlySales = monthlyColumn ? parser.parseNumber(record[monthlyColumn]) : 0

      return {
        keyword,
        group,
        totalSales,
        monthlySales
      }
    })
    .filter(Boolean)
}

export function buildCafeDataset(month) {
  const parser = new CSVParser({ month })

  const cafeRecords = parser.parseCafeRank()
  const trafficRecords = parser.parseTraffic()
  const salesRecords = parseSalesRecords(parser, month)

  const trafficMap = new Map()
  trafficRecords.forEach((record) => {
    trafficMap.set(record.keyword, record)
  })

  const salesMap = new Map()
  salesRecords.forEach((record) => {
    salesMap.set(record.keyword, record)
  })

  const technologyAccumulator = {}
  const totals = {
    totalPosts: 0,
    totalComments: 0,
    totalReplies: 0,
    totalEngagement: 0,
    totalViews: 0,
    searchVolume: 0,
    totalSales: 0,
    monthlySales: 0,
    asterasys: {
      totalPosts: 0,
      totalComments: 0,
      totalReplies: 0,
      totalEngagement: 0,
      totalViews: 0,
      searchVolume: 0,
      totalSales: 0,
      monthlySales: 0,
      products: []
    }
  }

  const products = cafeRecords.map((record) => {
    const { key: technology, label: technologyLabel } = normalizeTechnology(record.group)
    const totalPosts = record.totalPosts || 0
    const totalComments = record.totalComments || 0
    const totalReplies = record.totalReplies || 0
    const totalEngagement = totalComments + totalReplies
    const totalViews = record.totalViews || 0
    const rank = record.rank || null
    const isAsterasys = ASTERASYS_PRODUCTS.has(record.keyword)

    const traffic = trafficMap.get(record.keyword)
    const searchVolume = traffic?.monthlySearchVolume || 0
    const searchRank = traffic?.searchRank || null
    const postsPerSearch = postsPerThousandSearch(totalPosts, searchVolume)

    const sales = salesMap.get(record.keyword)
    const totalSales = sales?.totalSales || 0
    const monthlySales = sales?.monthlySales || 0

    const participation = calculateParticipation(totalComments, totalReplies, totalPosts)
    const salesPerPost = safeDivide(monthlySales, totalPosts, 100)
    const salesPerThousandSearch = safeDivide(monthlySales, searchVolume, 1000)
    const searchToSalesRate = safeDivide(monthlySales, searchVolume, 100)

    totals.totalPosts += totalPosts
    totals.totalComments += totalComments
    totals.totalReplies += totalReplies
    totals.totalEngagement += totalEngagement
    totals.totalViews += totalViews
    totals.searchVolume += searchVolume
    totals.totalSales += totalSales
    totals.monthlySales += monthlySales

    if (!technologyAccumulator[technology]) {
      technologyAccumulator[technology] = {
        technology,
        label: technologyLabel,
        posts: 0,
        engagement: 0,
        searchVolume: 0,
        totalSales: 0,
        monthlySales: 0,
        asterasysPosts: 0,
        asterasysMonthlySales: 0
      }
    }

    const techBucket = technologyAccumulator[technology]
    techBucket.posts += totalPosts
    techBucket.engagement += totalEngagement
    techBucket.searchVolume += searchVolume
    techBucket.totalSales += totalSales
    techBucket.monthlySales += monthlySales

    if (isAsterasys) {
      techBucket.asterasysPosts += totalPosts
      techBucket.asterasysMonthlySales += monthlySales

      totals.asterasys.totalPosts += totalPosts
      totals.asterasys.totalComments += totalComments
      totals.asterasys.totalReplies += totalReplies
      totals.asterasys.totalEngagement += totalEngagement
      totals.asterasys.totalViews += totalViews
      totals.asterasys.searchVolume += searchVolume
      totals.asterasys.totalSales += totalSales
      totals.asterasys.monthlySales += monthlySales
      totals.asterasys.products.push({
        keyword: record.keyword,
        technology,
        technologyLabel,
        rank,
        totalPosts,
        totalEngagement,
        participation,
        searchVolume,
        postsPerThousandSearch: postsPerSearch,
        monthlySales,
        totalSales,
        salesPerPost,
        salesPerThousandSearch,
        searchToSalesRate,
        isAsterasys: true
      })
    }

    return {
      keyword: record.keyword,
      technology,
      technologyLabel,
      rank,
      totalPosts,
      totalComments,
      totalReplies,
      totalEngagement,
      totalViews,
      participation,
      searchVolume,
      searchRank,
      postsPerThousandSearch: postsPerSearch,
      totalSales,
      monthlySales,
      salesPerPost,
      salesPerThousandSearch,
      searchToSalesRate,
      isAsterasys
    }
  })

  const technologyBreakdown = Object.values(technologyAccumulator).map((item) => ({
    ...item,
    share: safeDivide(item.posts, totals.totalPosts, 100) ?? 0,
    asterasysShare: safeDivide(item.asterasysPosts, item.posts, 100) ?? 0,
    postsPerThousandSearch: postsPerThousandSearch(item.posts, item.searchVolume),
    salesPerThousandSearch: safeDivide(item.monthlySales, item.searchVolume, 1000)
  }))

  const totalAverageParticipation = totals.totalPosts ? totals.totalEngagement / totals.totalPosts : 0
  const totalPostsPerThousandSearch = postsPerThousandSearch(totals.totalPosts, totals.searchVolume)
  const totalSalesPerThousandSearch = safeDivide(totals.monthlySales, totals.searchVolume, 1000)
  const totalSearchToSalesRate = safeDivide(totals.monthlySales, totals.searchVolume, 100)

  const asterasysPostsPerThousandSearch = postsPerThousandSearch(
    totals.asterasys.totalPosts,
    totals.asterasys.searchVolume
  )
  const asterasysSalesPerThousandSearch = safeDivide(
    totals.asterasys.monthlySales,
    totals.asterasys.searchVolume,
    1000
  )
  const asterasysSearchToSalesRate = safeDivide(
    totals.asterasys.monthlySales,
    totals.asterasys.searchVolume,
    100
  )

  const productsWithShares = products.map((product) => {
    const techTotals = technologyAccumulator[product.technology]
    return {
      ...product,
      marketShare: safeDivide(product.totalPosts, totals.totalPosts, 100) ?? 0,
      technologyShare: techTotals ? safeDivide(product.totalPosts, techTotals.posts, 100) ?? 0 : 0
    }
  })

  const asterasysProducts = totals.asterasys.products
    .map((product) => {
      const techTotals = technologyAccumulator[product.technology]
      return {
        ...product,
        marketShare: safeDivide(product.totalPosts, totals.totalPosts, 100) ?? 0,
        technologyShare: techTotals ? safeDivide(product.totalPosts, techTotals.posts, 100) ?? 0 : 0
      }
    })
    .sort((a, b) => b.totalPosts - a.totalPosts)

  return {
    month,
    products: productsWithShares.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank
      if (a.rank) return -1
      if (b.rank) return 1
      return b.totalPosts - a.totalPosts
    }),
    totals: {
      totalPosts: totals.totalPosts,
      totalComments: totals.totalComments,
      totalReplies: totals.totalReplies,
      totalEngagement: totals.totalEngagement,
      totalViews: totals.totalViews,
      searchVolume: totals.searchVolume,
      totalSales: totals.totalSales,
      monthlySales: totals.monthlySales,
      averageParticipation: totalAverageParticipation,
      postsPerThousandSearch: totalPostsPerThousandSearch,
      salesPerThousandSearch: totalSalesPerThousandSearch,
      searchToSalesRate: totalSearchToSalesRate,
      asterasysShare: safeDivide(totals.asterasys.totalPosts, totals.totalPosts, 100) ?? 0,
      technologyBreakdown,
      asterasys: {
        totalPosts: totals.asterasys.totalPosts,
        totalComments: totals.asterasys.totalComments,
        totalReplies: totals.asterasys.totalReplies,
        totalEngagement: totals.asterasys.totalEngagement,
        totalViews: totals.asterasys.totalViews,
        searchVolume: totals.asterasys.searchVolume,
        totalSales: totals.asterasys.totalSales,
        monthlySales: totals.asterasys.monthlySales,
        postsPerThousandSearch: asterasysPostsPerThousandSearch,
        salesPerThousandSearch: asterasysSalesPerThousandSearch,
        searchToSalesRate: asterasysSearchToSalesRate,
        share: safeDivide(totals.asterasys.totalPosts, totals.totalPosts, 100) ?? 0,
        products: asterasysProducts
      }
    },
    traffic: trafficRecords,
    sales: salesRecords
  }
}

export function splitCafeProductsByTechnology(products) {
  const buckets = { ALL: [], RF: [], HIFU: [], UNKNOWN: [] }

  products.forEach((product) => {
    buckets.ALL.push(product)
    if (buckets[product.technology]) {
      buckets[product.technology].push(product)
    } else {
      buckets.UNKNOWN.push(product)
    }
  })

  return buckets
}

export function buildCafeLeaderboard(products) {
  const sorted = [...products].sort((a, b) => b.totalPosts - a.totalPosts)

  return sorted.map((product, index) => ({
    rank: product.rank || index + 1,
    keyword: product.keyword,
    technology: product.technology,
    technologyLabel: product.technologyLabel,
    totalPosts: product.totalPosts,
    totalEngagement: product.totalEngagement,
    participation: product.participation,
    searchVolume: product.searchVolume,
    searchToPostRatio: product.postsPerThousandSearch,
    totalSales: product.totalSales,
    monthlySales: product.monthlySales,
    salesPerPost: product.salesPerPost,
    salesPerThousandSearch: product.salesPerThousandSearch,
    searchToSalesRate: product.searchToSalesRate,
    isAsterasys: product.isAsterasys,
    marketShare: product.marketShare,
    technologyShare: product.technologyShare
  }))
}

export function mapCafeCorrelation(products) {
  return products.map((product) => ({
    keyword: product.keyword,
    technology: product.technology,
    technologyLabel: product.technologyLabel,
    totalPosts: product.totalPosts,
    participation: product.participation,
    searchVolume: product.searchVolume,
    postsPerThousandSearch: product.postsPerThousandSearch,
    monthlySales: product.monthlySales,
    salesPerThousandSearch: product.salesPerThousandSearch,
    searchToSalesRate: product.searchToSalesRate,
    isAsterasys: product.isAsterasys
  }))
}
