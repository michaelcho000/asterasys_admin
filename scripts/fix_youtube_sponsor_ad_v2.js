const fs = require('fs');
const path = require('path');

// CSV 파일 경로
const csvFilePath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - youtube_sponsor ad.csv');

console.log('YouTube Sponsor Ad CSV 파일을 재수정합니다...');

try {
  // 파일 읽기
  let csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  // BOM 제거
  csvContent = csvContent.replace(/^\uFEFF/, '');
  
  // 라인별로 분할
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (i === 0) {
      // 헤더 처리
      processedLines.push('기기구분,캠페인,평균 CPV,조회수,동영상,,,,유튜브광고');
      continue;
    }
    
    // CSV 파싱을 위한 정규표현식 사용
    const csvRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
    let columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
        continue;
      }
      
      current += char;
    }
    columns.push(current.trim());
    
    // 최소 5개 컬럼이 있어야 처리
    if (columns.length < 5) continue;
    
    // 기기구분, 캠페인, 평균CPV, 조회수, 동영상 순으로 정리
    const product = columns[0] || '';
    const campaign = columns[1] || '';
    let cpv = columns[2] || '';
    let views = columns[3] || '';
    const video = columns[4] || '';
    
    // KRW 제거하고 ₩ 확인
    if (cpv === 'KRW' && columns.length > 5) {
      cpv = columns[3] || '';
      views = columns[4] || '';
    } else if (cpv.includes('KRW')) {
      cpv = cpv.replace('KRW', '').trim();
    }
    
    // 평균 CPV에 ₩ 추가
    if (cpv && !cpv.includes('₩') && cpv.match(/^\d+$/)) {
      cpv = '₩' + cpv;
    }
    
    // 조회수에서 따옴표와 콤마 제거
    views = views.replace(/^"/, '').replace(/"$/, '').replace(/,/g, '');
    
    // 결과 라인 생성
    const resultLine = [product, campaign, cpv, views, video, '', '', '', '', ''].join(',');
    processedLines.push(resultLine);
  }
  
  // 파일에 다시 쓰기
  const modifiedContent = processedLines.join('\n');
  fs.writeFileSync(csvFilePath, modifiedContent, 'utf-8');
  
  console.log('✅ YouTube Sponsor Ad CSV 파일 재수정 완료!');
  console.log(`- 총 ${processedLines.length - 1}개 데이터 행 처리`);
  console.log('- 통화 코드 컬럼 완전 제거');
  console.log('- 평균 CPV에 원화 표기(₩) 정리');
  console.log('- 조회수에서 따옴표와 콤마 완전 제거');
  
} catch (error) {
  console.error('❌ 파일 수정 중 오류 발생:', error.message);
}