import { campaign, useGame, useGameDispatch } from "../../game/GameContext";
import {
  COST, MIN_BELIEVERS_TO_TRAIN, isAccessible, isReached, leadersNeeded, rollTurnEvent,
} from "../../game/reducer";
import styles from "./panel.module.css";

export function Panel() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const id = state.selected;
  const def = campaign.regions[id];
  const r = state.regions[id];
  const need = leadersNeeded(campaign, id);
  const reached = isReached(state, campaign, id);
  const accessible = isAccessible(state, campaign, id);

  const canAct = !state.over && state.ap > 0 && accessible;
  const canTrain = canAct && r.bel >= MIN_BELIEVERS_TO_TRAIN && r.lead < need && state.funds >= COST.train;
  const canAid = canAct && state.funds >= COST.aid;

  // randomness happens here, in the click handler, never inside the reducer
  const endTurn = () => dispatch({ type: "END_TURN", event: rollTurnEvent(state, campaign) });

  return (
    <aside className={styles.panel}>
      <section className={styles.box}>
        <h2 className={styles.title}>{def.name}</h2>
        <p className={styles.blurb}>
          {!accessible
            ? "Locked. Grow a neighboring region to 30 believers to open the road."
            : reached
              ? "This region has leaders who can carry on without you."
              : def.blurb ?? "No report from this region yet."}
        </p>
      </section>

      <div className={styles.chips}>
        <div className={`${styles.chip} ${styles.blue}`}><small>OPEN</small><b>{r.open}</b></div>
        <div className={`${styles.chip} ${styles.red}`}><small>PERS</small><b>{r.pers}</b></div>
        <div className={`${styles.chip} ${styles.orange}`}><small>FAITH</small><b>{r.bel}</b></div>
      </div>

      <div className={styles.leaders} aria-label={`Leaders ${r.lead} of ${need}`}>
        LEADERS {"■".repeat(r.lead)}{"□".repeat(need - r.lead)}
      </div>

      <button className={styles.action} disabled={!canAct} onClick={() => dispatch({ type: "PREACH" })}>
        <span>Preach</span><span>1 AP</span>
      </button>
      <button className={styles.action} disabled={!canTrain} onClick={() => dispatch({ type: "TRAIN" })}>
        <span>Train leader</span><span>{COST.train}$</span>
      </button>
      <button className={styles.action} disabled={!canAid} onClick={() => dispatch({ type: "AID" })}>
        <span>Aid</span><span>{COST.aid}$</span>
      </button>
      <button className={styles.action} disabled={state.over !== null || state.ap < 1} onClick={() => dispatch({ type: "PRAY" })}>
        <span>Pray</span><span>+2</span>
      </button>
      <button className={`${styles.action} ${styles.end}`} disabled={state.over !== null} onClick={endTurn}>
        <span>End turn</span><span>▶</span>
      </button>

      {state.over && (
        <section className={`${styles.box} ${styles.over}`} role="status">
          <p>
            {state.over === "win"
              ? "Every region has leaders to carry on. Well done, good and faithful servant!"
              : "Time is up. The work continues. Try again."}
          </p>
          <button className={styles.action} onClick={() => dispatch({ type: "RESET" })}>
            <span>Play again</span><span>↺</span>
          </button>
        </section>
      )}
    </aside>
  );
}
