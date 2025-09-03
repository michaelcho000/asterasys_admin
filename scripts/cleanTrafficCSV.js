const fs = require('fs');
const path = require('path');

/**
 * traffic.csv 숫자 데이터 정리 스크립트
 * 따옴표와 쉼표를 제거하여 순수 숫자로 변환
 */

const csvPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - traffic.csv');

console.log('🔄 traffic.csv 숫자 데이터 정리 시작...');
console.log(`📁 파일 경로: ${csvPath}`);

try {
    // 파일 읽기
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('✅ 원본 파일 읽기 완료');
    
    // 숫자 필드에서 따옴표와 쉼표 제거
    // 패턴: "83,230" -> 83230, "196,470" -> 196470
    csvContent = csvContent.replace(/"(\d{1,3}(?:,\d{3})+)"/g, (match, number) => {
        return number.replace(/,/g, '');
    });
    
    console.log('🧹 숫자 데이터 정리 완료');
    console.log('   - 따옴표 제거: "196,470" → 196470');
    console.log('   - 쉼표 제거: "83,230" → 83230');
    console.log('   - 검색량: "114,390" → 114390');
    console.log('   - 월간 검색량 데이터 모두 순수 숫자로 변환');
    
    // 파일 쓰기
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    
    console.log('💾 파일 저장 완료');
    console.log('🎉 traffic.csv 숫자 데이터 정리 성공!');
    
    // 변경 사항 요약 출력
    const originalMatches = fs.readFileSync(csvPath + '.backup', 'utf8').match(/"(\d{1,3}(?:,\d{3})+)"/g);
    const cleanedContent = csvContent;
    const cleanedMatches = cleanedContent.match(/\d{4,}/g); // 4자리 이상 숫자
    
    console.log(`\n📊 변경 사항 요약:`);
    console.log(`   원본 따옴표 숫자: ${originalMatches ? originalMatches.length : 0}개`);
    console.log(`   정리된 숫자: ${cleanedMatches ? cleanedMatches.length : 0}개`);
    
    // 주요 제품들의 변경 사항 표시 (Asterasys 제품 중심)
    console.log(`\n🔍 Asterasys 제품 검색량 변경 사항:`);
    const lines = cleanedContent.split('\n');
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    
    lines.slice(1).forEach(line => {
        if (line.trim()) {
            const [keyword, group, searchVolume, rank] = line.split(',');
            if (asterasysProducts.includes(keyword)) {
                console.log(`   ${keyword} (${group}): 월간 검색량 ${searchVolume.toLocaleString()} (${rank}위)`);
            }
        }
    });
    
    // 전체 시장 1위 제품들도 표시
    console.log(`\n🏆 시장 1위 제품들:`);
    lines.slice(1).forEach(line => {
        if (line.trim()) {
            const [keyword, group, searchVolume, rank] = line.split(',');
            if (rank === '1') {
                console.log(`   ${keyword} (${group}): 월간 검색량 ${searchVolume.toLocaleString()}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}