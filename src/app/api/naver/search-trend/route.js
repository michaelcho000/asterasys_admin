import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { keywords, startDate, endDate } = await request.json();
        
        const requestBody = {
            startDate: startDate || "2024-01-01",
            endDate: endDate || "2024-12-31",
            timeUnit: "month",
            keywordGroups: keywords.map(keyword => ({
                groupName: keyword,
                keywords: [keyword]
            }))
        };

        const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Naver-Client-Id': 'c_LhnyuBH4h0kdw4I8Wo',
                'X-Naver-Client-Secret': 'pj7Wl8Jb3d'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Naver API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch search trend data', details: error.message }, 
            { status: 500 }
        );
    }
}