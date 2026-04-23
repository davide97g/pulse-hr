-- Tightens proposal types to the spec: only "improvement" and "idea" are
-- allowed. Any rows currently using the legacy "bug" value (no real backend
-- means there are no real bugs) are migrated to "idea".
ALTER TABLE "proposals" DROP CONSTRAINT IF EXISTS "proposals_type_chk";--> statement-breakpoint
UPDATE "proposals" SET "type" = 'idea' WHERE "type" = 'bug';--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_type_chk" CHECK ("type" in ('improvement','idea'));
