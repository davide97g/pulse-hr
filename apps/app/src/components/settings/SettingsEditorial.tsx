import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useEmployees } from "@/lib/tables/employees";
import {
  type InviteRole as SettingsRole,
  type InviteRow,
  resendInvite as resendInviteStore,
  restoreInvite,
  revokeInvite as revokeInviteStore,
  updateInviteRole as updateInviteRoleStore,
  useInvites,
} from "@/lib/invites";
import {
  resetWorkspace,
  setWorkspaceName,
  useWorkspaceStatus,
} from "@/lib/workspace";
import { ShareFinalModal } from "@/components/share/ShareFinalModal";

const ROLE_BY_DEPT: Record<string, SettingsRole> = {
  Engineering: "Member",
  Design: "Member",
  Product: "Member",
  Sales: "Member",
  Marketing: "Member",
  Finance: "Viewer",
  "People Ops": "Admin",
};

function deriveRole(role: string, dept: string, idx: number): SettingsRole {
  if (idx === 0) return "Admin";
  if (role === "Admin" || role === "HR Manager") return "Admin";
  if (role === "Manager") return "Member";
  return ROLE_BY_DEPT[dept] ?? "Member";
}

export function SettingsEditorial() {
  const { locale } = useI18n();
  const ws = useWorkspaceStatus();
  const employees = useEmployees();

  const [draftName, setDraftName] = useState(ws.name);
  const [nameDirty, setNameDirty] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const invites = useInvites();

  const it = locale === "it";

  const people = useMemo(() => {
    return employees.slice(0, 6).map((e, idx) => ({
      id: e.id,
      initials: e.initials,
      name: e.name,
      email: e.email,
      meta: idx === 0
        ? (it ? "Tu · Owner" : "You · Owner")
        : (it ? `Aggiunto · ${e.joinDate}` : `Joined · ${e.joinDate}`),
      role: deriveRole(e.role, e.department, idx),
      owner: idx === 0,
    }));
  }, [employees, it]);

  const counts = useMemo(() => ({
    pending: invites.filter((i) => i.status === "pending").length,
    accepted: 12,
    expired: invites.filter((i) => i.status === "expired").length,
  }), [invites]);

  function onNameChange(v: string) {
    setDraftName(v);
    setNameDirty(v.trim() !== ws.name);
  }

  function saveName() {
    const next = draftName.trim();
    if (!next) {
      toast.error(it ? "Il nome del workspace non può essere vuoto" : "Workspace name cannot be empty");
      return;
    }
    setWorkspaceName(next);
    setNameDirty(false);
    toast.success(it ? "Nome workspace aggiornato" : "Workspace name updated");
  }

  function cancelName() {
    setDraftName(ws.name);
    setNameDirty(false);
  }

  function copyUrl() {
    const slug = ws.name.toLowerCase().replace(/\s+/g, "-");
    navigator.clipboard?.writeText(`app.pulsehr.it/${slug}`).catch(() => {});
    toast.success(it ? "URL copiato" : "URL copied");
  }

  function resendInvite(id: string) {
    resendInviteStore(id);
    toast.success(it ? "Invito rispedito" : "Invite resent");
  }

  function revokeInvite(id: string) {
    const removed = revokeInviteStore(id);
    if (!removed) return;
    toast(it ? "Invito revocato" : "Invite revoked", {
      action: {
        label: it ? "Annulla" : "Undo",
        onClick: () => restoreInvite(removed),
      },
    });
  }

  function updatePersonRole(_id: string, _role: SettingsRole) {
    toast(it ? "Ruolo aggiornato" : "Role updated");
  }

  function updateInviteRole(id: string, role: SettingsRole) {
    updateInviteRoleStore(id, role);
  }

  function confirmResetAction() {
    if (resetInput.trim() !== ws.name) {
      toast.error(it
        ? `Scrivi “${ws.name}” per confermare`
        : `Type “${ws.name}” to confirm`);
      return;
    }
    resetWorkspace();
    setConfirmReset(false);
    setResetInput("");
  }

  const slug = ws.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="ph flex flex-col min-h-full">
      <header
        style={{
          padding: "20px 24px 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 24,
          borderBottom: "1px solid var(--line)",
        }}
        className="md:[padding:28px_40px_18px]"
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it
              ? `IMPOSTAZIONI · WORKSPACE ${ws.name.toUpperCase()} · ${people.length} PERSONE · ${counts.pending} INVITI APERTI`
              : `SETTINGS · WORKSPACE ${ws.name.toUpperCase()} · ${people.length} PEOPLE · ${counts.pending} OPEN INVITES`}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(48px, 9vw, 96px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.88,
            }}
          >
            <span style={{ fontStyle: "italic" }}>
              {it ? "Impostazioni" : "Settings"}
            </span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <span
          className="t-mono hidden md:inline-block"
          style={{ color: "var(--muted-foreground)" }}
        >
          {it ? "ULTIMA MODIFICA · ORA" : "LAST EDITED · NOW"}
        </span>
      </header>

      <div className="flex flex-col px-4 md:px-10 pb-10">
        <SectionWorkspace
          name={draftName}
          original={ws.name}
          dirty={nameDirty}
          slug={slug}
          onChange={onNameChange}
          onSave={saveName}
          onCancel={cancelName}
          onCopyUrl={copyUrl}
          it={it}
        />

        <SectionPeople
          people={people}
          it={it}
          onRoleChange={updatePersonRole}
        />

        <SectionInvites
          invites={invites}
          counts={counts}
          it={it}
          onResend={resendInvite}
          onRevoke={revokeInvite}
          onRoleChange={updateInviteRole}
          onOpenShare={() => setShareOpen(true)}
        />

        <SectionDanger
          it={it}
          onReset={() => {
            setResetInput("");
            setConfirmReset(true);
          }}
        />
      </div>

      <ShareFinalModal open={shareOpen} onOpenChange={setShareOpen} />

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent
          style={{
            border: "1px solid var(--spark)",
            borderRadius: 18,
            padding: "32px 36px",
            maxWidth: 560,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <span className="t-mono" style={{ color: "var(--spark)" }}>
            {it ? "CONFERMA · AZIONE IRREVERSIBILE" : "CONFIRM · IRREVERSIBLE"}
          </span>
          <AlertDialogTitle
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: 38,
              letterSpacing: "-0.03em",
              lineHeight: 0.96,
            }}
          >
            {it ? "Resettare " : "Reset "}
            <span style={{ fontStyle: "italic" }}>{ws.name}</span>
            <span style={{ color: "var(--spark)" }}>?</span>
          </AlertDialogTitle>
          <AlertDialogDescription
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--fg-2)",
            }}
          >
            {it
              ? `${people.length} persone, ${counts.pending} inviti aperti e tutta la configurazione locale verranno rimossi. Per confermare, scrivi `
              : `${people.length} people, ${counts.pending} open invites, and all local configuration will be removed. To confirm, type `}
            <strong
              style={{
                fontFamily: "JetBrains Mono, monospace",
                background: "color-mix(in oklch, var(--spark) 18%, transparent)",
                padding: "1px 6px",
                borderRadius: 4,
                color: "var(--fg)",
              }}
            >
              {ws.name}
            </strong>
            {it ? " qui sotto." : " below."}
          </AlertDialogDescription>
          <input
            autoFocus
            value={resetInput}
            onChange={(e) => setResetInput(e.target.value)}
            placeholder={ws.name}
            style={{
              border: "1px solid var(--fg)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 15,
              fontFamily: "Inter, system-ui, sans-serif",
              background: "transparent",
              color: "var(--fg)",
              outline: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 6,
            }}
          >
            <button
              type="button"
              className="pill pill-ghost"
              onClick={() => setConfirmReset(false)}
            >
              {it ? "Annulla" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={confirmResetAction}
              disabled={resetInput.trim() !== ws.name}
              style={{
                border: "1.5px solid var(--fg)",
                borderRadius: 999,
                background: "var(--fg)",
                color: "var(--bg)",
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: "-0.01em",
                cursor: resetInput.trim() === ws.name ? "pointer" : "not-allowed",
                opacity: resetInput.trim() === ws.name ? 1 : 0.45,
              }}
            >
              {it ? "Sì, resetta tutto" : "Yes, reset everything"}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- shared section shell ---------- */
interface SectionProps {
  num: string;
  kana: string;
  title: React.ReactNode;
  italic?: string;
  hint: string;
  danger?: boolean;
  children: React.ReactNode;
}

function Section({ num, kana, title, italic, hint, danger, children }: SectionProps) {
  return (
    <section
      className="grid gap-6 md:gap-14 py-6"
      style={{
        gridTemplateColumns: "1fr",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="md:hidden flex flex-col gap-2">
        <span
          className="t-mono"
          style={{
            color: danger ? "var(--spark)" : "var(--muted-foreground)",
            letterSpacing: "0.08em",
          }}
        >
          {num} · {kana}
        </span>
        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: 26,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          {title}
          {italic && (
            <>
              {" "}
              <span style={{ fontStyle: "italic" }}>{italic}</span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </>
          )}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--muted-foreground)",
          }}
        >
          {hint}
        </p>
      </div>

      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: "280px 1fr",
          gap: 56,
        }}
      >
        <div className="flex flex-col gap-2.5">
          <span
            className="t-mono"
            style={{
              color: danger ? "var(--spark)" : "var(--muted-foreground)",
              letterSpacing: "0.08em",
            }}
          >
            {num} · {kana}
          </span>
          <h2
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: 32,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            {title}
            {italic && (
              <>
                {" "}
                <span style={{ fontStyle: "italic" }}>{italic}</span>
                <span style={{ color: "var(--spark)" }}>.</span>
              </>
            )}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--muted-foreground)",
              maxWidth: 240,
            }}
          >
            {hint}
          </p>
        </div>
        <div>{children}</div>
      </div>

      <div className="md:hidden">{children}</div>
    </section>
  );
}

