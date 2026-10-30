import {
  createContext, useContext, useEffect, useReducer,
  type Dispatch, type ReactNode,
} from "react";
import type { Action, GameState } from "../../types/game.d.ts";
import { paul } from "../data/campaigns/paul";
import { createReducer, initialState } from "./reducer";

// Swap this line (or make it a state) when you add the modern-world campaign.
export const campaign = paul;

const reducer = createReducer(campaign); // created once, not on every render
const SAVE_KEY = "mission-save";

function loadOrInit(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as GameState;
      if (s.version === 1 && s.campaignId === campaign.id) return s;
    }
  } catch { /* ignore corrupt or blocked storage */ }
  return initialState(campaign);
}

const StateCtx = createContext<GameState | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadOrInit);

  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

export function useGame() {
  const c = useContext(StateCtx);
  if (!c) throw new Error("useGame must be used inside <GameProvider>");
  return c;
}
export function useGameDispatch() {
  const c = useContext(DispatchCtx);
  if (!c) throw new Error("useGameDispatch must be used inside <GameProvider>");
  return c;
}
