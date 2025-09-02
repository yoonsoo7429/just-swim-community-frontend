"use client";

import React, { useEffect, useState } from "react";
import BadgeCard from "./BadgeCard";
import styles from "./BadgeNotification.module.scss";

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

interface BadgeNotificationProps {
  newBadges: UserBadge[];
  onClose: () => void;
}

export default function BadgeNotification({
  newBadges,
  onClose,
}: BadgeNotificationProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (newBadges.length === 0) {
      onClose();
      return;
    }

    // 각 배지를 3초씩 보여주기
    const timer = setTimeout(() => {
      if (currentBadgeIndex < newBadges.length - 1) {
        setCurrentBadgeIndex(currentBadgeIndex + 1);
      } else {
        // 모든 배지를 보여줬으면 닫기
        setIsVisible(false);
        setTimeout(onClose, 300); // 애니메이션 후 닫기
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentBadgeIndex, newBadges.length, onClose]);

  if (newBadges.length === 0 || !isVisible) {
    return null;
  }

  const currentBadge = newBadges[currentBadgeIndex];

  return (
    <div className={styles.overlay}>
      <div className={styles.notification}>
        <div className={styles.header}>
          <h2>🎉 새로운 배지 획득!</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.badgeContainer}>
          <div className={styles.celebration}>
            <div className={styles.sparkles}>✨ ⭐ ✨ ⭐ ✨</div>

            <BadgeCard
              badge={currentBadge.badge}
              isEarned={true}
              earnedAt={currentBadge.earnedAt}
              size="large"
            />

            <div className={styles.message}>
              <p className={styles.congratulations}>축하합니다!</p>
              <p className={styles.achievement}>
                <strong>{currentBadge.badge.name}</strong> 배지를 획득했습니다!
              </p>
              <p className={styles.points}>
                +{currentBadge.badge.points} 포인트 획득
              </p>
            </div>
          </div>
        </div>

        {newBadges.length > 1 && (
          <div className={styles.progress}>
            <div className={styles.progressText}>
              {currentBadgeIndex + 1} / {newBadges.length}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${
                    ((currentBadgeIndex + 1) / newBadges.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.continueButton} onClick={onClose}>
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
