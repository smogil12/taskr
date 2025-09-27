'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { TeamMemberTaskPieChart } from "@/components/charts/TeamMemberTaskPieChart";

interface ReportsData {
  timeTracking: {
    thisWeek: number;
    thisMonth: number;
  };
  projectProgress: {
    active: number;
    completed: number;
  };
  taskCompletion: {
    completedToday: number;
    completedThisWeek: number;
  };
  teamMemberTasks: {
    name: string;
    tasks: number;
    color: string;
  }[];
}

export default function ReportsPage() {
  const { token } = useAuth();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchReportsData();
    }
  }, [token]);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both reports summary and team member task data
      const [reportsResponse, teamTasksResponse] = await Promise.all([
        fetch('/api/reports/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/reports/team-member-tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (reportsResponse.ok && teamTasksResponse.ok) {
        const [reportsData, teamTasksData] = await Promise.all([
          reportsResponse.json(),
          teamTasksResponse.json()
        ]);

        // Debug logging
        console.log('🔍 Team tasks data from API:', teamTasksData);
        console.log('🔍 Team members with tasks:', teamTasksData.teamMemberTasks);
        console.log('🔍 Total team members:', teamTasksData.totalTeamMembers);
        console.log('🔍 Total tasks:', teamTasksData.totalTasks);

        // Combine the data
        const combinedData = {
          ...reportsData,
          teamMemberTasks: teamTasksData.teamMemberTasks || []
        };
        
        setReportsData(combinedData);
      } else {
        const errorData = reportsResponse.ok 
          ? await teamTasksResponse.json() 
          : await reportsResponse.json();
        setError(errorData.error || 'Failed to fetch reports data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View detailed reports and analytics for your projects and time tracking.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View detailed reports and analytics for your projects and time tracking.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchReportsData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.timeTracking.thisWeek || 0}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">This Month</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.timeTracking.thisMonth || 0}h
                </span>
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.projectProgress.active || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.projectProgress.completed || 0}
                </span>
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.taskCompletion.completedToday || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">This Week</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportsData?.taskCompletion.completedThisWeek || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Member Task Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Member Task Distribution</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visual breakdown of tasks assigned to each team member
            </p>
          </div>
          <div className="p-6">
            {reportsData?.teamMemberTasks && reportsData.teamMemberTasks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <TeamMemberTaskPieChart 
                    data={reportsData.teamMemberTasks}
                    title="Tasks by Team Member"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportsData.teamMemberTasks.reduce((sum, member) => sum + member.tasks, 0)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportsData.teamMemberTasks.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Team Members with Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportsData.teamMemberTasks.length > 0 
                        ? Math.round(reportsData.teamMemberTasks.reduce((sum, member) => sum + member.tasks, 0) / reportsData.teamMemberTasks.length)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Tasks per Member</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Task Data Available</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks have been assigned to team members yet. Start by creating tasks and assigning them to team members.
                </p>
              </div>
            )}
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
