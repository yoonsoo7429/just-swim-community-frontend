"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

interface RecordFormProps {
  onSubmit?: (record: {
    distance: number;
    time: string;
    stroke: string;
    description: string;
    date: string;
  }) => void;
  onCancel?: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onCancel }) => {
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [stroke, setStroke] = useState("freestyle");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<{
    distance?: string;
    time?: string;
    stroke?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { distance?: string; time?: string; stroke?: string } = {};

    if (!distance) {
      newErrors.distance = "거리를 입력해주세요.";
    } else if (isNaN(Number(distance)) || Number(distance) <= 0) {
      newErrors.distance = "올바른 거리를 입력해주세요.";
    }

    if (!time) {
      newErrors.time = "시간을 입력해주세요.";
    } else if (!/^\d{1,2}:\d{2}$/.test(time)) {
      newErrors.time = "시간 형식을 MM:SS로 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit?.({
        distance: Number(distance),
        time,
        stroke,
        description,
        date,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>수영 기록 올리기</h2>

      <div className={styles.formGrid}>
        <Input
          type="number"
          label="거리 (미터)"
          placeholder="예: 100"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          error={errors.distance}
          required
        />

        <Input
          type="text"
          label="시간 (MM:SS)"
          placeholder="예: 02:30"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          error={errors.time}
          required
        />

        <div className={styles.selectWrapper}>
          <label className={styles.label}>영법</label>
          <select
            value={stroke}
            onChange={(e) => setStroke(e.target.value)}
            className={styles.select}
          >
            <option value="freestyle">자유형</option>
            <option value="backstroke">배영</option>
            <option value="breaststroke">평영</option>
            <option value="butterfly">접영</option>
            <option value="medley">개인혼영</option>
          </select>
        </div>

        <Input
          type="date"
          label="날짜"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
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