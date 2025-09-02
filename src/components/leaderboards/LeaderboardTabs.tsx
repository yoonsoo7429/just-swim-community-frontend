"use client";

import React, { useState } from "react";
import styles from "./LeaderboardTabs.module.scss";

interface Tab {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

interface LeaderboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function LeaderboardTabs({
  tabs,
  activeTab,
  onTabChange,
}: LeaderboardTabsProps) {
  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.active : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.description && (
              <span className={styles.tabDescription}>{tab.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
