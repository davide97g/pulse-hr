/**
 * Mounts once at the root, after Clerk has resolved. Two jobs:
 *
 * 1. Bridge Clerk's userId into the workspace controller. When the user
 *    changes (sign-in / sign-out / account swap), every persistent table
 *    re-hydrates from the new namespace or clears.
 * 2. Surface a sonner toast when the stored workspace's schemaVersion
 *    differs from the code's SCHEMA_VERSION, with a Reset action. The
 *    toast deliberately does not auto-wipe — reviewers must opt in so
 *    "my data disappeared" is never a mystery.
 *
 * Renders nothing.
 */
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import {
  ANON_USER_ID,
  createWorkspace,
  getNamespace,
  isWorkspaceReady,
  resetWorkspace,
  setCurrentUserId,
  storedSchemaVersion,
  useWorkspaceStatus,
} from "@/lib/workspace";

export function WorkspaceMount() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    // Unauthed visitors get an anonymous namespace so they can spin up a demo
    // workspace immediately. Real Clerk userIds always take precedence — when
    // someone signs in mid-session we drop the anon namespace.
    setCurrentUserId(userId ?? ANON_USER_ID);
  }, [isLoaded, userId]);

  const status = useWorkspaceStatus();
  const shownFor = useRef<string | null>(null);

  useEffect(() => {
    if (!status.needsReset) return;
    // Show once per (user × condition) so reload spam doesn't stack toasts.
    const key = `${userId ?? "anon"}:needsReset`;
    if (shownFor.current === key) return;
    shownFor.current = key;
    toast("New demo version available", {
      description: "Your seeded workspace is from an older schema. Reset to load the latest.",
      duration: Infinity,
      action: {
        label: "Reset workspace",
        onClick: () => {
          resetWorkspace();
          toast.success("Workspace reset");
        },
      },
    });
  }, [status.needsReset, userId]);

  // Dev-only console helpers — quick smoke tests until onboarding UI exists.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__pulse_createWorkspace = createWorkspace;
    w.__pulse_resetWorkspace = resetWorkspace;
    w.__pulse_workspaceInfo = () => ({
      namespace: getNamespace(),
      ready: isWorkspaceReady(),
      schemaVersion: storedSchemaVersion(),
    });
    return () => {
      delete w.__pulse_createWorkspace;
      delete w.__pulse_resetWorkspace;
      delete w.__pulse_workspaceInfo;
    };
  }, []);

  return null;
}
