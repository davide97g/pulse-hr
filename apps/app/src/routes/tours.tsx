import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { useT } from "@pulse-hr/shared/i18n";
import { EditorialPage } from "@/components/app/layouts/EditorialPage";
import { useTour } from "@/components/app/TourProvider";
import {
  clearCompletedTours,
  getCompletedTours,
  TOURS,
  TOURS_BY_WORKFLOW,
  WORKFLOW_LABEL_KEYS,
  type Tour,
  type TourWorkflow,
} from "@/lib/tours";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tours")({
  head: () => ({ meta: [{ title: "Help & tours — Pulse HR" }] }),
  component: ToursPage,
});

function useCompletedTours(): { ids: Set<string>; refresh: () => void } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  void tick;
  return {
    ids: new Set(getCompletedTours()),
    refresh: () => setTick((t) => t + 1),
  };
}

function ToursPage() {
  const t = useT();
  const { start } = useTour();
  const { ids: completedIds, refresh } = useCompletedTours();
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { todoCount, doneCount, byWorkflowFiltered } = useMemo(() => {
    let todo = 0;
    let done = 0;
    const grouped: Record<string, Tour[]> = {};
    for (const [workflow, tours] of Object.entries(TOURS_BY_WORKFLOW)) {
      const filtered = tours.filter((tour) => {
        const isDone = completedIds.has(tour.id);
        if (isDone) done++;
        else todo++;
        return tab === "done" ? isDone : !isDone;
      });
      if (filtered.length) grouped[workflow] = filtered;
    }
    return { todoCount: todo, doneCount: done, byWorkflowFiltered: grouped };
  }, [completedIds, tab]);

  const selectedTour = selectedId ? TOURS.find((tour) => tour.id === selectedId) ?? null : null;
  const handlePlay = (id: string) => {
    setSelectedId(null);
    start(id);
  };
  const handleResetAll = () => {
    clearCompletedTours();
    refresh();
  };

  return (
    <>
      <EditorialPage
        eyebrowText={t("tours.page.eyebrow")}
        eyebrowNote={t("tours.page.eyebrow.note", { done: doneCount, todo: todoCount })}
        title={t("tours.page.title")}
        summary={
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("tours.page.summary")}
          </p>
        }
        actions={
          doneCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              {t("tours.page.resetAll")}
            </Button>
          ) : null
        }
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as "todo" | "done")}>
          <TabsList className="mb-6">
            <TabsTrigger value="todo" className="gap-2">
              {t("tours.tab.todo")}
              <span className="tabular-nums text-xs text-muted-foreground">
                {todoCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="done" className="gap-2">
              {t("tours.tab.done")}
              <span className="tabular-nums text-xs text-muted-foreground">
                {doneCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {Object.keys(byWorkflowFiltered).length === 0 ? (
              <EmptyState
                icon={tab === "done" ? <Sparkles className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                title={
                  tab === "done"
                    ? t("tours.empty.done.title")
                    : t("tours.empty.todo.title")
                }
                description={
                  tab === "done"
                    ? t("tours.empty.done.desc")
                    : t("tours.empty.todo.desc")
                }
              />
            ) : (
              <div className="flex flex-col gap-8">
                {(Object.entries(byWorkflowFiltered) as [TourWorkflow, Tour[]][]).map(
                  ([workflow, tours]) => (
                    <section key={workflow} className="flex flex-col gap-3">
                      <div className="t-mono text-muted-foreground px-1">
                        {t(WORKFLOW_LABEL_KEYS[workflow])}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tours.map((tour) => (
                          <TourCard
                            key={tour.id}
                            tour={tour}
                            done={completedIds.has(tour.id)}
                            onOpen={() => setSelectedId(tour.id)}
                            onPlay={() => handlePlay(tour.id)}
                          />
                        ))}
                      </div>
                    </section>
                  ),
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </EditorialPage>

      <SidePanel
        open={!!selectedTour}
        onClose={() => setSelectedId(null)}
        title={selectedTour ? t(selectedTour.name) : undefined}
        width={520}
      >
        {selectedTour && (
          <TourDetail
            tour={selectedTour}
            done={completedIds.has(selectedTour.id)}
            onPlay={() => handlePlay(selectedTour.id)}
          />
        )}
      </SidePanel>
    </>
  );
}

function TourCard({
  tour,
  done,
  onOpen,
  onPlay,
}: {
  tour: Tour;
  done: boolean;
  onOpen: () => void;
  onPlay: () => void;
}) {
  const t = useT();
  const stepsKey = tour.steps.length === 1 ? "tours.card.steps_one" : "tours.card.steps_other";
  return (
    <Card
      onClick={onOpen}
      className={cn(
        "group relative p-4 cursor-pointer transition-colors hover:bg-muted/30",
        done && "opacity-90",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-9 w-9 rounded-full shrink-0 flex items-center justify-center",
            done ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
          )}
        >
          {done ? <Check className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-[15px] leading-tight">{t(tour.name)}</div>
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {tour.duration}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {t(stepsKey, { count: tour.steps.length })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-snug mt-1 line-clamp-2">
            {t(tour.summary)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-3 flex items-center justify-end">
        <Button
          size="sm"
          variant={done ? "outline" : "default"}
          className="h-8 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
          {done ? t("tours.action.replay") : t("tours.action.start")}
        </Button>
      </div>
    </Card>
  );
}

function TourDetail({
  tour,
  done,
  onPlay,
}: {
  tour: Tour;
  done: boolean;
  onPlay: () => void;
}) {
  const t = useT();
  const stepsKey = tour.steps.length === 1 ? "tours.card.steps_one" : "tours.card.steps_other";
  return (
    <div className="flex flex-col gap-6 px-5 py-5">
      <header className="flex flex-col gap-2">
        <div className="t-mono text-muted-foreground">
          {t(WORKFLOW_LABEL_KEYS[tour.workflow]).toUpperCase()} ·{" "}
          {t(stepsKey, { count: tour.steps.length }).toUpperCase()} ·{" "}
          {tour.duration.toUpperCase()}
        </div>
        <h2 className="font-display italic text-3xl leading-tight">{t(tour.name)}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t(tour.summary)}</p>
        {done && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <Check className="h-3.5 w-3.5" />
            {t("tours.detail.completed")}
          </div>
        )}
      </header>

      <Button size="lg" onClick={onPlay} className="w-full">
        <PlayCircle className="h-4 w-4 mr-2" />
        {done ? t("tours.action.replayTour") : t("tours.action.startTour")}
      </Button>

      <section className="flex flex-col gap-3">
        <div className="t-mono text-muted-foreground">{t("tours.detail.whatYouWillSee")}</div>
        <ol className="flex flex-col gap-2">
          {tour.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-[11px] font-medium inline-flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-tight">{t(s.title)}</div>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  {t(s.body)}
                </p>
                {s.docHref && (
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {t("tours.detail.docsLink")}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
