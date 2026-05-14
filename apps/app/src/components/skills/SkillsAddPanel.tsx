import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { LevelSegments } from "@pulse-hr/ui/atoms/LevelSegments";
import {
  LV,
  LV_CAPTION,
  LV_LABEL,
  SKILL_CATALOG,
  type SkillBucket,
  type SkillLevel,
} from "@/lib/skills-data";
import { findCatalogByName, type SkillDraft } from "@/lib/skills-store";

export interface SkillsAddPanelProps {
  open: boolean;
  mode?: "add" | "edit";
  /** Pre-fill data when editing. */
  initial?: {
    name?: string;
    bucket?: SkillBucket;
    level?: SkillLevel;
    note?: string;
    validatedBy?: string;
    validatedOn?: string;
  };
  onClose: () => void;
  onSubmit?: (draft: SkillDraft) => void;
  onRemove?: () => void;
}

const SUGGESTIONS = ["TypeScript", "Public speaking", "Kubernetes", "Storytelling", "Coaching"];

export function SkillsAddPanel({
  open,
  mode = "add",
  initial,
  onClose,
  onSubmit,
  onRemove,
}: SkillsAddPanelProps) {
  const editing = mode === "edit";
  const [name, setName] = useState(initial?.name ?? "");
  const [bucket, setBucket] = useState<SkillBucket>(initial?.bucket ?? "hard");
  const [level, setLevel] = useState<SkillLevel>(initial?.level ?? "practitioner");
  const [note, setNote] = useState(initial?.note ?? "");

  /* Reset / hydrate form whenever the panel opens or the initial row changes. */
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setBucket(initial?.bucket ?? "hard");
    setLevel(initial?.level ?? "practitioner");
    setNote(initial?.note ?? "");
  }, [open, initial?.name, initial?.bucket, initial?.level, initial?.note]);

  /* Keep the bucket selector in sync when the user picks an entry from the catalog. */
  useEffect(() => {
    const match = findCatalogByName(name);
    if (match) setBucket(match.bucket);
  }, [name]);

  const title = editing ? "Edit skill" : "Add a skill";
  const submitDisabled = !name.trim();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Pick a skill from the catalog first.");
      return;
    }
    const match = findCatalogByName(trimmed);
    if (!match) {
      toast.error(`"${trimmed}" isn't in the catalog yet. Pick a suggestion.`);
      return;
    }
    onSubmit?.({ sk: match.id, lvl: level, note: note.trim() || undefined });
  };

  return (
    <SidePanel open={open} onClose={onClose} title={title} width={520}>
      <div
        style={{
          padding: "22px 28px 18px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {editing ? "EDIT SKILL" : "ADD A SKILL"}
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: '"Fraunces", ui-serif, serif',
            fontWeight: 400,
            fontSize: 40,
            letterSpacing: "-0.035em",
            lineHeight: 0.95,
          }}
        >
          {editing ? (
            <>
              <span style={{ fontStyle: "italic" }}>{initial?.name ?? "Skill"}</span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </>
          ) : (
            <>
              Cosa <span style={{ fontStyle: "italic" }}>sai fare</span>
              <span style={{ color: "var(--spark)" }}>?</span>
            </>
          )}
        </h2>
      </div>

      <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Skill name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SKILL · AUTOCOMPLETE FROM CATALOG
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Start typing…"
            disabled={editing}
            list="skills-catalog-options"
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              padding: "14px 16px",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
              background: "var(--bg)",
              outline: "none",
              width: "100%",
            }}
          />
          <datalist id="skills-catalog-options">
            {SKILL_CATALOG.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
          {!editing && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setName(s)}
                  className="t-mono"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "transparent",
                    color: "var(--fg)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bucket */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BUCKET
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(
              [
                ["hard", "Hard.", "Technical · tools · languages"],
                ["soft", "Soft.", "How you show up at work"],
              ] as const
            ).map(([k, t, d]) => {
              const on = bucket === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setBucket(k)}
                  style={{
                    border: `1px solid ${on ? "var(--fg)" : "var(--line)"}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    background: on ? "var(--bg-2)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Fraunces", ui-serif, serif',
                      fontStyle: "italic",
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {t}
                  </div>
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {d}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SELF-ASSESSED LEVEL
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {LV.map((lvl) => {
              const on = level === lvl;
              const masterOn = on && lvl === "master";
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  style={{
                    border: `1px solid ${
                      on ? (lvl === "master" ? "var(--spark)" : "var(--fg)") : "var(--line)"
                    }`,
                    background: on
                      ? masterOn
                        ? "color-mix(in oklch, var(--spark) 18%, var(--bg))"
                        : "var(--bg-2)"
                      : "transparent",
                    padding: "10px 12px",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LevelSegments level={lvl} size="xs" />
                  <span
                    style={{
                      fontFamily: '"Fraunces", ui-serif, serif',
                      fontStyle: "italic",
                      fontSize: 16,
                      color: masterOn ? "var(--spark)" : "var(--fg)",
                    }}
                  >
                    {LV_LABEL[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--muted-foreground)",
              letterSpacing: "-0.005em",
              lineHeight: 1.45,
              marginTop: 2,
            }}
          >
            {LV_LABEL[level]} · {LV_CAPTION[level]}.
          </p>
        </div>

        {/* Note */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NOTE · OPTIONAL · ONE LINE
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What does this skill look like for you, today?"
            rows={2}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 16px",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--fg)",
              background: "var(--bg)",
              outline: "none",
              minHeight: 64,
              resize: "vertical",
              letterSpacing: "-0.005em",
            }}
          />
        </div>

        {editing && (
          <div
            className="iridescent-border"
            style={{
              borderRadius: 12,
              padding: "14px 16px",
              background: "color-mix(in oklch, var(--spark) 6%, transparent)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              HEADS UP
            </span>
            <span
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 16,
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
              }}
            >
              {initial?.validatedBy
                ? `This skill was validated by ${initial.validatedBy}${
                    initial?.validatedOn ? ` on ${initial.validatedOn}` : ""
                  }.`
                : "This skill is validated."}{" "}
              Editing it sends it back to{" "}
              <span style={{ color: "var(--spark)" }}>proposed</span>; they'll see it in their
              queue.
            </span>
          </div>
        )}
      </div>

      <footer
        style={{
          padding: "16px 28px",
          borderTop: "1px solid var(--line-strong)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginTop: "auto",
        }}
      >
        {editing ? (
          <EditorialPill kind="ghost" size="sm" onClick={onRemove}>
            Remove skill
          </EditorialPill>
        ) : (
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            WILL BE SUBMITTED AS · PROPOSED
          </span>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <EditorialPill kind="ghost" size="sm" onClick={onClose}>
            Cancel
          </EditorialPill>
          <EditorialPill
            kind="spark"
            size="sm"
            onClick={handleSubmit}
            disabled={submitDisabled}
          >
            {editing ? "Save & re-propose →" : "Submit →"}
          </EditorialPill>
        </div>
      </footer>
    </SidePanel>
  );
}
