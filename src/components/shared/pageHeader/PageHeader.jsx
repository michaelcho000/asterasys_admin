'use client'
import React, { useState } from 'react'
import { FiAlignRight, FiArrowLeft } from 'react-icons/fi'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const PageHeader = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false)
    const pathName = usePathname()
    
    const getPageInfo = (path) => {
        if (path === "/") {
            return {
                folderName: "마케팅 성과 개요",
                fileName: "대시보드",
                breadcrumb: "대시보드"
            }
        }
        
        const segments = path.split("/").filter(Boolean)
        
        // 경로별 한글 매핑
        const pathMapping = {
            'channel': '채널 성과',
            'market-analysis': '시장 분석', 
            'product': 'Asterasys 제품 분석',
            'reports': '운영 리포트',
            'export': '데이터 내보내기',
            'youtube': 'YouTube 분석',
            'blog': '블로그 분석',
            'cafe': '카페 분석',
            'news': '뉴스 분석',
            'sales': '판매 성과',
            'rankings': '경쟁사 순위',
            'market-share': '시장 점유율',
            'technology': '기술별 비교'
        }
        
        const folderName = pathMapping[segments[0]] || segments[0]
        const fileName = pathMapping[segments[1]] || segments[1] || ''
        
        return {
            folderName,
            fileName,
            breadcrumb: fileName || folderName
        }
    }
    
    const { folderName, fileName, breadcrumb } = getPageInfo(pathName)
    return (
        <div className="page-header">
            <div className="page-header-left d-flex align-items-center">
                <div className="page-header-title">
                    <h5 className="m-b-10 text-capitalize">{folderName}</h5>
                </div>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link href="/">Asterasys</Link></li>
                    <li className="breadcrumb-item">{breadcrumb}</li>
                </ul>
            </div>
            <div className="page-header-right ms-auto">
                <div className={`page-header-right-items ${openSidebar ? "page-header-right-open" : ""}`}>
                    <div className="d-flex d-md-none">
                        <Link href="#" onClick={() => setOpenSidebar(false)} className="page-header-right-close-toggle">
                            <FiArrowLeft size={16} className="me-2" />
                            <span>Back</span>
                        </Link>
                    </div>
                    {children}
                </div>
                <div className="d-md-none d-flex align-items-center">
                    <Link href="#" onClick={() => setOpenSidebar(true)} className="page-header-right-open-toggle">
                        <FiAlignRight className="fs-20" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PageHeader