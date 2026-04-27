import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Star,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  UserPlus,
  Trash2,
  MoreHorizontal,
  Users,
  MapPin,
  Ban,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonCards } from "@pulse-hr/ui/atoms/SkeletonList";
import { useQuickAction } from "@/components/app/QuickActions";
import { useBulkSelect, BulkBar, RowCheckbox } from "@/components/app/bulk";
import { Ban as BanIcon, FileDown } from "lucide-react";
import { type Candidate, type JobPosting, type Scorecard } from "@/lib/mock-data";
import { candidatesTable, useCandidates } from "@/lib/tables/candidates";
import { jobPostingsTable, useJobPostings } from "@/lib/tables/jobPostings";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/recruiting")({
  head: () => ({ meta: [{ title: "Recruiting — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Recruiting,
});

const stages: Candidate["stage"][] = ["Applied", "Screen", "Interview", "Offer", "Hired"];

function Recruiting() {
  const [loading, setLoading] = useState(true);
  const candidates = useCandidates();
  const jobs = useJobPostings();
  const [selId, setSelId] = useUrlParam("sel");
  const selected = selId ? (candidates.find((c) => c.id === selId) ?? null) : null;
  const setSelected = (c: Candidate | null) => setSelId(c?.id ?? null);
  const [jobParam, setJobParam] = useUrlParam("job");
  const selectedJob: JobPosting | "new" | null =
    jobParam === "new" ? "new" : jobParam ? (jobs.find((j) => j.id === jobParam) ?? null) : null;
  const setSelectedJob = (j: JobPosting | "new" | null) => {
    if (j === null) setJobParam(null);
    else if (j === "new") setJobParam("new");
    else setJobParam(j.id);
  };
  const [toDelete, setToDelete] = useState<{
    kind: "cand" | "job";
    id: string;
    label: string;
  } | null>(null);
  const { open: openAction } = useQuickAction();
  const [tab, setTab] = useUrlParam("tab", "pipeline");
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [scorecardDraft, setScorecardDraft] = useState({ title: "", criteria: "", score: 4 });
  const candBulk = useBulkSelect(candidates);
  const jobBulk = useBulkSelect(jobs);

  const bulkSetJobStatus = (status: JobPosting["status"]) => {
    const targets = jobBulk.selectedRows.filter((j) => j.status !== status);
    if (targets.length === 0) {
      toast(`Already ${status}`);
      return;
    }
    const snaps = targets.map((j) => ({ id: j.id, prior: j.status }));
    targets.forEach((j) => jobPostingsTable.update(j.id, { status }));
    jobBulk.clear();
    toast(`${targets.length} job${targets.length === 1 ? "" : "s"} marked ${status}`, {
      action: {
        label: "Undo",
        onClick: () => snaps.forEach((s) => jobPostingsTable.update(s.id, { status: s.prior })),
      },
    });
  };

  const bulkDeleteJobs = () => {
    const targets = jobBulk.selectedRows;
    if (targets.length === 0) return;
    targets.forEach((j) => jobPostingsTable.remove(j.id));
    jobBulk.clear();
    toast(`${targets.length} job${targets.length === 1 ? "" : "s"} deleted`, {
      action: {
        label: "Undo",
        onClick: () => targets.forEach((j) => jobPostingsTable.add(j)),
      },
    });
  };

  const bulkRejectCandidates = () => {
    const targets = candBulk.selectedRows;
    if (targets.length === 0) return;
    targets.forEach((c) => candidatesTable.remove(c.id));
    candBulk.clear();
    toast(`${targets.length} candidate${targets.length === 1 ? "" : "s"} rejected`, {
      action: {
        label: "Undo",
        onClick: () => targets.forEach((c) => candidatesTable.add(c)),
      },
    });
  };

  const bulkExportCandidates = () => {
    const rows = candBulk.selectedRows;
    if (rows.length === 0) return;
    const cols = ["id", "name", "role", "stage", "appliedDate", "rating"];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc(r[c as keyof Candidate])).join(",")),
    ].join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${rows.length}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const moveStage = (id: string, dir: 1 | -1) => {
    const c = candidatesTable.getAll().find((x) => x.id === id);
    if (!c) return;
    const idx = stages.indexOf(c.stage);
    const next = stages[Math.min(stages.length - 1, Math.max(0, idx + dir))];
    if (next === "Hired" && c.stage !== "Hired") toast.success(`${c.name} hired! 🎉`);
    candidatesTable.update(id, { stage: next });
  };

  const rejectCandidate = (c: Candidate) => {
    candidatesTable.remove(c.id);
    toast(`${c.name} rejected`, {
      action: { label: "Undo", onClick: () => candidatesTable.add(c) },
    });
  };

  const saveJob = (
    data: Omit<JobPosting, "id" | "applicants" | "posted" | "status">,
    id?: string,
  ) => {
    if (id) {
      jobPostingsTable.update(id, data);
      toast.success("Job updated");
    } else {
      const j: JobPosting = {
        ...data,
        id: `j-${Date.now()}`,
        applicants: 0,
        posted: new Date().toISOString().slice(0, 10),
        status: "draft",
      };
      jobPostingsTable.add(j);
      toast.success("Job created", { description: "Saved as draft. Publish when ready." });
    }
  };

  const toggleJobStatus = (j: JobPosting) => {
    const nextStatus: JobPosting["status"] = j.status === "open" ? "closed" : "open";
    jobPostingsTable.update(j.id, { status: nextStatus });
    toast.success(`Job ${j.status === "open" ? "closed" : "published"}`, {
      description: `${j.title} — ${j.status === "open" ? "no longer visible" : "live on careers page"}`,
    });
  };

  const removeJob = (j: JobPosting) => {
    jobPostingsTable.remove(j.id);
    toast("Job deleted", {
      action: { label: "Undo", onClick: () => jobPostingsTable.add(j) },
    });
  };

  const openRoles = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Recruiting"
        description={`${openRoles} open role${openRoles === 1 ? "" : "s"} · ${candidates.length} candidates in pipeline`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="press-scale"
              onClick={() => setSelectedJob("new")}
            >
              <Briefcase className="h-4 w-4 mr-1.5" />
              New job
            </Button>
            <Button size="sm" className="press-scale" onClick={() => openAction("post-job")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Post via quick action
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            Jobs ({jobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          {loading ? (
            <div className="md:overflow-x-visible overflow-x-auto scrollbar-thin -mx-6 px-6 md:-mx-0 md:px-0">
              <div className="grid grid-cols-5 gap-3 md:min-w-0 min-w-[780px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg p-2.5 min-h-[400px] space-y-2">
                    <div className="h-3 w-[50%] shimmer rounded" />
                    {Array.from({ length: 2 }).map((_, j) => (
                      <Card key={j} className="p-3 space-y-2">
                        <div className="h-3 w-[70%] shimmer rounded" />
                        <div className="h-2.5 w-[50%] shimmer rounded" />
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState
              tone="welcome"
              icon={<Users className="h-6 w-6" />}
              title="No candidates in the pipeline"
              description="Post a job to start collecting applicants."
              action={
                <Button size="sm" onClick={() => setSelectedJob("new")}>
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Create job
                </Button>
              }
            />
          ) : (
            <div className="md:overflow-x-visible overflow-x-auto scrollbar-thin -mx-6 px-6 md:-mx-0 md:px-0">
              <div className="grid grid-cols-5 gap-3 md:min-w-0 min-w-[780px]">
                {stages.map((stage) => {
                  const items = candidates.filter((c) => c.stage === stage);
                  return (
                    <div key={stage} className="bg-muted/40 rounded-lg p-2.5 min-h-[400px]">
                      <div className="flex items-center justify-between px-1.5 mb-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {stage}
                        </div>
                        <div
                          className={cn(
                            "text-xs rounded px-1.5 py-0.5 min-w-5 text-center font-medium",
                            stage === "Hired"
                              ? "bg-success/15 text-success"
                              : stage === "Offer"
                                ? "bg-info/15 text-info"
                                : "bg-background text-muted-foreground",
                          )}
                        >
                          {items.length}
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground text-center py-6 border border-dashed rounded-md">
                          Drop candidates here
                        </div>
                      ) : (
                        <div className="space-y-2 stagger-in">
                          {items.map((c) => (
                            <Card
                              key={c.id}
                              onClick={() => setSelected(c)}
                              className={cn(
                                "p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all press-scale group",
                                candBulk.isSelected(c.id) && "ring-2 ring-primary/50",
                              )}
                            >
                              <div className="flex items-center gap-2.5 mb-2">
                                <Avatar initials={c.initials} color={c.avatarColor} size={28} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">{c.name}</div>
                                  <div className="text-[11px] text-muted-foreground truncate">
                                    {c.role}
                                  </div>
                                </div>
                                <RowCheckbox
                                  checked={candBulk.isSelected(c.id)}
                                  onChange={() => candBulk.toggle(c.id)}
                                  label={`Select ${c.name}`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i <= c.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                                    />
                                  ))}
                                </div>
                                <span className="tabular-nums">{c.appliedDate.slice(5)}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          {loading ? (
            <SkeletonCards cards={4} />
          ) : jobs.length === 0 ? (
            <EmptyState
              tone="welcome"
              icon={<Briefcase className="h-6 w-6" />}
              title="No jobs posted yet"
              description="Draft your first opening to start sourcing candidates."
              action={
                <Button size="sm" onClick={() => setSelectedJob("new")}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  New job
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-in">
              {jobs.map((j) => (
                <Card
                  key={j.id}
                  className={cn(
                    "p-5 press-scale hover:shadow-md transition-all",
                    jobBulk.isSelected(j.id) && "ring-2 ring-primary/50",
                  )}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <RowCheckbox
                      checked={jobBulk.isSelected(j.id)}
                      onChange={() => jobBulk.toggle(j.id)}
                      label={`Select ${j.title}`}
                      visibleWhen="always"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{j.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.department} · {j.location}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedJob(j)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleJobStatus(j)}>
                          {j.status === "open" ? "Close job" : "Publish job"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const url = `${window.location.origin}/jobs/${j.id}`;
                            try {
                              await navigator.clipboard.writeText(url);
                              toast.success("Public link copied", { description: url });
                            } catch {
                              toast.error("Couldn't copy link");
                            }
                          }}
                        >
                          Copy public link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setToDelete({ kind: "job", id: j.id, label: j.title })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-2 flex-wrap">
                    <StatusBadge
                      status={
                        j.status === "open"
                          ? "active"
                          : j.status === "closed"
                            ? "rejected"
                            : "draft"
                      }
                    />
                    <span className="text-muted-foreground">· {j.type}</span>
                    <span className="text-muted-foreground">· {j.salary}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {j.applicants} applicants
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedJob(j)}>
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={selected.initials} color={selected.avatarColor} size={56} />
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-sm text-muted-foreground">{selected.role}</div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i <= selected.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/40 mb-4">
              <div className="text-xs text-muted-foreground">Current stage</div>
              <div className="text-sm font-semibold">{selected.stage}</div>
            </div>
            <div className="flex gap-2 mb-5">
              <Button
                size="sm"
                variant="outline"
                className="press-scale"
                disabled={selected.stage === "Applied"}
                onClick={() => moveStage(selected.id, -1)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1 press-scale"
                onClick={() => moveStage(selected.id, 1)}
                disabled={selected.stage === "Hired"}
              >
                {selected.stage === "Offer" ? (
                  <>
                    <PartyPopper className="h-3.5 w-3.5 mr-1.5" />
                    Mark hired
                  </>
                ) : (
                  <>
                    Advance stage <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="press-scale text-destructive hover:bg-destructive/10"
                onClick={() => {
                  rejectCandidate(selected);
                  setSelected(null);
                }}
                title="Reject"
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex gap-2 mb-5">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 press-scale"
                onClick={() =>
                  toast.success("Interview scheduled", {
                    description: `Invite sent to ${selected.name}`,
                  })
                }
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Schedule interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 press-scale"
                onClick={() => {
                  setScorecardDraft({ title: "", criteria: "", score: 4 });
                  setScorecardOpen(true);
                }}
              >
                Add scorecard
              </Button>
            </div>

            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Timeline
            </div>
            <div className="space-y-3 stagger-in">
              {["Applied via website", "Screened by Olivia", "Tech interview scheduled"].map(
                (t, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">{t}</div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </SidePanel>

      <SidePanel
        open={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        width={520}
        title={selectedJob === "new" ? "New job" : selectedJob?.title}
      >
        {selectedJob !== null && (
          <JobForm
            job={selectedJob === "new" ? null : selectedJob}
            onCancel={() => setSelectedJob(null)}
            onSave={(data) => {
              saveJob(data, selectedJob === "new" ? undefined : selectedJob.id);
              setSelectedJob(null);
            }}
          />
        )}
      </SidePanel>

      <Dialog open={scorecardOpen} onOpenChange={setScorecardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add scorecard{selected ? ` — ${selected.name}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sc-title">Title</Label>
              <Input
                id="sc-title"
                value={scorecardDraft.title}
                onChange={(e) =>
                  setScorecardDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="e.g. Tech interview, Culture fit"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-criteria">Notes</Label>
              <Textarea
                id="sc-criteria"
                rows={4}
                value={scorecardDraft.criteria}
                onChange={(e) =>
                  setScorecardDraft((d) => ({ ...d, criteria: e.target.value }))
                }
                placeholder="What stood out? Strengths, concerns, next steps."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Score: {scorecardDraft.score} / 5</Label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={scorecardDraft.score}
                onChange={(e) =>
                  setScorecardDraft((d) => ({ ...d, score: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScorecardOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selected || !scorecardDraft.title.trim()}
              onClick={() => {
                if (!selected) return;
                const card: Scorecard = {
                  id: `sc-${Date.now()}`,
                  title: scorecardDraft.title.trim(),
                  criteria: scorecardDraft.criteria.trim(),
                  score: scorecardDraft.score,
                  createdAt: new Date().toISOString().slice(0, 10),
                };
                candidatesTable.update(selected.id, {
                  scorecards: [...(selected.scorecards ?? []), card],
                });
                toast.success("Scorecard saved");
                setScorecardOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {toDelete?.kind === "job" ? "job" : "candidate"}?
            </AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.label} will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete?.kind === "job") {
                  const j = jobs.find((x) => x.id === toDelete.id);
                  if (j) removeJob(j);
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {tab === "pipeline" && (
        <BulkBar
          count={candBulk.count}
          onClear={candBulk.clear}
          noun="candidate"
          actions={[
            {
              label: "Reject",
              icon: <BanIcon className="h-3.5 w-3.5" />,
              onClick: bulkRejectCandidates,
              tone: "destructive",
            },
            {
              label: "Export CSV",
              icon: <FileDown className="h-3.5 w-3.5" />,
              onClick: bulkExportCandidates,
            },
          ]}
          className="-mx-4 md:-mx-6"
        />
      )}
      {tab === "jobs" && (
        <BulkBar
          count={jobBulk.count}
          onClear={jobBulk.clear}
          noun="job"
          actions={[
            {
              label: "Open",
              icon: <Plus className="h-3.5 w-3.5" />,
              onClick: () => bulkSetJobStatus("open"),
            },
            {
              label: "Close",
              icon: <BanIcon className="h-3.5 w-3.5" />,
              onClick: () => bulkSetJobStatus("closed"),
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              onClick: bulkDeleteJobs,
              tone: "destructive",
            },
          ]}
          className="-mx-4 md:-mx-6"
        />
      )}
    </div>
  );
}

function JobForm({
  job,
  onCancel,
  onSave,
}: {
  job: JobPosting | null;
  onCancel: () => void;
  onSave: (data: Omit<JobPosting, "id" | "applicants" | "posted" | "status">) => void;
}) {
  const [title, setTitle] = useState(job?.title ?? "");
  const [department, setDepartment] = useState(job?.department ?? "Engineering");
  const [location, setLocation] = useState(job?.location ?? "Remote");
  const [type, setType] = useState<JobPosting["type"]>(job?.type ?? "Full-time");
  const [salary, setSalary] = useState(job?.salary ?? "");
  const [owner, setOwner] = useState(job?.owner ?? "Sarah Chen");
  const [description, setDescription] = useState(job?.description ?? "");
  const valid = title.trim() && description.trim();

  return (
    <>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium">
              {job ? "Edit job posting" : "Create a new job posting"}
            </div>
            <div className="text-xs text-muted-foreground">
              Starts as draft — publish when ready.
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Job title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Frontend Engineer"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>
              <MapPin className="h-3 w-3 inline mr-1" />
              Location
            </Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Employment</Label>
            <div className="flex gap-1.5">
              {(["Full-time", "Part-time", "Contractor"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  type="button"
                  className={cn(
                    "flex-1 text-xs py-2 rounded-md border press-scale",
                    type === t
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Salary</Label>
            <Input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="€80k – €110k"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Hiring manager</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="About the role…"
          />
        </div>
      </div>
      <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!valid}
          onClick={() => onSave({ title, department, location, type, salary, owner, description })}
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          {job ? "Save changes" : "Save draft"}
        </Button>
      </div>
    </>
  );
}
