import React, { useState } from "react";
import styles from "../styles/wireframe.module.css";

export default function WireframeFromSQL({ parsedTables }) {
  const getTable = (name) => parsedTables.find(t => t.tableName.toLowerCase() === name.toLowerCase());

  const Student = getTable("Student");
  const Teacher = getTable("Teacher");
  const Course = getTable("Course");
  const Lesson = getTable("lesson");
  const Exam = getTable("Exam");
  const projectName = typeof window !== "undefined" ? localStorage.getItem("projectName") : "";
  const [inputValue, setInputValue] = useState(projectName || "Untitled");

  const handleChangeProjectName = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("projectName", inputValue);
      alert("Project name updated to: " + inputValue);
    }
  };

  return (
  <>
      <div className={styles.exportTopRight}>
        <button className={styles.exportBtn}>Export</button>
      </div>
  
    <div className={styles.bar}>
      <img className={styles.logo} src="/pic/logo.png" alt="Logo" />
      <img className={styles.dropdown} src="/pic/dropdown.png" alt="Dropdown" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.nameInput}
      />
      
    </div>


  <div className={styles.containerHorizontal}>
      {/* Sidebar */}
      <aside className={styles.sidebarHorizontal}>
  <div className={styles.logoBox}></div>

  <nav className={styles.menuSection}>
    <button className={styles.menuButton}>Home</button>
    <button className={styles.menuButton}>Student</button>
    <button className={styles.menuButton}>Teacher</button>
    <button className={styles.menuButton}>Courses</button>
  </nav>

  <div className={styles.subSection}>
    {[1, 2, 3].map((_, i) => (
      <div key={i} className={styles.subItem}>
        <span className={styles.subIcon}>✖</span>
        <div className={styles.subBar}></div>
      </div>
    ))}
  </div>
</aside>
      {/* Main */}
      <main className={styles.mainHorizontal}>
        {/* Header */}
        <header className={styles.header}>
          <input
            className={styles.searchBar}
            placeholder="Search..."
          />
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={styles.activeTab}>Courses</button>
          <button className={styles.tab}>Lessons</button>
          <button className={styles.tab}>Exam</button>
        </div>

        {/* Horizontal Layout */}
        <section className={styles.horizontalScrollSection}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={styles.cardHorizontal}>
              <div className={styles.thumbnail}></div>
              <h3>Course {i + 1}</h3>
            </div>
          ))}
        </section>

        <section className={styles.horizontalScrollSection}>
          <h3 className={styles.subheader}>Lessons</h3>
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className={styles.lessonTileHorizontal}>
              <div className={styles.thumbnail}></div>
              <p className={styles.lessonLabel}>lesson_title</p>
            </div>
          ))}
        </section>

        <section className={styles.horizontalScrollSection}>
          <h3 className={styles.subheader}>Exam Info</h3>
          <div className={styles.cardHorizontal}>

          </div>
        </section>
      </main>
    </div>
    </>
  );
}