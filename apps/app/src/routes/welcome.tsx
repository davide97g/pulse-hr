import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Users, Briefcase, FolderKanban, Receipt, Award, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createWorkspace, useWorkspaceStatus } from "@/lib/workspace";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse HR" }] }),
  component: Welcome,
});

const SEED_PREVIEW = [
  { icon: Users, label: "12 employees" },
  { icon: Briefcase, label: "8 clients" },
  { icon: FolderKanban, label: "Active projects + timesheets" },
  { icon: Receipt, label: "Leave, expenses, payroll" },
  { icon: Award, label: "Kudos, focus sessions, pulse" },
  { icon: Building2, label: "4 offices with rooms & seats" },
];

function Welcome() {
  const navigate = useNavigate();
  const status = useWorkspaceStatus();
  const [creating, setCreating] = useState(false);

  // If a workspace is already provisioned, this page has no purpose.
  useEffect(() => {
    if (status.ready) navigate({ to: "/", replace: true });
  }, [status.ready, navigate]);

  const handleCreate = () => {
    if (creating) return;
    setCreating(true);
    // Run the seed inside a microtask so the button can paint its loading state.
    queueMicrotask(() => {
      try {
        createWorkspace();
        toast.success("Workspace ready", { icon: <Sparkles className="h-4 w-4" /> });
        navigate({ to: "/", replace: true });
      } catch (err) {
        console.warn(err);
        setCreating(false);
        toast.error("Could not create workspace");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl p-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold">Welcome to Pulse</h1>
            <p className="text-sm text-muted-foreground">Set up your demo workspace.</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          We'll seed your workspace with a sample organisation so you can explore every feature
          with realistic data. Everything lives in your browser — edits stick across reloads, and
          you can reset any time from{" "}
          <span className="font-medium text-foreground">Settings → Workspace</span>.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SEED_PREVIEW.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-md border bg-card/50 px-3 py-2 text-sm"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end gap-2">
          <Button
            size="lg"
            className="press-scale"
            onClick={handleCreate}
            disabled={creating || !status.hasUser}
          >
            {creating ? "Creating workspace…" : "Create my workspace"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
