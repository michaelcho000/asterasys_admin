const fs = require('fs');
const path = require('path');

/**
 * news analysis.csv에서 울쎄라 데이터 업데이트
 * total_articles: 198개
 * 카테고리별 개수와 비율 계산 및 수정
 */

const csvPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - news analysis.csv');

console.log('🔄 울쎄라 뉴스 데이터 업데이트 시작...');
console.log(`📁 파일 경로: ${csvPath}`);

try {
    // 파일 읽기
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('✅ 원본 파일 읽기 완료');
    
    // 새로운 울쎄라 카테고리 데이터
    const newCategories = {
        total_articles: 198,
        기업소식: 42,
        병원발행: 144,
        연예인: 10,
        투자주식: 0, // 투자·주식으로 표기될 수 있음
        고객반응: 0,
        기술자료: 0,
        의학: 2,
        기타: 0
    };
    
    // 총합 검증
    const categorySum = newCategories.기업소식 + newCategories.병원발행 + 
                      newCategories.연예인 + newCategories.투자주식 + 
                      newCategories.고객반응 + newCategories.기술자료 + 
                      newCategories.의학 + newCategories.기타;
    
    console.log('📊 새로운 울쎄라 카테고리 데이터:');
    console.log(`   총 기사 수: ${newCategories.total_articles}건`);
    console.log(`   기업소식: ${newCategories.기업소식}건 (${(newCategories.기업소식/newCategories.total_articles*100).toFixed(1)}%)`);
    console.log(`   병원발행: ${newCategories.병원발행}건 (${(newCategories.병원발행/newCategories.total_articles*100).toFixed(1)}%)`);
    console.log(`   연예인: ${newCategories.연예인}건 (${(newCategories.연예인/newCategories.total_articles*100).toFixed(1)}%)`);
    console.log(`   의학: ${newCategories.의학}건 (${(newCategories.의학/newCategories.total_articles*100).toFixed(1)}%)`);
    console.log(`   카테고리 합계: ${categorySum}건`);
    
    if (categorySum !== newCategories.total_articles) {
        console.warn(`⚠️ 카테고리 합계(${categorySum})와 총 기사수(${newCategories.total_articles})가 일치하지 않습니다!`);
    }
    
    // 울쎄라 행 찾기 및 교체
    const lines = csvContent.split('\n');
    let ultheraLineFound = false;
    
    const updatedLines = lines.map(line => {
        if (line.startsWith('울쎄라,')) {
            ultheraLineFound = true;
            console.log('\n🔍 기존 울쎄라 데이터:');
            console.log(`   ${line.substring(0, 100)}...`);
            
            // 새로운 울쎄라 데이터 행 생성
            const newUltheraLine = [
                '울쎄라',
                '198', // total_articles
                '2025-08-12 ~ 2025-09-02', // analysis_period (기존 유지)
                (newCategories.total_articles / 31).toFixed(1), // avg_daily_articles (8월 31일 기준)
                '19', // max_daily_articles (기존 유지)
                '병원발행', // dominant_category (병원발행이 144건으로 최대)
                (newCategories.병원발행/newCategories.total_articles*100).toFixed(1), // dominant_percentage
                (newCategories.기업소식/newCategories.total_articles*100).toFixed(1), // category_기업소식
                (newCategories.병원발행/newCategories.total_articles*100).toFixed(1), // category_병원발행
                (newCategories.연예인/newCategories.total_articles*100).toFixed(1), // category_연예인
                (newCategories.투자주식/newCategories.total_articles*100).toFixed(1), // category_투자·주식
                (newCategories.고객반응/newCategories.total_articles*100).toFixed(1), // category_고객반응
                (newCategories.기술자료/newCategories.total_articles*100).toFixed(1), // category_기술자료
                (newCategories.의학/newCategories.total_articles*100).toFixed(1), // category_의학
                (newCategories.기타/newCategories.total_articles*100).toFixed(1), // category_기타
                'MEDIUM', // campaign_intensity (기존 유지)
                '0.6', // campaign_score (기존 유지)
                '1', // spike_dates_count (기존 유지)
                '2025-09-01', // peak_date (기존 유지)
                '19', // peak_articles (기존 유지)
                '12', // number_promotion_articles (기존 유지)
                '8', // unique_numbers_count (기존 유지)
                '전지현(18); 이민호(18); 김태희(2)', // celebrity_usage (기존 유지)
                '49', // marketing_keyword_score (기존 유지)
                '6', // competitor_mentions_count (기존 유지)
                '울쎄라', // top_competitor_mentioned (기존 유지)
                '울쎄라(142); 써마지(48); 인모드(9); 슈링크(16); 볼뉴머(3); 올리지오(3)' // competitor_mentions_detail (기존 유지)
            ].join(',');
            
            console.log('\n✏️ 새로운 울쎄라 데이터:');
            console.log(`   총 기사수: 100+ → 198`);
            console.log(`   일평균: 5.0 → ${(newCategories.total_articles / 31).toFixed(1)}건/일`);
            console.log(`   주요 카테고리: 병원발행 ${(newCategories.병원발행/newCategories.total_articles*100).toFixed(1)}%`);
            
            return newUltheraLine;
        }
        return line;
    });
    
    if (!ultheraLineFound) {
        console.error('❌ 울쎄라 데이터를 찾을 수 없습니다!');
        process.exit(1);
    }
    
    // 파일 쓰기
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(csvPath, updatedContent, 'utf8');
    
    console.log('\n💾 파일 저장 완료');
    console.log('🎉 울쎄라 뉴스 데이터 업데이트 성공!');
    
    // 업데이트 후 검증
    console.log('\n🔍 업데이트 검증:');
    console.log(`   총 198건 = 기업소식(42) + 병원발행(144) + 연예인(10) + 의학(2) = ${42+144+10+2}건`);
    console.log(`   주요 카테고리: 병원발행 (72.7%)`);
    console.log(`   일평균: ${(198/31).toFixed(1)}건/일`);
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}