import { SplashScreen } from "@/components/SplashScreen";
import { HomeFeed } from "@/components/HomeFeed";
import Landing from "@/pages/Landing";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!user) return <Landing />;
  return <HomeFeed />;
};

export default Index;
