import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PencilLine, Save, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Card } from "@pulse-hr/ui/primitives/card";
import { StatusBadge } from "@/components/app/AppShell";
import { BirthdayHalo } from "@pulse-hr/ui/atoms/BirthdayHalo";
import { isBirthday } from "@/lib/birthday";
import { type Employee, type EmployeeStatus, departments } from "@/lib/mock-data";
import { employeesTable, initialsFor, useEmployee } from "@/lib/tables/employees";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/people_/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Employee — ${params.employeeId} — Pulse HR` }] }),
  component: EmployeeDetailRoute,
});

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

function draftEquals(a: Draft, b: Draft): boolean {
  return (Object.keys(a) as (keyof Draft)[]).every((k) => a[k] === b[k]);
}

function EmployeeDetailRoute() {
  const { employeeId } = Route.useParams();
  const navigate = useNavigate();
  const employee = useEmployee(employeeId);
  const [draft, setDraft] = useState<Draft | null>(null);

  // Seed the draft from the employee whenever the id changes. Later saves
  // update the underlying row, but the draft stays put so the admin can
  // continue editing without field reversion.
  useEffect(() => {
    if (employee) setDraft(fromEmployee(employee));
  }, [employeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const pristine = useMemo(
    () => (employee && draft ? draftEquals(draft, fromEmployee(employee)) : true),
    [draft, employee],
  );

  if (!employee) {
    return (
      <div className="p-4 md:p-6 max-w-[1100px] mx-auto fade-in">
        <Link
          to="/people"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground press-scale mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to People
        </Link>
        <Card className="p-10 text-center">
          <div className="text-base font-semibold">Employee not found</div>
          <div className="text-sm text-muted-foreground mt-1">
            The id <code className="font-mono">{employeeId}</code> doesn't match anyone in this
            workspace.
          </div>
        </Card>
      </div>
    );
  }

  if (!draft) return null;

  const save = () => {
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
  };

  const reset = () => {
    setDraft(fromEmployee(employee));
    toast("Form reset", { description: "Reverted to the saved record." });
  };

  const remove = () => {
    const snapshot = employee;
    employeesTable.remove(employee.id);
    toast(`${employee.name} removed`, {
      description: "Employee archived.",
      action: {
        label: "Undo",
        onClick: () => employeesTable.add(snapshot),
      },
    });
    navigate({ to: "/people" });
  };

  const firstName = employee.name.split(" ")[0];
  const lastName = employee.name.split(" ").slice(1).join(" ");

  return (
    <div className="p-6 md:p-12 max-w-[1240px] mx-auto fade-in pb-28">
      <Link
        to="/people"
        className="inline-flex items-center gap-1.5 t-mono press-scale mb-6"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        ← INDIETRO · PERSONE
      </Link>

      {/* Editorial spread: portrait halo + display name */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12 mb-10 items-start">
        <div className="flex flex-col gap-4 items-start">
          <BirthdayHalo
            initials={employee.initials}
            color={employee.avatarColor}
            size={220}
            active={isBirthday(employee)}
          />
          <div className="flex flex-col gap-1">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {employee.id}
            </span>
            <StatusBadge status={employee.status} />
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-0">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PEOPLE · SCHEDA · {employee.department.toUpperCase()}
          </span>
          <h1
            className="t-display-it"
            style={{
              margin: 0,
              fontSize: "clamp(64px, 9vw, 124px)",
              wordBreak: "break-word",
            }}
          >
            <span className="spark-mark">{firstName}</span>
            <br />
            {lastName || ""}
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </h1>
          <p
            className="t-body-lg"
            style={{
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              maxWidth: 560,
            }}
          >
            {employee.role} · {employee.department} · {employee.location}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Button
              variant="outline"
              size="sm"
              className="press-scale text-destructive hover:bg-destructive/10"
              onClick={remove}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Elimina
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Identity">
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
        </SectionCard>

        <SectionCard title="Job">
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
                {/* keep current value present even if it doesn't match any known dept */}
                {!departments.some((d) => d.name === draft.department) && (
                  <option value={draft.department}>{draft.department}</option>
                )}
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
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
        </SectionCard>

        <SectionCard title="Location & status">
          <Field label="Location">
            <Input
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Remote — Milan"
            />
          </Field>
          <Field label="Status">
            <SegmentedRow
              values={STATUSES.map((s) => s.value) as EmployeeStatus[]}
              labels={STATUSES.map((s) => s.label)}
              active={draft.status}
              onChange={(v) => set("status", v)}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Dates">
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
        </SectionCard>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[240px] bg-background/95 backdrop-blur border-t z-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {pristine ? (
              "No unsaved changes."
            ) : (
              <span className="text-foreground font-medium">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={pristine}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={save} disabled={pristine}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
        {title}
      </div>
      {children}
    </Card>
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
              on ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted",
            )}
          >
            {labels?.[i] ?? v}
          </button>
        );
      })}
    </div>
  );
}
