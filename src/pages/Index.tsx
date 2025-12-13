import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { HomeFeed } from "@/components/HomeFeed";
import { useAuth } from "@/hooks/useAuth";

type AppState = "splash" | "onboarding" | "home";

const Index = () => {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("splash");

  // Auto-transition from splash after a few seconds if user doesn't tap
  useEffect(() => {
    if (appState === "splash") {
      const timer = setTimeout(() => {
        if (loading) return;
        setAppState(user ? "home" : "onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState, user, loading]);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (!loading && user && appState === "onboarding") {
      setAppState("home");
    }
  }, [user, loading, appState]);

  if (loading) {
    return <SplashScreen />;
  }

  if (appState === "splash") {
    return (
      <SplashScreen
        onComplete={() => setAppState(user ? "home" : "onboarding")}
      />
    );
  }

  if (appState === "onboarding" && !user) {
    return <OnboardingFlow onComplete={() => setAppState("home")} />;
  }

  return <HomeFeed />;
};

export default Index;
