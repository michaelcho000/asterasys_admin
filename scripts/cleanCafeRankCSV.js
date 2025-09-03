const fs = require('fs');
const path = require('path');

/**
 * cafe_rank.csv 숫자 데이터 정리 스크립트
 * 따옴표와 쉼표를 제거하여 순수 숫자로 변환
 */

const csvPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - cafe_rank.csv');

console.log('🔄 cafe_rank.csv 숫자 데이터 정리 시작...');
console.log(`📁 파일 경로: ${csvPath}`);

try {
    // 파일 읽기
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('✅ 원본 파일 읽기 완료');
    
    // 숫자 필드에서 따옴표와 쉼표 제거
    // 패턴: "7,357" -> 7357, "99,041" -> 99041
    csvContent = csvContent.replace(/"(\d{1,3}(?:,\d{3})+)"/g, (match, number) => {
        return number.replace(/,/g, '');
    });
    
    console.log('🧹 숫자 데이터 정리 완료');
    console.log('   - 따옴표 제거: "7,357" → 7357');
    console.log('   - 쉼표 제거: "99,041" → 99041');
    console.log('   - 발행량: "1,258" → 1258');
    console.log('   - 댓글수: "3,866" → 3866');
    console.log('   - 조회수: "58,850" → 58850');
    
    // 파일 쓰기
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    
    console.log('💾 파일 저장 완료');
    console.log('🎉 cafe_rank.csv 숫자 데이터 정리 성공!');
    
    // 변경 사항 요약 출력
    const originalMatches = fs.readFileSync(csvPath + '.backup', 'utf8').match(/"(\d{1,3}(?:,\d{3})+)"/g);
    const cleanedContent = csvContent;
    const cleanedMatches = cleanedContent.match(/\d{4,}/g); // 4자리 이상 숫자
    
    console.log(`\n📊 변경 사항 요약:`);
    console.log(`   원본 따옴표 숫자: ${originalMatches ? originalMatches.length : 0}개`);
    console.log(`   정리된 숫자: ${cleanedMatches ? cleanedMatches.length : 0}개`);
    
    // 주요 제품들의 변경 사항 표시
    console.log(`\n🔍 주요 제품 변경 사항:`);
    const lines = cleanedContent.split('\n');
    lines.slice(1, 6).forEach(line => {
        if (line.trim()) {
            const [keyword, group, posts, comments] = line.split(',');
            console.log(`   ${keyword}: 발행량 ${posts}, 댓글 ${comments}`);
        }
    });
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}