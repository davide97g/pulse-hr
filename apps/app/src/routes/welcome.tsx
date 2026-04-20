import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_WORKSPACE_NAME, createWorkspace, useWorkspaceStatus } from "@/lib/workspace";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse HR" }] }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const status = useWorkspaceStatus();
  const [name, setName] = useState(DEFAULT_WORKSPACE_NAME);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status.ready) navigate({ to: "/", replace: true });
  }, [status.ready, navigate]);

  const handleCreate = () => {
    if (creating) return;
    setCreating(true);
    queueMicrotask(() => {
      try {
        createWorkspace(name);
        toast.success(`${name || DEFAULT_WORKSPACE_NAME} is ready`, {
          icon: <Sparkles className="h-4 w-4" />,
        });
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
      <Card className="w-full max-w-md p-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold">Welcome to Pulse</h1>
            <p className="text-sm text-muted-foreground">Name your demo workspace.</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          We'll seed a sample organisation so you can explore every feature with realistic data.
          Everything lives in your browser — edits stick across reloads, and you can reset any time.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_WORKSPACE_NAME}
              disabled={creating}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="submit"
              size="lg"
              className="press-scale"
              disabled={creating || !status.hasUser}
            >
              {creating ? "Creating workspace…" : "Create my workspace"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
