import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/forgotPassword.module.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setMessage('Email is required*');
      return;
    }

    try {
      // Add your logic to handle sending a password reset email
      setMessage('Password reset link has been sent to your email.');
      setShowModal(true); // Show the modal after sending the reset link
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    router.push('/'); // Redirect to index.js
  };

  return (
    <div className={styles.ForgotPassword}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <img className={styles.mangoPic} src="/pic/mangomango.jpg" alt="MangoMango" />
        <h1 className={styles.h1Message}>Mango Mango</h1>
        <div className={styles.resetBox}>
          <p className={styles.instructions}>Enter your Business e-mail to send you a password reset link</p>
          <input
            className={styles.inputStyles}
            type="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
          {message && <p className={styles.message}>{message}</p>}
          <button className={styles.submitButton} type="submit">Send password reset email</button>
        </div>
      </form>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <img className={styles.checkIcon} src="/pic/Frame.png" alt="Success" />
            <p className={styles.modalMessage}>Password reset link has been sent.</p>
            <button className={styles.confirmButton} onClick={handleConfirm}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
