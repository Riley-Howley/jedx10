import { useState } from "react";
import styles from "./expandableText.module.css";

export default function ExpandToggle({ expanded, onToggle }: any) {
  return (
    <button className={styles.expandBtn} onClick={onToggle}>
      {expanded ? "Show less" : "Show more"}
      <span
        className={`${styles.chevron} ${expanded ? styles.rotate : ""}`}
      />
    </button>
  );
}

export function ExpandableText({ text, maxChars = 340 }: any) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxChars;
  const display = expanded ? text : text.slice(0, maxChars);

  return (
    <div>
      <p>{display}{!expanded && isLong ? "..." : ""}</p>

      {isLong && (
        <ExpandToggle
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
      )}
    </div>
  );
}

