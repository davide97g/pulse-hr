import { z } from "zod";

export const AnchorSchema = z.object({
  selector: z.string().max(2048).nullable(),
  xPct: z.number().finite(),
  yPct: z.number().finite(),
  fallbackX: z.number().finite(),
  fallbackY: z.number().finite(),
  scrollY: z.number().finite(),
});

export const PageMetaSchema = z.object({
  title: z.string().max(512),
  viewportW: z.number().int().nonnegative(),
  viewportH: z.number().int().nonnegative(),
  userAgent: z.string().max(1024),
});

export const NewCommentSchema = z.object({
  route: z
    .string()
    .min(1)
    .max(512)
    .regex(/^\//, "route must start with /"),
  anchor: AnchorSchema,
  pageMeta: PageMetaSchema,
  body: z.string().trim().min(1).max(4096),
  tags: z
    .array(z.string().regex(/^[a-z0-9-]{1,24}$/))
    .max(10)
    .optional(),
  screenshotUrl: z.string().url().max(1024).nullable().optional(),
});

export const NewReplySchema = z.object({
  body: z.string().trim().min(1).max(4096),
});

export const VoteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const StatusSchema = z.object({
  status: z.enum(["open", "triaged", "planned", "shipped", "wont_do"]),
});

export const ProposalTypeSchema = z.enum(["bug", "idea", "improvement"]);

export const NewProposalSchema = z.object({
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1).max(4096),
  type: ProposalTypeSchema,
});

export const EditProposalSchema = z
  .object({
    title: z.string().trim().min(1).max(140).optional(),
    body: z.string().trim().min(1).max(4096).optional(),
  })
  .refine((v) => v.title !== undefined || v.body !== undefined, {
    message: "title or body required",
  });

export const ListQuerySchema = z.object({
  route: z
    .string()
    .min(1)
    .max(512)
    .regex(/^\//, "route must start with /"),
});
