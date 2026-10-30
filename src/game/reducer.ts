import type { Campaign, EventEffect, RegionId } from "../../types";
import type { Action, GameState, Region, TurnEvent } from "../../types/game";

export const COST = { train: 20, aid: 15 } as const;

export const MIN_BELIEVERS_TO_TRAIN = 30;

export const ACCESS_THRESHOLD = 30;

const MAX_LOG = 50;
const EVENT_CAHNGE = 0.6;
const NEW_WORKER_EVERY = 4;

const clamp = (n: number) => Math.min(100, Math.max(0, n))

export const leadersNeeded = (camp: Campaign, id: RegionId) => (
  camp.regions[id].pop >= 5 ? 4 : 3
)

export const isReached = (gameState: GameState, camp: Campaign, id: RegionId) => (
  gameState.regions[id].lead >= leadersNeeded(camp, id)
)

export const neighbors = (camp: Campaign, id: RegionId) => (
  camp.links.filter((l) => l.includes(id)).map((l) => (l[0] === id ? l[1] : l[0]))
)

export const isAccessible = (gameState: GameState, camp: Campaign, id: RegionId) => (
  !!camp.regions[id].start ||
  gameState.regions[id].bel > 0 ||
  neighbors(camp, id).some((n) => gameState.regions[n].bel >= ACCESS_THRESHOLD)
)

export const reachedCount = (gameState: GameState, camp: Campaign) => (
  Object.keys(camp.regions).filter((id) => isReached(gameState, camp, id)).length
)

export function initialState(camp: Campaign): GameState {
  const regions: Record<RegionId, Region> = {}
  let start = Object.keys(camp.regions)[0];
  for (const [id, region] of Object.entries(camp.regions)) {
    if (region.start) start = id;
    regions[id] = {
      id: id,
      open: region.open,
      pers: region.pers,
      bel: region.start ? 30 : 0,
      lead: 0
    }
  }
  return {
    version: 1,
    campaignId: camp.id,
    turn: 1,
    ap: 2,
    workers: 2,
    funds: 40,
    prayer: 1,
    selected: start,
    regions,
    log: ["Acts 1:8 – “…ye shall be witnesses unto me in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.”"],
    over: null
  }
}

//Helpers 

const patchRegion = (gameState: GameState, id: RegionId, p: Partial<Region>): GameState => (
  {
    ...gameState, regions: { ...gameState.regions, [id]: { ...gameState.regions[id], ...p } }
  }
)

const addLog = (gameState: GameState, msg: string): GameState => ({
  ...gameState, log: [msg, ...gameState.log].slice(0, MAX_LOG)
})

const spendAp = (gameState: GameState): GameState => ({ ...gameState, ap: gameState.ap - 1 })

//Events

export function applyEffect(gameState: GameState, event: EventEffect, targetId: RegionId | null): GameState {
  switch (event.kind) {
    case "funds": return { ...gameState, funds: gameState.funds + Math.max(0, gameState.funds + event.delta) }
    case "prayer": return { ...gameState, prayer: gameState.prayer + Math.max(0, gameState.prayer + event.delta) }
    case "region": {
      if (!targetId) {
        return gameState
      }
      const region = gameState.regions[targetId]
      return patchRegion(gameState, targetId, region)
    }
  }
}

export function applyEvent(gameState: GameState, camp: Campaign, event: TurnEvent): GameState {
  const def = camp.events.find((el) => el.id === event.eventId)
  if (!def) return gameState
  let newGameState = gameState
  for (const fn of def.effects) newGameState = applyEffect(gameState, fn, event.targetId);
  const where = event.targetId ? ` (${camp.regions[event.targetId].name})` : "";
  return addLog(newGameState, `${def.text}${where} — ${def.verse}`);
}
export function rollTurnEvent(
  s: GameState, c: Campaign, rng: () => number = Math.random,
): TurnEvent | null {
  if (rng() >= EVENT_CAHNGE || c.events.length === 0) return null;
  const event = c.events[Math.floor(rng() * c.events.length)];
  const started = Object.values(s.regions).filter((r) => r.bel > 0);
  const needsTarget = event.effects.some((e) => e.kind === "region");
  const targetId = needsTarget && started.length
    ? started[Math.floor(rng() * started.length)].id : null;
  return { eventId: event.id, targetId };
}

