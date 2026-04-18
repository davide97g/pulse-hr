import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { useQuickAction } from "@/components/app/QuickActions";
import { leaveRequests, employeeById, type LeaveRequest } from "@/lib/mock-data";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [{ title: "Leave — Pulse HR" }] }),
  component: Leave,
});

function Leave() {
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const { open: openAction } = useQuickAction();

  const decide = (id: string, status: "approved" | "rejected") => {
    setDecisions(d => ({ ...d, [id]: status }));
    const e = employeeById(leaveRequests.find(l => l.id === id)!.employeeId)!;
    if (status === "approved") toast.success(`Approved leave for ${e.name}`);
    else toast.error(`Rejected leave for ${e.name}`);
  };

  const getStatus = (l: LeaveRequest): "pending" | "approved" | "rejected" => decisions[l.id] ?? l.status;
  const filtered = (status: string) => leaveRequests.filter(l => getStatus(l) === status);

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Leave"
        description="Manage leave requests, balances and the team calendar"
        actions={<Button size="sm" onClick={() => openAction("request-leave")}><Plus className="h-4 w-4 mr-1.5" />Request leave</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Vacation", value: "12 / 25", color: "oklch(0.6 0.16 220)" },
          { label: "Sick", value: "2 / 10", color: "oklch(0.7 0.15 30)" },
          { label: "Personal", value: "1 / 5", color: "oklch(0.6 0.18 280)" },
          { label: "Carry over", value: "3 days", color: "oklch(0.65 0.15 155)" },
        ].map(b => (
          <Card key={b.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />{b.label}</div>
            <div className="text-2xl font-semibold mt-1">{b.value}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({filtered("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filtered("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filtered("rejected").length})</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="h-3.5 w-3.5 mr-1.5" />Calendar</TabsTrigger>
        </TabsList>

        {(["pending","approved","rejected"] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0 overflow-hidden">
              {filtered(tab).length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-sm font-medium">No {tab} requests</div>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered(tab).map(l => {
                    const e = employeeById(l.employeeId)!;
                    return (
                      <div
                        key={l.id}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/40 cursor-pointer"
                        onClick={() => setSelected(l)}
                      >
                        <Avatar initials={e.initials} color={e.avatarColor} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{l.type} • {l.days} day{l.days > 1 ? "s" : ""} • {l.from} → {l.to}</div>
                        </div>
                        <StatusBadge status={getStatus(l)} />
                        {tab === "pending" && (
                          <div className="flex gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10" onClick={() => decide(l.id, "rejected")}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="h-8 px-3 bg-success text-success-foreground hover:bg-success/90" onClick={() => decide(l.id, "approved")}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="calendar" className="mt-4">
          <Card className="p-5">
            <div className="grid grid-cols-7 gap-1">
              {["S","M","T","W","T","F","S"].map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
              {Array.from({length: 30}).map((_, i) => {
                const onLeave = [3, 4, 12, 13, 14, 15, 22, 23].includes(i);
                return (
                  <div key={i} className="aspect-square border rounded-md p-1.5 hover:bg-muted/40 cursor-pointer">
                    <div className="text-xs">{i + 1}</div>
                    {onLeave && <div className="mt-1 h-1 rounded bg-info" />}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title="Leave request">
        {selected && (() => {
          const e = employeeById(selected.employeeId)!;
          return (
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={e.initials} color={e.avatarColor} size={48} />
                <div><div className="font-semibold">{e.name}</div><div className="text-xs text-muted-foreground">{e.role}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Type" value={selected.type} />
                <Field label="Days" value={`${selected.days}`} />
                <Field label="From" value={selected.from} />
                <Field label="To" value={selected.to} />
                <Field label="Submitted" value={selected.submittedAt} />
                <Field label="Status" value={<StatusBadge status={getStatus(selected)} />} />
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Reason</div>
                <div className="text-sm p-3 rounded-md bg-muted/40">{selected.reason}</div>
              </div>
              {getStatus(selected) === "pending" && (
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => decide(selected.id, "rejected")}><X className="h-4 w-4 mr-1.5" />Reject</Button>
                  <Button className="flex-1 bg-success hover:bg-success/90 text-white" onClick={() => decide(selected.id, "approved")}><Check className="h-4 w-4 mr-1.5" />Approve</Button>
                </div>
              )}
            </div>
          );
        })()}
      </SidePanel>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-md bg-muted/40">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
