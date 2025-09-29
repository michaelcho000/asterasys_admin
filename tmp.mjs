import { buildBlogDataset } from './src/services/blog/blogAnalysisService.js'

const dataset = buildBlogDataset('2025-08')

console.log('Total posts:', dataset.totals.totalPosts)
console.log('Technology breakdown:', dataset.totals.technologyBreakdown)
console.log('Asterasys products:')
dataset.totals.asterasys.products.forEach((p) => {
  const tech = dataset.totals.technologyBreakdown.find((item) => item.technology === p.technology)
  const techShare = tech ? (p.totalPosts / tech.posts) * 100 : null
  const marketShare = dataset.totals.totalPosts ? (p.totalPosts / dataset.totals.totalPosts) * 100 : null
  console.log(p.keyword, p.totalPosts, p.technology, {
    techShare,
    marketShare
  })
})
