import { createFileRoute } from "@tanstack/react-router";
import { FileText, Folder, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Pulse HR" }] }),
  component: Documents,
});

const folders = ["Contracts", "Policies", "Templates", "Tax forms", "Onboarding"];
const docs = [
  { name: "Employment contract — Emma Wilson", folder: "Contracts", size: "112 KB", updated: "2d ago", status: "pending" },
  { name: "Company handbook 2025", folder: "Policies", size: "2.4 MB", updated: "1w ago", status: "approved" },
  { name: "NDA Template", folder: "Templates", size: "84 KB", updated: "2w ago", status: "approved" },
  { name: "F24 — March 2025", folder: "Tax forms", size: "320 KB", updated: "3w ago", status: "approved" },
  { name: "Remote work policy", folder: "Policies", size: "180 KB", updated: "1mo ago", status: "approved" },
];

function Documents() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Documents"
        description="Contracts, policies, templates and e-signatures"
        actions={<Button size="sm" onClick={() => toast.success("Upload dialog opened")}><Upload className="h-4 w-4 mr-1.5" />Upload</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {folders.map(f => (
          <Card key={f} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <Folder className="h-6 w-6 text-info mb-2" />
            <div className="text-sm font-medium">{f}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{Math.floor(Math.random() * 12) + 3} files</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative max-w-sm">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents…" className="pl-8 h-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Name</th>
              <th className="text-left font-medium px-4 py-2.5">Folder</th>
              <th className="text-left font-medium px-4 py-2.5">Size</th>
              <th className="text-left font-medium px-4 py-2.5">Updated</th>
              <th className="text-left font-medium px-4 py-2.5">Signature</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="border-t hover:bg-muted/40 cursor-pointer">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{d.folder}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{d.size}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{d.updated}</td>
                <td className="px-4 py-2.5"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
