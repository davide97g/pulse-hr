import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";

const meta: Meta = {
  title: "Primitives/Table",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const ROWS = [
  {
    name: "Alma Moretti",
    team: "Design",
    role: "Staff",
    status: "active",
    hours: "182.25",
  },
  {
    name: "Teo Nava",
    team: "Design",
    role: "Senior",
    status: "active",
    hours: "164.00",
  },
  {
    name: "Mira Rossi",
    team: "Engineering",
    role: "Staff",
    status: "leave",
    hours: "32.50",
  },
  {
    name: "Sana Said",
    team: "Engineering",
    role: "Principal",
    status: "active",
    hours: "176.75",
  },
];

export const Default: Story = {
  render: () => (
    <div className="rounded-md border border-border overflow-hidden overflow-x-auto">
      <Table>
        <TableCaption>People · April 2026</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((r) => (
            <TableRow key={r.name}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>{r.team}</TableCell>
              <TableCell>{r.role}</TableCell>
              <TableCell>
                <Badge
                  variant={r.status === "active" ? "default" : "secondary"}
                >
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {r.hours}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};
