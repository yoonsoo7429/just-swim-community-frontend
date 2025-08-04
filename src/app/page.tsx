import React from 'react';
import Layout from '../components/layout/Layout';
import styles from './page.module.scss';

export default function Home() {
  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              수영 기록을 공유하고<br />
              함께 성장하는 커뮤니티
            </h1>
            <p className={styles.subtitle}>
              수영 기록을 올리고 다른 수영인들과 피드백을 주고받으며 
              함께 성장해보세요
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryButton}>
                기록 올리기
              </button>
              <button className={styles.secondaryButton}>
                커뮤니티 둘러보기
              </button>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresContainer}>
            <h2 className={styles.sectionTitle}>Just Swim에서 할 수 있는 것들</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📊</div>
                <h3>수영 기록 공유</h3>
                <p>본인의 수영 기록을 올리고 다른 사람들과 공유해보세요</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💬</div>
                <h3>피드백 & 댓글</h3>
                <p>다른 수영인들의 기록에 피드백을 주고받으며 함께 성장하세요</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📋</div>
                <h3>훈련 프로그램 공유</h3>
                <p>효과적인 훈련 프로그램을 공유하고 다른 사람들의 프로그램을 참고하세요</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🏆</div>
                <h3>성과 추적</h3>
                <p>개인 기록을 추적하고 목표 달성 과정을 확인해보세요</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.courses}>
          <div className={styles.coursesContainer}>
            <h2 className={styles.sectionTitle}>인기 훈련 프로그램</h2>
            <div className={styles.coursesGrid}>
              <div className={styles.course}>
                <div className={styles.courseImage}>
                  <div className={styles.courseLevel}>초급</div>
                </div>
                <div className={styles.courseContent}>
                  <h3>자유형 기초 훈련</h3>
                  <p>자유형을 처음 배우는 분들을 위한 4주 훈련 프로그램</p>
                  <ul>
                    <li>기본 자세 연습</li>
                    <li>호흡법 훈련</li>
                    <li>팔 동작 연습</li>
                  </ul>
                  <button className={styles.courseButton}>프로그램 보기</button>
                </div>
              </div>
              
              <div className={styles.course}>
                <div className={styles.courseImage}>
                  <div className={styles.courseLevel}>중급</div>
                </div>
                <div className={styles.courseContent}>
                  <h3>지구력 향상 훈련</h3>
                  <p>수영 지구력을 향상시키는 6주 훈련 프로그램</p>
                  <ul>
                    <li>인터벌 훈련</li>
                    <li>거리별 훈련</li>
                    <li>기술 개선</li>
                  </ul>
                  <button className={styles.courseButton}>프로그램 보기</button>
                </div>
              </div>
              
              <div className={styles.course}>
                <div className={styles.courseImage}>
                  <div className={styles.courseLevel}>고급</div>
                </div>
                <div className={styles.courseContent}>
                  <h3>경영 기술 훈련</h3>
                  <p>경영을 위한 고급 기술 훈련 프로그램</p>
                  <ul>
                    <li>스타트 훈련</li>
                    <li>턴 기술</li>
                    <li>경영 전략</li>
                  </ul>
                  <button className={styles.courseButton}>프로그램 보기</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 