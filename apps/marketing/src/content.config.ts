import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/!(README).{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().min(50).max(200),
      datePublished: z.coerce.date(),
      dateUpdated: z.coerce.date().optional(),
      author: z.string().default("Davide Ghiotto"),
      track: z
        .enum(["oss-mechanics", "people-first-hr", "engineering-notes", "agent-native-hr"])
        .optional(),
      tags: z.array(z.string()).default([]),
      ogImage: image().optional(),
      locale: z.enum(["en", "it"]).default("en"),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
