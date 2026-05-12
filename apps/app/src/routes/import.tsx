import { createFileRoute } from "@tanstack/react-router";
import { SuperImportCanvas } from "@/components/import/SuperImportCanvas";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <div className="p-4 md:p-6">
      <SuperImportCanvas />
    </div>
  );
}
