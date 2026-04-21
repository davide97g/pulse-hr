import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidePanel } from "@/components/app/SidePanel";
import type { Employee, EmployeeStatus } from "@/lib/mock-data";
import { departments } from "@/lib/mock-data";
import { employeesTable, initialsFor, useEmployees } from "@/lib/tables/employees";
import { cn } from "@/lib/utils";

const STATUSES: { value: EmployeeStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "remote", label: "Remote" },
  { value: "on_leave", label: "On leave" },
  { value: "offboarding", label: "Offboarding" },
];

const EMPLOYMENT_TYPES: Employee["employmentType"][] = ["Full-time", "Part-time", "Contractor"];

const BIRTHDAY_RE = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

type Draft = {
  first: string;
  last: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  manager: string;
  location: string;
  status: EmployeeStatus;
  employmentType: Employee["employmentType"];
  joinDate: string;
  birthday: string;
  salary: string;
};

function splitName(name: string): { first: string; last: string } {
  const trimmed = name.trim();
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return { first: trimmed, last: "" };
  return { first: trimmed.slice(0, idx), last: trimmed.slice(idx + 1) };
}

function fromEmployee(e: Employee): Draft {
  const { first, last } = splitName(e.name);
  return {
    first,
    last,
    email: e.email,
    phone: e.phone,
    role: e.role,
    department: e.department,
    manager: e.manager ?? "",
    location: e.location,
    status: e.status,
    employmentType: e.employmentType,
    joinDate: e.joinDate,
    birthday: e.birthday ?? "",
    salary: String(e.salary),
  };
}

export function EditEmployeePanel({
  employeeId,
  onClose,
}: {
  employeeId: string | null;
  onClose: () => void;
}) {
  const list = useEmployees();
  const employee = useMemo(
    () => (employeeId ? list.find((e) => e.id === employeeId) ?? null : null),
    [list, employeeId],
  );

  const open = !!employee;
  const [draft, setDraft] = useState<Draft | null>(null);

  // Reset draft whenever a different employee opens the panel.
  useEffect(() => {
    if (employee) setDraft(fromEmployee(employee));
    else setDraft(null);
  }, [employee?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const submit = () => {
    if (!employee || !draft) return;
    const name = `${draft.first.trim()} ${draft.last.trim()}`.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!draft.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (draft.birthday && !BIRTHDAY_RE.test(draft.birthday.trim())) {
      toast.error("Birthday must be MM-DD (e.g. 06-14)");
      return;
    }
    const salaryNum = Number(draft.salary);
    if (draft.salary !== "" && Number.isNaN(salaryNum)) {
      toast.error("Salary must be a number");
      return;
    }

    const prior = employee;
    const patch: Partial<Employee> = {
      name,
      initials: initialsFor(name),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      role: draft.role.trim() || "Team member",
      department: draft.department.trim() || "—",
      manager: draft.manager.trim() || undefined,
      location: draft.location.trim(),
      status: draft.status,
      employmentType: draft.employmentType,
      joinDate: draft.joinDate,
      birthday: draft.birthday.trim() || undefined,
      salary: Number.isFinite(salaryNum) ? salaryNum : 0,
    };

    employeesTable.update(employee.id, patch);
    toast.success(`${name} updated`, {
      description: "Changes saved locally.",
      icon: <PencilLine className="h-4 w-4" />,
      action: {
        label: "Undo",
        onClick: () => employeesTable.update(prior.id, prior),
      },
    });
    onClose();
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      width={560}
      title={employee ? `Edit ${employee.name}` : "Edit employee"}
    >
      {employee && draft && (
        <>
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
              <PencilLine className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">
                Admin edit. Every field is editable and changes save to this browser only.
              </div>
            </div>

            <Section title="Identity">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <Input value={draft.first} onChange={(e) => set("first", e.target.value)} />
                </Field>
                <Field label="Last name">
                  <Input value={draft.last} onChange={(e) => set("last", e.target.value)} />
                </Field>
              </div>
              <Field label="Work email">
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </Section>

            <Section title="Job">
              <Field label="Role">
                <Input value={draft.role} onChange={(e) => set("role", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <select
                    value={draft.department}
                    onChange={(e) => set("department", e.target.value)}
                    className="h-9 w-full px-2.5 rounded-md border bg-background text-sm"
                  >
                    {[draft.department, ...departments.filter((d) => d !== draft.department)].map(
                      (d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
                <Field label="Manager">
                  <Input
                    value={draft.manager}
                    onChange={(e) => set("manager", e.target.value)}
                    placeholder="— none —"
                  />
                </Field>
              </div>
              <Field label="Employment type">
                <SegmentedRow
                  values={EMPLOYMENT_TYPES}
                  active={draft.employmentType}
                  onChange={(v) => set("employmentType", v)}
                />
              </Field>
              <Field label="Salary (annual)">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    className="pl-6"
                    value={draft.salary}
                    onChange={(e) => set("salary", e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                  />
                </div>
              </Field>
            </Section>

            <Section title="Location & status">
              <Field label="Location">
                <Input
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Remote — Milan"
                />
              </Field>
              <Field label="Status">
                <SegmentedRow
                  values={STATUSES.map((s) => s.value)}
                  labels={STATUSES.map((s) => s.label)}
                  active={draft.status}
                  onChange={(v) => set("status", v)}
                />
              </Field>
            </Section>

            <Section title="Dates">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Join date">
                  <Input
                    type="date"
                    value={draft.joinDate}
                    onChange={(e) => set("joinDate", e.target.value)}
                  />
                </Field>
                <Field label="Birthday (MM-DD)">
                  <Input
                    value={draft.birthday}
                    onChange={(e) => set("birthday", e.target.value)}
                    placeholder="06-14"
                    maxLength={5}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit}>Save changes</Button>
          </div>
        </>
      )}
    </SidePanel>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SegmentedRow<T extends string>({
  values,
  labels,
  active,
  onChange,
}: {
  values: readonly T[];
  labels?: readonly string[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
    >
      {values.map((v, i) => {
        const on = active === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "text-xs py-2 rounded-md border press-scale transition-colors",
              on
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "hover:bg-muted",
            )}
          >
            {labels?.[i] ?? v}
          </button>
        );
      })}
    </div>
  );
}
