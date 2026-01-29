import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../../../lib/superbase";
import styles from "../adminDashboard.module.css";

export const TotalUsers = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const loadActiveUsers = async () => {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")

      if (error) {
        console.error("Failed to load active users:", error.message);
        setUserCount(0);
        return;
      }

      console.log("Data", data)

      setUserCount( data.length);
    };

    loadActiveUsers();
  }, []);

  return <p className={styles.statNumber}>{userCount}</p>;
};
