import { CSVParser } from '@/lib/data-processing/csvParser'

const ASTERASYS_PRODUCTS = new Set(['리프테라', '쿨페이즈', '쿨소닉'])

const TECHNOLOGY_LABEL = {
  고주파: 'RF',
  초음파: 'HIFU'
}

const BLOG_TYPE_LABEL = {
  병원블로그: '병원',
  플레이스블로그: '플레이스',
  일반블로그: '일반'
}

function normalizeTechnology(value) {
  if (!value) return 'UNKNOWN'
  return TECHNOLOGY_LABEL[value] || value
}

function formatBlogType(value) {
  if (!value) return '기타'
  return BLOG_TYPE_LABEL[value] || value
}

function calculateParticipation(totalComments, totalReplies, totalCount) {
  if (!totalCount) return 0
  return (totalComments + totalReplies) / totalCount
}

function safeDivide(numerator, denominator) {
  if (!denominator) return null
  return numerator / denominator
}

function postsPerThousandSearch(posts, searchVolume) {
  if (!searchVolume) return null
  return (posts / searchVolume) * 1000
}

function enrichProductsWithSearch(products, trafficMap) {
  return products.map((product) => {
    const traffic = trafficMap.get(product.keyword)
    const searchVolume = traffic?.monthlySearchVolume || 0
    const searchRank = traffic?.searchRank || null
    const ratio = postsPerThousandSearch(product.totalPosts, searchVolume)

    return {
      ...product,
      searchVolume,
      searchRank,
      searchToPostRatio: ratio,
      searchToPostRatioPercent: ratio != null ? ratio : null
    }
  })
}

function calculatePerformanceScore(product) {
  const weights = { posts: 0.5, participation: 0.3, searchEfficiency: 0.2 }
  const participationScore = Math.min(product.participation * 100, 200)
  const searchEfficiency = product.searchToPostRatio != null ? Math.min(product.searchToPostRatio * 10, 200) : 50
  return Math.round(
    product.totalPosts * weights.posts + participationScore * weights.participation + searchEfficiency * weights.searchEfficiency
  )
}

