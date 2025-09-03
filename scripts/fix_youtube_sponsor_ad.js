const fs = require('fs');
const path = require('path');

// CSV 파일 경로
const csvFilePath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - youtube_sponsor ad.csv');

console.log('YouTube Sponsor Ad CSV 파일을 수정합니다...');

try {
  // 파일 읽기
  let csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  // BOM 제거
  csvContent = csvContent.replace(/^\uFEFF/, '');
  
  // 라인별로 분할
  const lines = csvContent.split('\n');
  
  // 첫 번째 라인 (헤더) 수정 - 통화 코드 컬럼 제거
  if (lines[0]) {
    lines[0] = lines[0].replace('기기구분,캠페인,통화 코드,평균 CPV,조회수,동영상,,,,유튜브광고', 
                               '기기구분,캠페인,평균 CPV,조회수,동영상,,,,유튜브광고');
  }
  
  // 각 데이터 라인 처리
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const columns = lines[i].split(',');
    
    // 데이터가 충분하지 않으면 건너뛰기
    if (columns.length < 6) continue;
    
    // 통화 코드 컬럼 제거 (3번째 인덱스)
    if (columns[2] === 'KRW') {
      columns.splice(2, 1);
    }
    
    // 평균 CPV에서 ₩ 기호가 없으면 추가
    if (columns[2] && !columns[2].includes('₩') && columns[2].match(/^\d+$/)) {
      columns[2] = '₩' + columns[2];
    }
    
    // 조회수 처리 - 따옴표와 콤마 제거
    if (columns[3]) {
      columns[3] = columns[3]
        .replace(/^"/, '')      // 시작 따옴표 제거
        .replace(/"$/, '')      // 끝 따옴표 제거
        .replace(/,/g, '');     // 콤마 제거
    }
    
    // 수정된 라인으로 교체
    lines[i] = columns.join(',');
  }
  
  // 파일에 다시 쓰기
  const modifiedContent = lines.join('\n');
  fs.writeFileSync(csvFilePath, modifiedContent, 'utf-8');
  
  console.log('✅ YouTube Sponsor Ad CSV 파일 수정 완료!');
  console.log('- 통화 코드 컬럼 제거');
  console.log('- 평균 CPV에 원화 표기(₩) 유지');
  console.log('- 조회수에서 따옴표와 콤마 제거');
  
} catch (error) {
  console.error('❌ 파일 수정 중 오류 발생:', error.message);
}