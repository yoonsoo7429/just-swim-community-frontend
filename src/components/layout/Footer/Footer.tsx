import React from 'react';
import styles from './styles.module.scss';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>Just Swim</h3>
            <p className={styles.description}>
              전문적인 수영 강습과 함께 안전하고 즐거운 수영을 경험해보세요.
            </p>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.subtitle}>서비스</h4>
            <ul className={styles.linkList}>
              <li><a href="/courses" className={styles.link}>수영 강습</a></li>
              <li><a href="/instructors" className={styles.link}>강사 소개</a></li>
              <li><a href="/facilities" className={styles.link}>시설 안내</a></li>
              <li><a href="/schedule" className={styles.link}>수업 일정</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.subtitle}>고객지원</h4>
            <ul className={styles.linkList}>
              <li><a href="/contact" className={styles.link}>문의하기</a></li>
              <li><a href="/faq" className={styles.link}>자주 묻는 질문</a></li>
              <li><a href="/privacy" className={styles.link}>개인정보처리방침</a></li>
              <li><a href="/terms" className={styles.link}>이용약관</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.subtitle}>연락처</h4>
            <div className={styles.contactInfo}>
              <p>📞 02-1234-5678</p>
              <p>📧 info@justswim.com</p>
              <p>📍 서울특별시 강남구 테헤란로 123</p>
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