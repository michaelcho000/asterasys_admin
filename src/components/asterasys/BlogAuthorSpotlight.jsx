'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const TABS = ['ALL', '쿨페이즈', '리프테라', '쿨소닉']

const BlogAuthorSpotlight = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authors, setAuthors] = useState([])
  const [grouped, setGrouped] = useState({})
  const [summary, setSummary] = useState({ total: 0, asterasys: 0 })
  const [activeTab, setActiveTab] = useState('ALL')

  useEffect(() => {
    if (!month) return

    const fetchAuthors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(withMonthParam('/api/data/blog-authors', month))
        if (!response.ok) {
          throw new Error('블로그 작성자 데이터를 불러오지 못했습니다.')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '작성자 데이터가 유효하지 않습니다.')
        }
        setAuthors(data.authors || [])
        setGrouped(data.grouped || {})
        setSummary(data.summary || { total: 0, asterasys: 0 })
      } catch (err) {
        console.error('Blog author fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthors()
  }, [month, refreshKey])

  const filteredAuthors = useMemo(() => {
    if (activeTab === 'ALL') {
      return authors.filter((author) => author.isAsterasys).slice(0, 8)
    }
    const list = grouped[activeTab] || []
    return list.slice(0, 8)
  }, [authors, grouped, activeTab])

  if (isRemoved) return null

  return (
    <div className='col-xxl-8 col-lg-8 col-md-12'>
      <div className={`card stretch stretch-full ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
        <div className='card-header d-flex align-items-center justify-content-between flex-wrap gap-3'>
          <div>
            <h5 className='card-title mb-1'>Top 블로거 하이라이트</h5>
            <p className='text-muted fs-12 mb-0'>제품별 상위 작성자와 활동량</p>
          </div>
          <div className='btn-group btn-group-sm'>
            {TABS.map((tab) => (
              <button
                key={tab}
                type='button'
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className='card-body custom-card-action'>
          {loading ? (
            <CardLoader />
          ) : error ? (
            <div className='text-danger fw-semibold'>{error}</div>
          ) : filteredAuthors.length ? (
            <div className='d-flex flex-column gap-3'>
              {filteredAuthors.map((author) => (
                <div
                  key={`${author.product}-${author.rank}-${author.name}`}
                  className='border rounded-3 p-3 border-light-subtle'
                >
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <div className='d-flex align-items-center gap-2'>
                        <span className='badge bg-primary-subtle text-primary'>{author.product}</span>
                        <span className='fw-semibold text-dark'>{author.name}</span>
                      </div>
                      <div className='text-muted fs-12 mt-1'>순위 {author.rank}위 · 발행 {author.totalPosts}건 · {author.participationLabel}</div>
                    </div>
                    {author.url && (
                      <Link href={author.url} target='_blank' className='fs-12 fw-semibold text-primary text-decoration-none'>
                        블로그 보기 →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted fs-12 mb-0'>표시할 작성자 데이터가 없습니다.</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default BlogAuthorSpotlight
