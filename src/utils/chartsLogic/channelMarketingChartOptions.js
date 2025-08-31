import { asterasysChannelData } from '../fackData/asterasysChannelData'

export const channelMarketingChartOptions = {
    chart: {
        type: 'donut',
        toolbar: {
            show: false
        }
    },
    series: asterasysChannelData.map(item => item.count),
    labels: asterasysChannelData.map(item => item.channel),
    colors: asterasysChannelData.map(item => item.color),
    legend: {
        show: false
    },
    dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
            return Math.round(val) + '%'
        },
        style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            colors: ['#ffffff']
        },
        background: {
            enabled: false
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            color: '#000000',
            opacity: 0.45
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        color: '#374151',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        fontSize: '20px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        color: '#1f2937',
                        offsetY: 10,
                        formatter: function (val) {
                            return val + '건'
                        }
                    },
                    total: {
                        show: true,
                        showAlways: true,
                        label: '총 발행량',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        color: '#6b7280',
                        formatter: function (w) {
                            const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                            return total.toLocaleString() + '건'
                        }
                    }
                }
            }
        }
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 280
            },
            legend: {
                position: 'bottom'
            }
        }
    }],
    tooltip: {
        style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
        },
        custom: function({series, seriesIndex, dataPointIndex, w}) {
            const channel = w.globals.labels[seriesIndex];
            const value = series[seriesIndex];
            const percentage = ((value / w.globals.seriesTotals.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            
            return `<div style="background: #1f2937; color: #ffffff; padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <strong style="color: #ffffff;">${channel}</strong><br/>
                <span style="color: #ffffff;">${value}건 (${percentage}%)</span>
            </div>`;
        }
    }
}