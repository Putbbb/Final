import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import styles from '../styles/LoginPage.module.css';
import NextAuth from "next-auth";

const GOOGLE_CLIENT_ID =
  "274339556106-aj0sh5ka60vl7baq106uj4m2rqvldiha.apps.googleusercontent.com";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Email is required.');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format.');
      return;
    }

    if (!formData.password) {
      setError('Password is required.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/afterlogin');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/afterlogin" });
    } catch (error) {
      setError("Failed to login with Google. Please try again.");
    }
  };


  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img className={styles.logo} src="/pic/logo.png" alt="Logo" />
          <span className={styles.logoText}>ER Craft</span>
        </div>
      </div>

      <div className={styles.leftSection}>
        <h1 className={styles.heading}>Login to Your Account</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.termsGroup}>
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
            />
            <label htmlFor="agreeTerms">I agree to the terms & conditions</label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>

        <div className={styles.orDivider}>or</div>
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          <img src="/pic/google-icon.png" alt="Google Icon" />
          Login with Google
        </button>
      </div>

      <div className={styles.rightSection}>
        <img src="/pic/loginlo.png" alt="Decorative Illustration" className={styles.decorativeImage} />
      </div>
    </div>
  );
};

export default LoginPage;