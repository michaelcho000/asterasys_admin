import React from 'react'
import { FiSearch, FiYoutube, FiEdit3, FiTrendingUp } from 'react-icons/fi'

/**
 * Asterasys 운영 리포트 컴포넌트
 * 실제 CSV 데이터 기반: cafe_seo.csv, youtube_sponsor ad.csv, blog_post.csv, news_release.csv
 */

const AsterasysOperationalReports = () => {
    // 실제 cafe_seo.csv 데이터 기반 SEO 성과
    const seoPerformance = {
        totalKeywords: 34, // cafe_seo.csv 총 키워드 수 
        exposureSuccess: 12, // 노출현황 2인 항목들
        smartBlockSuccess: 3, // 스마트블록 성공
        popularPostsAchieved: 15, // 인기글 달성
        averageCafePosition: 2.4 // 평균 카페 순위
    }

    // 실제 youtube_sponsor ad.csv 데이터 기반 광고 성과
    const youtubeAdPerformance = {
        totalCampaigns: 3, // 캠페인 수
        totalImpressions: "11,176,597", // 총 노출수 합계
        totalViews: "1,966,959", // 총 조회수 합계
        averageCPV: "₩132", // 평균 CPV
        topPerformingVideo: "쿨페이즈 오피셜"
    }

    // 실제 blog_post.csv 데이터 기반 블로그 운영
    const blogOperations = {
        totalHospitals: 8, // 협력 병원 수
        totalPosts: 24, // 총 게시물 수 (리프테라 13 + 쿨페이즈 7 + 쿨소닉 4)
        averagePostsPerHospital: 3.0, // 병원별 평균 게시물
        activeHospitals: ["사르티네의원", "비본영의원", "리마인드피부과", "유어힐의원"]
    }

    // 실제 news_release.csv 데이터 기반 뉴스 릴리즈
    const newsReleases = {
        totalReleases: 12, // 총 뉴스 릴리즈
        releasePeriod: "8/12 - 8/15 (4일간)",
        mediaOutlets: 3, // 언론사 수 (medisobizanews, rapportian, mdtoday)
        coveragePerProduct: {
            리프테라: 4,
            쿨페이즈: 4, 
            쿨소닉: 4
        }
    }

    return (
        <>
            {/* SEO 성과 섹션 */}
            <div className="col-lg-6">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">
                            <FiSearch className="me-2 text-primary" />
                            SEO 성과 현황
                            <span className="badge bg-primary ms-2">실시간</span>
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-primary fw-bold">{seoPerformance.totalKeywords}</div>
                                    <small className="text-muted">총 키워드</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-success fw-bold">{seoPerformance.exposureSuccess}</div>
                                    <small className="text-muted">노출 성공</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-warning fw-bold">{seoPerformance.smartBlockSuccess}</div>
                                    <small className="text-muted">스마트블록</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-info fw-bold">{seoPerformance.popularPostsAchieved}</div>
                                    <small className="text-muted">인기글</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 유튜브 광고 성과 */}
            <div className="col-lg-6">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">
                            <FiYoutube className="me-2 text-danger" />
                            유튜브 광고 ROI
                            <span className="badge bg-danger ms-2">Live</span>
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h5 text-danger fw-bold">{youtubeAdPerformance.totalImpressions}</div>
                                    <small className="text-muted">총 노출수</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h5 text-success fw-bold">{youtubeAdPerformance.totalViews}</div>
                                    <small className="text-muted">총 조회수</small>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="text-center p-3 bg-light rounded-3">
                                    <div className="h4 text-primary fw-bold">{youtubeAdPerformance.averageCPV}</div>
                                    <small className="text-muted">평균 CPV (Cost Per View)</small>
                                    <div className="mt-2">
                                        <span className="badge bg-warning">최고 성과: {youtubeAdPerformance.topPerformingVideo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 블로그 운영 현황 */}
            <div className="col-lg-6">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">
                            <FiEdit3 className="me-2 text-info" />
                            블로그 운영 현황
                            <span className="badge bg-info ms-2">8월</span>
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-info fw-bold">{blogOperations.totalHospitals}</div>
                                    <small className="text-muted">협력 병원</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-success fw-bold">{blogOperations.totalPosts}</div>
                                    <small className="text-muted">총 게시물</small>
                                </div>
                            </div>
                        </div>
                        <div className="border-top pt-3">
                            <h6 className="text-muted small mb-2">주요 협력 병원:</h6>
                            {blogOperations.activeHospitals.map((hospital, index) => (
                                <span key={index} className="badge bg-light text-dark me-1 mb-1">{hospital}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 뉴스 릴리즈 성과 */}
            <div className="col-lg-6">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">
                            <FiTrendingUp className="me-2 text-warning" />
                            뉴스 릴리즈 성과
                            <span className="badge bg-warning ms-2">8월</span>
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h4 text-warning fw-bold">{newsReleases.totalReleases}</div>
                                    <small className="text-muted">총 릴리즈</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center p-3 border rounded-3">
                                    <div className="h5 text-info fw-bold">{newsReleases.mediaOutlets}</div>
                                    <small className="text-muted">언론사 수</small>
                                </div>
                            </div>
                        </div>
                        <div className="border-top pt-3">
                            <h6 className="text-muted small mb-2">제품별 보도 현황:</h6>
                            {Object.entries(newsReleases.coveragePerProduct).map(([product, count]) => (
                                <div key={product} className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small">{product}</span>
                                    <span className="badge bg-warning">{count}건</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AsterasysOperationalReports