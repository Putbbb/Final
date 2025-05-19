import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/accountCreated.module.css';

const AccountCreated = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/'); // Redirect to the homepage or signup page
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src="/pic/logo.png" alt="ER Craft Logo" className={styles.logo} />
        <span className={styles.logoText}>ER Craft</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Create an Account <span className={styles.successIcon}>✔️</span>
        </h1>
        <p className={styles.message}>Your account has been created.</p>
        <button className={styles.goBackButton} onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AccountCreated;
