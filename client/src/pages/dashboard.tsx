import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourtCard } from "@/components/court-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSummary } from "@/components/dashboard-summary";
import { useToast } from "@/hooks/use-toast";
import type { Court, SportType } from "@shared/schema";
import { SPORT_METADATA } from "@shared/schema";
import { 
  Activity, 
  Circle, 
  Grid3x3, 
  CircleDot, 
  Hexagon 
} from "lucide-react";

const SPORT_ICONS: Record<SportType, React.ComponentType<any>> = {
  badminton: Activity,
  volleyball: Circle,
  carrom: Grid3x3,
  basketball: CircleDot,
  football: Hexagon,
  tennis: Activity,
};

export default function Dashboard() {
  const [selectedSport, setSelectedSport] = useState<SportType | "all">("all");
  const [courts, setCourts] = useState<Court[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  // Fetch initial courts data
  const { data: initialCourts, isLoading } = useQuery<Court[]>({
    queryKey: ["/api/courts"],
  });

  // Set up WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "court_update") {
        if (message.courts) {
          setCourts(message.courts);
        } else if (message.court) {
          setCourts(prev => 
            prev.map(c => c.id === message.court.id ? message.court : c)
          );
        }
      } else if (message.type === "check_in" || message.type === "check_out") {
        if (message.courts) {
          setCourts(message.courts);
        }
      } else if (message.type === "session_warning") {
        if (message.courts) {
          setCourts(message.courts);
        }
        toast({
          title: "Session Ending Soon",
          description: message.message || "Your session will end in 10 minutes",
          variant: "destructive",
        });
      } else if (message.type === "session_expired") {
        if (message.courts) {
          setCourts(message.courts);
        }
        toast({
          title: "Session Expired",
          description: message.message || "A court session has expired and is now available",
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  // Initialize courts from query
  useEffect(() => {
    if (initialCourts) {
      setCourts(initialCourts);
    }
  }, [initialCourts]);

  // Filter courts by selected sport
  const filteredCourts = useMemo(() => {
    if (selectedSport === "all") return courts;
    return courts.filter(c => c.sport === selectedSport);
  }, [courts, selectedSport]);

  // Group courts by sport
  const courtsBySport = useMemo(() => {
    const grouped: Record<SportType, Court[]> = {
      badminton: [],
      volleyball: [],
      carrom: [],
      basketball: [],
      football: [],
      tennis: [],
    };

    filteredCourts.forEach(court => {
      grouped[court.sport].push(court);
    });

    return grouped;
  }, [filteredCourts]);

  // Calculate stats for each sport
  const sportStats = useMemo(() => {
    const stats: Record<SportType, { available: number; total: number }> = {
      badminton: { available: 0, total: 0 },
      volleyball: { available: 0, total: 0 },
      carrom: { available: 0, total: 0 },
      basketball: { available: 0, total: 0 },
      football: { available: 0, total: 0 },
      tennis: { available: 0, total: 0 },
    };

    courts.forEach(court => {
      stats[court.sport].total++;
      if (court.status === "available") {
        stats[court.sport].available++;
      }
    });

    return stats;
  }, [courts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader totalAvailable={0} totalCourts={0} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <Skeleton className="h-32 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAvailable = courts.filter(c => c.status === "available").length;
  const totalCourts = courts.length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader totalAvailable={totalAvailable} totalCourts={totalCourts} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-12">
        {/* Dashboard Summary */}
        <DashboardSummary courts={courts} sportStats={sportStats} />

        {/* Category Filter Tabs */}
        <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b">
          <Tabs value={selectedSport} onValueChange={(v) => setSelectedSport(v as SportType | "all")} data-testid="tabs-sport-filter">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent p-0" data-testid="tabs-list-sports">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-all"
              >
                All Sports
                <Badge variant="secondary" className="ml-2" data-testid="badge-all-count">
                  {totalAvailable}/{totalCourts}
                </Badge>
              </TabsTrigger>
              {(Object.keys(SPORT_METADATA) as SportType[]).map(sport => {
                const Icon = SPORT_ICONS[sport];
                const stats = sportStats[sport];
                return (
                  <TabsTrigger 
                    key={sport}
                    value={sport}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-${sport}`}
                  >
                    <Icon className="w-4 h-4 mr-2" data-testid={`icon-tab-${sport}`} />
                    {SPORT_METADATA[sport].name}
                    <Badge variant="secondary" className="ml-2" data-testid={`badge-${sport}-count`}>
                      {stats.available}/{stats.total}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Sport Sections */}
        <div className="space-y-12">
          {(Object.keys(courtsBySport) as SportType[]).map(sport => {
            const sportCourts = courtsBySport[sport];
            if (sportCourts.length === 0) return null;

            const Icon = SPORT_ICONS[sport];
            const stats = sportStats[sport];

            return (
              <section key={sport} className="space-y-6" data-testid={`section-${sport}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center" data-testid={`icon-${sport}`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold" data-testid={`heading-${sport}`}>{SPORT_METADATA[sport].name}</h2>
                      <p className="text-sm text-muted-foreground" data-testid={`text-${sport}-availability`}>
                        Available: {stats.available}/{stats.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sportCourts.map(court => (
                    <CourtCard key={court.id} court={court} ws={ws} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourts.length === 0 && (
          <Card className="border-dashed" data-testid="card-empty-state">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4" data-testid="icon-empty-state">
                <Circle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="heading-empty-state">No courts available</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm" data-testid="text-empty-state">
                There are no courts in the selected category. Please try another sport.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
