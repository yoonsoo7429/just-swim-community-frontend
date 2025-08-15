import React, { useState } from "react";
import Link from "next/link";
import { TrainingProgram } from "@/types";
import { communityAPI } from "@/utils/api";
import styles from "./styles.module.scss";

interface ProgramCardProps {
  program: TrainingProgram;
  viewMode?: "compact" | "detailed";
  onJoin?: (programId: number) => void;
  onLeave?: (programId: number) => void;
  showActions?: boolean;
  isMyProgram?: boolean;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  viewMode = "compact",
  onJoin,
  onLeave,
  showActions = false,
  isMyProgram = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "초급";
      case "intermediate":
        return "중급";
      case "advanced":
        return "고급";
      default:
        return difficulty;
    }
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(program.id);
    }
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLeave) {
      onLeave(program.id);
    }
  };

  const handleShareToCommunity = async () => {
    try {
      // 훈련 프로그램 공유 기능은 백엔드에서 아직 구현되지 않았으므로 임시로 alert만 표시
      alert("훈련 프로그램 공유 기능은 준비 중입니다.");

      // TODO: 백엔드 구현 후 아래 코드 활성화
      // const response = await postsAPI.createPost({
      //   title: `${program.title} - 훈련 프로그램 공유`,
      //   content: `훈련 프로그램을 공유합니다!`,
      //   category: "훈련 후기",
      // });

      // alert("프로그램이 성공적으로 공유되었습니다!");
      // router.push("/community");
    } catch (error) {
      console.error("프로그램 공유 실패:", error);
      alert("프로그램 공유에 실패했습니다.");
    }
  };

  // 컴팩트 모드 (전체 보기)
  if (viewMode === "compact") {
    return (
      <div className={styles.programCardCompact}>
        <div className={styles.headerCompact}>
          <div className={styles.titleSectionCompact}>
            <h3 className={styles.titleCompact}>{program.title}</h3>
            <span
              className={styles.difficultyCompact}
              style={{
                backgroundColor: getDifficultyColor(program.difficulty),
              }}
            >
              {getDifficultyText(program.difficulty)}
            </span>
          </div>
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={`${styles.expandIcon} ${
                isExpanded ? styles.expanded : ""
              }`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.statsCompact}>
          {program.type === "regular" ? (
            <>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {program.totalWeeks || 0}주
                </span>
                <span className={styles.labelCompact}>총 주차</span>
              </div>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {program.sessionsPerWeek || 0}회
                </span>
                <span className={styles.labelCompact}>주당 세션</span>
              </div>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {(program.totalWeeks || 0) * (program.sessionsPerWeek || 0)}회
                </span>
                <span className={styles.labelCompact}>총 세션</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {program.totalSessions || 0}회
                </span>
                <span className={styles.labelCompact}>총 세션</span>
              </div>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {program.estimatedDuration || 0}분
                </span>
                <span className={styles.labelCompact}>예상 시간</span>
              </div>
              <div className={styles.statCompact}>
                <span className={styles.valueCompact}>
                  {program.type === "short-term" ? "단기" : "정기"}
                </span>
                <span className={styles.labelCompact}>훈련 타입</span>
              </div>
            </>
          )}
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>
              {program.participantsCount || 0}명
            </span>
            <span className={styles.labelCompact}>참여자</span>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.expandedContent}>
            {program.description && (
              <p className={styles.descriptionCompact}>{program.description}</p>
            )}

            <div className={styles.footerCompact}>
              <span className={styles.visibilityCompact}>
                {program.visibility === "public" ? "공개" : "비공개"}
              </span>
              <span className={styles.statusCompact}>
                {program.isPublished ? "게시됨" : "임시저장"}
              </span>
              {program.maxParticipants && (
                <span className={styles.maxParticipantsCompact}>
                  최대 {program.maxParticipants}명
                </span>
              )}
            </div>

            <div className={styles.actionsCompact}>
              <Link
                href={`/programs/${program.id}`}
                className={styles.viewDetailsButton}
              >
                상세 보기
              </Link>

              {showActions && (
                <div className={styles.participationActions}>
                  {program.isParticipating ? (
                    <button
                      className={styles.leaveButton}
                      onClick={handleLeave}
                    >
                      탈퇴하기
                    </button>
                  ) : (
                    <button
                      className={styles.joinButton}
                      onClick={handleJoin}
                      disabled={
                        !!(
                          program.maxParticipants &&
                          program.participantsCount >= program.maxParticipants
                        )
                      }
                    >
                      {program.maxParticipants &&
                      program.participantsCount >= program.maxParticipants
                        ? "참여 불가"
                        : "참여하기"}
                    </button>
                  )}
                </div>
              )}

              {isMyProgram && program.isPublished && (
                <button
                  className={styles.shareButton}
                  onClick={handleShareToCommunity}
                  disabled={isSharing}
                >
                  {isSharing ? "공유 중..." : "커뮤니티에 공유"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 상세 모드 (기존 코드)
  return (
    <Link href={`/programs/${program.id}`} className={styles.programCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{program.title}</h3>
        <span
          className={styles.difficulty}
          style={{ backgroundColor: getDifficultyColor(program.difficulty) }}
        >
          {getDifficultyText(program.difficulty)}
        </span>
      </div>

      {program.description && (
        <p className={styles.description}>{program.description}</p>
      )}

      <div className={styles.stats}>
        {program.type === "regular" ? (
          <>
            <div className={styles.stat}>
              <span className={styles.label}>총 주차</span>
              <span className={styles.value}>{program.totalWeeks || 0}주</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>주당 세션</span>
              <span className={styles.value}>
                {program.sessionsPerWeek || 0}회
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>총 세션</span>
              <span className={styles.value}>
                {(program.totalWeeks || 0) * (program.sessionsPerWeek || 0)}회
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.stat}>
              <span className={styles.label}>총 세션</span>
              <span className={styles.value}>
                {program.totalSessions || 0}회
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>예상 시간</span>
              <span className={styles.value}>
                {program.estimatedDuration || 0}분
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>훈련 타입</span>
              <span className={styles.value}>
                {program.type === "short-term" ? "단기" : "정기"}
              </span>
            </div>
          </>
        )}
        <div className={styles.stat}>
          <span className={styles.label}>참여자</span>
          <span className={styles.value}>
            {program.participantsCount || 0}명
            {program.maxParticipants && ` / ${program.maxParticipants}명`}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.visibility}>
          {program.visibility === "public" ? "공개" : "비공개"}
        </span>
        <span className={styles.status}>
          {program.isPublished ? "게시됨" : "임시저장"}
        </span>
      </div>
    </Link>
  );
};

export default ProgramCard;
