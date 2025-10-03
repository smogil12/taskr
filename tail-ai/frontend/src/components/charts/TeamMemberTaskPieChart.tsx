'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TeamMemberTaskData {
  name: string
  tasks: number
  color: string
}

interface TeamMemberTaskPieChartProps {
  data: TeamMemberTaskData[]
  title?: string
}

export function TeamMemberTaskPieChart({ 
  data, 
  title = "Tasks by Team Member" 
}: TeamMemberTaskPieChartProps) {
  const [chartOptions, setChartOptions] = useState<any>(null)
  const [series, setSeries] = useState<number[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      const chartData = data.map(item => item.tasks)
      const labels = data.map(item => item.name)
      const colors = data.map(item => item.color)

      setSeries(chartData)
      setChartOptions({
        chart: {
          type: 'pie',
          height: 350,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        labels: labels,
        colors: colors,
        stroke: {
          show: true,
          width: 2,
          colors: ['#ffffff']
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            colors: ['#ffffff']
          },
          formatter: function (val: number) {
            return val.toFixed(1) + '%'
          }
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '16px',
          fontFamily: 'Helvetica, Arial',
          fontWeight: 500,
          labels: {
            colors: '#ffffff',
            useSeriesColors: false
          },
          markers: {
            width: 12,
            height: 12,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: colors,
            radius: 12,
            customHTML: undefined,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
          },
          itemMargin: {
            horizontal: 5,
            vertical: 5
          }
        },
        tooltip: {
          enabled: true,
          theme: 'light',
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial'
          },
          y: {
            formatter: function (val: number) {
              return `${val} tasks`
            }
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: false
              }
            },
            expandOnClick: true
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ]
      })
    }
  }, [data])

  if (!chartOptions || series.length === 0) {
    return (
      <div className="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
        <div className="flex justify-between items-start w-full">
          <div className="flex-col items-center">
            <div className="flex items-center mb-1">
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1">
                {title}
              </h5>
            </div>
          </div>
        </div>
        <div className="py-6 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
      <div className="flex justify-between items-start w-full">
        <div className="flex-col items-center">
          <div className="flex items-center mb-1">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1">
              {title}
            </h5>
          </div>
        </div>
      </div>
      
      {/* Pie Chart */}
      <div className="py-6" id="pie-chart">
        <Chart
          options={chartOptions}
          series={series}
          type="pie"
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
        <div className="flex justify-between items-center pt-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Task distribution across team members
          </div>
        </div>
      </div>
    </div>
  )
}
