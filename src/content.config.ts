import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
const articles = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "src/articles" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

export const collections = {
  articles,
};
