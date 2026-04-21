import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { setTokenGetter } from "@/lib/proposals/api";
import { ProposalComposer } from "./ProposalComposer";

type Ctx = {
  open: () => void;
};

const ProposalContext = createContext<Ctx | null>(null);

export function ProposalProvider({ children }: { children: React.ReactNode }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  const open = useCallback(() => setComposerOpen(true), []);

  return (
    <ProposalContext.Provider value={{ open }}>
      {children}
      <ProposalComposer open={composerOpen} onOpenChange={setComposerOpen} />
    </ProposalContext.Provider>
  );
}

export function useNewProposal(): Ctx {
  const ctx = useContext(ProposalContext);
  if (!ctx) throw new Error("useNewProposal must be used within ProposalProvider");
  return ctx;
}
