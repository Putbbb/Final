import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/authenPage.module.css';

export default function IndexPage() {
  const router = useRouter();

  return (
    <>
      <div className={styles.bar}>
        <img
          className={styles.logoPic}
          src="/pic/logo.png"
          alt="logo"
          onClick={() => router.push('/')}
        />
        <ul>
          <li>About</li>
          <li onClick={() => router.push('/guideline')}>Guideline</li>
          <li onClick={() => router.push('/login')}>Login</li>
        </ul>
        <button
          className={styles.getStartedButton}
          onClick={() => router.push('/signup')}
        >
          Get started!
        </button>
      </div>
      <main className={styles.mainContent}>
        <div className={styles.textContent}>
          <h1>Welcome to ER CRAFT</h1>
          <p>
            Celebrate the joy of accomplishment with an<br />
            app designed to track your progress, motivate<br />
            your efforts, and celebrate your successes.
          </p>
          <button
            className={styles.getStartedButton}
            onClick={() => router.push('/signup')}
          >
            Get started
          </button>
        </div>
        <div className={styles.visualContainer}>
          <img className={styles.shape1} src="/pic/Visual.png" alt="Shape 1" />
          <img className={styles.shape2} src="/pic/half-torus.png" alt="Shape 2" />
          <img className={styles.shape3} src="/pic/pyramid.png" alt="Shape 3" />
          <img className={styles.shape4} src="/pic/cylinder.png" alt="Shape 4" />
        </div>
      </main>
    </>
  );
}
