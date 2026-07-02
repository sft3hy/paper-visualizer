import { z } from 'zod';

export const ExplainerSchema = z.object({
  title_plain: z.string().max(150),
  tldr: z.string().max(350),
  big_picture: z.string().max(700),
  key_findings: z.array(
    z.object({
      finding: z.string().max(250),
      why_it_matters: z.string().max(250),
    })
  ).min(2).max(6),
  method_simplified: z.array(
    z.object({
      step_title: z.string().max(80),
      step_description: z.string().max(250),
    })
  ).min(2).max(6),
  glossary: z.array(
    z.object({
      term: z.string().max(50),
      definition: z.string().max(200),
    })
  ).max(10),
  real_world_analogy: z.string().max(450),
  limitations: z.array(z.string().max(200)).max(5),
  concept_map_nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string().max(50),
    })
  ).min(2).max(10),
  concept_map_edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().max(40).optional(),
    })
  ).min(1).max(15),
});

export type ExplainerData = z.infer<typeof ExplainerSchema>;
