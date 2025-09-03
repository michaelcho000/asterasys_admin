const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * news analysis.csv의 total_articles를 news_rank.csv에 매칭하여 업데이트
 * 발행량 순위도 재계산
 */

const newsRankPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - news_rank.csv');
const newsAnalysisPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - news analysis.csv');

console.log('🔄 뉴스 데이터 동기화 시작...');
console.log(`📁 news_rank 파일: ${newsRankPath}`);
console.log(`📁 news_analysis 파일: ${newsAnalysisPath}`);

try {
    // news_rank.csv 읽기
    let newsRankContent = fs.readFileSync(newsRankPath, 'utf8');
    const newsRankRecords = parse(newsRankContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
    
    // news analysis.csv 읽기 (문제가 있는 행 처리)
    const newsAnalysisContent = fs.readFileSync(newsAnalysisPath, 'utf8');
    const cleanAnalysisContent = newsAnalysisContent.replace(/^\uFEFF/, ''); // BOM 제거
    const newsAnalysisRecords = parse(cleanAnalysisContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,  // 컬럼 수 불일치 허용
        skip_records_with_error: true  // 오류가 있는 레코드 건너뛰기
    });
    
    console.log('✅ 파일 읽기 완료');
    console.log(`   news_rank 제품 수: ${newsRankRecords.length}개`);
    console.log(`   news_analysis 제품 수: ${newsAnalysisRecords.length}개`);
    
    // news analysis 데이터를 키-값 매핑으로 변환 (유효한 데이터만)
    const analysisMap = {};
    newsAnalysisRecords.forEach(record => {
        if (record.product_name && record.total_articles && record.product_name.length > 0) {
            let articles = record.total_articles;
            // "100+" 형태 처리
            if (typeof articles === 'string' && articles.includes('+')) {
                articles = articles.replace('+', '');
            }
            // 숫자로 변환 가능한 경우만 매핑에 포함
            const parsedArticles = parseInt(articles);
            if (!isNaN(parsedArticles)) {
                analysisMap[record.product_name] = parsedArticles;
            }
        }
    });
    
    console.log('\n📊 news analysis 데이터 매핑:');
    Object.entries(analysisMap).forEach(([product, articles]) => {
        console.log(`   ${product}: ${articles}건`);
    });
    
    // news_rank 데이터 업데이트
    let updateCount = 0;
    let noMatchCount = 0;
    
    console.log('\n🔄 데이터 업데이트:');
    const updatedRecords = newsRankRecords.map(record => {
        const productName = record['키워드'];
        if (analysisMap[productName] !== undefined) {
            const oldValue = record['총 발행량'];
            const newValue = analysisMap[productName];
            record['총 발행량'] = newValue;
            updateCount++;
            
            console.log(`   ${productName}: ${oldValue} → ${newValue}`);
            return record;
        } else {
            noMatchCount++;
            console.log(`   ${productName}: 매칭 데이터 없음 (기존값 ${record['총 발행량']} 유지)`);
            return record;
        }
    });
    
    console.log(`\n🔄 매칭 결과:`);
    console.log(`   업데이트된 제품: ${updateCount}개`);
    console.log(`   매칭되지 않은 제품: ${noMatchCount}개`);
    
    // 발행량 기준으로 순위 재계산
    console.log('\n📈 발행량 순위 재계산 중...');
    
    // RF와 HIFU 제품 분리
    const rfProducts = [];
    const hifuProducts = [];
    
    updatedRecords.forEach(record => {
        const group = record['그룹'];
        if (group === '고주파') {
            rfProducts.push(record);
        } else if (group === '초음파') {
            hifuProducts.push(record);
        }
    });
    
    // 각 그룹별로 발행량 기준 내림차순 정렬 후 순위 부여
    rfProducts.sort((a, b) => parseInt(b['총 발행량']) - parseInt(a['총 발행량']));
    hifuProducts.sort((a, b) => parseInt(b['총 발행량']) - parseInt(a['총 발행량']));
    
    rfProducts.forEach((record, index) => {
        record['발행량 순위'] = index + 1;
    });
    
    hifuProducts.forEach((record, index) => {
        record['발행량 순위'] = index + 1;
    });
    
    // 최종 레코드 병합 (원래 순서 유지)
    const finalRecords = [...rfProducts, ...hifuProducts];
    
    console.log('\n🏆 RF 제품 순위 (전체):');
    rfProducts.forEach(record => {
        const isAsterasys = record['키워드'] === '쿨페이즈' ? '⭐' : '';
        console.log(`   ${record['발행량 순위']}위: ${record['키워드']} (${record['총 발행량']}건) ${isAsterasys}`);
    });
    
    console.log('\n🏆 HIFU 제품 순위 (전체):');
    hifuProducts.forEach(record => {
        const isAsterasys = ['쿨소닉', '리프테라'].includes(record['키워드']) ? '⭐' : '';
        console.log(`   ${record['발행량 순위']}위: ${record['키워드']} (${record['총 발행량']}건) ${isAsterasys}`);
    });
    
    // Asterasys 제품 순위 확인
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    console.log('\n⭐ Asterasys 제품 순위 요약:');
    finalRecords.forEach(record => {
        if (asterasysProducts.includes(record['키워드'])) {
            console.log(`   ${record['키워드']} (${record['그룹']}): ${record['발행량 순위']}위 (${record['총 발행량']}건)`);
        }
    });
    
    // CSV 파일로 저장
    const headers = Object.keys(finalRecords[0]);
    const csvOutput = [
        headers.join(','),
        ...finalRecords.map(record => 
            headers.map(header => record[header]).join(',')
        )
    ].join('\n');
    
    fs.writeFileSync(newsRankPath, csvOutput, 'utf8');
    
    console.log('\n💾 파일 저장 완료');
    console.log('🎉 뉴스 데이터 동기화 성공!');
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}