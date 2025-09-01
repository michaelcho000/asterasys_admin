#!/usr/bin/env node

/**
 * Asterasys 제품별 상위 채널 추출 스크립트
 */

const fs = require('fs');
const path = require('path');

function extractAsterasysChannels() {
    try {
        const data = JSON.parse(fs.readFileSync('data/raw/dataset_youtube-scraper_2025-08-28_09-52-54-390.json', 'utf8'));
        
        const asterasysProducts = ['쿨소닉', '쿨페이즈', '리프테라'];
        const results = {};

        asterasysProducts.forEach(product => {
            console.log(`\n📊 ${product} 상위 5개 채널:`);
            
            const productVideos = data.filter(v => v.input?.trim() === product);
            
            // 채널별 그룹핑하고 조회수 합계 계산
            const channelStats = {};
            productVideos.forEach(video => {
                const channelName = video.channelName;
                if (!channelStats[channelName]) {
                    channelStats[channelName] = {
                        channelName,
                        channelUrl: video.channelUrl,
                        channelId: video.channelId,
                        videos: [],
                        totalViews: 0,
                        totalLikes: 0,
                        totalComments: 0
                    };
                }
                
                channelStats[channelName].videos.push({
                    title: video.title,
                    url: video.url,
                    views: parseInt(video.viewCount) || 0,
                    likes: parseInt(video.likes) || 0,
                    comments: parseInt(video.commentsCount) || 0,
                    type: video.type,
                    date: video.date
                });
                
                channelStats[channelName].totalViews += parseInt(video.viewCount) || 0;
                channelStats[channelName].totalLikes += parseInt(video.likes) || 0;
                channelStats[channelName].totalComments += parseInt(video.commentsCount) || 0;
            });
            
            // 상위 5개 채널 선택 (총 조회수 기준)
            const topChannels = Object.values(channelStats)
                .sort((a, b) => b.totalViews - a.totalViews)
                .slice(0, 5);
            
            topChannels.forEach((channel, index) => {
                console.log(`  ${index + 1}. ${channel.channelName}`);
                console.log(`     조회수: ${channel.totalViews.toLocaleString()}회 (${channel.videos.length}개 비디오)`);
                console.log(`     URL: ${channel.channelUrl}`);
                
                // 가장 성과가 좋은 비디오
                const bestVideo = channel.videos.sort((a, b) => b.views - a.views)[0];
                console.log(`     대표 영상: ${bestVideo.title.substring(0, 50)}...`);
                console.log(`     대표 영상 조회수: ${bestVideo.views.toLocaleString()}회`);
            });
            
            // 전체 통계
            const totalVideos = productVideos.length;
            const totalViews = productVideos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0);
            const totalLikes = productVideos.reduce((sum, v) => sum + (parseInt(v.likes) || 0), 0);
            const totalComments = productVideos.reduce((sum, v) => sum + (parseInt(v.commentsCount) || 0), 0);
            const shortsCount = productVideos.filter(v => v.type === 'shorts').length;
            const regularCount = totalVideos - shortsCount;
            const shortsRatio = totalVideos > 0 ? (shortsCount / totalVideos * 100).toFixed(1) : 0;
            
            console.log(`\n📈 ${product} 전체 통계:`);
            console.log(`  총 비디오: ${totalVideos}개`);
            console.log(`  총 조회수: ${totalViews.toLocaleString()}회`);
            console.log(`  총 좋아요: ${totalLikes.toLocaleString()}개`);
            console.log(`  총 댓글: ${totalComments.toLocaleString()}개`);
            console.log(`  Shorts: ${shortsCount}개 (${shortsRatio}%) / 일반: ${regularCount}개`);
            
            // 결과 저장
            results[product] = {
                totalStats: {
                    totalVideos,
                    totalViews,
                    totalLikes,
                    totalComments,
                    shortsCount,
                    regularCount,
                    shortsRatio: parseFloat(shortsRatio)
                },
                topChannels: topChannels.map(channel => ({
                    channelName: channel.channelName,
                    channelUrl: channel.channelUrl,
                    channelId: channel.channelId,
                    totalViews: channel.totalViews,
                    videoCount: channel.videos.length,
                    bestVideo: channel.videos.sort((a, b) => b.views - a.views)[0]
                }))
            };
        });

        // JSON 파일로 저장
        const outputPath = 'data/processed/youtube/asterasys_channels_data.json';
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        
        console.log(`\n✅ 데이터 저장 완료: ${outputPath}`);
        
        return results;
        
    } catch (error) {
        console.error('❌ 채널 데이터 추출 실패:', error.message);
    }
}

extractAsterasysChannels();