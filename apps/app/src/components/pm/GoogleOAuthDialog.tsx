import { useEffect, useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { IntegrationConnection, SyncDirection } from "@/lib/mock-data";

type Step = "account" | "scopes" | "connecting" | "done";

const MOCK_ACCOUNTS = [
  { email: "davide@pulsehr.test", name: "Davide Ghiotto", initial: "D" },
  { email: "davide.work@gmail.com", name: "Davide Ghiotto", initial: "D" },
];

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleOAuthDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnected: (c: IntegrationConnection) => void;
}) {
  const [step, setStep] = useState<Step>("account");
  const [account, setAccount] = useState(MOCK_ACCOUNTS[0]);
  const [writeScope, setWriteScope] = useState(true);

  useEffect(() => {
    if (!open) {
      // reset on close so reopening starts clean
      const t = setTimeout(() => {
        setStep("account");
        setAccount(MOCK_ACCOUNTS[0]);
        setWriteScope(true);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const pickAccount = (a: (typeof MOCK_ACCOUNTS)[number]) => {
    setAccount(a);
    setStep("scopes");
  };

  const allow = () => {
    setStep("connecting");
    const syncDirection: SyncDirection = writeScope ? "two-way" : "import";
    window.setTimeout(() => {
      const now = new Date().toISOString();
      onConnected({
        provider: "google-calendar",
        status: "connected",
        workspace: account.email,
        connectedAt: now,
        syncedAt: now,
        syncDirection,
        webhookEvents: [
          {
            id: `w-${Date.now()}`,
            at: now,
            kind: "auth",
            summary: `OAuth granted (${writeScope ? "two-way" : "import-only"})`,
          },
        ],
      });
      setStep("done");
      window.setTimeout(() => onOpenChange(false), 700);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-white text-neutral-900 shadow-2xl">
        {/* Hard-coded Google-ish palette — intentionally bypasses theme tokens */}
        <div className="px-6 pt-6 pb-5 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <GoogleLogo size={18} />
            <span className="font-medium">Sign in with Google</span>
          </div>
        </div>

        {step === "account" && (
          <div className="px-6 py-5">
            <DialogTitle className="text-[22px] font-normal text-neutral-900">
              Choose an account
            </DialogTitle>
            <DialogDescription className="text-neutral-500 mt-1">
              to continue to <span className="text-neutral-700">Pulse HR</span>
            </DialogDescription>
            <div className="mt-5 divide-y divide-neutral-200 border border-neutral-200 rounded-md">
              {MOCK_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => pickAccount(a)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-sm font-semibold">
                    {a.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-900 truncate">{a.name}</div>
                    <div className="text-xs text-neutral-500 truncate">{a.email}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
              ))}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Use another account
            </button>
          </div>
        )}

        {step === "scopes" && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-[10px] font-semibold">
                {account.initial}
              </div>
              <span>{account.email}</span>
            </div>
            <DialogTitle className="text-[20px] font-normal text-neutral-900 mt-4">
              Pulse HR wants to access your Google Account
            </DialogTitle>
            <DialogDescription className="text-neutral-500 mt-2">
              This will allow Pulse HR to:
            </DialogDescription>

            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-neutral-600" />
                </span>
                <span className="text-neutral-700">
                  See events and other details on your primary calendar
                </span>
              </li>
              <li className="flex items-start gap-3">
                <label className="flex items-start gap-3 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={writeScope}
                    onChange={(e) => setWriteScope(e.target.checked)}
                    className="mt-1 accent-blue-600"
                  />
                  <span className="text-neutral-700">
                    <span className="block">
                      See, edit, share, and permanently delete calendars
                    </span>
                    <span className="block text-xs text-neutral-500 mt-0.5">
                      Uncheck to connect in read-only (import) mode.
                    </span>
                  </span>
                </label>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-neutral-600" />
                </span>
                <span className="text-neutral-700">
                  See your primary Google Account email address
                </span>
              </li>
            </ul>

            <p className="mt-5 text-xs text-neutral-500 leading-relaxed">
              Make sure you trust Pulse HR. You may be sharing sensitive info with this site or app.
              You can always see or remove access in your Google Account.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                onClick={allow}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Allow
              </button>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="px-6 py-10 flex flex-col items-center justify-center gap-3 text-neutral-700">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div className="text-sm">Connecting to Google Calendar…</div>
          </div>
        )}

        {step === "done" && (
          <div className="px-6 py-10 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-neutral-700">Connected</div>
            <div className="text-xs text-neutral-500">{account.email}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
