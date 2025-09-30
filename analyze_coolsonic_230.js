console.log('쿨소닉 230개 발행량 출처 분석\n');
console.log('='.repeat(60));

const sources = [
  { name: 'blog_rank (병원블로그)', value: 20 },
  { name: 'cafe_rank (카페 발행량)', value: 605 },
  { name: 'news_rank (뉴스 발행량)', value: 12 },
  { name: 'youtube_rank (유튜브 발행량)', value: 230 },
  { name: 'youtube_products (실제 영상)', value: 7 },
];

console.log('\n📊 각 채널별 쿨소닉 데이터:');
sources.forEach(s => {
  console.log(`${s.name.padEnd(35)} ${String(s.value).padStart(5)}개`);
});

console.log('\n🔍 youtube_rank 230개 구성 추정:');
console.log('- YouTube 스크래퍼 JSON: 7개 (실제 영상)');
console.log('- 나머지 223개: ???');

console.log('\n💡 가능성 있는 출처:');
console.log('1. 네이버 블로그 YouTube 임베드 포스팅');
console.log('2. 카페에서 YouTube 링크 공유');
console.log('3. YouTube 외부 언급량 (블로그/카페/커뮤니티)');
console.log('4. YouTube 키워드 검색량 추정치');
console.log('5. 수동 집계 데이터');
