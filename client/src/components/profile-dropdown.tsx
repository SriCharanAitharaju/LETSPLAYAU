import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Palette,
  Settings,
  HelpCircle,
  LogOut,
  User as UserIcon,
  Smartphone,
} from "lucide-react";
import type { User } from "@shared/schema";

export function ProfileDropdown() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const handleLogout = async () => {
    try {
      // Navigate directly to logout endpoint which handles redirect
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const handleThemeChange = (newTheme: string) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    localStorage.setItem("theme", newTheme);
  };

  const getTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const currentTheme = getTheme();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-profile-menu"
            className="hover-elevate"
          >
            <UserIcon className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">
            {user?.firstName || "Profile"}
          </DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpenDialog("history")}
            data-testid="menu-item-history"
          >
            <Clock className="w-4 h-4 mr-2" />
            <span>Booking History</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid="menu-item-theme">
              <Palette className="w-4 h-4 mr-2" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                checked={currentTheme === "light"}
                onCheckedChange={() => handleThemeChange("light")}
                data-testid="theme-light"
              >
                Light
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentTheme === "dark"}
                onCheckedChange={() => handleThemeChange("dark")}
                data-testid="theme-dark"
              >
                Dark
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentTheme === "system"}
                onCheckedChange={() => handleThemeChange("system")}
                data-testid="theme-system"
              >
                System
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            onClick={() => setOpenDialog("settings")}
            data-testid="menu-item-settings"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDialog("help")}
            data-testid="menu-item-help"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            <span>Help & Support</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            data-testid="menu-item-logout"
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* History Dialog */}
      <Dialog open={openDialog === "history"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking History</DialogTitle>
            <DialogDescription>
              Your recent court bookings and sessions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground text-center py-8">
              No booking history yet. Your bookings will appear here.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openDialog === "settings"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Account Information
              </div>
              <div className="space-y-2 text-sm">
                <p>Email: {user?.email}</p>
                <p>Name: {user?.firstName}</p>
                <p>Auth Method: {user?.authMethod === "oauth" ? "Google Sign-In" : "Email & Password"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={openDialog === "help"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Frequently asked questions and support
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">How do I book a court?</h4>
              <p className="text-muted-foreground">
                Select a court from the dashboard and click "Check In" to book it. You can only book one court at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">How long can I use a court?</h4>
              <p className="text-muted-foreground">
                Each booking is valid for 1 hour. You'll receive a warning 10 minutes before your session expires.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Can I extend my session?</h4>
              <p className="text-muted-foreground">
                You can book the same court again after your current session ends.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Contact Support</h4>
              <p className="text-muted-foreground">
                Email: support@anurag.edu.in
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
