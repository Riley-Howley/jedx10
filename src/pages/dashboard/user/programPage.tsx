import { useParams } from "react-router-dom";
import styles from './programPage.module.css';
import { loadProgram } from "../admin/supabaseHelpers";
import { useEffect, useState } from "react";
import ProgramStructure from "./programStructure";

const ProgramPage = () => {
    const { programId } = useParams();

    const [program, setProgram] = useState(null);

    const handleLoadProgram = async (programId: string) => {

        const data = await loadProgram(programId);
        if (data) setProgram(data)
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
            {program && <ProgramStructure courses={program.courses}/>}
        </div>
    );
};

export default ProgramPage;