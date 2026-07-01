"use client";
import styles from "./ThreeBodyLoader.module.css";

const ThreeBodyLoader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.threeBody}>
        <div className={styles.threeBody__dot}></div>
        <div className={styles.threeBody__dot}></div>
        <div className={styles.threeBody__dot}></div>
      </div>
    </div>
  );
};

export default ThreeBodyLoader;