/* ---------- 01 · WORKSPACE ---------- */
interface SectionWorkspaceProps {
  name: string;
  original: string;
  dirty: boolean;
  slug: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onCopyUrl: () => void;
  it: boolean;
}

function SectionWorkspace({
  name,
  dirty,
  slug,
  onChange,
  onSave,
  onCancel,
  onCopyUrl,
  it,
}: SectionWorkspaceProps) {
  return (
    <Section
      num="01"
      kana="WORKSPACE"
      title={it ? "L'" : "Workspace"}
      italic={it ? "identità" : "identity"}
      hint={
        it
          ? "Nome e configurazione globale del workspace. Visibile a chiunque ne faccia parte."
          : "Workspace name and global configuration. Visible to everyone who belongs to it."
      }
    >
      <div className="flex flex-col gap-4">
        <FieldRow label={it ? "NOME · MODIFICABILE" : "NAME · EDITABLE"}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid " + (dirty ? "var(--fg)" : "var(--line-strong)"),
              borderRadius: 12,
              padding: "10px 14px",
              background: "transparent",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--ink)",
                color: "var(--paper)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {(name || "·").charAt(0).toUpperCase()}
            </div>
            <input
              value={name}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 24,
                letterSpacing: "-0.02em",
                color: "var(--fg)",
              }}
            />
            {dirty ? (
              <div className="flex items-center gap-2">
                <span className="t-mono hidden sm:inline" style={{ color: "var(--spark)" }}>
                  · {it ? "MODIFICATO" : "MODIFIED"}
                </span>
                <button
                  type="button"
                  className="pill pill-ghost pill-sm"
                  onClick={onCancel}
                >
                  {it ? "Annulla" : "Cancel"}
                </button>
                <button
                  type="button"
                  className="pill pill-spark pill-sm"
                  onClick={onSave}
                >
                  {it ? "Salva" : "Save"}
                </button>
              </div>
            ) : (
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                {it ? "EDIT" : "EDIT"}
              </span>
            )}
          </div>
        </FieldRow>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FieldRow label={it ? "URL WORKSPACE" : "WORKSPACE URL"}>
            <ReadOnlyField mono>
              <span style={{ color: "var(--muted-foreground)" }}>
                app.pulsehr.it/
              </span>
              {slug}
              <span style={{ flex: 1 }} />
              <button
                type="button"
                onClick={onCopyUrl}
                className="t-mono"
                style={{
                  color: "var(--muted-foreground)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {it ? "COPIA" : "COPY"}
              </button>
            </ReadOnlyField>
          </FieldRow>
          <FieldRow label={it ? "REGIONE · FUSO" : "REGION · TIMEZONE"}>
            <ReadOnlyField>
              <span>EU · Frankfurt</span>
              <span style={{ color: "var(--muted-foreground)", marginLeft: 8 }}>
                · Europe/Rome (CEST)
              </span>
            </ReadOnlyField>
          </FieldRow>
        </div>
      </div>
    </Section>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ReadOnlyField({
  children,
  mono,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        fontFamily: mono
          ? "JetBrains Mono, monospace"
          : "Inter, system-ui, sans-serif",
        color: "var(--fg)",
        background: "transparent",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- 02 · PEOPLE & ROLES ---------- */
interface PersonRow {
  id: string;
  initials: string;
  name: string;
  email: string;
  meta: string;
  role: SettingsRole;
  owner: boolean;
}

const ROLE_LEGEND_IT: Array<[SettingsRole, string]> = [
  ["Admin",  "Tutto — configurazione, fatturato, persone."],
  ["Member", "Persone, commesse, kudos, timesheet."],
  ["Viewer", "Solo lettura. Niente RAL, niente buste."],
  ["Guest",  "Una commessa. Scade automaticamente."],
];
const ROLE_LEGEND_EN: Array<[SettingsRole, string]> = [
  ["Admin",  "Everything — config, billing, people."],
  ["Member", "People, projects, kudos, timesheet."],
  ["Viewer", "Read-only. No salary, no payroll."],
  ["Guest",  "One project. Auto-expires."],
];

function SectionPeople({
  people,
  it,
  onRoleChange,
}: {
  people: PersonRow[];
  it: boolean;
  onRoleChange: (id: string, role: SettingsRole) => void;
}) {
  const legend = it ? ROLE_LEGEND_IT : ROLE_LEGEND_EN;
  return (
    <Section
      num="02"
      kana={it ? "PERSONE & RUOLI" : "PEOPLE & ROLES"}
      title={it ? "Chi accede a" : "Who can do"}
      italic={it ? "cosa" : "what"}
      hint={
        it
          ? "4 ruoli. Ogni persona vede solo ciò che il suo ruolo permette."
          : "4 roles. Each person sees only what their role allows."
      }
    >
      <div className="flex flex-col gap-3.5">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {legend.map(([k, v], i) => (
            <div
              key={k}
              className="flex flex-col gap-1.5"
              style={{
                padding: "12px 14px",
                borderRight: i < legend.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                className="t-mono"
                style={{ color: "var(--spark)", fontWeight: 700 }}
              >
                {k.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: "var(--muted-foreground)",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {people.map((p, i) => (
            <div
              key={p.id}
              className="grid items-center gap-3.5"
              style={{
                gridTemplateColumns: "auto 1fr auto auto",
                padding: "12px 16px",
                borderBottom:
                  i < people.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span className="avatar">{p.initials}</span>
              <div className="flex flex-col min-w-0">
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--fg)",
                  }}
                  className="truncate"
                >
                  {p.name}
                </span>
                <span
                  className="t-mono truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {p.email} · {p.meta}
                </span>
              </div>
              <RoleSelect
                role={p.role}
                owner={p.owner}
                onChange={(r) => onRoleChange(p.id, r)}
              />
              <button
                type="button"
                title={it ? "Rimuovi" : "Remove"}
                disabled={p.owner}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  cursor: p.owner ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: p.owner ? 0.35 : 1,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11">
                  <path
                    d="M2 2 L9 9 M9 2 L2 9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function RoleSelect({
  role,
  owner,
  onChange,
}: {
  role: SettingsRole;
  owner?: boolean;
  onChange?: (r: SettingsRole) => void;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px 6px 12px",
        borderRadius: 999,
        border: "1px solid var(--line-strong)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--fg)",
        background: "transparent",
        cursor: owner ? "default" : "pointer",
        opacity: owner ? 0.85 : 1,
        position: "relative",
      }}
    >
      {role}
      {!owner && (
        <>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            style={{ opacity: 0.55 }}
            aria-hidden
          >
            <path
              d="M1 2.5 L4 5.5 L7 2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <select
            value={role}
            onChange={(e) => onChange?.(e.target.value as SettingsRole)}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              fontSize: 16,
            }}
            aria-label="Role"
          >
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Viewer">Viewer</option>
            <option value="Guest">Guest</option>
          </select>
        </>
      )}
    </label>
  );
}

/* ---------- 03 · INVITES ---------- */
function SectionInvites({
  invites,
  counts,
  it,
  onResend,
  onRevoke,
  onRoleChange,
  onOpenShare,
}: {
  invites: InviteRow[];
  counts: { pending: number; accepted: number; expired: number };
  it: boolean;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  onRoleChange: (id: string, role: SettingsRole) => void;
  onOpenShare: () => void;
}) {
  return (
    <Section
      num="03"
      kana={it ? "INVITI" : "INVITES"}
      title={it ? "Recap &" : "Recap &"}
      italic={it ? "gestione" : "manage"}
      hint={
        it
          ? "Inviti aperti, accettati o scaduti. Reinvia o revoca quando serve."
          : "Open, accepted or expired invites. Resend or revoke as needed."
      }
    >
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 md:grid-cols-[repeat(3,1fr)_auto] gap-3 items-stretch">
          <CountCard label={it ? "IN ATTESA" : "PENDING"} num={counts.pending} spark />
          <CountCard label={it ? "ACCETTATI" : "ACCEPTED"} num={counts.accepted} />
          <CountCard label={it ? "SCADUTI" : "EXPIRED"} num={counts.expired} muted />
          <button
            type="button"
            className="pill pill-spark pill-sm col-span-2 md:col-span-1"
            style={{
              alignSelf: "stretch",
              paddingLeft: 18,
              paddingRight: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={onOpenShare}
          >
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 5,
                borderRadius: 999,
                background: "var(--spark-ink)",
                marginRight: 2,
              }}
            />
            {it ? "Invita" : "Invite"}
            <span className="arr" style={{ marginLeft: 6 }}>→</span>
          </button>
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {invites.length === 0 ? (
            <div
              style={{
                padding: "20px 16px",
                fontSize: 13,
                color: "var(--muted-foreground)",
              }}
            >
              {it ? "Nessun invito aperto." : "No open invites."}
            </div>
          ) : (
            invites.map((inv, i) => {
              const expired = inv.status === "expired";
              return (
                <div
                  key={inv.id}
                  className="grid items-center gap-3.5"
                  style={{
                    gridTemplateColumns:
                      "auto minmax(0,1fr) auto auto auto",
                    padding: "12px 16px",
                    borderBottom:
                      i < invites.length - 1 ? "1px solid var(--line)" : "none",
                    opacity: expired ? 0.7 : 1,
                  }}
                >
                  <span className="avatar" style={{ opacity: 0.85 }}>
                    {inv.initials}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="truncate"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--fg)",
                      }}
                    >
                      {inv.name}
                    </span>
                    <span
                      className="t-mono truncate"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {inv.email} · {it ? "INVIATO" : "SENT"} {inv.sent}
                    </span>
                  </div>
                  <StatusChip status={inv.status} it={it} />
                  <RoleSelect
                    role={inv.role}
                    onChange={(r) => onRoleChange(inv.id, r)}
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="pill pill-ghost pill-sm"
                      onClick={() => onResend(inv.id)}
                    >
                      {it ? "Rispedisci" : "Resend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRevoke(inv.id)}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 999,
                        background: "transparent",
                        color: "var(--fg)",
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                    >
                      {it ? "Revoca" : "Revoke"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Section>
  );
}

function CountCard({
  label,
  num,
  spark,
  muted,
}: {
  label: string;
  num: number;
  spark?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1 min-w-0"
      style={{
        border: "1px solid " + (spark ? "var(--spark)" : "var(--line)"),
        borderRadius: 12,
        padding: "12px 16px",
        background: spark
          ? "color-mix(in oklch, var(--spark) 10%, transparent)"
          : "transparent",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        className="t-num"
        style={{
          fontSize: 36,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: muted ? "var(--muted-foreground)" : "var(--fg)",
        }}
      >
        {num}
      </span>
    </div>
  );
}

function StatusChip({
  status,
  it,
}: {
  status: "pending" | "expired";
  it: boolean;
}) {
  const map = {
    pending: {
      label: it ? "IN ATTESA" : "PENDING",
      color: "var(--fg)",
      bd: "var(--spark)",
    },
    expired: {
      label: it ? "SCADUTO" : "EXPIRED",
      color: "var(--muted-foreground)",
      bd: "var(--line-strong)",
    },
  } as const;
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 999,
        border: "1px solid " + s.bd,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: s.color,
        background: "transparent",
      }}
    >
      {status === "pending" && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "var(--spark)",
            boxShadow: "0 0 8px var(--spark)",
          }}
        />
      )}
      {s.label}
    </span>
  );
}

/* ---------- 04 · DANGER ---------- */
function SectionDanger({ it, onReset }: { it: boolean; onReset: () => void }) {
  return (
    <Section
      num="04"
      kana={it ? "ZONA PERICOLOSA" : "DANGER ZONE"}
      title={it ? "Azioni" : "Irreversible"}
      italic={it ? "irreversibili" : "actions"}
      danger
      hint={
        it
          ? "Cancella tutti i dati locali e riporta il workspace allo stato iniziale. Non si può annullare."
          : "Wipes all local data and resets the workspace to its initial state. Cannot be undone."
      }
    >
      <div
        className="grid items-center gap-4"
        style={{
          border: "1px solid var(--spark)",
          borderRadius: 12,
          padding: "16px 20px",
          gridTemplateColumns: "1fr auto",
          background: "color-mix(in oklch, var(--spark) 6%, transparent)",
        }}
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
            }}
          >
            {it ? "Reset workspace" : "Reset workspace"}
          </span>
          <span
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--fg-2)",
              maxWidth: 540,
            }}
          >
            {it
              ? "Rimuove persone, inviti, commesse e configurazione locale. Il workspace torna vuoto, intestato solo a te. Richiede conferma con il nome del workspace."
              : "Removes people, invites, projects and local configuration. The workspace goes back to empty, owned only by you. Requires typing the workspace name to confirm."}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{
            border: "1.5px solid var(--fg)",
            borderRadius: 999,
            background: "var(--fg)",
            color: "var(--bg)",
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {it ? "Reset workspace →" : "Reset workspace →"}
        </button>
      </div>
    </Section>
  );
}
