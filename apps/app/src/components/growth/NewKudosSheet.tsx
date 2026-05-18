import { useEffect, useMemo, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@pulse-hr/ui/primitives/popover";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { kudosTable } from "@/lib/tables/kudos";
import { useEmployees } from "@/lib/tables/employees";
import { Avatar } from "@/components/app/AppShell";
import { toast } from "sonner";
import type { Employee, Kudo } from "@/lib/mock-data";
import { useDraft } from "@/lib/use-draft";
import { useT } from "@pulse-hr/shared/i18n";

interface KudoDraft {
  toId: string;
  message: string;
  tag: Kudo["tag"];
  amount: number;
}

const EMPTY_KUDO_DRAFT: KudoDraft = {
  toId: "",
  message: "",
  tag: "craft",
  amount: 5,
};

const TAG_IDS: Kudo["tag"][] = ["craft", "impact", "teamwork", "courage", "kindness"];
const TAG_KEY: Record<Kudo["tag"], string> = {
  craft: "kudos.tag.craft",
  impact: "kudos.tag.impact",
  teamwork: "kudos.tag.teamwork",
  courage: "kudos.tag.courage",
  kindness: "kudos.tag.kindness",
};

const COIN_OPTIONS = [5, 10, 25, 50];

export function NewKudosSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const employees = useEmployees();
  const t = useT();
  const { draft, setDraft, clearDraft } = useDraft<KudoDraft>(
    "pulsehr.draft.kudos-new",
    EMPTY_KUDO_DRAFT,
  );
  const { toId, message, tag, amount } = draft;

  function publish() {
    if (!toId || !message.trim()) {
      toast.error(t("kudos.new.validation"));
      return;
    }
    const k: Kudo = {
      id: `kd-${Date.now()}`,
      fromId: "e1",
      toId,
      amount,
      tag,
      date: new Date().toISOString().slice(0, 10),
      message: message.trim(),
    };
    kudosTable.add(k);
    toast.success(t("kudos.new.published"), {
      action: { label: t("common.undo"), onClick: () => kudosTable.remove(k.id) },
    });
    clearDraft();
    onClose();
  }

  const target = employees.find((e) => e.id === toId);

  return (
    <SidePanel open={open} onClose={onClose} title={t("kudos.new.title")} width={520}>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.new.recipient")}
          </span>
          <EmployeePicker
            employees={employees.filter((e) => e.id !== "e1")}
            value={toId}
            onChange={(id) => setDraft({ toId: id })}
            placeholder={t("kudos.new.recipient.placeholder")}
            searchPlaceholder={t("kudos.new.recipient.search")}
            emptyLabel={t("kudos.new.recipient.empty")}
            clearLabel={t("common.close")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.new.category")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TAG_IDS.map((id) => {
              const on = tag === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDraft({ tag: id })}
                  className="t-mono"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                    background: on ? "var(--ink)" : "transparent",
                    color: on ? "var(--paper)" : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}
                >
                  {t(TAG_KEY[id])}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            COIN
          </span>
          <div className="flex gap-1.5">
            {COIN_OPTIONS.map((n) => {
              const on = amount === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDraft({ amount: n })}
                  className="t-mono"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--spark)" : "var(--line)"}`,
                    background: on
                      ? "color-mix(in oklch, var(--spark) 12%, transparent)"
                      : "transparent",
                    color: on ? "var(--spark)" : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}
                >
                  +{n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.new.message")}
          </span>
          <textarea
            value={message}
            onChange={(e) => setDraft({ message: e.target.value })}
            placeholder={t("kudos.new.message.placeholder")}
            rows={4}
            style={{
              padding: "12px 14px",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--fg)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.4,
              resize: "vertical",
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.new.preview")}
          </span>
          <div
            className="p-4 flex flex-col"
            style={{
              gap: 10,
              border: "1px solid var(--line)",
              borderRadius: 14,
              background: "var(--bg)",
            }}
          >
            <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
              {target ? (
                <>
                  <Avatar initials={target.initials} size={24} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {target.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {t("kudos.new.preview.pickPerson")}
                </span>
              )}
              <span style={{ flex: 1 }} />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {t(TAG_KEY[tag])}
              </span>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                +{amount}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 17,
                lineHeight: 1.4,
                color: message ? "var(--fg)" : "var(--muted-foreground)",
              }}
            >
              «{message || t("kudos.new.preview.placeholder")}»
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="t-mono"
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            {t("common.cancel").toUpperCase()}
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={publish}
            className="t-mono"
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "none",
              background: "var(--spark)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            {t("kudos.new.publish")}
          </button>
        </div>
      </div>
    </SidePanel>
  );
}

