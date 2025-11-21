import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Clock, LogIn, LogOut } from "lucide-react";
import type { Court } from "@shared/schema";

interface CourtCardProps {
  court: Court;
  ws: WebSocket | null;
}

export function CourtCard({ court, ws }: CourtCardProps) {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

  // Update timer every second for occupied courts
  useEffect(() => {
    if (court.status === "occupied" && court.currentSession) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, court.currentSession!.endTime - now);
        const progressPercent = (remaining / 3600000) * 100;
        
        setTimeRemaining(Math.floor(remaining / 1000));
        setProgress(progressPercent);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(0);
      setProgress(100);
    }
  }, [court]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/check-in", { courtId: court.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courts"] });
      toast({
        title: "Checked In Successfully",
        description: `You have checked into ${court.name}. Enjoy your session!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Unable to check in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/check-out", { courtId: court.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courts"] });
      toast({
        title: "Checked Out Successfully",
        description: `Thank you for using ${court.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-out Failed",
        description: error.message || "Unable to check out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isAvailable = court.status === "available";
  const isProcessing = checkInMutation.isPending || checkOutMutation.isPending;

  return (
    <Card 
      className={`transition-all duration-300 ${
        isAvailable 
          ? "border-t-4 border-t-green-500 shadow-lg hover:shadow-xl" 
          : "border-t-4 border-t-red-500 shadow-md opacity-90"
      }`}
      data-testid={`card-court-${court.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground" data-testid={`text-court-name-${court.id}`}>
              {court.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Court #{court.courtNumber}
            </p>
          </div>
          <Badge 
            variant={isAvailable ? "default" : "secondary"}
            className={`uppercase tracking-wide ${
              isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
            data-testid={`badge-status-${court.id}`}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Occupied
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {!isAvailable && court.currentSession && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2" data-testid={`text-timer-label-${court.id}`}>Time Remaining</p>
              <p className="text-4xl font-mono font-bold text-foreground" data-testid={`text-timer-${court.id}`}>
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-muted-foreground mt-2" data-testid={`text-auto-checkout-${court.id}`}>
                Auto checkout at {new Date(court.currentSession.endTime).toLocaleTimeString()}
              </p>
            </div>
            <Progress value={progress} className="h-2" data-testid={`progress-${court.id}`} />
          </div>
        )}

        {isAvailable && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3" data-testid={`icon-available-${court.id}`}>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground" data-testid={`text-ready-${court.id}`}>
              This court is ready for use
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        {isAvailable ? (
          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={isProcessing}
            className="w-full"
            size="lg"
            data-testid={`button-checkin-${court.id}`}
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Check In
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => checkOutMutation.mutate()}
            disabled={isProcessing}
            variant="destructive"
            className="w-full"
            size="lg"
            data-testid={`button-checkout-${court.id}`}
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Checking Out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Check Out
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
