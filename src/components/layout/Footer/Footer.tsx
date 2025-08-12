import React from "react";
import styles from "./styles.module.scss";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>Just Swim</h3>
            <p className={styles.description}>
              수영 기록 관리, 훈련 프로그램, 그리고 커뮤니티를 한 곳에서
              제공하는 수영 애호가들을 위한 플랫폼입니다.
            </p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>주요 기능</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="/records" className={styles.link}>
                  수영 기록 관리
                </a>
              </li>
              <li>
                <a href="/programs" className={styles.link}>
                  훈련 프로그램
                </a>
              </li>
              <li>
                <a href="/community" className={styles.link}>
                  커뮤니티
                </a>
              </li>
              <li>
                <a href="/" className={styles.link}>
                  홈
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>지원</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="/help" className={styles.link}>
                  도움말
                </a>
              </li>
              <li>
                <a href="/faq" className={styles.link}>
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="/privacy" className={styles.link}>
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="/terms" className={styles.link}>
                  이용약관
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>연락처</h4>
            <div className={styles.contactInfo}>
              <p>📧 support@justswim.com</p>
              <p>💬 커뮤니티에서 문의하기</p>
              <p>🌐 온라인 서비스</p>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2024 Just Swim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
