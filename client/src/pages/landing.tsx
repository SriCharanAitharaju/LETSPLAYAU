import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue: string) => {
    if (!emailValue.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }

    if (!emailValue.endsWith("@anurag.edu.in")) {
      return "Please use your Anurag University email (format: yourname@anurag.edu.in)";
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsLoading(true);
    sessionStorage.setItem("userEmail", email);
    window.location.href = "/api/login";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Sports Court Booking
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              Book your favorite sports court in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Anurag University Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@anurag.edu.in"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                data-testid="input-email"
                className="border-slate-300 dark:border-slate-600"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format: yourname@anurag.edu.in
              </p>
            </div>

            {error && (
              <div 
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                data-testid="text-error"
              >
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
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

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your university email to access the court booking system
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
