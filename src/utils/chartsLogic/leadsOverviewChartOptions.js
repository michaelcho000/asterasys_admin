export const leadsOverviewChartOptions = {
    dataLabels: {
        enabled: !1
    },
    series: [60, 25, 15], // 병원자체 60%, 자사운영 25%, 체험단 15%
    labels: ["병원 자체 블로그", "Asterasys 운영", "체험단 캠페인"],
    colors: ["#3454d1", "#f59e0b", "#10b981"],
    stroke: {
        width: 0, lineCap: "round"
    },
    legend: {
        show: !1,
        position: "bottom",
        fontFamily: "Inter",
        fontWeight: 500,
        labels: {
            colors: "#A0ACBB", fontFamily: "Inter"
        },
        markers: {
            width: 10, height: 10
        },
        itemMargin: {
            horizontal: 20, vertical: 5
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: "85%",
                labels: {
                    show: !1,
                    name: {
                        show: !1, fontSize: "16px", colors: "#A0ACBB", fontFamily: "Inter"
                    },
                    value: {
                        show: !1, fontSize: "30px", fontFamily: "Inter", color: "#A0ACBB", formatter: function (e) {
                            return e
                        }
                    }
                }
            }
        }
    },
    responsive: [{
        breakpoint: 380,
        options: {
            chart: {
                width: 280
            },
            legend: {
                show: !1
            }
        }
    }
    ],
    tooltip: {
        y: {
            formatter: function (e) {
                return +e + "%"
            }
        },
        style: {
            colors: "#A0ACBB", fontFamily: "Inter"
        }
    }
}