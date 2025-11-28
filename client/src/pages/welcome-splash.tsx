import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface WelcomeSplashProps {
  studentName: string;
  onComplete: () => void;
}

export default function WelcomeSplash({ studentName, onComplete }: WelcomeSplashProps) {
  const [displayText, setDisplayText] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setDisplayText(true), 300);
    const checkTimer = setTimeout(() => setShowCheck(true), 800);
    const completeTimer = setTimeout(onComplete, 2800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(checkTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div
          className={`transition-all duration-700 transform ${
            displayText ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Welcome!
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-blue-100 mb-8">
            {studentName}
          </p>
        </div>

        {showCheck && (
          <div
            className={`transition-all duration-500 transform ${
              showCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
              </div>
            </div>
          </div>
        )}

        <p className="text-white/80 text-lg font-medium">
          Ready to book your sports court?
        </p>
      </div>
    </div>
  );
}
