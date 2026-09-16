export type ResearchAnalysis = {
  id: string;
  slug: string;
  title: string;
  domain: "WIS" | "SCD" | "WW";
  subjectType: "character" | "work" | "aspect";
  subjectLabel: string;
  aspect: string;
  summary: string;
  tags: string[];
  author: string;
  readTime: string;
  comments: number;
  revision: string;
  status: "published";
};

export const researchCatalog: ResearchAnalysis[] = [
  { id: "seed-analysis-strategists-ceiling", slug: "strategist-ceiling", title: "The strategist's ceiling", domain: "SCD", subjectType: "character", subjectLabel: "Baku Madarame × Johan Liebert", aspect: "Planning under information loss", summary: "A comparison-led study of what survives when both characters lose control of the model they built.", tags: ["planning", "deception", "adaptability", "comparison"], author: "ScaleFrame Editorial", readTime: "8 min", comments: 12, revision: "03", status: "published" },
  { id: "seed-analysis-johan-interior", slug: "johan-interior-distance", title: "The distance inside Johan", domain: "WW", subjectType: "character", subjectLabel: "Johan Liebert", aspect: "Interiority and negative space", summary: "How restraint, absence, and other people's projections do the work of characterization.", tags: ["psychology", "characterization", "subtext"], author: "Mira / close reading", readTime: "11 min", comments: 8, revision: "02", status: "published" },
  { id: "seed-analysis-dune-prescience", slug: "prescience-as-constraint", title: "When foresight becomes a cage", domain: "WIS", subjectType: "aspect", subjectLabel: "Paul Atreides", aspect: "Prescience, agency, and win conditions", summary: "A powerscaling note separating what a future sight can perceive from what a character can actually choose.", tags: ["abilities", "win conditions", "assumptions"], author: "Nadir", readTime: "7 min", comments: 5, revision: "01", status: "published" },
  { id: "seed-analysis-arc-boundaries", slug: "arc-boundaries-change-the-answer", title: "The version is the argument", domain: "SCD", subjectType: "aspect", subjectLabel: "Character versions", aspect: "Canon boundaries and fair comparison", summary: "Why a version selector is not admin detail: it changes the evidence a reader is allowed to use.", tags: ["methodology", "canon", "versions"], author: "ScaleFrame Editorial", readTime: "5 min", comments: 19, revision: "04", status: "published" },
  { id: "seed-analysis-guts-survival", slug: "guts-survival-as-writing", title: "Survival is not a personality", domain: "WW", subjectType: "character", subjectLabel: "Guts", aspect: "Trauma, action, and agency", summary: "A craft analysis of how repeated survival becomes meaningful only when the writing gives it a cost.", tags: ["trauma", "agency", "character arc"], author: "Eli R.", readTime: "9 min", comments: 7, revision: "02", status: "published" },
  { id: "seed-analysis-reaction-speed", slug: "reaction-speed-and-context", title: "Reaction speed needs a scene", domain: "WIS", subjectType: "aspect", subjectLabel: "Combat speed", aspect: "Contextualizing feats", summary: "A beginner-friendly guide to separating reaction, travel, attack, and decision speed before scaling a feat.", tags: ["feats", "speed", "beginner guide"], author: "Kaito", readTime: "6 min", comments: 24, revision: "05", status: "published" },
];

export const researchTags = ["planning", "deception", "adaptability", "psychology", "characterization", "subtext", "abilities", "win conditions", "methodology", "canon", "versions", "feats", "speed", "beginner guide", "agency", "comparison"];
