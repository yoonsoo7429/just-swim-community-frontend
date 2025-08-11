import React, { useState } from "react";
import { CreateTrainingProgramDto } from "../../../types";
import { trainingAPI } from "../../../utils/api";
import styles from "./styles.module.scss";
import { Button, Input, Modal } from "@/components/ui";

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateTrainingProgramDto>({
    title: "",
    description: "",
    difficulty: "beginner",
    totalWeeks: 4,
    sessionsPerWeek: 3,
    visibility: "public",
    isPublished: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    field: keyof CreateTrainingProgramDto,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await trainingAPI.createProgram(formData);
      onSuccess();
      onClose();
      // 폼 초기화
      setFormData({
        title: "",
        description: "",
        difficulty: "beginner",
        totalWeeks: 4,
        sessionsPerWeek: 3,
        visibility: "public",
        isPublished: false,
      });
    } catch (error) {
      console.error("프로그램 생성 실패:", error);
      alert("프로그램 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 훈련 프로그램 만들기">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">프로그램 제목 *</label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="예: 초급자 수영 프로그램"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="프로그램에 대한 설명을 입력하세요"
            rows={3}
            className={styles.textarea}
          />
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
            <label htmlFor="totalWeeks">총 주차 *</label>
            <Input
              id="totalWeeks"
              type="number"
              min="1"
              max="52"
              value={formData.totalWeeks}
              onChange={(e) =>
                handleInputChange("totalWeeks", parseInt(e.target.value))
              }
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="sessionsPerWeek">주당 세션 수 *</label>
            <Input
              id="sessionsPerWeek"
              type="number"
              min="1"
              max="7"
              value={formData.sessionsPerWeek}
              onChange={(e) =>
                handleInputChange("sessionsPerWeek", parseInt(e.target.value))
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="visibility">공개 설정 *</label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleInputChange("visibility", e.target.value)}
              className={styles.select}
            >
              <option value="public">공개</option>
              <option value="private">비공개</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) =>
                handleInputChange("isPublished", e.target.checked)
              }
              className={styles.checkbox}
            />
            즉시 게시하기
          </label>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "생성 중..." : "프로그램 만들기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProgramModal;
