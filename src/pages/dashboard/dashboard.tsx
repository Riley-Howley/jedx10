import { Outlet } from "react-router-dom";
import brandImage from "../../assets/logoSmall.webp";
import UserDropdown from "./components/userDropdown/userDropdown";

import styles from "./dashboard.module.css";


const Dashboard = () => {
    return (
        <>
            <div className={styles.header}>
                <img src={brandImage} className={styles.brandImage} />
                <div>
                    <UserDropdown  />
                </div>
            </div>
            <Outlet />
        </>

    );
};

export default Dashboard;