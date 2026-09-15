export const seedWorks = [
  { slug: "monster", title: "Monster", type: "Manga / Anime", creator: "Naoki Urasawa", accent: "cyan", description: "A psychological thriller built around identity, consequence, and the stories people tell about evil." },
  { slug: "usogui", title: "Usogui", type: "Manga", creator: "Toshio Sako", accent: "orange", description: "Gambling battles where reading the room is as important as surviving the wager." },
  { slug: "berserk", title: "Berserk", type: "Manga", creator: "Kentaro Miura", accent: "wine", description: "A dark fantasy epic about ambition, trauma, loyalty, and the cost of agency." },
  { slug: "vinland-saga", title: "Vinland Saga", type: "Manga / Anime", creator: "Makoto Yukimura", accent: "green", description: "A historical character study of violence, purpose, and the work of becoming free." },
  { slug: "death-note", title: "Death Note", type: "Manga / Anime", creator: "Tsugumi Ohba", accent: "orange", description: "A battle of information, prediction, performance, and moral self-deception." },
  { slug: "the-beginning-after-the-end", title: "The Beginning After the End", type: "Web novel / Comic", creator: "TurtleMe", accent: "cyan", description: "A reincarnation fantasy with a version-aware progression history." },
  { slug: "dune", title: "Dune", type: "Novel / Film", creator: "Frank Herbert", accent: "wine", description: "Politics, prescience, ecology, and the dangers of turning people into symbols." },
  { slug: "frankenstein", title: "Frankenstein", type: "Novel", creator: "Mary Shelley", accent: "green", description: "A public-domain foundation for arguments about creation, responsibility, and the human." },
];

export const seedCharacters = [
  { slug: "baku-madarame", name: "Baku Madarame", work: "Usogui", versions: ["Composite manga", "Kagerou Club arc"] },
  { slug: "johan-liebert", name: "Johan Liebert", work: "Monster", versions: ["Manga canon", "Anime adaptation"] },
  { slug: "light-yagami", name: "Light Yagami", work: "Death Note", versions: ["Manga canon", "Anime adaptation"] },
  { slug: "l-lawliet", name: "L Lawliet", work: "Death Note", versions: ["Manga canon", "Anime adaptation"] },
  { slug: "guts", name: "Guts", work: "Berserk", versions: ["Golden Age", "Black Swordsman"] },
  { slug: "thorfinn", name: "Thorfinn", work: "Vinland Saga", versions: ["Prologue", "Farmland arc"] },
  { slug: "paul-atreides", name: "Paul Atreides", work: "Dune", versions: ["Dune novel", "Film adaptation"] },
  { slug: "the-creature", name: "The Creature", work: "Frankenstein", versions: ["1818 novel", "1823 edition"] },
];

export const seedMetrics = [
  { slug: "planning", name: "Planning", domain: "SCD", family: "Planning & strategy", definition: "The ability to sequence goals, contingencies, and resources across changing conditions.", status: "standardized", defaultWeight: 1.2 },
  { slug: "deduction", name: "Deduction", domain: "SCD", family: "Cognition", definition: "Inference from incomplete information where the path from evidence to conclusion can be inspected.", status: "standardized", defaultWeight: 1 },
  { slug: "deception", name: "Deception", domain: "SCD", family: "Manipulation", definition: "The ability to create, sell, and maintain a false model in an opponent’s mind.", status: "standardized", defaultWeight: 1 },
  { slug: "adaptability", name: "Adaptability", domain: "SCD", family: "Adversity handling", definition: "The quality of updating decisions after a plan, model, or resource changes.", status: "standardized", defaultWeight: 1.1 },
  { slug: "attack-potency", name: "Attack potency", domain: "WIS", family: "Offense", definition: "Damage output evaluated within the comparison’s stated scaling and environmental rules.", status: "standardized", defaultWeight: 1 },
  { slug: "battle-iq", name: "Battle IQ", domain: "WIS", family: "Combat reasoning", definition: "Reading the fight state and selecting useful actions under pressure.", status: "standardized", defaultWeight: 1 },
  { slug: "win-conditions", name: "Win conditions", domain: "WIS", family: "Match resolution", definition: "The practical routes available to close the match under the declared rules.", status: "standardized", defaultWeight: 1.3 },
  { slug: "characterization", name: "Characterization", domain: "WW", family: "Foundations", definition: "The clarity, depth, and dramatic usefulness of the character’s construction.", status: "standardized", defaultWeight: 1.1 },
  { slug: "psychology", name: "Psychology", domain: "WW", family: "Interior", definition: "The depth, consistency, and dramatic usefulness of a character’s inner life.", status: "standardized", defaultWeight: 1.2 },
  { slug: "thematic-integration", name: "Thematic integration", domain: "WW", family: "Themes", definition: "How naturally the character carries, complicates, or transforms the work’s ideas.", status: "standardized", defaultWeight: 1 },
  { slug: "dialogue", name: "Dialogue", domain: "WW", family: "Writing execution", definition: "Voice, subtext, rhythm, and how speech reveals rather than merely explains.", status: "standardized", defaultWeight: 0.9 },
  { slug: "counter-planning", name: "Counter-planning", domain: "SCD", family: "Planning & strategy", definition: "A proposed community metric for preserving a winning line after an opponent exposes the first plan.", status: "experimental", defaultWeight: 0.8 },
];

export const seedComparisons = [
  { slug: "baku-vs-johan-strategists-ceiling", title: "Baku Madarame vs Johan Liebert", domain: "SCD", winner: "Baku Madarame", difficulty: "High diff", scoreA: 61, scoreB: 39, categories: 12, evidence: 14 },
  { slug: "guts-vs-thorfinn-trauma-as-architecture", title: "Guts vs Thorfinn", domain: "WW", winner: "Exploratory", difficulty: "Open reading", scoreA: 0, scoreB: 0, categories: 18, evidence: 8 },
  { slug: "light-vs-l-decision-space", title: "Light Yagami vs L Lawliet", domain: "SCD", winner: "L Lawliet", difficulty: "Extreme", scoreA: 48, scoreB: 52, categories: 24, evidence: 22 },
];
