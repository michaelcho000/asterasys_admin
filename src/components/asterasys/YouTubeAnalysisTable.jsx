'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const YouTubeAnalysisTable = ({ title }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [youtubeData, setYoutubeData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadYouTubeData = async () => {
            try {
                setLoading(true)
                
                // YouTube 분석 데이터 로드
                const response = await fetch(withMonthParam('/api/data/youtube-analysis', month))
                
                if (response.ok) {
                    const data = await response.json()
                    setYoutubeData(data.rankings || [])
                } else {
                    // API가 없다면 기본 데이터 사용
                    setYoutubeData(getDefaultYouTubeData())
                }
                
            } catch (error) {
                console.error('YouTube 데이터 로드 실패:', error)
                // 로컬 더미 데이터로 대체
                setYoutubeData(getDefaultYouTubeData())
            } finally {
                setLoading(false)
            }
        }

        loadYouTubeData()
    }, [month, refreshKey])

    const parseCSVData = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',')
        
        return lines.slice(1).map((line, index) => {
            const values = line.split(',')
            const device = values[0]
            const category = values[1]
            const marketRank = parseInt(values[2])
            const company = values[3]
            const isAsterasys = values[4] === 'Y'
            const videoCount = parseInt(values[5])
            const videoShare = parseFloat(values[6])
            const totalViews = parseInt(values[7])
            const viewShare = parseFloat(values[8])
            const avgViews = parseInt(values[9])
            const engagement = parseFloat(values[10])
            const channels = parseInt(values[11])
            
            return {
                rank: index + 1,
                device,
                category,
                marketRank,
                company,
                isAsterasys,
                videoCount,
                videoShare,
                totalViews,
                viewShare,
                avgViews,
                engagement,
                channels,
                status: getDeviceStatus(videoCount, engagement),
                rankChange: getRankChange(marketRank, index + 1)
            }
        })
    }

    const getDefaultYouTubeData = () => {
        return [
            { rank: 1, device: '울쎄라', category: 'HIFU', marketRank: 1, company: '머츠', isAsterasys: false, videoCount: 300, totalViews: 910812, avgViews: 3036, engagement: 0.830, channels: 179, status: '시장지배', rankChange: 0 },
            { rank: 2, device: '브이로', category: 'HIFU', marketRank: 6, company: '클래시테크', isAsterasys: false, videoCount: 283, totalViews: 494736, avgViews: 1748, engagement: 1.544, channels: 255, status: '약진', rankChange: 4 },
            { rank: 3, device: '써마지', category: 'RF', marketRank: 1, company: '썸', isAsterasys: false, videoCount: 262, totalViews: 1954651, avgViews: 7461, engagement: 0.850, channels: 141, status: '경쟁우위', rankChange: -2 },
            { rank: 4, device: '인모드', category: 'RF', marketRank: 2, company: '인바이오', isAsterasys: false, videoCount: 80, totalViews: 151674, avgViews: 1896, engagement: 1.390, channels: 41, status: '안정적', rankChange: -2 },
            { rank: 5, device: '슈링크', category: 'HIFU', marketRank: 2, company: '허쉬메드', isAsterasys: false, videoCount: 62, totalViews: 1150119, avgViews: 18550, engagement: 0.895, channels: 48, status: '안정적', rankChange: -3 },
            { rank: 12, device: '쿨소닉', category: 'HIFU', marketRank: 3, company: 'Asterasys', isAsterasys: true, videoCount: 7, totalViews: 20953, avgViews: 2993, engagement: 1.045, channels: 5, status: '성장필요', rankChange: -9 },
            { rank: 14, device: '쿨페이즈', category: 'RF', marketRank: 3, company: 'Asterasys', isAsterasys: true, videoCount: 2, totalViews: 1675, avgViews: 838, engagement: 0.179, channels: 2, status: '성장필요', rankChange: -11 },
            { rank: 15, device: '리프테라', category: 'HIFU', marketRank: 4, company: 'Asterasys', isAsterasys: true, videoCount: 2, totalViews: 1532, avgViews: 766, engagement: 0.653, channels: 2, status: '성장필요', rankChange: -11 }
        ]
    }

    const getDeviceStatus = (videoCount, engagement) => {
        if (videoCount >= 200) return '시장지배'
        if (videoCount >= 100) return '경쟁우위'
        if (videoCount >= 50) return '안정적'
        if (videoCount >= 10) return '성장세'
        return '성장필요'
    }

    const getRankChange = (marketRank, youtubeRank) => {
        return marketRank - youtubeRank // 양수면 상승, 음수면 하락
    }

    const getFilteredData = () => {
        if (activeTab === 'ALL') return youtubeData
        return youtubeData.filter(item => item.category === activeTab)
    }

    const getStatusColor = (status) => {
        switch(status) {
            case '시장지배': return 'success'
            case '경쟁우위': return 'primary' 
            case '약진': return 'info'
            case '안정적': return 'warning'
            case '성장세': return 'warning'
            case '성장필요': return 'danger'
            default: return 'secondary'
        }
    }

    const getRankChangeIcon = (change) => {
        if (change > 0) return <FiTrendingUp className="text-success" />
        if (change < 0) return <FiTrendingDown className="text-danger" />
        return <span className="text-muted">-</span>
    }

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader 
                    title={title}
                    refresh={handleRefresh}
                    remove={handleDelete}
                    expand={handleExpand}
                />

                <div className="card-body">
                    {/* 탭 메뉴 */}
                    <div className="d-flex gap-2 mb-4">
                        <button 
                            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('ALL')}
                        >
                            전체 (18개)
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === 'RF' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setActiveTab('RF')}
                        >
                            RF 고주파 (9개)
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === 'HIFU' ? 'btn-info' : 'btn-outline-info'}`}
                            onClick={() => setActiveTab('HIFU')}
                        >
                            HIFU 초음파 (9개)
                        </button>
                    </div>

                    {loading ? (
                        <CardLoader />
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr className="border-b">
                                        <th scope="row" width="80">YouTube 순위</th>
                                        <th width="120">브랜드명</th>
                                        <th width="80">분야</th>
                                        <th width="80">시장순위</th>
                                        <th width="100">순위변동</th>
                                        <th width="100">비디오 수</th>
                                        <th width="120">총 조회수</th>
                                        <th width="100">평균 조회수</th>
                                        <th width="80">참여도</th>
                                        <th width="80">채널 수</th>
                                        <th width="100">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        getFilteredData().map((item, index) => (
                                            <tr key={item.device} className={`${item.isAsterasys ? 'table-primary' : ''}`}>
                                                <td>
                                                    <div className="fw-bold text-dark d-flex align-items-center">
                                                        <span className={`badge ${item.rank <= 3 ? 'bg-warning' : item.rank <= 10 ? 'bg-primary' : 'bg-secondary'} me-2`}>
                                                            {item.rank}위
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-semibold text-dark">
                                                            {item.device}
                                                            {item.isAsterasys && <span className="badge bg-primary ms-2 fs-10">Asterasys</span>}
                                                        </span>
                                                        <small className="text-muted">{item.company}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.category === 'RF' ? 'bg-warning' : 'bg-info'}`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-center">
                                                        <span className="fw-bold text-muted">{item.marketRank}위</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        {getRankChangeIcon(item.rankChange)}
                                                        <small className="ms-1">
                                                            {item.rankChange > 0 ? `+${item.rankChange}` : item.rankChange || '-'}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">
                                                        {(item.videoCount || 0).toLocaleString()}개
                                                    </div>
                                                    <small className="text-muted">
                                                        {youtubeData.length > 0 ? (((item.videoCount || 0) / youtubeData.reduce((sum, d) => sum + (d.videoCount || 0), 0)) * 100).toFixed(1) : '0.0'}%
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">
                                                        {(item.totalViews || 0).toLocaleString()}회
                                                    </div>
                                                    <small className="text-muted">
                                                        {youtubeData.length > 0 ? (((item.totalViews || 0) / youtubeData.reduce((sum, d) => sum + (d.totalViews || 0), 0)) * 100).toFixed(1) : '0.0'}%
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="text-dark">
                                                        {(item.avgViews || 0).toLocaleString()}회
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`fw-semibold ${(item.engagement || 0) > 1.0 ? 'text-success' : 'text-muted'}`}>
                                                        {(item.engagement || 0).toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">
                                                        {(item.channels || 0)}개
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getStatusColor(item.status)} text-white`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            
                            {/* 요약 정보 */}
                            <div className="border-top pt-3 mt-3">
                                <div className="row text-center">
                                    <div className="col-md-3">
                                        <div className="text-muted">총 비디오</div>
                                        <div className="fw-bold fs-5">
                                            {youtubeData.reduce((sum, item) => sum + item.videoCount, 0).toLocaleString()}개
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-muted">총 조회수</div>
                                        <div className="fw-bold fs-5">
                                            {youtubeData.reduce((sum, item) => sum + item.totalViews, 0).toLocaleString()}회
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-muted">Asterasys 점유율</div>
                                        <div className="fw-bold fs-5 text-primary">
                                            {(
                                                (youtubeData.filter(d => d.isAsterasys).reduce((sum, d) => sum + d.videoCount, 0) / 
                                                youtubeData.reduce((sum, d) => sum + d.videoCount, 0)) * 100
                                            ).toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-muted">활성 채널</div>
                                        <div className="fw-bold fs-5">
                                            {youtubeData.reduce((sum, item) => sum + item.channels, 0).toLocaleString()}개
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asterasys 하이라이트 */}
                            <div className="alert alert-primary mt-4" role="alert">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="avatar-text bg-primary text-white">
                                            <FiTrendingUp size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="alert-heading mb-1">⭐ Asterasys YouTube 분석 인사이트</h6>
                                        <p className="mb-2">
                                            <strong>현재 점유율:</strong> 0.95% (11개 비디오) • 
                                            <strong>목표:</strong> 5% (58개 비디오) • 
                                            <strong>필요한 성장:</strong> 4배 증가
                                        </p>
                                        <small className="text-muted">
                                            💡 <strong>핵심 기회:</strong> 시장 순위 3-4위 대비 YouTube 순위 12-15위 → 엄청난 성장 잠재력
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default YouTubeAnalysisTable
