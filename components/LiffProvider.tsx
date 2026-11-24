"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Liff } from "@line/liff";

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

type LiffContextType = {
  liff: Liff | null;
  profile: Profile | null;
  idToken: string | null;
  error: string | null;
  loading: boolean;
};

const initialState: LiffContextType = {
  liff: null,
  profile: null,
  idToken: null,
  error: null,
  loading: true,
};

const LiffContext = createContext<LiffContextType>(initialState);

export const useLiff = () => useContext(LiffContext);

export default function LiffProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LiffContextType>(initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error("ไม่พบ NEXT_PUBLIC_LIFF_ID ในไฟล์ .env.local");
        }

        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login(); // redirect ไปหน้า login แล้วกลับมา
          return;
        }

        const profile = await liff.getProfile();
        const idToken = liff.getIDToken();

        setState({ liff, profile, idToken, error: null, loading: false });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "LIFF init failed";
        setState((s) => ({ ...s, error: message, loading: false }));
      }
    };

    init();
  }, []);

  return <LiffContext.Provider value={state}>{children}</LiffContext.Provider>;
}