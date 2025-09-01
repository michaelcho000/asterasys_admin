#!/usr/bin/env node

/**
 * YouTube 성과 vs 판매량 상관관계 분석 스크립트
 */

const fs = require('fs');
const path = require('path');

function analyzeCorrelation() {
    try {
        // YouTube 데이터 로드
        const youtubeData = fs.readFileSync('data/processed/youtube_products.csv', 'utf8');
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
        const saleData = fs.readFileSync('data/raw/asterasys_total_data - sale.csv', 'utf8');
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

        fs.writeFileSync('data/processed/youtube/youtube_sales_correlation.json', JSON.stringify(result, null, 2));
        console.log('\n✅ 분석 결과 저장: data/processed/youtube/youtube_sales_correlation.json');

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