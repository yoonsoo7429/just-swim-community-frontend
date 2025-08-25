"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { trainingAPI, postsAPI } from "@/utils/api";
import { TrainingProgram } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getDifficultyText } from "@/utils";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";

const ProgramDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);
  const { user } = useAuth();

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);

  useEffect(() => {
    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getProgramById(programId);
      setProgram(response.data);
    } catch (error) {
      console.error("프로그램 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async () => {
    if (!program) return;

    // 모집 정보 입력 모달 표시
    setShowRecruitmentModal(true);
  };

  const handleRecruitmentSubmit = async (recruitmentInfo: any) => {
    if (!program) return;

    try {
      setPublishing(true);

      // 1. 프로그램을 게시 상태로 변경
      await trainingAPI.updateProgram(program.id, { isPublished: true });

      // 2. 커뮤니티에 모집글 자동 생성 (상세 정보 포함)
      const recruitmentPost = {
        title: program.title,
        content: `훈련 프로그램 "${
          program.title
        }"에 참여할 사람을 모집합니다.\n\n${
          program.description || "프로그램 설명이 없습니다."
        }\n\n난이도: ${getDifficultyText(
          program.difficulty
        )}\n\n함께 훈련하며 성장해보세요!`,
        category: "훈련 모집",
        tags: ["훈련", "모집", program.difficulty],
        isRecruitment: true,
        trainingProgramId: program.id,
        recruitmentInfo: {
          ...recruitmentInfo,
          currentParticipants: 0,
          status: "open",
        },
      };

      await postsAPI.createPost(recruitmentPost);

      // 3. 프로그램 데이터 새로고침
      await fetchProgramData();

      // 4. 모달 닫기
      setShowRecruitmentModal(false);

      alert(
        "프로그램이 성공적으로 게시되었습니다!\n커뮤니티에 상세한 모집글이 자동으로 생성되었습니다."
      );
    } catch (error) {
      console.error("프로그램 게시 실패:", error);
      alert("프로그램 게시에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = () => {
    // TODO: 수정 모달 또는 수정 페이지로 이동
    alert("수정 기능은 아직 구현되지 않았습니다.");
  };

  const handleDelete = async () => {
    if (!program || !confirm("정말로 이 프로그램을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await trainingAPI.deleteProgram(program.id);
      alert("프로그램이 삭제되었습니다.");
      router.push("/programs");
    } catch (error) {
      console.error("프로그램 삭제 실패:", error);
      alert("프로그램 삭제에 실패했습니다.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.overview}>
            <div className={styles.programInfo}>
              <h2>{program?.title}</h2>
              {program?.description && (
                <p className={styles.description}>{program.description}</p>
              )}
              <div className={styles.meta}>
                <span>
                  난이도:{" "}
                  {program?.difficulty
                    ? getDifficultyText(program.difficulty)
                    : "-"}
                </span>
                <span>
                  공개 설정:{" "}
                  {program?.visibility === "public" ? "공개" : "비공개"}
                </span>
                <span>
                  상태: {program?.isPublished ? "게시됨" : "임시저장"}
                </span>
              </div>
            </div>

            <div className={styles.info}>
              <h3>프로그램 정보</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>생성일</span>
                  <span className={styles.value}>
                    {program?.createdAt
                      ? new Date(program.createdAt).toLocaleDateString("ko-KR")
                      : "-"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>수정일</span>
                  <span className={styles.value}>
                    {program?.updatedAt
                      ? new Date(program.updatedAt).toLocaleDateString("ko-KR")
                      : "-"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>작성자</span>
                  <span className={styles.value}>
                    {program?.user?.name || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className={styles.settings}>
            <h3>프로그램 설정</h3>
            <div className={styles.settingItem}>
              <span className={styles.label}>공개 설정</span>
              <span className={styles.value}>
                {program?.visibility === "public" ? "공개" : "비공개"}
              </span>
            </div>
            <div className={styles.settingItem}>
              <span className={styles.label}>게시 상태</span>
              <span className={styles.value}>
                {program?.isPublished ? "게시됨" : "임시저장"}
              </span>
            </div>
            <div className={styles.settingItem}>
              <span className={styles.label}>난이도</span>
              <span className={styles.value}>
                {program?.difficulty
                  ? getDifficultyText(program.difficulty)
                  : "-"}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (!program) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>프로그램을 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  const isMyProgram = user && program.user.id === user.id;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={() => router.push("/programs")}
            className={styles.backButton}
            aria-label="뒤로 가기"
          >
            <IconArrowLeft width={20} height={20} />
          </button>
          <div className={styles.headerContent}>
            <h1>{program.title}</h1>
            <div className={styles.actions}>
              {isMyProgram ? (
                <>
                  {!program.isPublished && (
                    <button
                      className={styles.publishButton}
                      onClick={handlePublishNow}
                      disabled={publishing}
                    >
                      {publishing ? "게시 중..." : "즉시 게시"}
                    </button>
                  )}
                  <button className={styles.editButton} onClick={handleEdit}>
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                  >
                    삭제
                  </button>
                </>
              ) : (
                user &&
                program.visibility === "public" &&
                program.isPublished && (
                  <button className={styles.joinButton}>참여하기</button>
                )
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            개요
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            설정
          </button>
        </div>

        <div className={styles.tabContent}>{renderTabContent()}</div>
      </div>
    </Layout>
  );
};

export default ProgramDetailPage;
