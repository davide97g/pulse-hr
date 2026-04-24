import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@pulse-hr/ui/primitives/card";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Switch } from "@pulse-hr/ui/primitives/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";

const meta: Meta = {
  title: "Patterns/Form layout",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

function Field({
  label,
  htmlFor,
  hint,
  children,
  span = 1,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div className={`grid gap-1.5 ${span === 2 ? "md:col-span-2" : ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const InCard: Story = {
  render: () => (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New commessa</CardTitle>
        <CardDescription>
          Give the engagement an ID, a budget, and a lead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Code" htmlFor="code" hint="Shown in every export.">
            <Input id="code" defaultValue="ACM-2026-014" />
          </Field>
          <Field label="Client" htmlFor="client">
            <Input id="client" placeholder="Acme SpA" />
          </Field>
          <Field label="Lead" htmlFor="lead">
            <Select>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Pick someone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alma">Alma Moretti</SelectItem>
                <SelectItem value="teo">Teo Nava</SelectItem>
                <SelectItem value="mira">Mira Rossi</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Budget (€)" htmlFor="budget">
            <Input id="budget" type="number" defaultValue="50000" />
          </Field>
          <Field label="Description" htmlFor="desc" span={2}>
            <Textarea id="desc" placeholder="What's the scope?" rows={3} />
          </Field>
          <div className="flex items-center justify-between md:col-span-2 rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-medium">Billable</div>
              <div className="text-xs text-muted-foreground">
                Hours logged count toward invoices.
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Create commessa</Button>
      </CardFooter>
    </Card>
  ),
};
