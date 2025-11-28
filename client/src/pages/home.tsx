import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Dashboard from "./dashboard";
import WelcomeSplash from "./welcome-splash";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useState } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  const studentName = user?.firstName || user?.email?.split("@")[0] || "Student";

  if (!showDashboard) {
    return (
      <WelcomeSplash
        studentName={studentName}
        onComplete={() => setShowDashboard(true)}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome, {studentName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {user?.email}
            </p>
          </div>
          <ProfileDropdown />
        </div>
      </Card>

      <div>
        <Dashboard />
      </div>
    </div>
  );
}