// ---------- End of turn ----------
function endTurn(gameState: GameState, camp: Campaign, event: TurnEvent | null): GameState {
  let next: GameState = { ...gameState, funds: gameState.funds + 10 + 5 * reachedCount(gameState, camp), prayer: gameState.prayer + 1 };

  // passive growth: regions with leaders keep growing; reached ones also warm their neighbors
  const regions = { ...next.regions };
  for (const id of Object.keys(regions)) {
    const r = regions[id];
    if (isReached(next, camp, id)) {
      regions[id] = { ...r, bel: clamp(r.bel + 5) };
      for (const n of neighbors(camp, id)) regions[n] = { ...regions[n], open: clamp(regions[n].open + 2) };
    } else if (r.lead > 0) {
      regions[id] = { ...r, bel: clamp(r.bel + 3) };
    }
  }
  next = { ...next, regions };

  if (event) next = applyEvent(next, camp, event);

  const turn = next.turn + 1;
  let workers = next.workers;
  if (turn % NEW_WORKER_EVERY === 0) {
    workers++;
    next = addLog(next, "A new worker joins the mission (+1 action each turn).");
  }
  next = { ...next, turn, workers, ap: workers };

  const over = reachedCount(next, camp) === Object.keys(camp.regions).length ? "win"
    : turn > camp.maxTurns ? "lose" : null;
  return { ...next, over };
}

// ---------- The reducer ----------
export const createReducer = (c: Campaign) =>
  (s: GameState, a: Action): GameState => {
    if (a.type === "LOAD") return a.state;
    if (a.type === "RESET") return initialState(c);
    if (a.type === "SELECT") return c.regions[a.id] ? { ...s, selected: a.id } : s;
    if (s.over) return s;
    if (a.type === "END_TURN") return endTurn(s, c, a.event);

    // everything below costs one action
    if (s.ap < 1) return s;
    const id = s.selected;
    const r = s.regions[id];
    const def = c.regions[id];

    switch (a.type) {
      case "PRAY":
        return addLog(spendAp({ ...s, prayer: s.prayer + 2 }), "You pray. +2 prayer.");

      case "PREACH": {
        if (!isAccessible(s, c, id)) return s;
        const popFactor = 0.6 + def.pop * 0.2;                 // bigger places respond faster
        let gain = (8 + r.open / 8 - r.pers / 10) * popFactor;
        const usedPrayer = s.prayer > 0;
        if (usedPrayer) gain *= 2;
        gain = Math.max(2, Math.round(gain));
        const next = patchRegion(
          { ...s, prayer: usedPrayer ? s.prayer - 1 : s.prayer }, id, { bel: clamp(r.bel + gain) },
        );
        return addLog(spendAp(next),
          `Preached in ${def.name}: +${gain} believers${usedPrayer ? " (prayer doubled it)" : ""}.`);
      }

      case "TRAIN": {
        const need = leadersNeeded(c, id);
        if (!isAccessible(s, c, id) || r.bel < MIN_BELIEVERS_TO_TRAIN
          || r.lead >= need || s.funds < COST.train) return s;
        const next = patchRegion({ ...s, funds: s.funds - COST.train }, id, { lead: r.lead + 1 });
        const done = r.lead + 1 >= need;
        return addLog(spendAp(next),
          `A local leader is trained in ${def.name} (${r.lead + 1}/${need}).${done ? " Region reached!" : ""}`);
      }

      case "AID": {
        if (!isAccessible(s, c, id) || s.funds < COST.aid) return s;
        const next = patchRegion({ ...s, funds: s.funds - COST.aid }, id,
          { open: clamp(r.open + 10), pers: clamp(r.pers - 5) });
        return addLog(spendAp(next), `Wells and medicine in ${def.name} build trust.`);
      }
    }
  };
