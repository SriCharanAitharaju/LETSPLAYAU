import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, TrendingUp } from "lucide-react";
import type { Court, SportType } from "@shared/schema";
import { SPORT_METADATA } from "@shared/schema";

interface DashboardSummaryProps {
  courts: Court[];
  sportStats: Record<SportType, { available: number; total: number }>;
}

export function DashboardSummary({ courts, sportStats }: DashboardSummaryProps) {
  const stats = useMemo(() => {
    const totalAvailable = courts.filter(c => c.status === "available").length;
    const totalOccupied = courts.filter(c => c.status === "occupied").length;
    
    // Find most popular sport (most occupied)
    let mostPopularSport: SportType = "badminton";
    let maxOccupied = 0;
    
    (Object.keys(sportStats) as SportType[]).forEach(sport => {
      const occupied = sportStats[sport].total - sportStats[sport].available;
      if (occupied > maxOccupied) {
        maxOccupied = occupied;
        mostPopularSport = sport;
      }
    });

    return {
      totalAvailable,
      totalOccupied,
      mostPopularSport: SPORT_METADATA[mostPopularSport].name,
      utilizationRate: courts.length > 0 ? Math.round((totalOccupied / courts.length) * 100) : 0,
    };
  }, [courts, sportStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="dashboard-summary">
      <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent" data-testid="card-summary-available">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide" data-testid="text-summary-available-label">
                Available Now
              </p>
              <p className="text-4xl font-bold text-foreground" data-testid="text-summary-available">
                {stats.totalAvailable}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-summary-available-total">
                out of {courts.length} courts
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center" data-testid="icon-summary-available">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-chart-2 bg-gradient-to-br from-chart-2/5 to-transparent" data-testid="card-summary-occupied">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide" data-testid="text-summary-occupied-label">
                Currently Active
              </p>
              <p className="text-4xl font-bold text-foreground" data-testid="text-summary-occupied">
                {stats.totalOccupied}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-summary-occupied-users">
                users playing now
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center" data-testid="icon-summary-occupied">
              <Users className="w-6 h-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-chart-3 bg-gradient-to-br from-chart-3/5 to-transparent" data-testid="card-summary-popular">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide" data-testid="text-summary-popular-label">
                Most Popular
              </p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-summary-popular">
                {stats.mostPopularSport}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-summary-utilization">
                {stats.utilizationRate}% utilization
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center" data-testid="icon-summary-popular">
              <TrendingUp className="w-6 h-6 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
