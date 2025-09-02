import { MainLayout } from "@/components/layout/main-layout";

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View detailed reports and analytics for your projects and time tracking.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Time Tracking Report */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Time Tracking Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Overview of your time tracking activities
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">This Week</span>
                <span className="font-medium text-gray-900 dark:text-white">32.5h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">This Month</span>
                <span className="font-medium text-gray-900 dark:text-white">128.3h</span>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Project Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Current project status and completion rates
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Active Projects</span>
                <span className="font-medium text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                <span className="font-medium text-gray-900 dark:text-white">12</span>
              </div>
            </div>
          </div>

          {/* Task Completion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Task Completion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Task completion rates and productivity metrics
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Completed Today</span>
                <span className="font-medium text-gray-900 dark:text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">This Week</span>
                <span className="font-medium text-gray-900 dark:text-white">23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Reports</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Weekly Time Report</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Detailed breakdown of time spent on projects</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  View Report
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Project Performance</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analysis of project timelines and efficiency</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  View Report
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Client Billing Report</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time tracking and billing summary by client</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
