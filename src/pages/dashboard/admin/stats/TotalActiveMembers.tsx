import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../../../lib/superbase";
import styles from "../adminDashboard.module.css";

export const TotalActiveSessions = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const loadCurrentlyActive = async () => {
      const ONE_MINUTES_AGO = new Date(Date.now() - 1 * 60 * 1000);

      const { count, error } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_seen_at", ONE_MINUTES_AGO.toISOString());

      if (error) {
        console.error("Failed to load active sessions:", error.message);
        setUserCount(0);
        return;
      }

      setUserCount(count ?? 0);
    };

    loadCurrentlyActive();

    // Optional: refresh every 30 seconds for live feeling
    const interval = setInterval(loadCurrentlyActive, 30_000);

    return () => clearInterval(interval);
  }, []);

  return <p className={styles.statNumber}>{userCount}</p>;
};
