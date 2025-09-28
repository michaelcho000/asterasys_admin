#!/usr/bin/env node

/**
 * YouTube vs Sales 정확한 1:1 매칭 및 종합 성과 지수 계산
 */

const fs = require('fs')
const path = require('path')

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const CONFIG_PATH = path.join(process.cwd(), 'config', 'latest-month.json')

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

function readLatestMonth() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const content = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    if (MONTH_REGEX.test(content?.month)) {
      return content.month
    }
  } catch (error) {
    console.warn('[SalesMatching] latest-month.json 읽기 실패:', error.message)
  }
  return null
}

function resolveMonth(requested) {
  if (!requested) return null
  if (!MONTH_REGEX.test(requested)) {
    throw new Error(`잘못된 월 형식입니다: ${requested}. YYYY-MM 형식을 사용하세요.`)
  }
  return requested
}

function ensureFile(pathToFile) {
  if (!fs.existsSync(pathToFile)) {
    throw new Error(`파일을 찾을 수 없습니다: ${pathToFile}`)
  }
  return pathToFile
}

function processExactMatching() {
    try {
        const args = parseArgs(process.argv)
        const month = resolveMonth(args.month) || readLatestMonth()

        if (!month) {
            throw new Error('월 정보를 찾을 수 없습니다. --month=YYYY-MM 형식으로 실행해 주세요.')
        }

        console.log('📊 YouTube vs Sale 데이터 정확한 매칭 분석:');
        console.log(`📅 대상 월: ${month}`)

        // YouTube 데이터 로드
        const youtubeCsvPath = path.join(process.cwd(), 'data', 'raw', 'generated', month, 'youtube_products.csv')
        const youtubeData = fs.readFileSync(ensureFile(youtubeCsvPath), 'utf8')
        const youtubeLines = youtubeData.split('\n').filter(line => line.trim());
        const youtubeProducts = youtubeLines.slice(1).map(line => {
            const values = line.split(',');
            return {
                product: values[0],
                brand: values[1],
                category: values[2],
                videos: parseInt(values[3]) || 0,
                views: parseInt(values[4]) || 0,
                likes: parseInt(values[5]) || 0,
                comments: parseInt(values[6]) || 0
            };
        });

        // Sale 데이터 로드 (수정된 파일)
        const saleCsvPath = path.join(process.cwd(), 'data', 'raw', month, 'asterasys_total_data - sale.csv')
        const saleData = fs.readFileSync(ensureFile(saleCsvPath), 'utf8')
        const saleLines = saleData.split('\n').filter(line => line.trim());
        const saleProducts = saleLines.slice(1).map(line => {
            const values = line.split(',');
            return {
                product: values[0],
                category: values[1],
                sales: parseInt(values[2]?.replace(/,/g, '') || 0)
            };
        });

        console.log('YouTube 제품 수:', youtubeProducts.length);
        console.log('Sale 제품 수:', saleProducts.length);

        // 1:1 매칭 (Sale에 있는 제품만)
        const exactMatches = [];
        saleProducts.forEach(sale => {
            const youtube = youtubeProducts.find(yt => yt.product === sale.product);
            if (youtube) {
                // YouTube 종합 성과 지수 계산
                const youtubeScore = calculateYouTubeScore(youtube);
                
                exactMatches.push({
                    product: sale.product,
                    category: sale.category === '고주파' ? 'RF' : 'HIFU',
                    sales: sale.sales,
                    youtubeVideos: youtube.videos,
                    youtubeViews: youtube.views,
                    youtubeLikes: youtube.likes,
                    youtubeComments: youtube.comments,
                    youtubeScore: youtubeScore,
                    isAsterasys: ['쿨페이즈', '리프테라', '쿨소닉'].includes(sale.product),
                    // 효율성 지수: 판매량 / YouTube 성과점수
                    efficiency: youtubeScore > 0 ? (sale.sales / youtubeScore * 100).toFixed(1) : 0
                });
            }
        });

        console.log('\n✅ 정확한 1:1 매칭 결과 (' + exactMatches.length + '개):');
        exactMatches.sort((a, b) => b.sales - a.sales).forEach((item, index) => {
            const flag = item.isAsterasys ? '⭐' : '  ';
            console.log(`${flag}${index+1}. ${item.product} (${item.category})`);
            console.log(`     판매량: ${item.sales.toLocaleString()}대`);
            console.log(`     YouTube 종합점수: ${item.youtubeScore}점`);
            console.log(`     세부: ${item.youtubeViews.toLocaleString()}회, ${item.youtubeVideos}개 영상, ${item.youtubeLikes} 좋아요, ${item.youtubeComments} 댓글`);
            console.log(`     효율성: ${item.efficiency}점 (판매량/YouTube성과)`);
        });

        console.log('\n❌ 매칭되지 않은 YouTube 제품 (Sale 데이터 없음):');
        const unmatchedYoutube = youtubeProducts.filter(yt => 
            !saleProducts.find(sale => sale.product === yt.product)
        );
        unmatchedYoutube.forEach(product => {
            console.log(`  - ${product.product}: ${product.views.toLocaleString()}회 조회`);
        });

        console.log('\n🎯 Asterasys 제품 분석:');
        const asterasysProducts = exactMatches.filter(p => p.isAsterasys);
        asterasysProducts.forEach(item => {
            const rank = exactMatches.sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency))
                .findIndex(p => p.product === item.product) + 1;
            console.log(`  ${item.product}: ${rank}위/${exactMatches.length}위 (효율성 ${item.efficiency}점)`);
        });

        // 카테고리별 데이터 구성
        const result = {
            ALL: exactMatches,
            RF: exactMatches.filter(p => p.category === 'RF'),
            HIFU: exactMatches.filter(p => p.category === 'HIFU'),
            asterasysProducts,
            summary: {
                totalMatched: exactMatches.length,
                totalUnmatched: unmatchedYoutube.length,
                asterasysCount: asterasysProducts.length,
                avgYoutubeScore: Math.round(exactMatches.reduce((sum, p) => sum + p.youtubeScore, 0) / exactMatches.length),
                totalSales: exactMatches.reduce((sum, p) => sum + p.sales, 0)
            }
        };

        // 결과 저장
        const outputPath = path.join(process.cwd(), 'data', 'processed', 'youtube', month, 'youtube_sales_exact_matching.json')
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

        console.log(`\n✅ 정확한 매칭 데이터 저장: ${path.relative(process.cwd(), outputPath)}`);
        
        return result;

    } catch (error) {
        console.error('❌ 매칭 분석 실패:', error.message);
    }
}

function calculateYouTubeScore(youtube) {
    // YouTube 종합 성과 지수 계산
    // 가중치 적용: 조회수(40%) + 영상수(25%) + 좋아요(20%) + 댓글(15%)
    
    // 로그 스케일 적용 (큰 수치 차이 정규화)
    const viewsScore = Math.log10(Math.max(youtube.views, 1)) * 40;      
    const videosScore = Math.sqrt(Math.max(youtube.videos, 1)) * 25;        
    const likesScore = Math.log10(Math.max(youtube.likes, 1)) * 20;     
    const commentsScore = Math.log10(Math.max(youtube.comments, 1)) * 15; 
    
    return Math.round(viewsScore + videosScore + likesScore + commentsScore);
}

processExactMatching();
