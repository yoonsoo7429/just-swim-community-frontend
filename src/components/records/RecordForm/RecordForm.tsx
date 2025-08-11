"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { StrokeRecord } from "../../../types";

interface RecordFormProps {
  onSubmit?: (record: {
    title: string;
    description?: string;
    poolLength: 25 | 50;
    sessionStartTime: string;
    sessionEndTime: string;
    strokes: StrokeRecord[];
    totalDistance: number;
    totalDuration: number;
    calories?: number;
    sessionDate?: string;
  }) => void;
  onCancel?: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [poolLength, setPoolLength] = useState<25 | 50>(25);
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");
  const [strokes, setStrokes] = useState<StrokeRecord[]>([
    { style: "freestyle", distance: "" },
  ]);
  const [calories, setCalories] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState<{
    title?: string;
    poolLength?: string;
    sessionStartTime?: string;
    sessionEndTime?: string;
    strokes?: string;
  }>({});

  // 시간을 분 단위로 변환
  const convertTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 총 거리 계산
  const totalDistance = strokes.reduce(
    (sum, stroke) => sum + Number(stroke.distance),
    0
  );

  // 총 시간 계산
  const totalDuration =
    sessionStartTime && sessionEndTime
      ? convertTimeToMinutes(sessionEndTime) -
        convertTimeToMinutes(sessionStartTime)
      : 0;

  const validateForm = () => {
    const newErrors: {
      title?: string;
      poolLength?: string;
      sessionStartTime?: string;
      sessionEndTime?: string;
      strokes?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!poolLength || (poolLength !== 25 && poolLength !== 50)) {
      newErrors.poolLength = "수영장 길이를 선택해주세요 (25m 또는 50m).";
    }

    if (!sessionStartTime) {
      newErrors.sessionStartTime = "시작 시간을 입력해주세요.";
    }

    if (!sessionEndTime) {
      newErrors.sessionEndTime = "종료 시간을 입력해주세요.";
    }

    if (
      sessionStartTime &&
      sessionEndTime &&
      convertTimeToMinutes(sessionEndTime) <=
        convertTimeToMinutes(sessionStartTime)
    ) {
      newErrors.sessionEndTime = "종료 시간은 시작 시간보다 늦어야 합니다.";
    }

    if (
      strokes.length === 0 ||
      strokes.every((stroke) => stroke.distance === "")
    ) {
      newErrors.strokes = "최소 하나의 영법과 거리를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit?.({
        title: title.trim(),
        description: description.trim() || undefined,
        poolLength: poolLength,
        sessionStartTime,
        sessionEndTime,
        strokes: strokes.filter((stroke) => Number(stroke.distance) > 0),
        totalDistance,
        totalDuration: Math.max(0, totalDuration),
        calories: calories ? Number(calories) : undefined,
        sessionDate: sessionDate || undefined,
      });
    }
  };

  const addStroke = () => {
    setStrokes([...strokes, { style: "freestyle", distance: "" }]);
  };

  const removeStroke = (index: number) => {
    if (strokes.length > 1) {
      setStrokes(strokes.filter((_, i) => i !== index));
    }
  };

  const updateStroke = (
    index: number,
    field: keyof StrokeRecord,
    value: string | number
  ) => {
    const newStrokes = [...strokes];
    newStrokes[index] = { ...newStrokes[index], [field]: value };
    setStrokes(newStrokes);
  };

  const styleOptions = [
    { value: "freestyle", label: "자유형" },
    { value: "backstroke", label: "배영" },
    { value: "breaststroke", label: "평영" },
    { value: "butterfly", label: "접영" },
    { value: "medley", label: "개인혼영" },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>수영 기록 올리기</h2>

      <div className={styles.formGrid}>
        <Input
          type="text"
          label="제목"
          placeholder="예: 오늘의 자유형 훈련"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>수영장 길이 *</label>
          <select
            value={poolLength}
            onChange={(e) => setPoolLength(Number(e.target.value) as 25 | 50)}
            className={styles.select}
            required
          >
            <option value={25}>25m</option>
            <option value={50}>50m</option>
          </select>
          {errors.poolLength && (
            <div className={styles.error}>{errors.poolLength}</div>
          )}
        </div>

        <Input
          type="time"
          label="시작 시간"
          value={sessionStartTime}
          onChange={(e) => setSessionStartTime(e.target.value)}
          error={errors.sessionStartTime}
          required
        />

        <Input
          type="time"
          label="종료 시간"
          value={sessionEndTime}
          onChange={(e) => setSessionEndTime(e.target.value)}
          error={errors.sessionEndTime}
          required
        />

        <Input
          type="number"
          label="칼로리 (선택사항)"
          placeholder="예: 300"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />

        <Input
          type="date"
          label="날짜"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          required
        />
      </div>

      <div className={styles.strokesSection}>
        <div className={styles.sectionHeader}>
          <h3>영법별 거리</h3>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={addStroke}
          >
            영법 추가
          </Button>
        </div>

        {errors.strokes && <div className={styles.error}>{errors.strokes}</div>}

        {strokes.map((stroke, index) => (
          <div key={index} className={styles.strokeRow}>
            <div className={styles.strokeSelect}>
              <label>영법</label>
              <select
                value={stroke.style}
                onChange={(e) => updateStroke(index, "style", e.target.value)}
                className={styles.select}
              >
                {styleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.strokeDistance}>
              <label>거리 (미터)</label>
              <input
                type="number"
                value={stroke.distance}
                onChange={(e) =>
                  updateStroke(index, "distance", Number(e.target.value))
                }
                placeholder="0"
                min="0"
                className={styles.input}
              />
            </div>

            {strokes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={() => removeStroke(index)}
                className={styles.removeButton}
              >
                삭제
              </Button>
            )}
          </div>
        ))}

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>총 거리:</span>
            <span>{totalDistance}m</span>
          </div>
          <div className={styles.summaryItem}>
            <span>총 시간:</span>
            <span>
              {totalDuration > 0
                ? `${Math.floor(totalDuration / 60)}:${String(
                    totalDuration % 60
                  ).padStart(2, "0")}`
                : "0:00"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.textareaWrapper}>
        <label className={styles.label}>기록 설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="오늘 수영에 대한 느낌이나 특이사항을 적어주세요..."
          className={styles.textarea}
          rows={4}
        />
      </div>

      <div className={styles.buttonGroup}>
        <Button
          type="submit"
          variant="primary"
          size="large"
          className={styles.submitButton}
        >
          기록 올리기
        </Button>

        <Button
          type="button"
          variant="outline"
          size="large"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          취소
        </Button>
      </div>
    </form>
  );
};

export default RecordForm;
