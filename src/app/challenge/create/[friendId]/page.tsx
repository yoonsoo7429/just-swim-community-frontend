"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
}

export default function CreateFriendChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [friend, setFriend] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "distance",
    targetValue: "",
    unit: "m",
    startDate: "",
    endDate: "",
    isPublic: false,
    targetStroke: "",
  });

  const friendId = params.friendId as string;

  useEffect(() => {
    if (friendId && currentUser) {
      fetchFriendInfo();
    }
  }, [friendId, currentUser]);

  const fetchFriendInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${friendId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setFriend(userData);
      } else {
        router.push("/404");
      }
    } catch (error) {
      console.error("Failed to fetch friend info:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };

      // 카테고리 변경 시 단위 자동 설정
      if (name === "category") {
        switch (value) {
          case "distance":
          case "stroke":
            newData.unit = "m";
            break;
          case "duration":
            newData.unit = "분";
            break;
          case "frequency":
            newData.unit = "회";
            break;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.targetValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("종료일은 시작일보다 늦어야 합니다.");
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/challenges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            targetValue: parseInt(formData.targetValue),
            type: "group",
            invitedUserIds: [parseInt(friendId)],
            metadata:
              formData.category === "stroke"
                ? { targetStroke: formData.targetStroke }
                : undefined,
          }),
        }
      );

      if (response.ok) {
        const challenge = await response.json();
        alert("챌린지가 생성되었습니다!");
        router.push(`/social?tab=challenges`);
      } else {
        const error = await response.json();
        alert(error.message || "챌린지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to create challenge:", error);
      alert("챌린지 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>친구 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!friend) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>친구를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← 뒤로가기
          </button>
          <h1>⚔️ 친구 챌린지 생성</h1>
        </div>

        <div className={styles.friendInfo}>
          <div className={styles.avatar}>
            {friend.profileImage ? (
              <img
                src={friend.profileImage}
                alt={friend.name}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarText}>
                {friend.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
            <span className={styles.levelBadge}>
              {getLevelIcon(friend.userLevel)}
            </span>
          </div>

          <div className={styles.friendDetails}>
            <h2>{friend.name}님과 챌린지</h2>
            <p>Lv.{friend.userLevel}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              챌린지 제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="예: 1주일 5km 수영 챌린지"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="챌린지에 대한 자세한 설명을 입력하세요..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              챌린지 카테고리 *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="distance">거리 챌린지</option>
              <option value="duration">시간 챌린지</option>
              <option value="frequency">빈도 챌린지</option>
              <option value="stroke">특정 영법 챌린지</option>
            </select>
          </div>

          {formData.category === "stroke" && (
            <div className={styles.formGroup}>
              <label htmlFor="targetStroke" className={styles.label}>
                대상 영법 *
              </label>
              <select
                id="targetStroke"
                name="targetStroke"
                value={formData.targetStroke}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">영법을 선택하세요</option>
                <option value="freestyle">자유형</option>
                <option value="backstroke">배영</option>
                <option value="breaststroke">평영</option>
                <option value="butterfly">접영</option>
              </select>
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="targetValue" className={styles.label}>
                목표 값 *
              </label>
              <input
                type="number"
                id="targetValue"
                name="targetValue"
                value={formData.targetValue}
                onChange={handleInputChange}
                placeholder="1000"
                className={styles.input}
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="unit" className={styles.label}>
                단위
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className={styles.select}
              >
                {formData.category === "distance" && (
                  <>
                    <option value="m">미터 (m)</option>
                    <option value="km">킬로미터 (km)</option>
                  </>
                )}
                {formData.category === "duration" && (
                  <>
                    <option value="분">분</option>
                    <option value="시간">시간</option>
                  </>
                )}
                {formData.category === "frequency" && (
                  <option value="회">회</option>
                )}
                {formData.category === "stroke" && (
                  <>
                    <option value="m">미터 (m)</option>
                    <option value="km">킬로미터 (km)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>
                시작일 *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={styles.input}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.label}>
                종료일 *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={styles.input}
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                공개 챌린지로 만들기 (다른 사용자들도 참가 가능)
              </span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelBtn}
              disabled={creating}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={creating}
            >
              {creating ? "생성 중..." : "챌린지 생성"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
