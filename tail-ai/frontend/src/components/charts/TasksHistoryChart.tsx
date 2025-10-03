'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TaskHistoryData {
  month: string
  tasks: number
  createdTasks?: number
}

interface TasksHistoryChartProps {
  data: TaskHistoryData[]
  title: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  onTimeRangeChange?: (range: 'week' | 'month' | 'quarter' | 'year') => void
}

export function TasksHistoryChart({ data, title, timeRange = 'month', onTimeRangeChange }: TasksHistoryChartProps) {
  const [chartRendered, setChartRendered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const categories = data.map(item => item.month)
  const series = [
    {
      name: 'Tasks Completed',
      data: data.map(item => item.tasks)
    },
    {
      name: 'Tasks Created',
      data: data.map(item => item.createdTasks || 0)
    }
  ]

  // Calculate total and percentage change
  const totalTasks = data.reduce((sum, item) => sum + item.tasks, 0)
  const currentMonth = data[data.length - 1]?.tasks || 0
  const previousMonth = data[data.length - 2]?.tasks || 0
  const percentageChange = previousMonth > 0 
    ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) 
    : 0
  const isPositive = percentageChange >= 0

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#9CA3AF'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9CA3AF'
        },
        formatter: function (val: number) {
          return Math.round(val).toString()
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    colors: ['#3B82F6', '#8B5CF6'],
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val: number) {
          return `${val} tasks`
        }
      }
    },
    theme: {
      mode: 'dark'
    }
  }

  const timeRangeOptions = [
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'quarter', label: 'Last 90 days' },
    { value: 'year', label: 'Last 12 months' }
  ]

  const selectedLabel = timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'Last 30 days'

  useEffect(() => {
    setChartRendered(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('tasks-history-dropdown')
      const button = document.getElementById('tasks-history-dropdown-button')
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  if (!chartRendered) {
    return null
  }

  return (
    <div className="max-w-full w-full bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="flex justify-between p-4 md:p-6 pb-0 md:pb-0">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
            {totalTasks}
          </h5>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">{title}</p>
        </div>
        <div className={`flex items-center px-2.5 py-0.5 text-base font-semibold ${
          isPositive ? 'text-green-500 dark:text-green-500' : 'text-red-500 dark:text-red-500'
        } text-center`}>
          {Math.abs(percentageChange)}%
          <svg 
            className={`w-3 h-3 ms-1 ${!isPositive ? 'rotate-180' : ''}`} 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 10 14"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13V1m0 0L1 5m4-4 4 4"
            />
          </svg>
        </div>
      </div>
      
      <div id="tasks-history-chart" className="px-2.5">
        <ApexCharts options={options} series={series} type="area" height={350} />
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5 p-4 md:p-6 pt-0 md:pt-0">
        <div className="flex justify-between items-center pt-5">
          {/* Time Range Dropdown Button */}
          <div className="relative">
            <button
              id="tasks-history-dropdown-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
              type="button"
            >
              {selectedLabel}
              <svg 
                className="w-2.5 m-2.5 ms-1.5" 
                aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 10 6"
              >
                <path 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div 
                id="tasks-history-dropdown" 
                className="absolute left-0 mt-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700"
              >
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {timeRangeOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        onClick={() => {
                          onTimeRangeChange?.(option.value as any)
                          setDropdownOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <a
            href="/tasks"
            className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2"
          >
            View All Tasks
            <svg 
              className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 6 10"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="m1 9 4-4-4-4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

