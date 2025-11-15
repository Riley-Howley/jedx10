import { useParams } from "react-router-dom";
import styles from './programPage.module.css';
import { useEffect, useState } from "react";
import ProgramStructure from "./programStructure";
import { loadProgramCoursesWithLockState } from "../admin/supabaseHelpers";
import { useCurrentUser } from "../../../context/UserContext";

const ProgramPage = () => {
    const { programId } = useParams();

    const [program, setProgram] = useState(null);

    const { user } = useCurrentUser();


    const handleLoadProgram = async (programId: string) => {

        if (!user) return;
        const data = await loadProgramCoursesWithLockState(user.id,programId);
        if (data) setProgram(data as any)
        console.log(data)
      }

      useEffect(() => {
        handleLoadProgram(programId as string);
      }, [programId]);
      
    return (
        <div style={{ backgroundColor: '#121214' }} className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.headerTitle}>FITNESS</h1>
                        <div className={styles.headerSubtitle}>
                            <hr className={styles.headerLine} />
                            <h4 className={styles.headerText}>YOUR TRAINING HUB</h4>
                        </div>
                    </div>
                </div>
            </div>
            {program && <ProgramStructure courses={program}/>}
        </div>
    );
};

export default ProgramPage;