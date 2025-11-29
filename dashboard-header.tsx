import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  totalAvailable: number;
  totalCourts: number;
}

export function DashboardHeader({ totalAvailable, totalCourts }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">AU</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-app-title">
                Anurag University
              </h1>
              <p className="text-sm text-muted-foreground">Sports Complex Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Total Availability</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-total-availability">
                {totalAvailable}/{totalCourts}
              </p>
            </div>
            <Badge 
              variant={totalAvailable > 0 ? "default" : "secondary"}
              className="h-12 px-6 text-lg font-semibold"
              data-testid="badge-availability-status"
            >
              {totalAvailable > 0 ? `${totalAvailable} Available` : "All Occupied"}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
