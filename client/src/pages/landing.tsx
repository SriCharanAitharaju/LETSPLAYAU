import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!email.endsWith("@anurag.edu.in")) {
      setError("Please use your college email (e.g., 24eg104a28@anurag.edu.in)");
      return;
    }

    setIsLoading(true);
    // Store email in session storage temporarily if needed
    sessionStorage.setItem("userEmail", email);
    // Redirect to Replit login
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Sports Court Booking
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">
              Book your favorite sports court in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="24eg104a28@anurag.edu.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-error">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
              data-testid="button-signin"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Use your college email to sign in
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
