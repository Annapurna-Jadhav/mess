import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authSchema, type AuthSchema } from "@/auth/auth.schema";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { loginWithEmail, signupWithEmail, googleAuth } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthSchema) => {
    if (mode === "login") {
      await loginWithEmail(data.email, data.password);
    } else {
      await signupWithEmail(data.email, data.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-muted shadow-lg">
        {/* HEADER */}
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-semibold text-[#6770d2]">
            Welcome to SmartMessBalance
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Smart access. Secure balance. Built for campus life.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Institute Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@nitk.edu.in"
                  className="pl-9 h-11 focus-visible:ring-[#6770d2]"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder="......"
                  className="pl-9 pr-10 h-11 focus-visible:ring-[#6770d2]"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-[#6770d2]"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#6770d2] hover:bg-[#5b63c7] transition-colors"
              disabled={isSubmitting}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* MODE SWITCH */}
          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-[#6770d2] font-medium hover:underline"
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

          <Separator />

          {/* GOOGLE AUTH */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-[#6770d2] text-[#6770d2] hover:bg-[#6770d2]/10 transition"
            onClick={googleAuth}
          >
            {mode === "login"
              ? "Sign in with Google"
              : "Sign up with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}