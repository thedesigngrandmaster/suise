import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { HomeFeed } from "@/components/HomeFeed";

type AppState = "splash" | "onboarding" | "home";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("splash");

  // Auto-transition from splash after a few seconds if user doesn't tap
  useEffect(() => {
    if (appState === "splash") {
      const timer = setTimeout(() => {
        setAppState("onboarding");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  if (appState === "splash") {
    return <SplashScreen onComplete={() => setAppState("onboarding")} />;
  }

  if (appState === "onboarding") {
    return <OnboardingFlow onComplete={() => setAppState("home")} />;
  }

  return <HomeFeed />;
};

export default Index;