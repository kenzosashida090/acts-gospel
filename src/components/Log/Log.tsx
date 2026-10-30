import { useGame } from "../../game/GameContext";
import styles from "./log.module.css";

export function Log() {
  const { log } = useGame();
  return (
    <section className={styles.log} aria-label="Mission log" aria-live="polite">
      {log.slice(0, 6).map((line, i) => (
        <p key={`${log.length}-${i}`} className={i === 0 ? styles.latest : styles.old}>{line}</p>
      ))}
    </section>
  );
}
