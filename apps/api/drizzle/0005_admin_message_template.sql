ALTER TABLE "notifications_outbox" DROP CONSTRAINT IF EXISTS "notifications_outbox_template_chk";
--> statement-breakpoint
ALTER TABLE "notifications_outbox" ADD CONSTRAINT "notifications_outbox_template_chk" CHECK ("template_key" IN ('release','mention','admin_message'));
