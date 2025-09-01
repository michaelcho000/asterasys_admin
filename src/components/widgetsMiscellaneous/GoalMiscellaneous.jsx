'use client'
import React from 'react'
import Link from 'next/link';
import CardHeader from '@/components/shared/CardHeader'
import CircleProgress from '@/components/shared/CircleProgress';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

const goalData = [
    { value: 87, revenue: "674/774", title: "연간 판매 목표", color: "#3b82f6" },
    { value: 21, revenue: "114/522", title: "블로그 발행 목표", color: "#10b981" },
    { value: 75, revenue: "652/870", title: "카페 활동 목표", color: "#f59e0b" },
    { value: 29, revenue: "3/4", title: "제품 라인업 목표", color: "#ef4444" }
];

const GoalMiscellaneous = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    if (isRemoved) {
        return null;
    }
    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Asterasys 2025 목표 달성도"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action">
                    <div className="row g-4">
                        {goalData.map(({ color, revenue, title, value }, index) => (
                            <div key={index} className="col-sm-6">
                                <div className="px-4 py-3 text-center border border-dashed rounded-3 goal-card">
                                    <div className="mx-auto mb-4">
                                        <CircleProgress value={value} text_sym={"%"} path_color={color} />
                                    </div>
                                    <h2 className="fs-13 tx-spacing-1">{title}</h2>
                                    <div className="fs-11 text-muted text-truncate-1-line">{revenue}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card-footer">
                    <Link href="#" className="btn btn-primary">목표 설정 관리</Link>
                </div>
            </div>
            <CardLoader refreshKey={refreshKey} />
        </div>
    )
}

export default GoalMiscellaneous


