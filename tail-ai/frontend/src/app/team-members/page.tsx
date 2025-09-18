'use client'

import { TeamMembers } from "@/components/sections/team-members"
import { MainLayout } from "@/components/layout/main-layout";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamMembersPage() {
  const { permissions, isLoading } = useTeamPermissions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !permissions.canAccessTeamMembers) {
      router.push('/dashboard');
    }
  }, [mounted, isLoading, permissions.canAccessTeamMembers, router]);

  if (!mounted || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!permissions.canAccessTeamMembers) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TeamMembers />
    </MainLayout>
  );
}



