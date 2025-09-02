"use client";

import React, { useState } from "react";
import BadgeCard from "./BadgeCard";
import styles from "./BadgeList.module.scss";

interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  points: number;
  isActive: boolean;
}

interface UserBadge {
  id: number;
  earnedAt: string;
  badge: Badge;
}

interface BadgeListProps {
  allBadges: Badge[];
  userBadges: UserBadge[];
  showFilter?: boolean;
}

export default function BadgeList({
  allBadges,
  userBadges,
  showFilter = true,
}: BadgeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [showEarnedOnly, setShowEarnedOnly] = useState<boolean>(false);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge.id));
  const earnedBadgesMap = new Map(
    userBadges.map((ub) => [ub.badge.id, ub.earnedAt])
  );

  const categories = [
    { key: "all", label: "전체" },
    { key: "distance", label: "거리" },
    { key: "consecutive", label: "연속성" },
    { key: "stroke", label: "영법" },
    { key: "special", label: "특별" },
  ];

  const tiers = [
    { key: "all", label: "전체" },
    { key: "bronze", label: "브론즈" },
    { key: "silver", label: "실버" },
    { key: "gold", label: "골드" },
    { key: "platinum", label: "플래티넘" },
  ];

  const filteredBadges = allBadges.filter((badge) => {
    if (selectedCategory !== "all" && badge.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== "all" && badge.tier !== selectedTier) {
      return false;
    }
    if (showEarnedOnly && !earnedBadgeIds.has(badge.id)) {
      return false;
    }
    return true;
  });

  const stats = {
    total: allBadges.length,
    earned: userBadges.length,
    completionRate: (userBadges.length / allBadges.length) * 100,
  };

  return (
    <div className={styles.badgeList}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <h2>배지 컬렉션</h2>
          <p>
            {stats.earned}/{stats.total} 달성 ({stats.completionRate.toFixed(1)}
            %)
          </p>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {showFilter && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>카테고리:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>등급:</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              {tiers.map((tier) => (
                <option key={tier.key} value={tier.key}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(e) => setShowEarnedOnly(e.target.checked)}
              />
              획득한 배지만 보기
            </label>
          </div>
        </div>
      )}

      <div className={styles.badgeGrid}>
        {filteredBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            isEarned={earnedBadgeIds.has(badge.id)}
            earnedAt={earnedBadgesMap.get(badge.id)}
            size="medium"
          />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className={styles.emptyState}>
          <p>조건에 맞는 배지가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
