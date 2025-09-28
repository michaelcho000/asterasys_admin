#!/usr/bin/env python3
"""
YouTube 데이터 처리 스크립트 - Asterasys 대시보드용
처리: JSON → CSV → 분석 데이터 생성
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
from collections import Counter
import re
from pathlib import Path

class YouTubeDataProcessor:
    def __init__(self, json_file_path):
        self.json_file_path = json_file_path
        self.output_dir = Path('data/raw/generated/youtube')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Asterasys 제품 키워드 (기존 CSV 데이터와 일치)
        self.asterasys_products = ['쿨페이즈', '리프테라', '쿨소닉']
        
        # RF/HIFU 의료기기 전체 키워드 매핑
        self.device_mapping = {
            # RF 기기들
            '써마지': {'category': 'RF', 'rank': 1, 'company': '썸'},
            '인모드': {'category': 'RF', 'rank': 2, 'company': '인바이오'},
            '쿨페이즈': {'category': 'RF', 'rank': 3, 'company': 'Asterasys'},  # ⭐ Asterasys
            '덴서티': {'category': 'RF', 'rank': 4, 'company': '칸델라'},
            '올리지오': {'category': 'RF', 'rank': 5, 'company': '엘렉타'},
            '튜페이스': {'category': 'RF', 'rank': 6, 'company': '알마'},
            '세르프': {'category': 'RF', 'rank': 7, 'company': '클레시스'},
            '텐써마': {'category': 'RF', 'rank': 8, 'company': '휴온스'},
            '볼뉴머': {'category': 'RF', 'rank': 9, 'company': '클래시테크'},
            
            # HIFU 기기들  
            '울쎄라': {'category': 'HIFU', 'rank': 1, 'company': '머츠'},
            '슈링크': {'category': 'HIFU', 'rank': 2, 'company': '허쉬메드'},
            '쿨소닉': {'category': 'HIFU', 'rank': 3, 'company': 'Asterasys'},   # ⭐ Asterasys
            '리프테라': {'category': 'HIFU', 'rank': 4, 'company': 'Asterasys'}, # ⭐ Asterasys
            '리니어지': {'category': 'HIFU', 'rank': 5, 'company': '클래시테크'},
            '브이로': {'category': 'HIFU', 'rank': 6, 'company': '클래시테크'},
            '텐쎄라': {'category': 'HIFU', 'rank': 7, 'company': '휴온스'},
            '튠라이너': {'category': 'HIFU', 'rank': 8, 'company': '알마'},
            '리니어펌': {'category': 'HIFU', 'rank': 9, 'company': '클래시테크'}
        }
    
    def load_data(self):
        """JSON 파일 로드"""
        print(f"Loading YouTube data from {self.json_file_path}")
        with open(self.json_file_path, 'r', encoding='utf-8') as f:
            self.raw_data = json.load(f)
        print(f"Loaded {len(self.raw_data):,} YouTube videos")
        return self
    
    def create_dataframe(self):
        """pandas DataFrame 생성 및 기본 전처리"""
        print("Creating pandas DataFrame...")
        
        # 기본 DataFrame 생성
        self.df = pd.DataFrame(self.raw_data)
        
        # 날짜 변환
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df['date_str'] = self.df['date'].dt.strftime('%Y-%m-%d')
        
        # 숫자 컬럼 정리
        numeric_cols = ['viewCount', 'likes', 'numberOfSubscribers', 'commentsCount']
        for col in numeric_cols:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)
        
        # Duration을 초 단위로 변환
        self.df['duration_seconds'] = self.df['duration'].apply(self._duration_to_seconds)
        
        # 제품 분류 추가
        self.df['device_name'] = self.df['input'].str.strip()
        self.df['device_info'] = self.df['device_name'].map(self.device_mapping)
        self.df['device_category'] = self.df['device_info'].apply(lambda x: x['category'] if x else 'Unknown')
        self.df['device_rank'] = self.df['device_info'].apply(lambda x: x['rank'] if x else 999)
        self.df['device_company'] = self.df['device_info'].apply(lambda x: x['company'] if x else 'Unknown')
        
        # Asterasys 제품 여부
        self.df['is_asterasys'] = self.df['device_company'] == 'Asterasys'
        
        print(f"DataFrame created: {len(self.df):,} rows × {len(self.df.columns)} columns")
        return self
    
    def _duration_to_seconds(self, duration_str):
        """Duration 문자열을 초 단위로 변환"""
        if not duration_str or pd.isna(duration_str):
            return 0
        try:
            # HH:MM:SS 또는 MM:SS 형식 처리
            parts = duration_str.split(':')
            if len(parts) == 3:  # HH:MM:SS
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            elif len(parts) == 2:  # MM:SS
                return int(parts[0]) * 60 + int(parts[1])
            return 0
        except:
            return 0
    
    def analyze_market_share(self):
        """시장 점유율 분석 (Asterasys vs 경쟁사)"""
        print("Analyzing market share...")
        
        # 전체 비디오 수 기준 점유율
        video_counts = self.df['device_name'].value_counts()
        total_videos = len(self.df)
        
        # 조회수 기준 점유율  
        view_counts = self.df.groupby('device_name')['viewCount'].sum()
        total_views = self.df['viewCount'].sum()
        
        # 채널 수 기준 점유율
        channel_counts = self.df.groupby('device_name')['channelName'].nunique()
        
        market_share = pd.DataFrame({
            'device_name': video_counts.index,
            'video_count': video_counts.values,
            'video_share_pct': (video_counts / total_videos * 100).round(2),
            'total_views': view_counts.reindex(video_counts.index, fill_value=0).values,
            'view_share_pct': (view_counts.reindex(video_counts.index, fill_value=0) / total_views * 100).round(2),
            'unique_channels': channel_counts.reindex(video_counts.index, fill_value=0).values
        }).reset_index(drop=True)
        
        # 기기 정보 추가
        market_share = market_share.merge(
            pd.DataFrame([(k, v['category'], v['rank'], v['company']) 
                         for k, v in self.device_mapping.items()],
                        columns=['device_name', 'category', 'market_rank', 'company']),
            on='device_name', how='left'
        )
        
        # Asterasys 마킹
        market_share['is_asterasys'] = market_share['company'] == 'Asterasys'
        
        self.market_share_df = market_share.sort_values('video_count', ascending=False)
        print(f"Market share analysis completed for {len(market_share)} devices")
        return self
    
    def analyze_content_trends(self):
        """콘텐츠 트렌드 분석"""
        print("Analyzing content trends...")
        
        # 월별 트렌드
        monthly_trends = self.df.groupby(['device_name', self.df['date'].dt.to_period('M')]).agg({
            'viewCount': 'sum',
            'likes': 'sum', 
            'commentsCount': 'sum',
            'id': 'count'
        }).rename(columns={'id': 'video_count'}).reset_index()
        monthly_trends['month'] = monthly_trends['date'].astype(str)
        
        # 비디오 타입별 분석
        type_analysis = self.df.groupby(['device_name', 'type']).agg({
            'viewCount': ['count', 'sum', 'mean'],
            'likes': 'sum',
            'commentsCount': 'sum'
        }).reset_index()
        
        # 컬럼명 정리
        type_analysis.columns = ['device_name', 'video_type', 'video_count', 'total_views', 'avg_views', 'total_likes', 'total_comments']
        
        self.monthly_trends_df = monthly_trends
        self.type_analysis_df = type_analysis
        print("Content trends analysis completed")
        return self
    
    def analyze_channel_performance(self):
        """채널 성과 분석"""
        print("Analyzing channel performance...")
        
        channel_stats = self.df.groupby(['channelName', 'device_name']).agg({
            'viewCount': ['count', 'sum', 'mean'],
            'likes': 'sum',
            'commentsCount': 'sum', 
            'numberOfSubscribers': 'first'
        }).reset_index()
        
        # 컬럼명 정리
        channel_stats.columns = ['channel_name', 'device_name', 'video_count', 'total_views', 
                                'avg_views', 'total_likes', 'total_comments', 'subscribers']
        
        # 참여도 계산 (likes + comments) / views * 100
        channel_stats['engagement_rate'] = np.where(
            channel_stats['total_views'] > 0,
            (channel_stats['total_likes'] + channel_stats['total_comments']) / channel_stats['total_views'] * 100,
            0
        ).round(2)
        
        # 기기 정보 추가
        channel_stats = channel_stats.merge(
            pd.DataFrame([(k, v['company']) for k, v in self.device_mapping.items()],
                        columns=['device_name', 'company']),
            on='device_name', how='left'
        )
        
        self.channel_performance_df = channel_stats.sort_values('total_views', ascending=False)
        print(f"Channel performance analysis completed for {len(channel_stats)} unique channels")
        return self
    
    def generate_asterasys_insights(self):
        """Asterasys 전용 인사이트 생성"""
        print("Generating Asterasys-specific insights...")
        
        asterasys_df = self.df[self.df['is_asterasys']].copy()
        competitors_df = self.df[~self.df['is_asterasys']].copy()
        
        insights = {
            'summary': {
                'asterasys_videos': len(asterasys_df),
                'asterasys_total_views': asterasys_df['viewCount'].sum(),
                'asterasys_avg_views': asterasys_df['viewCount'].mean(),
                'market_video_share_pct': (len(asterasys_df) / len(self.df) * 100).round(2),
                'market_view_share_pct': (asterasys_df['viewCount'].sum() / self.df['viewCount'].sum() * 100).round(2)
            },
            'product_performance': asterasys_df.groupby('device_name').agg({
                'viewCount': ['count', 'sum', 'mean'],
                'likes': 'sum',
                'commentsCount': 'sum'
            }).to_dict(),
            'top_asterasys_channels': self.channel_performance_df[
                self.channel_performance_df['company'] == 'Asterasys'
            ].head(10).to_dict('records'),
            'competitor_benchmark': {
                'top_competitor_video_count': competitors_df['device_name'].value_counts().head(5).to_dict(),
                'top_competitor_views': competitors_df.groupby('device_name')['viewCount'].sum().nlargest(5).to_dict()
            }
        }
        
        self.asterasys_insights = insights
        print("Asterasys insights generated")
        return self
    
    def save_processed_data(self):
        """처리된 데이터 저장"""
        print("Saving processed data...")
        
        # CSV 파일 저장
        self.market_share_df.to_csv(self.output_dir / 'youtube_market_share.csv', index=False, encoding='utf-8-sig')
        self.monthly_trends_df.to_csv(self.output_dir / 'youtube_monthly_trends.csv', index=False, encoding='utf-8-sig')
        self.type_analysis_df.to_csv(self.output_dir / 'youtube_type_analysis.csv', index=False, encoding='utf-8-sig')
        self.channel_performance_df.to_csv(self.output_dir / 'youtube_channel_performance.csv', index=False, encoding='utf-8-sig')
        
        # JSON 인사이트 저장
        with open(self.output_dir / 'asterasys_youtube_insights.json', 'w', encoding='utf-8') as f:
            json.dump(self.asterasys_insights, f, ensure_ascii=False, indent=2, default=str)
        
        # 대시보드용 요약 데이터
        dashboard_summary = {
            'market_overview': {
                'total_videos': len(self.df),
                'total_views': int(self.df['viewCount'].sum()),
                'unique_channels': self.df['channelName'].nunique(),
                'asterasys_market_share': {
                    'video_share_pct': self.asterasys_insights['summary']['market_video_share_pct'],
                    'view_share_pct': self.asterasys_insights['summary']['market_view_share_pct']
                }
            },
            'top_devices': self.market_share_df.head(10).to_dict('records'),
            'asterasys_performance': {
                'total_videos': self.asterasys_insights['summary']['asterasys_videos'],
                'total_views': self.asterasys_insights['summary']['asterasys_total_views'],
                'avg_views': round(self.asterasys_insights['summary']['asterasys_avg_views'], 0)
            }
        }
        
        with open(self.output_dir / 'youtube_dashboard_summary.json', 'w', encoding='utf-8') as f:
            json.dump(dashboard_summary, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"Processed data saved to: {self.output_dir}")
        print("Files generated:")
        print("  - youtube_market_share.csv")
        print("  - youtube_monthly_trends.csv") 
        print("  - youtube_type_analysis.csv")
        print("  - youtube_channel_performance.csv")
        print("  - asterasys_youtube_insights.json")
        print("  - youtube_dashboard_summary.json")
        return self
    
    def process_all(self):
        """전체 처리 파이프라인 실행"""
        return (self.load_data()
                   .create_dataframe()
                   .analyze_market_share()
                   .analyze_content_trends()
                   .analyze_channel_performance()
                   .generate_asterasys_insights()
                   .save_processed_data())

def main():
    processor = YouTubeDataProcessor('data/raw/dataset_youtube-scraper_2025-08-28_09-52-54-390.json')
    result = processor.process_all()
    
    print("\n" + "="*50)
    print("🎉 YouTube 데이터 처리 완료!")
    print("="*50)
    print(f"📊 총 {len(processor.df):,}개 비디오 분석")
    print(f"🏥 {len(processor.device_mapping)}개 의료기기 브랜드")
    print(f"⭐ Asterasys 시장 점유율: {processor.asterasys_insights['summary']['market_video_share_pct']}% (비디오 수)")
    print(f"👁️ Asterasys 조회수 점유율: {processor.asterasys_insights['summary']['market_view_share_pct']}% (조회수)")

if __name__ == "__main__":
    main()
