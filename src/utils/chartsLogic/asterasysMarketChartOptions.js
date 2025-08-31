// Asterasys 시장 분석 차트 옵션 (실제 CSV 데이터 기반)

export const rfMarketChartOptions = () => ({
    chart: {
        type: 'bar',
        width: "100%",
        toolbar: { show: false },
        background: 'transparent'
    },
    colors: ['#8b5cf6', '#c4b5fd', '#e9d5ff', '#f3e8ff', '#faf5ff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#f59e0b'],
    series: [{
        name: "카페 발행량",
        data: [544, 328, 239, 220, 77, 67, 42, 42, 26] // 실제 cafe_rank.csv 데이터
    }],
    xaxis: {
        categories: ['써마지', '인모드', '덴서티', '⭐쿨페이즈', '올리지오', '튠페이스', '세르프', '텐써마', '볼뉴머'],
        labels: {
            style: {
                colors: '#64748b',
                fontSize: '12px'
            }
        }
    },
    yaxis: {
        title: {
            text: '발행량 (건)',
            style: { color: '#64748b' }
        }
    },
    plotOptions: {
        bar: {
            borderRadius: 4,
            columnWidth: '70%',
            distributed: true
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
            const rank = opts.dataPointIndex + 1
            return `${rank}위`
        },
        style: {
            colors: ['#fff'],
            fontSize: '11px',
            fontWeight: 'bold'
        }
    },
    title: {
        text: 'RF (고주파) 시장 순위',
        style: { color: '#1e293b', fontSize: '16px' }
    },
    tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const brands = ['써마지', '인모드', '덴서티', '⭐쿨페이즈', '올리지오', '튠페이스', '세르프', '텐써마', '볼뉴머']
            const values = [544, 328, 239, 220, 77, 67, 42, 42, 26]
            return `
                <div class="px-3 py-2">
                    <div class="fw-bold">${brands[dataPointIndex]}</div>
                    <div>순위: ${dataPointIndex + 1}위</div>
                    <div>발행량: ${values[dataPointIndex]}건</div>
                    <div class="text-muted small">출처: cafe_rank.csv</div>
                </div>
            `
        }
    }
})

export const hifuMarketChartOptions = () => ({
    chart: {
        type: 'donut',
        width: "100%",
        toolbar: { show: false }
    },
    colors: ['#06b6d4', '#67e8f9', '#a5f3fc', '#cffafe', '#f0fdfa', '#f8fafc', '#f1f5f9', '#e2e8f0', '#f59e0b'],
    series: [531, 256, 230, 202, 100, 37, 23, 22, 1], // 실제 cafe_rank.csv HIFU 데이터
    labels: ['울쎄라', '슈링크', '⭐쿨소닉', '⭐리프테라', '리니어지', '브이로', '텐쎄라', '튠라이너', '리니어펌'],
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'HIFU 총합',
                        formatter: () => '1,402건'
                    },
                    value: {
                        show: true,
                        formatter: (val) => val + '건'
                    }
                }
            }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
            const rank = opts.seriesIndex + 1
            return `${rank}위`
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        fontSize: '12px',
        formatter: (seriesName, opts) => {
            const rank = opts.seriesIndex + 1
            const value = opts.w.config.series[opts.seriesIndex]
            return `${rank}위 ${seriesName}: ${value}건`
        }
    },
    title: {
        text: 'HIFU (초음파) 시장 분포',
        style: { color: '#1e293b', fontSize: '16px' }
    },
    tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const brands = ['울쎄라', '슈링크', '⭐쿨소닉', '⭐리프테라', '리니어지', '브이로', '텐쎄라', '튠라이너', '리니어펌']
            const values = [531, 256, 230, 202, 100, 37, 23, 22, 1]
            const total = 1402
            const percentage = ((values[seriesIndex] / total) * 100).toFixed(1)
            return `
                <div class="px-3 py-2">
                    <div class="fw-bold">${brands[seriesIndex]}</div>
                    <div>순위: ${seriesIndex + 1}위</div>
                    <div>발행량: ${values[seriesIndex]}건</div>
                    <div>점유율: ${percentage}%</div>
                    <div class="text-muted small">출처: cafe_rank.csv</div>
                </div>
            `
        }
    }
})