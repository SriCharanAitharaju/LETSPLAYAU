import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Sports Court Booking
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Book your favorite sports court in seconds
          </p>
          
          <div className="space-y-3 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in with your college email to get started
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Email format: 24eg104a28@anurag.edu.in
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
