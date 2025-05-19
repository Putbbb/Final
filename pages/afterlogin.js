import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/authenPage.module.css';

export default function IndexPage() {
  const router = useRouter();
  const [showSubscription, setShowSubscription] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleSubscriptionModal = () => {
    setShowSubscription(!showSubscription);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation(); // Prevents closing when clicking inside the dropdown
    setShowProfile(!showProfile);
  };

  const handleOutsideClick = () => {
    setShowProfile(false);
    setShowSubscription(false);
  };

  return (
    <>
      {/* Navigation Bar */}
      <div className={styles.bar}>
        <img className={styles.logoPic} src="/pic/logo.png" alt="logo" />
        <ul>
          {/* Profile Dropdown */}
          <li className={styles.profileContainer} onClick={toggleProfileDropdown}>
            <img className={styles.profilePic} src="/pic/Account.png" alt="Profile" />
            {showProfile && (
              <div className={styles.profileDropdown} onClick={(e) => e.stopPropagation()}>
                <img className={styles.largeProfilePic} src="/pic/Account.png" alt="Profile" />
                <p className={styles.userEmail}>pattranith.dyo@gmail.com</p>
                <button className={styles.signOutButton} onClick={() => router.push('/')}>Sign Out</button>
              </div>
            )}
          </li>
          <li onClick={() => router.push('/guideline')}>Guideline</li>
          <li>
            <a onClick={toggleSubscriptionModal}>SUBSCRIPTION</a>
          </li>
        </ul>
        <button className={styles.getStartedButton} onClick={() => router.push('/project')}>
          MY PROJECT!
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent} onClick={handleOutsideClick}>
        <div className={styles.textContent}>
          <h1>Welcome to ER CRAFT</h1>
          <p>
            Celebrate the joy of accomplishment with an<br />
            app designed to track your progress, motivate<br />
            your efforts, and celebrate your successes.
          </p>
        </div>
        <div className={styles.visualContainer}>
          <img className={styles.shape1} src="/pic/Visual.png" alt="Shape 1" />
          <img className={styles.shape2} src="/pic/half-torus.png" alt="Shape 2" />
          <img className={styles.shape3} src="/pic/pyramid.png" alt="Shape 3" />
          <img className={styles.shape4} src="/pic/cylinder.png" alt="Shape 4" />
        </div>
      </main>

      {/* Subscription Modal (Overlay, Not Replacing Content) */}
      {showSubscription && (
        <div className={styles.modalOverlay} onClick={handleOutsideClick}>
          <div className={styles.subscriptionModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Choose your plan</h2>
            <div className={styles.subscriptionPlans}>
              {/* Free Plan */}
              <div className={styles.planCard}>
                <h3>Free</h3>
                <p className={styles.price}>฿0</p>
                <p>Free, for trying things out</p>
                <button className={styles.currentPlanButton}>Current Plan</button>
                <ul>
                <li>3 editable boards</li>
                <li>150 objects per board</li>
                <li>Free system and custom templates</li>
                <li>Export files available</li>
                <li>1GB of storage</li>
                </ul>
              </div>

              {/* Lifetime Plan */}
              <div className={styles.planCard}>
                <h3>Family</h3>
                <p className={styles.price}>฿449 <span>/month</span></p>
                <button className={styles.upgradeButton}>Upgrade</button>
                <ul>
                  <li>Share with 5 members</li>
                  <li>Unlimited editable boards & objects</li>
                  <li>Access more special templates</li>
                  <li>50GB of storage</li>
                  <li>Future upgrades & new features</li>
                </ul>
              </div>

              {/* Business Plan */}
              <div className={styles.planCard}>
                <h3>Business</h3>
                <p className={styles.price}>฿179 <span>/month</span></p>
                <button className={styles.upgradeButton}>Upgrade</button>
                <ul>

                  <li>Unlimited editable boards & objects</li>
                  <li>Unlimited editable boards & objects</li>
                  <li>Access more special templates</li>
                  <li>50GB of storage</li>
                  <li>Future upgrades & new features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}