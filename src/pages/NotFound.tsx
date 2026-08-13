import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { Home, ArrowLeft } from "lucide-react";

/**
 * True 404 page — used when the path is not a real route
 * and not a valid username profile URL.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404: no route for", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#0E131F] flex flex-col">
      <header className="border-b border-black/[0.04]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9C76F5] rounded-lg"
            aria-label="Suise home"
          >
            <BrandHeader />
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold tracking-wide text-[#9C76F5] mb-3">404</p>
          <h1 className="font-bricolage text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            This page doesn’t exist
          </h1>
          <p className="text-[#0E131F]/65 leading-relaxed mb-8">
            The link may be broken, or the page may have been removed. Double-check the URL,
            or head back home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="rounded-full bg-[#9C76F5] text-white hover:bg-[#8B63E8]"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
          </div>
          <p className="mt-8 text-xs text-[#0E131F]/35 font-mono truncate max-w-full">
            {location.pathname}
          </p>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
