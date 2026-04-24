import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@pulse-hr/ui/atoms/PageHeader";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Badge } from "@pulse-hr/ui/primitives/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";

const meta: Meta = {
  title: "Patterns/List route",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

type Row = { id: string; name: string; team: string; status: "active" | "leave"; color: string };

const SEED: Row[] = [
  { id: "1", name: "Alma Moretti", team: "Design", status: "active", color: "#b4ff39" },
  { id: "2", name: "Teo Nava", team: "Design", status: "active", color: "#39e1ff" },
  { id: "3", name: "Mira Rossi", team: "Engineering", status: "leave", color: "#c06bff" },
  { id: "4", name: "Sana Said", team: "Engineering", status: "active", color: "#ff6b9a" },
  { id: "5", name: "Kiko Tanaka", team: "Ops", status: "active", color: "#ffbf4a" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export const Loading: Story = {
  render: () => (
    <div className="max-w-4xl space-y-4">
      <PageHeader title="People" description="Everyone in the workspace." />
      <div className="rounded-md border border-border bg-card p-3">
        <SkeletonRows rows={5} />
      </div>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title="People"
        description="Everyone in the workspace."
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1.5" /> Invite
          </Button>
        }
      />
      <EmptyState
        title="No people yet"
        description="Invite your team to see them here."
        action={<Button>Invite someone</Button>}
      />
    </div>
  ),
};

export const Loaded: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<Row[]>([]);
    useEffect(() => {
      const t = setTimeout(() => {
        setRows(SEED);
        setLoading(false);
      }, 420);
      return () => clearTimeout(t);
    }, []);

    return (
      <div className="max-w-4xl space-y-4">
        <PageHeader
          title="People"
          description="Everyone in the workspace."
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> Invite
            </Button>
          }
        />

        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search…" className="pl-8" />
        </div>

        {loading ? (
          <div className="rounded-md border border-border bg-card p-3">
            <SkeletonRows rows={5} />
          </div>
        ) : (
          <ul className="stagger-in rounded-md border border-border bg-card divide-y divide-border">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 px-4 py-3 press-scale"
              >
                <AvatarDisplay
                  initials={initials(r.name)}
                  color={r.color}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.team}</div>
                </div>
                <Badge
                  variant={r.status === "active" ? "default" : "secondary"}
                >
                  {r.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};
