import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Dashboard from "./dashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome, {user?.firstName || user?.email}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/api/logout"}
          data-testid="button-logout"
        >
          Sign Out
        </Button>
      </div>
      <Dashboard />
    </div>
  );
}
