import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Filter, Download, Plus, MoreHorizontal, Mail, Phone, MapPin,
  Calendar, Briefcase, DollarSign, FileText, Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { employees, type Employee, departments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/people")({
  head: () => ({ meta: [{ title: "Employees — Pulse HR" }] }),
  component: People,
});

function People() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string | null>(null);
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = useMemo(() => employees.filter(e =>
    (!q || e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase())) &&
    (!dept || e.department === dept)
  ), [q, dept]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="People"
        description={`${employees.length} employees across ${departments.length} departments`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add employee</Button>
          </>
        }
      />

      <Card className="p-3 mb-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or role" className="pl-8 h-9" />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setDept(null)} className={cn("h-8 px-3 rounded-md text-sm", !dept ? "bg-foreground text-background" : "hover:bg-muted")}>All</button>
          {departments.slice(0, 5).map(d => (
            <button key={d.name} onClick={() => setDept(d.name)} className={cn("h-8 px-3 rounded-md text-sm", dept === d.name ? "bg-foreground text-background" : "hover:bg-muted")}>{d.name}</button>
          ))}
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" />More filters</Button>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Employee</th>
              <th className="text-left font-medium px-4 py-2.5">Department</th>
              <th className="text-left font-medium px-4 py-2.5">Location</th>
              <th className="text-left font-medium px-4 py-2.5">Status</th>
              <th className="text-left font-medium px-4 py-2.5">Joined</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                onClick={() => setSelected(e)}
                className="border-t cursor-pointer hover:bg-muted/40 transition-colors group"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={e.initials} color={e.avatarColor} size={32} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{e.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{e.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.department}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.location}</td>
                <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{e.joinDate}</td>
                <td className="px-2">
                  <button onClick={(ev) => ev.stopPropagation()} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-sm font-medium">No employees found</div>
            <div className="text-xs text-muted-foreground mt-1">Try adjusting your filters</div>
          </div>
        )}
      </Card>

      <EmployeePanel employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function EmployeePanel({ employee, onClose }: { employee: Employee | null; onClose: () => void }) {
  return (
    <SidePanel
      open={!!employee}
      onClose={onClose}
      width={520}
      title={employee && (
        <div className="flex items-center gap-2.5">
          <Avatar initials={employee.initials} color={employee.avatarColor} size={28} />
          <span>{employee.name}</span>
        </div>
      )}
    >
      {employee && (
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <Avatar initials={employee.initials} color={employee.avatarColor} size={64} />
            <div className="flex-1">
              <div className="text-lg font-semibold">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.role}</div>
              <div className="mt-2"><StatusBadge status={employee.status} /></div>
            </div>
          </div>
          <div className="flex gap-2 mb-5">
            <Button size="sm" variant="outline" className="flex-1"><Mail className="h-3.5 w-3.5 mr-1.5" />Email</Button>
            <Button size="sm" variant="outline" className="flex-1"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule</Button>
            <Button size="sm" variant="outline" className="flex-1">Edit</Button>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4 space-y-3">
              <Field icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={employee.email} />
              <Field icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={employee.phone} />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={employee.location} />
              <Field icon={<Calendar className="h-3.5 w-3.5" />} label="Joined" value={employee.joinDate} />
            </TabsContent>
            <TabsContent value="job" className="mt-4 space-y-3">
              <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Role" value={employee.role} />
              <Field icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={employee.department} />
              <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Employment" value={employee.employmentType} />
              <Field icon={<DollarSign className="h-3.5 w-3.5" />} label="Salary" value={`$${employee.salary.toLocaleString()} / year`} />
              {employee.manager && <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Manager" value={employee.manager} />}
            </TabsContent>
            <TabsContent value="docs" className="mt-4">
              <div className="space-y-2">
                {["Employment contract", "NDA", "Tax form W-9", "Equipment policy"].map(d => (
                  <div key={d} className="flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/40 cursor-pointer">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1 text-sm">{d}</div>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-4 space-y-3">
              {[
                { t: "2d ago", a: "Submitted timesheet for week of Apr 7" },
                { t: "1w ago", a: "Updated tax withholding" },
                { t: "2w ago", a: "Completed onboarding training" },
                { t: "1mo ago", a: "Joined Acme Inc." },
              ].map((it, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">{it.t}</div>
                  <div className="flex-1">{it.a}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </SidePanel>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}
