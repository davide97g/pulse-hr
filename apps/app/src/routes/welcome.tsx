import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Placeholder } from "@pulse-hr/ui/atoms/Placeholder";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  DEFAULT_WORKSPACE_NAME,
  createWorkspace,
  personalizeWorkspaceOwner,
  useWorkspaceStatus,
} from "@/lib/workspace";
import { setWorkspaceRole } from "@/lib/workspace-role";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse HR" }] }),
  component: Welcome,
});

type Step = 0 | 1;

function Welcome() {
  const navigate = useNavigate();
  const status = useWorkspaceStatus();
  const { user } = useUser();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState(DEFAULT_WORKSPACE_NAME);
  const [colleagues, setColleagues] = useState<string[]>(["", "", ""]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status.ready) navigate({ to: "/", replace: true });
  }, [status.ready, navigate]);

  const canNext = step === 0 ? name.trim().length > 1 : true;

  const currentUserName = (
    user?.fullName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    ""
  ).trim();

  const finish = async () => {
    if (creating) return;
    setCreating(true);

    const cleanColleagues = colleagues.map((c) => c.trim()).filter(Boolean);

    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata ?? {}),
            workspaceName: name.trim() || DEFAULT_WORKSPACE_NAME,
            colleagues: cleanColleagues,
          },
        });
      }
    } catch (err) {
      console.warn("welcome: failed to persist onboarding metadata", err);
    }

    try {
      createWorkspace(name);
      personalizeWorkspaceOwner(currentUserName);
      setWorkspaceRole("admin");
      if (cleanColleagues.length) {
        const today = new Date().toISOString().slice(0, 10);
        for (const cname of cleanColleagues) {
          employeesTable.add(
            makeEmployee({
              name: cname,
              email: `${cname.toLowerCase().replace(/\s+/g, ".")}@${(name || "acme").toLowerCase().replace(/[^a-z0-9]/g, "")}.co`,
              role: "Teammate",
              department: "Your team",
              location: "Remote",
              status: "active",
              joinDate: today,
              salary: 0,
              phone: "",
              employmentType: "Full-time",
            }),
          );
        }
      }
      toast.success(`${name || DEFAULT_WORKSPACE_NAME} è pronto`);
      navigate({ to: "/", replace: true });
    } catch (err) {
      console.warn(err);
      setCreating(false);
      toast.error("Could not create workspace");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 md:px-12 py-10 fade-in"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Eyebrow */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          PULSE · WELCOME · STEP {step + 1} / 2
        </span>
        <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
          PROTOTIPO LOCALE · NESSUNA SINCRONIZZAZIONE
        </span>
      </div>

      {/* Hero */}
      <h1
        className="t-display-it"
        style={{
          margin: "32px 0 16px",
          fontSize: "clamp(72px, 10vw, 144px)",
        }}
      >
        HR per chi <span className="spark-mark">odia</span>
        <br />
        gli HR<span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
      </h1>
      <p
        className="t-body-lg max-w-2xl"
        style={{ color: "var(--fg-2)", marginBottom: 40 }}
      >
        Un workspace, tre stanze: <strong>People</strong>, <strong>Work</strong>, <strong>Money</strong>.
        Diamogli un nome e qualche persona da animare.
      </p>

      {/* Three module rooms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {[
          { eyebrow: "01 · PEOPLE", caption: "Persone, leave, kudos" },
          { eyebrow: "02 · WORK", caption: "Commesse, focus, forecast" },
          { eyebrow: "03 · MONEY", caption: "Payroll, spese, fatture" },
        ].map((room, i) => (
          <div
            key={room.eyebrow}
            className="solid-card flex flex-col gap-3 p-5"
            style={{ minHeight: 220 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {room.eyebrow}
            </span>
            <Placeholder
              className="flex-1"
              caption={`Stanza ${String(i + 1).padStart(2, "0")}`}
            />
            <span
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--fg-2)",
              }}
            >
              {room.caption}
            </span>
          </div>
        ))}
      </div>

      {/* Form panel */}
      <div className="solid-card p-6 md:p-8 max-w-2xl">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {step === 0 ? "01 · DAI UN NOME AL WORKSPACE" : "02 · INVITA QUALCUNO"}
        </span>

        {step === 0 && (
          <div className="mt-4 space-y-3">
            <Label htmlFor="ws-name">Workspace</Label>
            <Input
              id="ws-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_WORKSPACE_NAME}
              disabled={creating}
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 22,
                letterSpacing: "-0.015em",
                height: 48,
              }}
            />
            <p className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
              SEEDIAMO UN'ORGANIZZAZIONE DI ESEMPIO · TUTTO RESTA NEL TUO BROWSER
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <Label htmlFor={`col-${i}`}>Persona {i + 1}</Label>
                <Input
                  id={`col-${i}`}
                  value={colleagues[i]}
                  onChange={(e) =>
                    setColleagues((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                  }
                  placeholder={["Maya Rossi", "Kai Bennett", "Elena Diaz"][i]}
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 18,
                  }}
                />
              </div>
            ))}
            <p className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
              FACOLTATIVO · LE AGGIUNGEREMO ALLA TUA LISTA PERSONE
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <EditorialPill
            kind="ghost"
            size="sm"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0 || creating}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Indietro
          </EditorialPill>

          {step < 1 ? (
            <EditorialPill
              kind="spark"
              arrow
              disabled={!canNext}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              Continua
            </EditorialPill>
          ) : (
            <EditorialPill
              kind="spark"
              arrow={!creating}
              disabled={creating || !status.hasAnyUser}
              onClick={finish}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creazione…
                </>
              ) : (
                <>
                  Crea workspace <Check className="h-4 w-4" />
                </>
              )}
            </EditorialPill>
          )}
        </div>
      </div>
    </div>
  );
}
