const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/asterasys_admin_latest/data/raw/2025-09/dataset_youtube-scraper_2025-09.json', 'utf8'));

// 리프테라 영상 필터링
const lifttera = data.filter(item => item.input && item.input.includes('리프테라'));

console.log('📊 리프테라 관련 영상 총 개수:', lifttera.length);
console.log('');

// 조회수 기준 정렬 (viewCount 필드 사용)
const sorted = lifttera.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

console.log('📈 조회수 상위 11개 영상:\n');

sorted.slice(0, 11).forEach((video, index) => {
  const views = (video.viewCount || 0).toLocaleString();
  console.log(`${index + 1}. [${views}회] ${video.title}`);
  console.log(`   🔗 https://youtube.com/watch?v=${video.id}`);
  console.log(`   📺 채널: ${video.channelUsername || 'Unknown'}`);
  console.log(`   👍 좋아요: ${video.likes || 0} | 💬 댓글: ${video.commentsCount || 0}`);
  console.log('');
});

// 통계
const totalViews = sorted.reduce((sum, v) => sum + (v.viewCount || 0), 0);
const totalLikes = sorted.reduce((sum, v) => sum + (v.likes || 0), 0);
const totalComments = sorted.reduce((sum, v) => sum + (v.commentsCount || 0), 0);

console.log('📊 리프테라 전체 통계:');
console.log(`   총 조회수: ${totalViews.toLocaleString()}회`);
console.log(`   총 좋아요: ${totalLikes.toLocaleString()}개`);
console.log(`   총 댓글: ${totalComments.toLocaleString()}개`);
console.log(`   평균 조회수: ${Math.round(totalViews / sorted.length).toLocaleString()}회`);