export function buildBlogDataset(month) {
  const parser = new CSVParser({ month })

  const rawBlog = parser.parseCSV('asterasys_total_data - blog_rank.csv')
  const rawAuthors = parser.parseCSV('asterasys_total_data - blog_user_rank.csv')
  const trafficRecords = parser.parseTraffic()

  const trafficMap = new Map()
  trafficRecords.forEach((record) => {
    trafficMap.set(record.keyword, record)
  })

  const productMap = new Map()
  let currentKeyword = ''
  let lastTechnology = ''
  let lastRank = 0

  rawBlog.forEach((row) => {
    const keyword = row['키워드']?.trim() || currentKeyword
    if (!keyword) {
      return
    }

    if (row['키워드']?.trim()) {
      currentKeyword = keyword
    }

    const technologyLabel = row['기기구분']?.trim() || lastTechnology
    if (technologyLabel) {
      lastTechnology = technologyLabel
    }

    const parsedRank = parser.parseNumber(row['발행량 순위'])
    if (parsedRank) {
      lastRank = parsedRank
    }

    const blogTypeRaw = row['블로그유형']?.trim()
    const typeCount = parser.parseNumber(row['총 개수'])
    const comments = parser.parseNumber(row['댓글 총 개수'])
    const replies = parser.parseNumber(row['대댓글 총 개수'])
    const aggregateTotal = parser.parseNumber(row['발행량합'])

    if (!productMap.has(keyword)) {
      productMap.set(keyword, {
        keyword,
        technologyLabel: technologyLabel || lastTechnology || '',
        technology: normalizeTechnology(technologyLabel || lastTechnology || ''),
        rank: lastRank || null,
        totalPosts: 0,
        totalByTypes: 0,
        totalComments: 0,
        totalReplies: 0,
        blogTypes: [],
        isAsterasys: ASTERASYS_PRODUCTS.has(keyword)
      })
    }

    const product = productMap.get(keyword)

    if (aggregateTotal) {
      product.totalPosts = aggregateTotal
    }

    product.totalByTypes += typeCount
    product.totalComments += comments
    product.totalReplies += replies
    product.technologyLabel = technologyLabel || product.technologyLabel
    product.technology = normalizeTechnology(product.technologyLabel)
    product.rank = product.rank || lastRank || null

    product.blogTypes.push({
      type: formatBlogType(blogTypeRaw),
      posts: typeCount,
      comments,
      replies,
      participation: calculateParticipation(comments, replies, typeCount)
    })
  })

  const products = Array.from(productMap.values()).map((product) => {
    const totalPosts = product.totalPosts || product.totalByTypes
    const totalEngagement = product.totalComments + product.totalReplies
    const participation = calculateParticipation(product.totalComments, product.totalReplies, totalPosts)

    const blogTypes = product.blogTypes
      .filter((entry) => entry.posts > 0)
      .map((entry) => ({
        ...entry,
        share: safeDivide(entry.posts, totalPosts) ? Math.round(safeDivide(entry.posts, totalPosts) * 1000) / 10 : 0
      }))

    return {
      ...product,
      totalPosts,
      totalEngagement,
      participation,
      blogTypes,
      blogTypeSummary: blogTypes.map((entry) => ({ type: entry.type, posts: entry.posts, share: entry.share }))
    }
  })

  const enrichedProducts = enrichProductsWithSearch(products, trafficMap)

  const totals = enrichedProducts.reduce(
    (acc, product) => {
      acc.totalPosts += product.totalPosts
      acc.totalComments += product.totalComments
      acc.totalReplies += product.totalReplies
      acc.totalEngagement += product.totalEngagement
      acc.searchVolume += product.searchVolume || 0

      const technologyKey = product.technology || 'UNKNOWN'
      if (!acc.technologyBreakdown[technologyKey]) {
        acc.technologyBreakdown[technologyKey] = {
          technology: technologyKey,
          label: product.technologyLabel || technologyKey,
          posts: 0,
          engagement: 0
        }
      }

      acc.technologyBreakdown[technologyKey].posts += product.totalPosts
      acc.technologyBreakdown[technologyKey].engagement += product.totalEngagement

      if (product.isAsterasys) {
        acc.asterasys.totalPosts += product.totalPosts
        acc.asterasys.totalEngagement += product.totalEngagement
        acc.asterasys.products.push({
          keyword: product.keyword,
          technology: product.technology,
          totalPosts: product.totalPosts,
          participation: product.participation,
          searchVolume: product.searchVolume,
          searchToPostRatio: product.searchToPostRatio
        })
      }

      return acc
    },
    {
      totalPosts: 0,
      totalComments: 0,
      totalReplies: 0,
      totalEngagement: 0,
      searchVolume: 0,
      technologyBreakdown: {},
      asterasys: {
        totalPosts: 0,
        totalEngagement: 0,
        products: []
      }
    }
  )

  const technologyBreakdown = Object.values(totals.technologyBreakdown).map((entry) => ({
    ...entry,
    share: totals.totalPosts ? (entry.posts / totals.totalPosts) * 100 : 0
  }))

  const authorList = []
  let currentAuthorKeyword = ''
  rawAuthors.forEach((row) => {
    if (row['키워드']?.trim()) {
      currentAuthorKeyword = row['키워드'].trim()
    }

    if (!currentAuthorKeyword) return

    const name = row['블로그명']?.trim()
    const url = row['URL']?.trim()
    if (!name) return

    const totalPosts = parser.parseNumber(row['총 발행 개수'])
    const rank = parser.parseNumber(row['순위'])
    const participationLabel = totalPosts >= 3 ? '참여도 높음' : totalPosts === 2 ? '참여도 보통' : '참여도 낮음'

    authorList.push({
      product: currentAuthorKeyword,
      name,
      url,
      totalPosts,
      rank,
      participationLabel,
      isAsterasys: ASTERASYS_PRODUCTS.has(currentAuthorKeyword)
    })
  })

  return {
    month,
    products: enrichedProducts.sort((a, b) => a.rank - b.rank),
    totals: {
      totalPosts: totals.totalPosts,
      totalComments: totals.totalComments,
      totalReplies: totals.totalReplies,
      totalEngagement: totals.totalEngagement,
      averageParticipation: totals.totalPosts ? totals.totalEngagement / totals.totalPosts : 0,
      searchVolume: totals.searchVolume,
      postsPerThousandSearch: postsPerThousandSearch(totals.totalPosts, totals.searchVolume),
      asterasysShare: totals.totalPosts ? (totals.asterasys.totalPosts / totals.totalPosts) * 100 : 0,
      technologyBreakdown,
      asterasys: totals.asterasys
    },
    traffic: trafficRecords,
    authors: authorList
  }
}

export function getProductByKeyword(dataset, keyword) {
  if (!dataset) return null
  return dataset.products.find((item) => item.keyword === keyword) || null
}

export function splitProductsByTechnology(products) {
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

export function buildLeaderboard(products) {
  const sorted = [...products].sort((a, b) => b.totalPosts - a.totalPosts)
  return sorted.map((product, index) => ({
    rank: index + 1,
    keyword: product.keyword,
    technology: product.technology,
    totalPosts: product.totalPosts,
    participation: product.participation,
    searchVolume: product.searchVolume,
    searchToPostRatio: product.searchToPostRatio,
    totalEngagement: product.totalEngagement,
    comments: product.totalComments,
    replies: product.totalReplies,
    isAsterasys: product.isAsterasys,
    performanceScore: calculatePerformanceScore(product)
  }))
}

export function buildAuthorSummary(authors) {
  const summary = authors.reduce(
    (acc, author) => {
      acc.total += 1
      if (author.isAsterasys) {
        acc.asterasys += 1
      }
      return acc
    },
    { total: 0, asterasys: 0 }
  )

  return summary
}
