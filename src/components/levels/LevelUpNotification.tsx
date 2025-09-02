"use client";

import React, { useEffect, useState } from "react";
import styles from "./LevelUpNotification.module.scss";

interface LevelUpNotificationProps {
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  xpGained: number;
  onClose: () => void;
}

export default function LevelUpNotification({
  oldLevel,
  newLevel,
  newTitle,
  xpGained,
  onClose,
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 5초 후 자동으로 닫기
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 닫기
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.notification}>
        <div className={styles.fireworks}>
          <div className={styles.firework}></div>
          <div className={styles.firework}></div>
          <div className={styles.firework}></div>
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>🎉 레벨 업! 🎉</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.levelChange}>
            <div className={styles.levelBadge}>
              <span className={styles.levelIcon}>{getLevelIcon(oldLevel)}</span>
              <span className={styles.levelNumber}>{oldLevel}</span>
            </div>

            <div className={styles.arrow}>→</div>

            <div className={styles.levelBadge}>
              <span className={styles.levelIcon}>{getLevelIcon(newLevel)}</span>
              <span className={styles.levelNumber}>{newLevel}</span>
            </div>
          </div>

          <div className={styles.newTitle}>
            <p className={styles.congratulations}>축하합니다!</p>
            <p className={styles.titleText}>
              이제 <strong>{newTitle}</strong>입니다!
            </p>
          </div>

          <div className={styles.xpGained}>
            <span className={styles.xpText}>+{xpGained} XP 획득</span>
          </div>

          <div className={styles.perks}>
            <h4>새로운 혜택이 해금되었습니다!</h4>
            <ul>
              {getPerksForLevel(newLevel).map((perk, index) => (
                <li key={index}>{perk}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.continueButton} onClick={onClose}>
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

function getPerksForLevel(level: number): string[] {
  const perks = {
    2: ["프로필 커스터마이징", "기본 통계 조회"],
    3: ["상세 통계 조회", "목표 설정"],
    4: ["친구 기능", "그룹 기능 해금"],
    5: ["커뮤니티 리더 권한", "특별 배지 해금"],
    6: ["고급 통계", "훈련 프로그램 생성"],
    7: ["멘토 기능", "코칭 권한"],
    8: ["전문가 분석", "특별 챌린지 참여"],
    9: ["마스터 클래스 참여", "특별 이벤트 우선 참여"],
    10: ["모든 기능 해금", "레전드 전용 배지", "특별 칭호"],
    11: ["마스터 전용 기능"],
    12: ["신급 기능 해금"],
  };

  return perks[level] || ["새로운 기능 해금"];
}
