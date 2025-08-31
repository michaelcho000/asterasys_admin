'use client'
import { useState, useEffect } from 'react';

export const useNaverSearchTrend = (keywords) => {
    const [trendData, setTrendData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/naver/search-trend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        keywords: keywords,
                        startDate: "2024-01-01",
                        endDate: "2024-12-31"
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch trend data');
                }

                const data = await response.json();
                
                // 데이터 변환
                const transformedData = {};
                data.results?.forEach(result => {
                    transformedData[result.title] = {
                        data: result.data || [],
                        hasData: result.data && result.data.length > 0
                    };
                });

                setTrendData(transformedData);
                setError(null);
            } catch (err) {
                console.error('Search trend fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (keywords && keywords.length > 0) {
            fetchTrendData();
        }
    }, [keywords]);

    return { trendData, loading, error };
};