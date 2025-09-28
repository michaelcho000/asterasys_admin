#!/usr/bin/env node

/**
 * YouTube 성과 vs 판매량 상관관계 분석 스크립트
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
    console.warn('[Correlation] latest-month.json 읽기 실패:', error.message)
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

function analyzeCorrelation() {
    try {
        const args = parseArgs(process.argv)
        const month = resolveMonth(args.month) || readLatestMonth()

        if (!month) {
            throw new Error('월 정보를 찾을 수 없습니다. --month=YYYY-MM 형식으로 실행해 주세요.')
        }

        console.log(`📅 대상 월: ${month}`)

        const youtubeCsvPath = path.join(process.cwd(), 'data', 'raw', 'generated', month, 'youtube_products.csv')
        const saleCsvPath = path.join(process.cwd(), 'data', 'raw', month, 'asterasys_total_data - sale.csv')

        // YouTube 데이터 로드
        const youtubeData = fs.readFileSync(ensureFile(youtubeCsvPath), 'utf8')
        const youtubeLines = youtubeData.split('\n').filter(line => line.trim());
        const youtubeProducts = youtubeLines.slice(1).map(line => {
            const values = line.split(',');
            return { 
                product: values[0], 
                brand: values[1],
                category: values[2],
                videos: parseInt(values[3]), 
                views: parseInt(values[4]),
                likes: parseInt(values[5]),
                comments: parseInt(values[6])
            };
        });

        // Sale 데이터 로드  
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

        console.log('📊 데이터 매칭 분석:');
        console.log('YouTube 제품 수:', youtubeProducts.length);
        console.log('Sale 제품 수:', saleProducts.length);

        // 매칭되는 제품 찾기
        const matchedProducts = [];
        const onlyYoutube = [];

        youtubeProducts.forEach(yt => {
            const sale = saleProducts.find(s => s.product === yt.product);
            if (sale) {
                matchedProducts.push({
                    product: yt.product,
                    category: sale.category,
                    youtubeVideos: yt.videos,
                    youtubeViews: yt.views,
                    youtubeLikes: yt.likes,
                    youtubeComments: yt.comments,
                    sales: sale.sales,
                    isAsterasys: ['쿨페이즈', '리프테라', '쿨소닉'].includes(yt.product)
                });
            } else {
                onlyYoutube.push(yt.product);
            }
        });

        console.log('\n✅ 상관관계 분석 가능 제품 (' + matchedProducts.length + '개):');
        matchedProducts.forEach((item, index) => {
            const asterasysFlag = item.isAsterasys ? '⭐' : '  ';
            console.log(`${asterasysFlag}${index + 1}. ${item.product} (${item.category}): ${item.youtubeViews.toLocaleString()}회 조회 → ${item.sales.toLocaleString()}대 판매`);
        });

        console.log('\n❌ YouTube만 있음 (판매량 미공개, 분석 제외):');
        onlyYoutube.forEach(product => console.log('  -', product));

        console.log('\n📈 Asterasys 제품 상관관계:');
        const asterasysProducts = matchedProducts.filter(p => p.isAsterasys);
        asterasysProducts.forEach(item => {
            const viewsPerSale = item.sales > 0 ? Math.round(item.youtubeViews / item.sales) : 0;
            console.log(`  ${item.product}: ${viewsPerSale.toLocaleString()}회/대 (조회수/판매량 비율)`);
        });

        // 상관관계 계수 계산 (피어슨 상관계수)
        const views = matchedProducts.map(p => p.youtubeViews);
        const sales = matchedProducts.map(p => p.sales);
        
        const correlation = calculateCorrelation(views, sales);
        console.log('\n📊 전체 시장 상관관계:');
        console.log(`피어슨 상관계수: ${correlation.toFixed(3)}`);
        console.log(`해석: ${getCorrelationInterpretation(correlation)}`);

        // 카테고리별 분석
        console.log('\n📊 카테고리별 상관관계:');
        ['고주파', '초음파'].forEach(category => {
            const categoryData = matchedProducts.filter(p => p.category === category);
            if (categoryData.length > 2) {
                const catViews = categoryData.map(p => p.youtubeViews);
                const catSales = categoryData.map(p => p.sales);
                const catCorrelation = calculateCorrelation(catViews, catSales);
                console.log(`${category}: ${catCorrelation.toFixed(3)} (${categoryData.length}개 제품)`);
            }
        });

        // 결과 저장
        const result = {
            matchedProducts,
            onlyYoutube,
            asterasysProducts,
            correlation,
            summary: {
                totalAnalyzable: matchedProducts.length,
                asterasysCount: asterasysProducts.length,
                excludedCount: onlyYoutube.length
            }
        };

        const outputPath = path.join(process.cwd(), 'data', 'processed', 'youtube', month, 'youtube_sales_correlation.json')
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
        console.log(`\n✅ 분석 결과 저장: ${path.relative(process.cwd(), outputPath)}`)

    } catch (error) {
        console.error('❌ 분석 실패:', error.message);
    }
}

function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationInterpretation(r) {
    const abs = Math.abs(r);
    if (abs >= 0.7) return '강한 상관관계';
    if (abs >= 0.5) return '보통 상관관계';
    if (abs >= 0.3) return '약한 상관관계';
    return '상관관계 없음';
}

analyzeCorrelation();
