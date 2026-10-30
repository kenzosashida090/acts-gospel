import { campaign, useGame } from "../../game/GameContext";
import { reachedCount } from "../../game/reducer";
import styles from "./hud.module.css";

export function Hud() {
  const s = useGame();
  const total = Object.keys(campaign.regions).length;
  const items = [
    { icon: "⏳", label: "Turn", value: `${s.turn}/${campaign.maxTurns}` },
    { icon: "⚡", label: "Actions", value: `${s.ap}/${s.workers}` },
    { icon: "💰", label: "Funds", value: s.funds },
    { icon: "🙏", label: "Prayer", value: s.prayer },
    { icon: "✝", label: "Reached", value: `${reachedCount(s, campaign)}/${total}` },
  ];
  return (
    <footer className={styles.hud}>
      {items.map((i) => (
        <div key={i.label} className={styles.item} title={i.label}>
          <span className={styles.icon} aria-hidden="true">{i.icon}</span>
          <span><small>{i.label}</small><b>{i.value}</b></span>
        </div>
      ))}
    </footer>
  );
}
