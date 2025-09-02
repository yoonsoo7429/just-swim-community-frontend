"use client";

import React, { useState } from "react";
import styles from "./CreateGoalModal.module.scss";

interface GoalRecommendation {
  type: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  difficulty: string;
  duration: number;
  reasoning: string;
}

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: any) => void;
  recommendations?: GoalRecommendation[];
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
  recommendations = [],
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    type: "weekly_distance",
    title: "",
    description: "",
    targetValue: "",
    unit: "m",
    difficulty: "medium",
    duration: "7", // days
    metadata: {} as { strokeType?: string },
  });

  const goalTypes = [
    {
      value: "weekly_distance",
      label: "주간 거리 목표",
      unit: "m",
      defaultDuration: 7,
    },
    {
      value: "monthly_distance",
      label: "월간 거리 목표",
      unit: "m",
      defaultDuration: 30,
    },
    {
      value: "streak",
      label: "연속 수영일 목표",
      unit: "일",
      defaultDuration: 14,
    },
    {
      value: "stroke_mastery",
      label: "영법별 거리 목표",
      unit: "m",
      defaultDuration: 30,
    },
    {
      value: "session_count",
      label: "세션 수 목표",
      unit: "회",
      defaultDuration: 7,
    },
    {
      value: "duration",
      label: "수영 시간 목표",
      unit: "분",
      defaultDuration: 7,
    },
  ];

  const difficulties = [
    { value: "easy", label: "쉬움", color: "#4caf50" },
    { value: "medium", label: "보통", color: "#ff9800" },
    { value: "hard", label: "어려움", color: "#f44336" },
    { value: "extreme", label: "극한", color: "#9c27b0" },
  ];

  const strokeTypes = [
    { value: "freestyle", label: "자유형" },
    { value: "backstroke", label: "배영" },
    { value: "breaststroke", label: "평영" },
    { value: "butterfly", label: "접영" },
  ];

  const handleTypeChange = (type: string) => {
    const goalType = goalTypes.find((gt) => gt.value === type);
    setFormData((prev) => ({
      ...prev,
      type,
      unit: goalType?.unit || "m",
      duration: goalType?.defaultDuration.toString() || "7",
      title: "",
      description: "",
      targetValue: "",
    }));
  };

  const handleRecommendationSelect = (recommendation: GoalRecommendation) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + recommendation.duration);

    setFormData({
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description,
      targetValue: recommendation.targetValue.toString(),
      unit: recommendation.unit,
      difficulty: recommendation.difficulty,
      duration: recommendation.duration.toString(),
      metadata:
        recommendation.type === "stroke_mastery"
          ? { strokeType: "freestyle" }
          : {},
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(formData.duration));

    const goalData = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      targetValue: parseInt(formData.targetValue),
      unit: formData.unit,
      difficulty: formData.difficulty,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      metadata: formData.metadata,
    };

    onSubmit(goalData);
    onClose();
  };

  const generateTitle = () => {
    if (!formData.targetValue || !formData.type) return;

    const goalType = goalTypes.find((gt) => gt.value === formData.type);
    const value = parseInt(formData.targetValue);

    let title = "";
    switch (formData.type) {
      case "weekly_distance":
        title = `주간 ${
          value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`
        } 달성`;
        break;
      case "monthly_distance":
        title = `월간 ${
          value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`
        } 달성`;
        break;
      case "streak":
        title = `${value}일 연속 수영`;
        break;
      case "stroke_mastery":
        const strokeLabel =
          strokeTypes.find((s) => s.value === formData.metadata?.strokeType)
            ?.label || "자유형";
        title = `${strokeLabel} ${
          value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`
        } 달성`;
        break;
      case "session_count":
        title = `${formData.duration}일간 ${value}회 수영`;
        break;
      case "duration":
        title = `${formData.duration}일간 총 ${value}분 수영`;
        break;
    }

    setFormData((prev) => ({ ...prev, title }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>새 목표 만들기</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className={styles.recommendations}>
            <h3>추천 목표</h3>
            <div className={styles.recommendationGrid}>
              {recommendations.map((rec, index) => (
                <button
                  key={index}
                  className={styles.recommendationCard}
                  onClick={() => handleRecommendationSelect(rec)}
                >
                  <div className={styles.recTitle}>{rec.title}</div>
                  <div className={styles.recDescription}>{rec.description}</div>
                  <div className={styles.recMeta}>
                    <span className={styles.recDifficulty}>
                      {rec.difficulty}
                    </span>
                    <span className={styles.recDuration}>{rec.duration}일</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>목표 유형</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              required
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>목표값</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetValue: e.target.value,
                  }))
                }
                onBlur={generateTitle}
                required
                min="1"
              />
            </div>
            <div className={styles.formGroup}>
              <label>단위</label>
              <input
                type="text"
                value={formData.unit}
                readOnly
                className={styles.readOnly}
              />
            </div>
          </div>

          {formData.type === "stroke_mastery" && (
            <div className={styles.formGroup}>
              <label>영법</label>
              <select
                value={formData.metadata.strokeType || "freestyle"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, strokeType: e.target.value },
                  }))
                }
                required
              >
                {strokeTypes.map((stroke) => (
                  <option key={stroke.value} value={stroke.value}>
                    {stroke.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>기간 (일)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                required
                min="1"
                max="365"
              />
            </div>
            <div className={styles.formGroup}>
              <label>난이도</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
              >
                {difficulties.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="목표 제목을 입력하세요"
            />
            <button
              type="button"
              className={styles.generateBtn}
              onClick={generateTitle}
            >
              자동 생성
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>설명 (선택사항)</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="목표에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className={styles.submitBtn}>
              목표 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
