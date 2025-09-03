const fs = require('fs');
const path = require('path');

/**
 * CSV 숫자 데이터 정리 스크립트
 * 따옴표와 쉼표를 제거하여 순수 숫자로 변환
 */

const csvPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - blog_rank.csv');

console.log('🔄 CSV 숫자 데이터 정리 시작...');
console.log(`📁 파일 경로: ${csvPath}`);

try {
    // 파일 읽기
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('✅ 원본 파일 읽기 완료');
    
    // 숫자 필드에서 따옴표와 쉼표 제거
    // 패턴: "1,234" -> 1234, "2,345" -> 2345
    csvContent = csvContent.replace(/"(\d{1,3}(?:,\d{3})+)"/g, (match, number) => {
        return number.replace(/,/g, '');
    });
    
    // 단순 쉼표가 있는 숫자도 처리 (따옴표 없이)
    // 패턴: 1,234 -> 1234 (CSV 필드 구분자와 혼동되지 않도록 주의)
    // 이 경우는 이미 따옴표로 감싸져 있어서 위 패턴으로 처리됨
    
    console.log('🧹 숫자 데이터 정리 완료');
    console.log('   - 따옴표 제거: "8,904" → 8904');
    console.log('   - 쉼표 제거: "1,698" → 1698');
    
    // 파일 쓰기
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    
    console.log('💾 파일 저장 완료');
    console.log('🎉 CSV 숫자 데이터 정리 성공!');
    
    // 변경 사항 요약 출력
    const originalMatches = fs.readFileSync(csvPath + '.backup', 'utf8').match(/"(\d{1,3}(?:,\d{3})+)"/g);
    const cleanedMatches = csvContent.match(/\d{4,}/g); // 4자리 이상 숫자
    
    console.log(`\n📊 변경 사항 요약:`);
    console.log(`   원본 따옴표 숫자: ${originalMatches ? originalMatches.length : 0}개`);
    console.log(`   정리된 숫자: ${cleanedMatches ? cleanedMatches.length : 0}개`);
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}