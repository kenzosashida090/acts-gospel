import type { KeyboardEvent } from "react";
import { campaign, useGame, useGameDispatch } from "../../game/GameContext";
import { isAccessible, isReached, leadersNeeded } from "../../game/reducer";
import mapUrl from "../../assets/roman-world.png"; // made by tools/generate_map.py
import styles from "./map.module.css";

// The PNG is 200x130 cells drawn at 4px per cell, so region x/y in paul.ts line up with it.
const MAP_W = 800;
const MAP_H = 520;

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");
const snap = (n: number) => Math.round(n / 4) * 4; // stay on the 4px pixel grid
const markerSize = (pop: number) => 8 + pop * 2;   // bigger place = bigger marker (10..18)

export function Map() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dispatch({ type: "SELECT", id });
    }
  };

  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role="group"
      aria-label="Map of the Roman world"
    >
      <image className={styles.bg} href={mapUrl} x={0} y={0} width={MAP_W} height={MAP_H} preserveAspectRatio="none" />

      {campaign.links.map(([a, b]) => {
        const A = campaign.regions[a], B = campaign.regions[b];
        return <line key={a + b} className={styles.link} x1={A.x} y1={A.y} x2={B.x} y2={B.y} />;
      })}

      {Object.entries(campaign.regions).map(([id, d]) => {
        const r = state.regions[id];
        const reached = isReached(state, campaign, id);
        const locked = !isAccessible(state, campaign, id);
        const need = leadersNeeded(campaign, id);

        const s = markerSize(d.pop);
        const mx = snap(d.x - s / 2);
        const my = snap(d.y - s / 2);
        const w = d.name.length * 8 + 16;
        const py = snap(d.y + s / 2 + 10);   // plaque top

        return (
          <g
            key={id}
            className={cx(
              styles.node,
              locked && styles.locked,
              r.bel > 0 && styles.started,
              reached && styles.reached,
              state.selected === id && styles.selected,
            )}
            tabIndex={0}
            role="button"
            aria-label={`${d.name}${reached ? ", reached" : locked ? ", locked" : ""}`}
            onClick={() => dispatch({ type: "SELECT", id })}
            onKeyDown={(e) => onKey(e, id)}
          >
            <rect className={styles.ring} x={mx - 8} y={my - 8} width={s + 16} height={s + 16} />
            <rect className={styles.markerOutline} x={mx - 4} y={my - 4} width={s + 8} height={s + 8} />
            <rect className={styles.marker} x={mx} y={my} width={s} height={s} />
            {reached && (
              <>
                <rect className={styles.cross} x={mx + s / 2 - 1} y={my + 2} width={2} height={s - 4} />
                <rect className={styles.cross} x={mx + 2} y={my + s / 2 - 1} width={s - 4} height={2} />
              </>
            )}

            <rect className={styles.plaque} x={snap(d.x - w / 2)} y={py} width={w} height={20} />
            <text className={styles.label} x={d.x} y={py + 14}>{d.name}</text>

            {Array.from({ length: need }, (_, i) => (
              <rect
                key={i}
                className={i < r.lead ? styles.pipOn : styles.pip}
                x={snap(d.x - (need * 10) / 2 + i * 10)}
                y={py + 26}
                width={6}
                height={6}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
