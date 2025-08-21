import React, { useState } from "react";
import { CreateTrainingProgramDto } from "@/types";
import { trainingAPI, postsAPI } from "@/utils/api";
import { getDifficultyText } from "@/utils";
import styles from "./styles.module.scss";
import { Button, Input, Modal } from "@/components/ui";

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RecruitmentFormData {
  maxParticipants: number;
  recruitmentDeadline: string;
  trainingType: "regular" | "one-time";
  meetingDays: string[];
  meetingTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  location: string;
  contactInfo: string;
  requirements: string;
  equipment: string;
  cost: string;
  specialNotes: string;
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
    visibility: "public",
    isPublished: false,
  });

  const [recruitmentData, setRecruitmentData] = useState<RecruitmentFormData>({
    maxParticipants: 1,
    recruitmentDeadline: "",
    trainingType: "regular",
    meetingDays: [],
    meetingTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
    location: "",
    contactInfo: "",
    requirements: "",
    equipment: "",
    cost: "",
    specialNotes: "",
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

  const handleRecruitmentChange = (
    field: keyof RecruitmentFormData,
    value: any
  ) => {
    setRecruitmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMeetingDayChange = (day: string, checked: boolean) => {
    setRecruitmentData((prev) => ({
      ...prev,
      meetingDays: checked
        ? [...prev.meetingDays, day]
        : prev.meetingDays.filter((d) => d !== day),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 프로그램 생성
      const response = await trainingAPI.createProgram({
        ...formData,
        isPublished: formData.isPublished,
      });

      const program = response.data;

      // 즉시 공개하기가 체크되어 있다면 모집 정보와 함께 게시
      if (formData.isPublished) {
        // 1. 프로그램을 게시 상태로 변경
        await trainingAPI.updateProgram(program.id, { isPublished: true });

        // 2. 커뮤니티에 모집글 자동 생성
        const recruitmentPost = {
          title: `[훈련 모집] ${program.title}`,
          content: `훈련 프로그램 "${
            program.title
          }"에 참여할 사람을 모집합니다.\n\n${
            program.description || "프로그램 설명이 없습니다."
          }\n\n난이도: ${getDifficultyText(
            program.difficulty
          )}\n\n함께 훈련하며 성장해보세요!`,
          category: "훈련 모집",
          tags: ["훈련", "모집", program.difficulty],
          // 백엔드 Post 엔티티 구조에 맞게 개별 필드 사용
          trainingProgramId: program.id, // TrainingProgram 관계 설정
          recruitmentType: recruitmentData.trainingType,
          meetingDays:
            recruitmentData.trainingType === "regular"
              ? recruitmentData.meetingDays
              : undefined,
          meetingTime: recruitmentData.meetingTime,
          meetingDateTime:
            recruitmentData.trainingType === "one-time"
              ? new Date(
                  `${recruitmentData.startDate}T${recruitmentData.meetingTime}`
                )
              : undefined,
          location: recruitmentData.location,
          maxParticipants: recruitmentData.maxParticipants,
          currentParticipants: 0,
          recruitmentStatus: "open",
        };

        await postsAPI.createPost(recruitmentPost);

        alert(
          "프로그램이 성공적으로 생성되고 게시되었습니다!\n커뮤니티에 상세한 모집글이 자동으로 생성되었습니다."
        );
      } else {
        alert("프로그램이 성공적으로 생성되었습니다!");
      }

      // 성공 처리
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("프로그램 생성 실패:", error);
      alert("프로그램 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "beginner",
      visibility: "public",
      isPublished: false,
    });
    setRecruitmentData({
      maxParticipants: 1,
      recruitmentDeadline: "",
      trainingType: "regular",
      meetingDays: [],
      meetingTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
      location: "",
      contactInfo: "",
      requirements: "",
      equipment: "",
      cost: "",
      specialNotes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const weekDays = [
    { value: "monday", label: "월요일" },
    { value: "tuesday", label: "화요일" },
    { value: "wednesday", label: "수요일" },
    { value: "thursday", label: "목요일" },
    { value: "friday", label: "금요일" },
    { value: "saturday", label: "토요일" },
    { value: "sunday", label: "일요일" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 훈련 프로그램 만들기"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 프로그램 정보 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>프로그램 정보</h3>

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
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
                }
                className={styles.select}
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="visibility">공개 설정 *</label>
              <select
                id="visibility"
                value={formData.visibility}
                onChange={(e) =>
                  handleInputChange("visibility", e.target.value)
                }
                className={styles.select}
              >
                <option value="public">공개</option>
                <option value="private">비공개</option>
              </select>
            </div>
          </div>

          {formData.visibility === "public" && (
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
              <p className={styles.helpText}>
                체크하면 다른 사용자들이 바로 프로그램을 볼 수 있습니다.
                체크하지 않으면 나중에 수동으로 공개할 수 있습니다.
              </p>
            </div>
          )}

          {formData.visibility === "private" && (
            <div className={styles.formGroup}>
              <p className={styles.helpText}>
                비공개 프로그램은 본인만 볼 수 있으며, 나중에 공개 설정으로
                변경할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 모집 정보 (즉시 게시하기가 체크된 경우에만 표시) */}
        {formData.isPublished && formData.visibility === "public" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>모집 정보</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="maxParticipants">모집 인원 *</label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={recruitmentData.maxParticipants}
                  onChange={(e) =>
                    handleRecruitmentChange(
                      "maxParticipants",
                      parseInt(e.target.value)
                    )
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="recruitmentDeadline">모집 마감일 *</label>
                <Input
                  id="recruitmentDeadline"
                  type="date"
                  value={recruitmentData.recruitmentDeadline}
                  onChange={(e) =>
                    handleRecruitmentChange(
                      "recruitmentDeadline",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="trainingType">훈련 유형 *</label>
              <select
                id="trainingType"
                value={recruitmentData.trainingType}
                onChange={(e) =>
                  handleRecruitmentChange(
                    "trainingType",
                    e.target.value as "regular" | "one-time"
                  )
                }
                className={styles.select}
              >
                <option value="regular">정기 훈련</option>
                <option value="one-time">단기 훈련</option>
              </select>
            </div>

            {recruitmentData.trainingType === "regular" && (
              <>
                <div className={styles.formGroup}>
                  <label>훈련 요일 *</label>
                  <div className={styles.checkboxGroup}>
                    {weekDays.map((day) => (
                      <label key={day.value} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={recruitmentData.meetingDays.includes(
                            day.value
                          )}
                          onChange={(e) =>
                            handleMeetingDayChange(day.value, e.target.checked)
                          }
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="meetingTime">훈련 시작 시간 *</label>
                    <Input
                      id="meetingTime"
                      type="time"
                      value={recruitmentData.meetingTime}
                      onChange={(e) =>
                        handleRecruitmentChange("meetingTime", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endTime">훈련 종료 시간 *</label>
                    <Input
                      id="endTime"
                      type="time"
                      value={recruitmentData.endTime}
                      onChange={(e) =>
                        handleRecruitmentChange("endTime", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {recruitmentData.trainingType === "one-time" && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="startDate">훈련 시작일 *</label>
                    <Input
                      id="startDate"
                      type="date"
                      value={recruitmentData.startDate}
                      onChange={(e) =>
                        handleRecruitmentChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endDate">훈련 종료일 *</label>
                    <Input
                      id="endDate"
                      type="date"
                      value={recruitmentData.endDate}
                      onChange={(e) =>
                        handleRecruitmentChange("endDate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="meetingTime">훈련 시작 시간 *</label>
                    <Input
                      id="meetingTime"
                      type="time"
                      value={recruitmentData.meetingTime}
                      onChange={(e) =>
                        handleRecruitmentChange("meetingTime", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endTime">훈련 종료 시간 *</label>
                    <Input
                      id="endTime"
                      type="time"
                      value={recruitmentData.endTime}
                      onChange={(e) =>
                        handleRecruitmentChange("endTime", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* 공통 필드들 */}
            <div className={styles.formGroup}>
              <label htmlFor="location">훈련 장소 *</label>
              <Input
                id="location"
                type="text"
                value={recruitmentData.location}
                onChange={(e) =>
                  handleRecruitmentChange("location", e.target.value)
                }
                placeholder="예: 서울올림픽공원 수영장"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contactInfo">연락처</label>
              <Input
                id="contactInfo"
                type="text"
                value={recruitmentData.contactInfo}
                onChange={(e) =>
                  handleRecruitmentChange("contactInfo", e.target.value)
                }
                placeholder="예: 카카오톡 ID 또는 전화번호"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="requirements">참여 요구사항</label>
              <textarea
                id="requirements"
                value={recruitmentData.requirements}
                onChange={(e) =>
                  handleRecruitmentChange("requirements", e.target.value)
                }
                placeholder="참여자에게 필요한 요구사항이 있다면 입력하세요"
                rows={2}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="equipment">준비물</label>
              <textarea
                id="equipment"
                value={recruitmentData.equipment}
                onChange={(e) =>
                  handleRecruitmentChange("equipment", e.target.value)
                }
                placeholder="참여자가 준비해야 할 준비물이 있다면 입력하세요"
                rows={2}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cost">참여 비용</label>
              <Input
                id="cost"
                type="text"
                value={recruitmentData.cost}
                onChange={(e) =>
                  handleRecruitmentChange("cost", e.target.value)
                }
                placeholder="예: 무료 또는 50,000원"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="specialNotes">특별 안내</label>
              <textarea
                id="specialNotes"
                value={recruitmentData.specialNotes}
                onChange={(e) =>
                  handleRecruitmentChange("specialNotes", e.target.value)
                }
                placeholder="참여자에게 전달할 특별한 안내사항이 있다면 입력하세요"
                rows={2}
                className={styles.textarea}
              />
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={handleClose}>
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
