import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employees, type ManagerAsk } from "@/lib/mock-data";

export function AskTopicDialog({
  employeeId,
  open,
  onOpenChange,
  onCreate,
}: {
  employeeId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate?: (ask: ManagerAsk) => void;
}) {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [tone, setTone] = useState<ManagerAsk["tone"]>("neutral");
  const employee = employees.find((e) => e.id === employeeId);

  function submit() {
    if (!topic.trim() || !prompt.trim()) return;
    const ask: ManagerAsk = {
      id: `ma-${Date.now()}`,
      managerId: employees[0].id,
      employeeId,
      topic: topic.trim(),
      prompt: prompt.trim(),
      createdAt: new Date().toISOString(),
      dueAt: dueAt || undefined,
      status: "pending",
      tone,
    };
    onCreate?.(ask);
    toast.success(`Sent to ${employee?.name.split(" ")[0] ?? "report"}`);
    onOpenChange(false);
    setTopic("");
    setPrompt("");
    setDueAt("");
    setTone("neutral");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ask {employee?.name.split(" ")[0] ?? "report"} a topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input
              placeholder="Feedback on ACME demo"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prompt</Label>
            <Textarea
              rows={3}
              placeholder="What should the agent ask them?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due</Label>
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ManagerAsk["tone"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="probing">Probing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
