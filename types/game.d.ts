// Add these to your types/index.d.ts (next to Campaign, RegionDef, EventDef, EventEffect)
import type { RegionId } from "./index.d.ts"
export type Region = {
  id: RegionId;
  open: number;  // 0-100
  pers: number;  // 0-100
  bel: number;   // believers, 0-100
  lead: number;  // trained local leaders
};

export type GameState = {
  version: 1;               // bump when the shape changes, so old saves can be migrated
  campaignId: string;
  turn: number;
  ap: number;               // actions left this turn
  workers: number;
  funds: number;
  prayer: number;
  selected: RegionId;
  regions: Record<RegionId, Region>;
  log: string[];
  over: null | "win" | "lose";
};

// The random part of a turn is decided OUTSIDE the reducer and passed in, so the reducer stays pure.
export type TurnEvent = { eventId: string; targetId: RegionId | null };

export type Action =
  | { type: "SELECT"; id: RegionId }
  | { type: "PREACH" }
  | { type: "TRAIN" }
  | { type: "AID" }
  | { type: "PRAY" }
  | { type: "END_TURN"; event: TurnEvent | null }
  | { type: "LOAD"; state: GameState }
  | { type: "RESET" };
