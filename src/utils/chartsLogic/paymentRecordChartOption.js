// RF/HIFU 제품별 실제 CSV 데이터 (발행량 + 댓글수)
//
// ===== DATA UPDATE INSTRUCTIONS =====
// 이 파일은 CSV 데이터 교체 시 수동 업데이트가 필요합니다
//
// 1. CSV 파일 교체 후 다음 데이터를 업데이트하세요:
//    - blog_rank.csv → publishData (발행량)
//    - cafe_comments.csv → commentData (댓글수)
//    - traffic.csv → getSearchVolume() 함수의 searchData 객체
//
// 2. productData 구조:
//    - name: 제품명 (CSV 키워드 컬럼과 일치해야 함)
//    - publishData: 발행량 (숫자)
//    - commentData: 댓글수 (숫자) 
//    - isAsterasys: Asterasys 제품 여부 (true/false)
//
// 3. 순위 자동 계산:
//    - totalScore = publishData + commentData 기준으로 자동 정렬
//    - 차트에서 시장점유율과 순위가 자동 계산됨
//
// ===== END INSTRUCTIONS =====
//
const productData = {
    RF: {
        rawProducts: [
            { name: "인모드", publishData: 941, commentData: 1731, isAsterasys: false },
            { name: "써마지", publishData: 928, commentData: 3477, isAsterasys: false },
            { name: "올리지오", publishData: 299, commentData: 532, isAsterasys: false },
            { name: "덴서티", publishData: 203, commentData: 941, isAsterasys: false },
            { name: "볼뉴머", publishData: 175, commentData: 159, isAsterasys: false },
            { name: "세르프", publishData: 139, commentData: 255, isAsterasys: false },
            { name: "텐써마", publishData: 122, commentData: 238, isAsterasys: false },
            { name: "튠페이스", publishData: 106, commentData: 548, isAsterasys: false },
            { name: "쿨페이즈", publishData: 38, commentData: 1670, isAsterasys: true }
        ]
    },
    HIFU: {
        rawProducts: [
            { name: "슈링크", publishData: 256, commentData: 1722, isAsterasys: false },
            { name: "울쎄라", publishData: 531, commentData: 2885, isAsterasys: false },
            { name: "쿨소닉", publishData: 13, commentData: 1813, isAsterasys: true },
            { name: "리프테라", publishData: 63, commentData: 1593, isAsterasys: true },
            { name: "리니어지", publishData: 100, commentData: 134, isAsterasys: false },
            { name: "브이로", publishData: 37, commentData: 336, isAsterasys: false },
            { name: "텐쎄라", publishData: 23, commentData: 121, isAsterasys: false },
            { name: "튠라이너", publishData: 22, commentData: 98, isAsterasys: false },
            { name: "리니어펌", publishData: 1, commentData: 4, isAsterasys: false }
        ]
    }
};

// 합산 데이터로 순위 정렬하는 함수  
const getSortedProducts = (category) => {
    const products = productData[category].rawProducts;
    return products
        .map(product => ({
            ...product,
            totalScore: product.publishData + product.commentData,
            // traffic.csv에서 검색량 데이터 추가
            searchVolume: getSearchVolume(product.name)
        }))
        .sort((a, b) => b.totalScore - a.totalScore); // 내림차순 정렬 (1위부터)
};

// 검색량 데이터 (traffic.csv 기반)
const getSearchVolume = (productName) => {
    const searchData = {
        "써마지": 544,
        "인모드": 328, 
        "덴서티": 239,
        "쿨페이즈": 220,
        "올리지오": 77,
        "튠페이스": 67,
        "세르프": 42,
        "텐써마": 42,
        "볼뉴머": 26,
        "울쎄라": 531,
        "슈링크": 256,
        "쿨소닉": 230,
        "리프테라": 202,
        "리니어지": 100,
        "브이로": 37,
        "텐쎄라": 23,
        "튠라이너": 22,
        "리니어펌": 1
    };
    return searchData[productName] || 0;
};

export const paymentRecordChartOption = (category = 'RF') => {
    const sortedProducts = getSortedProducts(category);
    
    const chartOptions = {
        chart: {
            type: 'line',
            height: 340,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 4,
                borderRadiusApplication: 'end',
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: [0, 0, 3],
            curve: 'smooth',
            colors: ['transparent', 'transparent', '#ef4444']
        },
        xaxis: {
            categories: sortedProducts.map(product => product.name),
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: function (val) {
                    return Math.floor(val);
                }
            }
        },
        series: [
            {
                name: '콘텐츠 발행량',
                data: sortedProducts.map(product => product.publishData),
                type: 'bar'
            },
            {
                name: '댓글/반응 수', 
                data: sortedProducts.map(product => product.commentData),
                type: 'bar'
            },
            {
                name: '검색량',
                data: sortedProducts.map(product => product.searchVolume),
                type: 'line'
            }
        ],
        colors: ['#3b82f6', '#10b981', '#ef4444'],
        fill: {
            opacity: [0.85, 0.85, 0.1]
        },
        markers: {
            size: [0, 0, 6],
            colors: ['', '', '#ef4444'],
            strokeColors: ['', '', '#ffffff'],
            strokeWidth: [0, 0, 2],
            hover: {
                size: [0, 0, 8]
            }
        },
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
            },
            y: {
                formatter: function (val, opts) {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0) return val + '건';
                    if (seriesIndex === 1) return val + '개';
                    if (seriesIndex === 2) return val + '회';
                    return val;
                }
            }
        },
        legend: {
            show: false
        },
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 0,
            position: 'back',
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 20
            }
        },
        responsive: [{
            breakpoint: 768,
            options: {
                plotOptions: {
                    bar: {
                        columnWidth: '80%'
                    }
                },
                legend: {
                    position: 'bottom',
                    offsetY: 10
                }
            }
        }]
    };

    // 데이터에 productData 추가
    chartOptions.productData = productData;

    return chartOptions;
}