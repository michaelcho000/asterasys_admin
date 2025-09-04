import Link from 'next/link'
import React from 'react'
import { FiAirplay, FiChevronRight, FiCommand, FiDownload, FiFilePlus, FiSearch, FiUserPlus } from 'react-icons/fi'


const tags = ["블로그순위", "카페순위", "검색량", "판매량", "유튜브순위", "뉴스순위", "경쟁사분석", "마켓팅성과", "트렌드분석", "KPI대시보드", "성과보고서"]
const recnetSearch = [
    {
        id: 1,
        search_title: "리프테라 경쟁사 분석",
        path: "메인 / 경쟁사순위 / RF",
        icon: <FiAirplay />,
        badge: "R"
    },
    {
        id: 2,
        search_title: "쿨페이즈 마켓팅 성과",
        path: "메인 / 제품포트폴리오 / RF",
        icon: <FiFilePlus />,
        badge: "M"
    },
    {
        id: 3,
        search_title: "쿨소닉 판매 트렌드",
        path: "멤인 / 검색트렌드 / HIFU",
        icon: <FiUserPlus />,
        badge: "T"
    },

]
const competitorSearch = [
    {
        id: 1,
        name: "리프테라",
        email: "HIFU • Asterasys 제품",
        src: "/images/avatar/1.png",
    },
    {
        id: 2,
        name: "쿨페이즈",
        email: "RF • Asterasys 제품",
        src: "/images/avatar/2.png",
    },
    {
        id: 3,
        name: "쿨소닉",
        email: "HIFU • Asterasys 신제품",
        src: "/images/avatar/3.png",
    },
    {
        id: 4,
        name: "울쒸라",
        email: "HIFU • 경쟁사 (시장지배)",
        src: "/images/avatar/4.png",
    },
    {
        id: 5,
        name: "써마지",
        email: "RF • 경쟁사 (최상위)",
        src: "/images/avatar/5.png",
    },

]
const dataFiles = [
    {
        id: 1,
        file_name: "asterasys_total_data - blog_rank.csv",
        size: "블로그 순위 데이터",
        src: "/images/file-icons/csv.png"
    },
    {
        id: 2,
        file_name: "asterasys_total_data - cafe_rank.csv",
        size: "카페 순위 데이터",
        src: "/images/file-icons/csv.png"
    },
    {
        id: 3,
        file_name: "asterasys_total_data - sale.csv",
        size: "판매량 데이터",
        src: "/images/file-icons/csv.png"
    },

]
const SearchModal = () => {
    return (
        <div className="dropdown nxl-h-item nxl-header-search">
            <div className="nxl-head-link me-0" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <FiSearch size={20} />
            </div>
            <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown">
                <div className="input-group search-form">
                    <span className="input-group-text">
                        <i className="fs-6 text-muted"><FiSearch /></i>
                    </span>
                    <input type="text" className="form-control search-input-field" placeholder="제품명, 경쟁사, 데이터 검색..." />
                    <span className="input-group-text">
                        <button type="button" className="btn-close"></button>
                    </span>
                </div>
                <div className="dropdown-divider mt-0"></div>
                <div className="search-items-wrapper">
                    <div className="searching-for px-4 py-2">
                        <p className="fs-11 fw-medium text-muted">I'm searching for...</p>
                        <div className="d-flex flex-wrap gap-1">
                            {
                                tags.map((tag, index) => <Link href={"#"} key={index} className="flex-fill border rounded py-1 px-2 text-center fs-11 fw-semibold">{tag}</Link>)
                            }
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="recent-result px-4 py-2">
                        <Title name={"Recnet"} number={"3"} />
                        {
                            recnetSearch.map(({ search_title, id, path, icon, badge }) => <Card key={id} icon={icon} subTitle={path} title={search_title} badge={badge} isImg={false} />)
                        }
                    </div>
                    <div className="dropdown-divider my-3"></div>
                    <div className="users-result px-4 py-2">
                        <Title name={"Competitors"} number={"5"} />
                        {
                            competitorSearch.map(({ name, id, email, src }) => <Card key={id} src={src} subTitle={email} title={name} badge={<FiChevronRight size={12} />} />)
                        }
                    </div>
                    <div className="dropdown-divider my-3"></div>
                    <div className="file-result px-4 py-2">
                        <Title name={"Data Files"} number={"3"} />
                        {
                            dataFiles.map(({ file_name, id, size, src }) => <Card key={id} src={src} subTitle={size} title={file_name} badge={<FiDownload size={12} />} />)
                        }
                    </div>
                    <div className="dropdown-divider mt-3 mb-0"></div>
                    <Link href={"#"} className="p-3 fs-10 fw-bold text-uppercase text-center d-block">더 많은 결과 보기</Link>
                </div>
            </div>
        </div>
    )
}

export default SearchModal


const Title = ({ name, number }) => {
    return (
        <h4 className="fs-13 fw-normal text-gray-600 mb-3">{name} <span className="badge small bg-gray-200 rounded ms-1 text-dark">{number}</span></h4>
    )
}

const Card = ({ src, icon, title, subTitle, badge }) => {
    return (
        <div className="d-flex align-items-center justify-content-between hr-card">
            <div className="d-flex align-items-center gap-3">
                {
                    icon ?
                        <div className="avatar-text rounded">
                            {icon}
                        </div>
                        :
                        <div className="avatar-image bg-gray-200 rounded">
                            <img src={src} alt="" className="img-fluid" />
                        </div>
                }

                <div>
                    <Link href={"#"} className="font-body fw-bold d-block mb-1">{title}</Link>
                    <p className="fs-11 text-muted mb-0">{subTitle}</p>
                </div>
            </div>
            {
                icon ?
                    <Link href={"#"} className="badge border rounded text-dark">{badge}<i className="ms-1 fs-10"><FiCommand /></i></Link>
                    :
                    <Link href={"#"} className="avatar-text avatar-md"> {badge} </Link>
            }

        </div>
    )
}