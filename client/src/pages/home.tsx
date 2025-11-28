import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Dashboard from "./dashboard";
import { LogOut } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  const studentName = user?.firstName || user?.email?.split("@")[0] || "Student";

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>

      <div>
        <Dashboard />
      </div>
    </div>
  );
}
