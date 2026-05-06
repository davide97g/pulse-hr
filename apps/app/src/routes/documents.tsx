import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Folder,
  Upload,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { useBulkSelect, BulkBar, RowCheckbox, HeaderCheckbox } from "@/components/app/bulk";
import { FileDown } from "lucide-react";
import { type Doc } from "@/lib/mock-data";
import { docsTable, useDocs } from "@/lib/tables/docs";
import { useFullName } from "@/lib/current-user";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Documents,
});

const DEFAULT_FOLDERS = ["Contracts", "Policies", "Templates", "Tax forms", "Onboarding"];

function Documents() {
  const me = useFullName() || "You";
  const list = useDocs();
  const [folderRaw, setFolderRaw] = useUrlParam("folder");
  const folder = folderRaw || null;
  const setFolder = (v: string | null) => setFolderRaw(v);
  const [q, setQ] = useUrlParam("q");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [rename, setRename] = useState<Doc | null>(null);
  const [toDelete, setToDelete] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const FOLDERS = useMemo(() => [...DEFAULT_FOLDERS, ...customFolders], [customFolders]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selected, setSelected] = useState<Doc | null>(null);
  const liveSelected = selected ? (list.find((d) => d.id === selected.id) ?? null) : null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    list.forEach((d) => m.set(d.folder, (m.get(d.folder) ?? 0) + 1));
    return m;
  }, [list]);

  const filtered = list.filter(
    (d) =>
      (!folder || d.folder === folder) && (!q || d.name.toLowerCase().includes(q.toLowerCase())),
  );

  const remove = (d: Doc) => {
    docsTable.remove(d.id);
    toast("Document deleted", {
      action: { label: "Undo", onClick: () => docsTable.add(d) },
    });
  };

  const bulk = useBulkSelect(filtered);

  const bulkDelete = () => {
    const targets = bulk.selectedRows;
    if (targets.length === 0) return;
    targets.forEach((d) => docsTable.remove(d.id));
    bulk.clear();
    toast(`${targets.length} document${targets.length === 1 ? "" : "s"} deleted`, {
      action: {
        label: "Undo",
        onClick: () => targets.forEach((d) => docsTable.add(d)),
      },
    });
  };

  const bulkDownload = () => {
    const rows = bulk.selectedRows;
    if (rows.length === 0) return;
    // TODO: zip generation — bundles a single text manifest for now
    const manifest = rows
      .map(
        (d) =>
          `Pulse HR document\n\nName: ${d.name}\nFolder: ${d.folder}\nOwner: ${d.owner}\nUpdated: ${d.updated}\nStatus: ${d.status}\n`,
      )
      .join("\n---\n\n");
    const blob = new Blob([manifest], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents-${rows.length}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${rows.length} document${rows.length === 1 ? "" : "s"}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        eyebrow="WORK · DOCUMENTI AZIENDALI"
        title={
          <>
            <span className="spark-mark">Archivio</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description="Contratti, policy, template, firme elettroniche."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="press-scale"
              onClick={() => {
                setNewFolderName("");
                setNewFolderOpen(true);
              }}
            >
              <FolderPlus className="h-4 w-4 mr-1.5" />
              New folder
            </Button>
            <Button size="sm" className="press-scale" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5 stagger-in">
        <Card
          className={cn(
            "p-4 cursor-pointer hover:shadow-md transition-shadow press-scale",
            !folder && "ring-2 ring-primary/40 border-primary/40",
          )}
          onClick={() => setFolder(null)}
        >
          <FileText className="h-6 w-6 text-primary mb-2" />
          <div className="text-sm font-medium">All files</div>
          <div className="text-xs text-muted-foreground mt-0.5">{list.length} files</div>
        </Card>
        {FOLDERS.map((f) => (
          <Card
            key={f}
            className={cn(
              "p-4 cursor-pointer hover:shadow-md transition-shadow press-scale",
              folder === f && "ring-2 ring-primary/40 border-primary/40",
            )}
            onClick={() => setFolder(f)}
          >
            <Folder className="h-6 w-6 text-info mb-2" />
            <div className="text-sm font-medium">{f}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{counts.get(f) ?? 0} files</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
        <div className="p-3 border-b flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search documents…"
              className="pl-8 h-9"
            />
          </div>
          {(folder || q) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFolder(null);
                setQ("");
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {loading ? (
          <SkeletonRows rows={5} avatar={false} />
        ) : filtered.length === 0 ? (
          <EmptyState
            compact
            icon={<FileText className="h-6 w-6" />}
            title={list.length === 0 ? "No documents yet" : "No matches"}
            description={
              list.length === 0
                ? "Upload your first document to get started."
                : "Try clearing filters."
            }
            action={
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-1.5" />
                Upload
              </Button>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <HeaderCheckbox
                    allSelected={bulk.allSelected}
                    someSelected={bulk.someSelected}
                    onToggle={() => bulk.toggleAll(filtered)}
                  />
                </th>
                <th className="text-left font-medium px-4 py-2.5">Name</th>
                <th className="text-left font-medium px-4 py-2.5">Folder</th>
                <th className="text-left font-medium px-4 py-2.5">Size</th>
                <th className="text-left font-medium px-4 py-2.5">Owner</th>
                <th className="text-left font-medium px-4 py-2.5">Updated</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="stagger-in">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-t hover:bg-muted/40 cursor-pointer group transition-colors"
                  onClick={() => setSelected(d)}
                >
                  <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                    <RowCheckbox
                      checked={bulk.isSelected(d.id)}
                      onChange={() => bulk.toggle(d.id)}
                      label={`Select ${d.name}`}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.folder}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{d.size}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.owner}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{d.updated}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-2" onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: real storage fetch — stubs a metadata blob for now
                            const blob = new Blob(
                              [
                                `Pulse HR document\n\nName: ${d.name}\nFolder: ${d.folder}\nOwner: ${d.owner}\nUpdated: ${d.updated}\nStatus: ${d.status}\n`,
                              ],
                              { type: "text/plain" },
                            );
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${d.name}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                            toast.success("Download started", { description: d.name });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRename(d)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={d.esignStatus === "requested" || d.esignStatus === "signed"}
                          onClick={() => {
                            // TODO: integrate e-sign provider
                            docsTable.update(d.id, {
                              esignStatus: "requested",
                              updated: "just now",
                            });
                            toast.success("Signature request sent", {
                              description: `${d.name} marked as awaiting signature.`,
                            });
                          }}
                        >
                          Request e-sign
                          {d.esignStatus === "requested" && (
                            <span className="ml-auto text-[10px] uppercase text-muted-foreground">
                              pending
                            </span>
                          )}
                          {d.esignStatus === "signed" && (
                            <span className="ml-auto text-[10px] uppercase text-success">
                              signed
                            </span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setToDelete(d)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <BulkBar
          count={bulk.count}
          onClear={bulk.clear}
          noun="document"
          actions={[
            {
              label: "Download",
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: bulkDownload,
            },
            {
              label: "Export CSV",
              icon: <FileDown className="h-3.5 w-3.5" />,
              onClick: () => {
                const rows = bulk.selectedRows;
                const cols = ["id", "name", "folder", "size", "owner", "updated", "status"];
                const esc = (v: unknown) => {
                  const s = String(v ?? "");
                  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const body = [
                  cols.join(","),
                  ...rows.map((r) =>
                    cols.map((c) => esc(r[c as keyof Doc])).join(","),
                  ),
                ].join("\n");
                const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `documents-${rows.length}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
              },
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              onClick: bulkDelete,
              tone: "destructive",
            },
          ]}
        />
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Drop a file or choose one to attach. Mock only.</DialogDescription>
          </DialogHeader>
          <UploadForm
            folders={FOLDERS}
            onSave={(data) => {
              const d = docsTable.add({
                name: data.name,
                folder: data.folder,
                size: "— KB",
                updated: "just now",
                status: "draft",
                owner: me,
              });
              toast.success("Uploaded", { description: d.name });
              setUploadOpen(false);
            }}
            onCancel={() => setUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-folder-name">Folder name</Label>
            <Input
              id="new-folder-name"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Compliance"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim()) {
                  e.preventDefault();
                  const name = newFolderName.trim();
                  if (FOLDERS.includes(name)) {
                    toast.error("Folder already exists");
                    return;
                  }
                  setCustomFolders((f) => [...f, name]);
                  setFolder(name);
                  toast.success("Folder created", { description: name });
                  setNewFolderOpen(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newFolderName.trim()}
              onClick={() => {
                const name = newFolderName.trim();
                if (FOLDERS.includes(name)) {
                  toast.error("Folder already exists");
                  return;
                }
                setCustomFolders((f) => [...f, name]);
                setFolder(name);
                toast.success("Folder created", { description: name });
                setNewFolderOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rename} onOpenChange={(o) => !o && setRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename document</DialogTitle>
          </DialogHeader>
          {rename && (
            <RenameForm
              doc={rename}
              onSave={(name) => {
                docsTable.update(rename.id, { name, updated: "just now" });
                toast.success("Renamed");
                setRename(null);
              }}
              onCancel={() => setRename(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <SidePanel
        open={!!liveSelected}
        onClose={() => setSelected(null)}
        width={420}
        title={liveSelected?.name}
      >
        {liveSelected && (
          <div className="space-y-5">
            <Card className="p-4 flex items-center gap-3">
              <FileText className="h-7 w-7 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{liveSelected.name}</div>
                <div className="text-xs text-muted-foreground">{liveSelected.folder}</div>
              </div>
              <StatusBadge status={liveSelected.status} />
            </Card>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Owner</dt>
                <dd className="mt-0.5">{liveSelected.owner}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Updated</dt>
                <dd className="mt-0.5">{liveSelected.updated}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Size</dt>
                <dd className="mt-0.5 tabular-nums">{liveSelected.size}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">E-sign</dt>
                <dd className="mt-0.5 capitalize">{liveSelected.esignStatus ?? "none"}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // TODO: real storage fetch
                  const blob = new Blob(
                    [
                      `Pulse HR document\n\nName: ${liveSelected.name}\nFolder: ${liveSelected.folder}\nOwner: ${liveSelected.owner}\nUpdated: ${liveSelected.updated}\nStatus: ${liveSelected.status}\n`,
                    ],
                    { type: "text/plain" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${liveSelected.name}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  toast.success("Download started", { description: liveSelected.name });
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setRename(liveSelected);
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Rename
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  liveSelected.esignStatus === "requested" ||
                  liveSelected.esignStatus === "signed"
                }
                onClick={() => {
                  // TODO: integrate e-sign provider
                  docsTable.update(liveSelected.id, {
                    esignStatus: "requested",
                    updated: "just now",
                  });
                  toast.success("Signature request sent");
                }}
              >
                Request e-sign
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelected(null);
                  setToDelete(liveSelected);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        )}
      </SidePanel>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `"${toDelete.name}" will be deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) remove(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UploadForm({
  onSave,
  onCancel,
  folders,
}: {
  onSave: (d: { name: string; folder: string }) => void;
  onCancel: () => void;
  folders: string[];
}) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState(folders[0]);
  return (
    <>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-md p-8 text-center hover:bg-muted/40 cursor-pointer transition-colors">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
          <div className="text-sm font-medium mt-2">Drop a file or click to upload</div>
          <div className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, JPG up to 20MB</div>
        </div>
        <div className="space-y-1.5">
          <Label>Document name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Employment contract — Jane Doe"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Folder</Label>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {folders.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), folder })}>
          Upload
        </Button>
      </DialogFooter>
    </>
  );
}

function RenameForm({
  doc,
  onSave,
  onCancel,
}: {
  doc: Doc;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(doc.name);
  return (
    <>
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim())}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