function EmployeePicker({
  employees,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
}: {
  employees: Employee[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  clearLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    setWidth(triggerRef.current.getBoundingClientRect().width);
  }, [open]);

  const selected = useMemo(
    () => employees.find((e) => e.id === value),
    [employees, value],
  );

  const sorted = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: selected ? "8px 12px" : "10px 12px",
            border: "1px solid var(--line-strong)",
            borderRadius: 12,
            background: "transparent",
            color: "var(--fg)",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            minHeight: 44,
            transition: "border-color 120ms ease, background 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }}
        >
          {selected ? (
            <>
              <Avatar initials={selected.initials} size={26} />
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selected.name}</span>
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", fontSize: 11 }}
                >
                  {selected.department}
                </span>
              </span>
            </>
          ) : (
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {placeholder}
            </span>
          )}
          <span style={{ flex: 1 }} />
          {selected ? (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange("");
                setQuery("");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: 999,
                border: "none",
                background: "transparent",
                color: "var(--muted-foreground)",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          ) : null}
          <ChevronDown
            size={16}
            style={{
              color: "var(--muted-foreground)",
              transition: "transform 160ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        style={{
          width,
          padding: 0,
          border: "1px solid var(--line-strong)",
          borderRadius: 14,
          background: "var(--bg)",
          boxShadow: "0 18px 48px -16px color-mix(in oklch, var(--ink) 35%, transparent)",
          overflow: "hidden",
        }}
      >
        <CommandPrimitive
          shouldFilter
          filter={(itemValue, search) => {
            const needle = search.trim().toLowerCase();
            if (!needle) return 1;
            return itemValue.toLowerCase().includes(needle) ? 1 : 0;
          }}
          className="flex h-full w-full flex-col"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <Search size={14} style={{ color: "var(--muted-foreground)" }} />
            <CommandPrimitive.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              className="t-mono"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--fg)",
                fontSize: 12,
                letterSpacing: "0.04em",
                padding: 0,
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={clearLabel}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >
                <X size={12} />
              </button>
            ) : null}
          </div>

          <CommandPrimitive.List
            style={{
              maxHeight: 280,
              overflowY: "auto",
              padding: 6,
            }}
          >
            <CommandPrimitive.Empty
              style={{
                padding: "18px 12px",
                textAlign: "center",
                color: "var(--muted-foreground)",
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 15,
              }}
            >
              {emptyLabel}
            </CommandPrimitive.Empty>

            {sorted.map((e) => {
              const isSelected = e.id === value;
              return (
                <CommandPrimitive.Item
                  key={e.id}
                  value={`${e.name} ${e.department}`}
                  onSelect={() => {
                    onChange(e.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    color: "var(--fg)",
                    transition: "background 120ms ease",
                  }}
                  className="ph-emp-item"
                >
                  <Avatar initials={e.initials} size={26} />
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</span>
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)", fontSize: 11 }}
                    >
                      {e.department}
                    </span>
                  </span>
                  <span style={{ flex: 1 }} />
                  {isSelected ? (
                    <Check size={16} style={{ color: "var(--spark)" }} />
                  ) : null}
                </CommandPrimitive.Item>
              );
            })}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
