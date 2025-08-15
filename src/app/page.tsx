"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

export default function Home() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Just Swim</h1>
          <p className={styles.subtitle}>
            수영 기록 관리, 훈련 프로그램, 그리고 커뮤니티를 한 곳에서
          </p>
          <div className={styles.features}>
            <div
              className={styles.feature}
              onClick={() => handleNavigate("/records")}
            >
              <span className={styles.featureIcon}>📊</span>
              <span>수영 기록 관리</span>
            </div>
            <div
              className={styles.feature}
              onClick={() => handleNavigate("/programs")}
            >
              <span className={styles.featureIcon}>📋</span>
              <span>훈련 프로그램</span>
            </div>
            <div
              className={styles.feature}
              onClick={() => handleNavigate("/community")}
            >
              <span className={styles.featureIcon}>🏊‍♂️</span>
              <span>커뮤니티</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
