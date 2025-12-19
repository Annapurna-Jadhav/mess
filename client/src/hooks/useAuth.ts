import {
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { auth, googleProvider } from "@/firebase";
import { setAccessToken, clearAuth } from "@/auth/authStore";
import { continueAuth } from "@/api/auth.api";
import type { AuthUser } from "@/auth/auth.types";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 FINALIZE AUTH (single source)
  const finalizeAuth = useCallback(async (navigateAfter = true) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("Authentication failed");

    const token = await firebaseUser.getIdToken(true);
    setAccessToken(token);

    const { user, redirectTo } = await continueAuth();
    setUser(user);

    if (navigateAfter) {
      navigate(redirectTo, { replace: true });
    }

    return user;
  }, [navigate]);

  // ---------- EMAIL LOGIN ----------
  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await finalizeAuth();
      toast.success("Logged in successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
      throw err;
    }
  };

  // ---------- EMAIL SIGNUP ----------
  const signupWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await finalizeAuth();
      toast.success("Account created successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
      throw err;
    }
  };

  // ---------- GOOGLE LOGIN ----------
  const googleAuth = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
      throw err;
    }
  };

  // ---------- GOOGLE REDIRECT HANDLER ----------
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;

        await finalizeAuth();
        toast.success("Logged in successfully");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Authentication failed");
        await signOut(auth);
        clearAuth();
      }
    };

    handleRedirect();
  }, [finalizeAuth]);

  // ---------- SESSION RESTORE (NO REDIRECT) ----------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          clearAuth();
          return;
        }

        const token = await firebaseUser.getIdToken();
        setAccessToken(token);

        const { user } = await continueAuth();
        setUser(user);
      } catch {
        setUser(null);
        clearAuth();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ---------- LOGOUT ----------
  const logout = async () => {
    await signOut(auth);
    clearAuth();
    setUser(null);
    navigate("/login", { replace: true });
    toast.success("Logged out");
  };

  return {
    user,
    loading, // 🔐 use in ProtectedRoute
    loginWithEmail,
    signupWithEmail,
    googleAuth,
    logout,
  };
};
