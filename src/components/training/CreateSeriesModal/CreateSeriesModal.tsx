import React, { useState } from "react";
import { Modal } from "@/components/ui";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { CreateTrainingSeriesDto } from "@/types";
import styles from "./styles.module.scss";

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTrainingSeriesDto) => void;
  trainingPrograms: any[];
}

const CreateSeriesModal: React.FC<CreateSeriesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trainingPrograms,
}) => {
  const [formData, setFormData] = useState<CreateTrainingSeriesDto>({
    title: "",
    description: "",
    difficulty: "beginner",
    type: "recurring",
    repeatDays: [],
    repeatTime: "19:00",
    duration: 120,
    startDate: "",
    endDate: "",
    defaultLocation: "",
    defaultMinParticipants: 8,
    defaultMaxParticipants: 12,
    trainingProgramId: 0,
  });

  const weekdays = [
    { value: "monday", label: "월요일" },
    { value: "tuesday", label: "화요일" },
    { value: "wednesday", label: "수요일" },
    { value: "thursday", label: "목요일" },
    { value: "friday", label: "금요일" },
    { value: "saturday", label: "토요일" },
    { value: "sunday", label: "일요일" },
  ];

  const handleInputChange = (
    field: keyof CreateTrainingSeriesDto,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const currentDays = prev.repeatDays || [];
      if (currentDays.includes(day)) {
        return { ...prev, repeatDays: currentDays.filter((d) => d !== day) };
      } else {
        return { ...prev, repeatDays: [...currentDays, day] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.type === "recurring" &&
      (!formData.repeatDays || formData.repeatDays.length === 0)
    ) {
      alert("정기 모임의 경우 반복 요일을 선택해주세요.");
      return;
    }
    if (!formData.trainingProgramId) {
      alert("훈련 프로그램을 선택해주세요.");
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "beginner",
      type: "recurring",
      repeatDays: [],
      repeatTime: "19:00",
      duration: 120,
      startDate: "",
      endDate: "",
      defaultLocation: "",
      defaultMinParticipants: 8,
      defaultMaxParticipants: 12,
      trainingProgramId: 0,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="정기 모임 시리즈 생성">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="title">시리즈 제목 *</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="difficulty">난이도 *</label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleInputChange("difficulty", e.target.value)}
              className={styles.select}
            >
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">모임 타입 *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className={styles.select}
            >
              <option value="one-time">일회성 모임</option>
              <option value="recurring">정기 모임</option>
            </select>
          </div>
        </div>

        {formData.type === "recurring" && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>반복 요일 *</label>
                <div className={styles.daySelector}>
                  {weekdays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`${styles.dayButton} ${
                        formData.repeatDays?.includes(day.value)
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="repeatTime">시작 시간 *</label>
                <Input
                  id="repeatTime"
                  type="time"
                  value={formData.repeatTime}
                  onChange={(e) =>
                    handleInputChange("repeatTime", e.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration">소요 시간 (분) *</label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="480"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", parseInt(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startDate">시작 날짜 *</label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endDate">종료 날짜 (선택사항)</label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="defaultLocation">기본 장소</label>
            <Input
              id="defaultLocation"
              value={formData.defaultLocation}
              onChange={(e) =>
                handleInputChange("defaultLocation", e.target.value)
              }
              placeholder="예: XX수영장"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="defaultMinParticipants">최소 참여자 수</label>
            <Input
              id="defaultMinParticipants"
              type="number"
              min="1"
              max="50"
              value={formData.defaultMinParticipants}
              onChange={(e) =>
                handleInputChange(
                  "defaultMinParticipants",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="defaultMaxParticipants">최대 참여자 수</label>
            <Input
              id="defaultMaxParticipants"
              type="number"
              min="1"
              max="100"
              value={formData.defaultMaxParticipants}
              onChange={(e) =>
                handleInputChange(
                  "defaultMaxParticipants",
                  parseInt(e.target.value)
                )
              }
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="trainingProgramId">훈련 프로그램 *</label>
            <select
              id="trainingProgramId"
              value={formData.trainingProgramId}
              onChange={(e) =>
                handleInputChange("trainingProgramId", parseInt(e.target.value))
              }
              className={styles.select}
              required
            >
              <option value={0}>프로그램을 선택하세요</option>
              {trainingPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={resetForm}>
            초기화
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            시리즈 생성
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSeriesModal;
