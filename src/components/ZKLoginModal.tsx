import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import phantomLogo from "@/assets/images/wallet-logo/phantom-logo.svg";
import slushLogo from "@/assets/images/wallet-logo/slush-logo.svg";

interface ZKLoginModalProps {
  onLogin: () => void;
}

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export function ZKLoginModal({ onLogin }: ZKLoginModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithSlush,
    signInWithPhantom,
  } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = isSignUp
      ? await signUpWithEmail(email, password, displayName)
      : await signInWithEmail(email, password);

    setLoading(false);
    if (!result.error) onLogin();
  };

  if (showEmailForm) {
    return (
      <div className="w-full max-w-sm p-6 bg-card rounded-2xl">
        <button
          onClick={() => setShowEmailForm(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h3 className="text-xl font-bold mb-4">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h3>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm p-6 bg-card rounded-2xl space-y-3">
      <Button variant="outline" onClick={signInWithGoogle}>
        <GoogleIcon /> Continue with Google
      </Button>

      <Button variant="outline" onClick={() => setShowEmailForm(true)}>
        <Mail className="w-5 h-5" /> Continue with Email
      </Button>

      <Button variant="outline" onClick={signInWithSlush}>
        <img src={slushLogo} className="w-5 h-5" /> Continue with Slush
      </Button>

      <Button variant="outline" onClick={signInWithPhantom}>
        <img src={phantomLogo} className="w-5 h-5" /> Continue with Phantom
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" />;
}