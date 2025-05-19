import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import styles from '../styles/registerPage.module.css';

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    const errors = [];
    if (!formData.fullname) errors.push('Full name is required.');
    if (!formData.email) errors.push('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format.');
    }
    if (!formData.password) errors.push('Password is required.');
    if (!formData.agreeTerms) errors.push('You must agree to the terms.');

    if (errors.length > 0) {
      setError(errors.join(' '));
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'An error occurred.');
        return;
      }

      setSuccess('Account created successfully!');
      setTimeout(() => {
        router.push('/AccountCreated');
      }, 2000);
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    await signIn("google", { callbackUrl: "/afterlogin" });
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <img src="/pic/logo.png" alt="ER Craft Logo" className={styles.logo} />
          <span className={styles.logoText}>ER Craft</span>
        </div>

        <div className={styles.formWrapper}>
          <h1>Create Account</h1>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="fullname">Your fullname*</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="Enter your name"
                value={formData.fullname}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email address*</label>
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
              <label htmlFor="password">Create password*</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
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
              <label htmlFor="agreeTerms">I agree to terms & conditions</label>
            </div>

            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
            {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}

            <button type="submit" className={styles.submitButton}>
              Register Account
            </button>
          </form>

          <div className={styles.orDivider}>Or</div>

          <button className={styles.googleButton} onClick={handleGoogleSignup}>
            <img src="/pic/google-icon.png" alt="Google Icon" />
            Sign up with Google
          </button>
        </div>
      </div>

      <div className={styles.rightSection}>
        <img
          src="/pic/Frame signup.png"
          alt="Decorative Signup"
          className={styles.rightImage}
        />
      </div>
    </div>
  );
};

export default SignupPage;