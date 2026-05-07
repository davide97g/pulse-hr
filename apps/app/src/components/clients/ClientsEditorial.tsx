import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClients, clientsTable } from "@/lib/tables/clients";
import { useProjects } from "@/lib/tables/projects";
import { ClientForm } from "@/components/pm/ClientForm";
import type { Client } from "@/lib/mock-data";

function clientInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientsEditorial() {
  const clients = useClients();
  const projects = useProjects();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  function saveClient(c: Client) {
    const exists = clientsTable.getAll().some((x) => x.id === c.id);
    if (exists) clientsTable.update(c.id, c);
    else clientsTable.add(c);
    toast.success(`Cliente “${c.name}” salvato`);
    setFormOpen(false);
  }

  const summary = useMemo(() => {
    const totalRevenue = projects.reduce((s, c) => s + c.burnedHours * (c.defaultBillableRate || 0), 0);
    return {
      activeClients: clients.length,
      revenueK: Math.round(totalRevenue / 1000),
    };
  }, [clients, projects]);

  const rows = useMemo(() => {
    return clients.map((c) => {
      const clientProjects = projects.filter((p) => p.clientId === c.id);
      const revenue = clientProjects.reduce((s, p) => s + p.burnedHours * (p.defaultBillableRate || 0), 0);
      const atRisk = clientProjects.some((p) => p.status === "at_risk");
      return {
        client: c,
        projects: clientProjects.length,
        revenueK: Math.round(revenue / 1000),
        status: atRisk ? "REV" : "OK",
      };
    });
  }, [clients, projects]);

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            CLIENTI · {summary.activeClients} ATTIVI · €{summary.revenueK}K NEL TRIMESTRE
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Clienti</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm">
            Filtri
          </button>
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => setFormOpen(true)}
          >
            + Cliente
          </button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          flex: 1,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="tab-row head"
          style={
            {
              "--cols": "40px 1.6fr 1fr 1fr 130px 80px",
              background: "var(--bg-2)",
            } as React.CSSProperties
          }
        >
          <span></span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>CLIENTE</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>SETTORE</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>PROJECTS</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>FATTURATO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>STATO</span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {rows.map((r) => (
            <div
              key={r.client.id}
              className="tab-row"
              onClick={() => navigate({ to: "/clients/$clientId", params: { clientId: r.client.id } })}
              style={
                {
                  "--cols": "40px 1.6fr 1fr 1fr 130px 80px",
                  "--row-pad": "12px",
                  alignItems: "center",
                  cursor: "pointer",
                } as React.CSSProperties
              }
            >
              <span className="ph-avatar ph-avatar-sm">{clientInitials(r.client.name)}</span>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 17,
                  fontFamily: "Fraunces, ui-serif, serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {r.client.name}
              </span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {r.client.industry}
              </span>
              <span
                className="t-body"
                style={{
                  color: "var(--fg-2)",
                  fontStyle: "italic",
                  fontFamily: "Fraunces, ui-serif, serif",
                }}
              >
                {r.projects} commess{r.projects === 1 ? "a" : "e"}
              </span>
              <span className="t-num" style={{ textAlign: "right", fontSize: 18 }}>
                € {r.revenueK}k
              </span>
              <span
                className="t-mono"
                style={{
                  textAlign: "right",
                  color: r.status === "REV" ? "var(--spark)" : "var(--muted-foreground)",
                }}
              >
                {r.status}
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUN CLIENTE</span>
            </div>
          )}
        </div>
      </div>
      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={saveClient}
        initial={null}
      />
    </div>
  );
}

export type { Client };
