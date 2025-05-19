import React from 'react';
import styles from '../styles/guide.module.css';
import Link from 'next/link';  // Import Link
import { useRouter } from 'next/router';

const GuidelinePage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Navigation Bar */}
      <div className={styles.navbar}>
        <img
          src="/pic/logo.png"
          alt="Logo"
          className={styles.logo}
          onClick={() => router.push('/')} 
        />
        <ul className={styles.navItems}>
          <li className={styles.navItem}><Link href="/afterlogin">Home</Link></li>
          <li className={styles.navItem}><Link href="/guideline" style={{color: '#007BFF' }}>Guideline</Link></li>
          <button className={styles.getStartedButton} onClick={() => router.push('/project')}>
            My Project!
          </button>
        </ul>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <h1 className={styles.sidebarHeading}>How to Use This Website</h1>
          <ul>
            <li><Link href="/what-is-this">What is this website?</Link></li>
            <li><Link href="/info/create-er">How to create an ER diagram?</Link></li>
            <li><a href="#export-sql">How to export SQL?</a></li>
            <li><a href="#templates">Example templates</a></li>

          </ul>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          <h1 className={styles.headingPrimary}>Welcome to Our ER Diagram Tool!</h1>
          <p className={styles.paragraph}>Easily create, modify, and export ER diagrams with our intuitive tool.</p>

          <h2 id="what-is-this" className={styles.headingSecondary}>Step 1: Choose a Template</h2>
          <img src="/pic/template-selection.png" alt="Choose a Template" className={styles.image} />
          <p className={styles.paragraph}>
          Pick a pre-made ER diagram template or start from scratch.
          </p>

         <h2 id="how-to-create" className={styles.headingSecondary}>Step 2: Customize Your Diagram</h2>
         <img src="/pic/diagram-edit.png" alt="Edit Diagram" className={styles.image}/>
         <p className={styles.paragraph}>
          Drag and drop entities, relationships, and attributes to design your database structure.
         </p>

         <h2 id="export-sql" className={styles.headingSecondary}>Step 3: Generate SQL Code</h2>
         <img src="/pic/sql-generate.png" alt="Generate SQL" className={styles.image}/>
         <p className={styles.paragraph}>
         Automatically generate SQL scripts for database implementation.
         </p>

         <h2 id="templates" className={styles.headingSecondary}>Step 4: Export & Use</h2>
         <img src="/pic/export.png" alt="Export SQL" className={styles.image}/>
         <p className={styles.paragraph}>
          Download your ER diagram and SQL code for easy use in MySQL and other databases.
          </p>

        </div>
      </div>
    </div>
  );
};

export default GuidelinePage;
