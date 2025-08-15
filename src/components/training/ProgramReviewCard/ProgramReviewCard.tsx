import React, { useState } from "react";
import styles from "./styles.module.scss";

interface Review {
  id: string;
  rating: number;
  review: string;
  isAnonymous: boolean;
  reviewCategories?: {
    difficulty?: number;
    effectiveness?: number;
    enjoyment?: number;
    instructor?: number;
    value?: number;
  };
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProgramReviewCardProps {
  review: Review;
  isMyReview: boolean;
}

const ProgramReviewCard: React.FC<ProgramReviewCardProps> = ({
  review,
  isMyReview,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${
          index < rating ? styles.filled : styles.empty
        }`}
      >
        ★
      </span>
    ));
  };

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      difficulty: "난이도",
      effectiveness: "효과성",
      enjoyment: "재미",
      instructor: "강사",
      value: "가치",
    };
    return categoryNames[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <span className={styles.author}>
            {review.isAnonymous ? "익명" : review.user.name}
          </span>
          {isMyReview && <span className={styles.myReviewBadge}>내 리뷰</span>}
        </div>
        <span className={styles.date}>{formatDate(review.createdAt)}</span>
      </div>

      <div className={styles.rating}>
        <div className={styles.overallRating}>
          <span className={styles.ratingLabel}>전체 평점:</span>
          <div className={styles.stars}>{renderStars(review.rating)}</div>
          <span className={styles.ratingValue}>{review.rating}/5</span>
        </div>

        {review.reviewCategories && (
          <div className={styles.categoryRatings}>
            {Object.entries(review.reviewCategories).map(
              ([category, rating]) => (
                <div key={category} className={styles.categoryRating}>
                  <span className={styles.categoryName}>
                    {getCategoryName(category)}:
                  </span>
                  <div className={styles.categoryStars}>
                    {renderStars(rating)}
                  </div>
                  <span className={styles.categoryValue}>{rating}/5</span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className={styles.reviewContent}>
        <p className={styles.reviewText}>
          {isExpanded
            ? review.review
            : review.review.length > 150
            ? `${review.review.substring(0, 150)}...`
            : review.review}
        </p>

        {review.review.length > 150 && (
          <button className={styles.expandButton} onClick={toggleExpanded}>
            {isExpanded ? "접기" : "더보기"}
          </button>
        )}
      </div>

      {isMyReview && (
        <div className={styles.actions}>
          <button className={styles.editButton}>수정</button>
          <button className={styles.deleteButton}>삭제</button>
        </div>
      )}
    </div>
  );
};

export default ProgramReviewCard;
