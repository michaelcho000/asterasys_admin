import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - autocomplete.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Autocomplete data file not found' }, { status: 404 })
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
    
    // Remove BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '')
    
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
      skip_records_with_error: true
    })
    
    const autoCompleteData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const keyword = record['자동완성 작업키워드'] || record.autocomplete_keyword || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (keyword is essential)
      if (!keyword || !currentProduct) return
      
      autoCompleteData.push({
        product: currentProduct,
        keyword: keyword
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = autoCompleteData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalKeywords = processedData.length
    const asterasysKeywords = processedData.filter(item => item.isAsterasys).length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalKeywords: 0,
          keywords: [],
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalKeywords++
      productBreakdown[item.product].keywords.push(item.keyword)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalKeywords: stats.totalKeywords,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalKeywords - a.totalKeywords)
    
    // Keyword analysis - find most common words
    const allWords = processedData.flatMap(item => 
      item.keyword.split(/[\s\-_]+/).filter(word => word.length > 1)
    )
    const wordFreq = {}
    allWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    
    const popularWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ word, frequency: freq }))
    
    const response = {
      success: true,
      autoCompleteData: processedData,
      summary: {
        totalKeywords,
        asterasysKeywords,
        asterasysMarketShare: totalKeywords > 0 ? ((asterasysKeywords / totalKeywords) * 100).toFixed(1) : '0.0',
        uniqueProducts: [...new Set(processedData.map(item => item.product))].length
      },
      productStats,
      popularWords
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing autocomplete data:', error)
    return NextResponse.json(
      { error: 'Failed to process autocomplete data' },
      { status: 500 }
    )
  }
}