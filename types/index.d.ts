// types/index.d.ts
export type RegionId = string;

export type RegionDef = {
  name: string;
  x: number; y: number;
  pop: number;          // 1-5, controls circle size
  open: number;         // starting openness 0-100
  pers: number;         // starting persecution 0-100
  start?: boolean;      // true for the starting region
};

export type EventEffect =
  | { kind: "region"; stat: "open" | "pers" | "bel"; delta: number }  // hits one random started region
  | { kind: "funds"; delta: number }
  | { kind: "prayer"; delta: number };

export type EventDef = {
  id: string;
  text: string;
  verse: string;
  effects: EventEffect[];
};

export type Campaign = {
  id: string;
  title: string;
  maxTurns: number;
  regions: Record<RegionId, RegionDef>;
  links: [RegionId, RegionId][];
  events: EventDef[];
};
