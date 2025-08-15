"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { communityRecruitmentAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.scss";

interface Recruitment {
  id: string;
  title: string;
  description: string;
  type: "short-term" | "recurring";
  status: "open" | "full" | "closed" | "completed";
  startDate: string;
  endDate: string;
  meetingTime: string;
  location: string;
  currentParticipants: number;
  maxParticipants: number;
  targetLevel: string;
  user: {
    name: string;
  };
  program: {
    title: string;
    difficulty: string;
  };
}

const CommunityRecruitmentPage: React.FC = () => {
  const { user } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [filteredRecruitments, setFilteredRecruitments] = useState<
    Recruitment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    targetLevel: "all",
    status: "all",
  });

  useEffect(() => {
    fetchRecruitments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recruitments, filters]);

  const fetchRecruitments = async () => {
    try {
      setLoading(true);
      const response = await communityRecruitmentAPI.getCommunityRecruitments();
      setRecruitments(response.data || []);
    } catch (error) {
      console.error("모집 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recruitments];

    if (filters.type !== "all") {
      filtered = filtered.filter(
        (recruitment) => recruitment.type === filters.type
      );
    }

    if (filters.targetLevel !== "all") {
      filtered = filtered.filter(
        (recruitment) => recruitment.targetLevel === filters.targetLevel
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (recruitment) => recruitment.status === filters.status
      );
    }

    setFilteredRecruitments(filtered);
  };

  const handleJoinRecruitment = async (recruitmentId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await communityRecruitmentAPI.joinRecruitment(recruitmentId, {
        message: "참여 신청합니다!",
        isRegularParticipant: false,
      });
      alert("참여 신청이 완료되었습니다!");
      fetchRecruitments(); // 목록 새로고침
    } catch (error) {
      console.error("참여 신청 실패:", error);
      alert("참여 신청에 실패했습니다.");
    }
  };

  const getTypeText = (type: string) => {
    return type === "short-term" ? "단기 모임" : "정기 모임";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "모집 중";
      case "full":
        return "모집 완료";
      case "closed":
        return "모집 종료";
      case "completed":
        return "완료됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#4CAF50";
      case "full":
        return "#FF9800";
      case "closed":
        return "#9E9E9E";
      case "completed":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>커뮤니티 모집</h1>
          <p>다른 사람들과 함께 훈련할 수 있는 모임을 찾아보세요!</p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>모임 유형:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">전체</option>
              <option value="short-term">단기 모임</option>
              <option value="recurring">정기 모임</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>난이도:</label>
            <select
              value={filters.targetLevel}
              onChange={(e) =>
                setFilters({ ...filters, targetLevel: e.target.value })
              }
            >
              <option value="all">전체</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>상태:</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">전체</option>
              <option value="open">모집 중</option>
              <option value="full">모집 완료</option>
              <option value="closed">모집 종료</option>
            </select>
          </div>
        </div>

        <div className={styles.recruitmentsList}>
          {filteredRecruitments.length === 0 ? (
            <div className={styles.noData}>
              <p>조건에 맞는 모집이 없습니다.</p>
            </div>
          ) : (
            filteredRecruitments.map((recruitment) => (
              <div key={recruitment.id} className={styles.recruitmentCard}>
                <div className={styles.cardHeader}>
                  <h3>{recruitment.title}</h3>
                  <div className={styles.badges}>
                    <span className={styles.typeBadge}>
                      {getTypeText(recruitment.type)}
                    </span>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(recruitment.status),
                      }}
                    >
                      {getStatusText(recruitment.status)}
                    </span>
                  </div>
                </div>

                <p className={styles.description}>{recruitment.description}</p>

                <div className={styles.programInfo}>
                  <strong>프로그램:</strong> {recruitment.program.title}
                  <span className={styles.difficulty}>
                    난이도: {recruitment.program.difficulty}
                  </span>
                </div>

                <div className={styles.meetingInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>모임 시간:</span>
                    <span>{recruitment.meetingTime}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>장소:</span>
                    <span>{recruitment.location}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>기간:</span>
                    <span>
                      {new Date(recruitment.startDate).toLocaleDateString()} ~
                      {new Date(recruitment.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.participants}>
                  <span>
                    참여자: {recruitment.currentParticipants}/
                    {recruitment.maxParticipants}명
                  </span>
                  {recruitment.targetLevel !== "all" && (
                    <span className={styles.targetLevel}>
                      대상: {recruitment.targetLevel}
                    </span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.author}>
                    작성자: {recruitment.user.name}
                  </span>
                  {recruitment.status === "open" && (
                    <button
                      onClick={() => handleJoinRecruitment(recruitment.id)}
                      className={styles.joinButton}
                    >
                      참여 신청
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommunityRecruitmentPage;
