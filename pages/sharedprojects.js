import React, { useEffect, useState } from "react";
import styles from "../styles/Project.module.css";
import { useRouter } from "next/router";

export default function SharedProjects() {
  const [sharedProjects, setSharedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/getSharedWorkspaces")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.shared)) {
          setSharedProjects(data.shared);
        } else {
          console.error("❌ Invalid shared data", data);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to fetch shared projects", err);
      });
  }, []);

  const filtered = sharedProjects.filter((item) =>
    `${item.shareName} ${item.projectName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className={styles.bar}>
        <img className={styles.logo} src="/pic/logo.png" alt="Logo" />
      </div>

      <div className={styles.sidebar}>
        <ul>
          <li className={styles.active}>Shared</li>
          <li onClick={() => router.push("/")}>Projects</li>
          <li>Folders</li>
        </ul>
      </div>

      <div className={styles.main}>
        <header className={styles.header}>
          <h1>Shared Projects</h1>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search shared projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className={styles.projectsContainer}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className={styles.projectCard}
                onClick={() =>
                  router.push(`/websitespace?share_id=${item.shareId}`)
                }
              >
                <div className={styles.cardIcon}>🤝</div>
                <h3>{item.shareName || "Untitled"}</h3>
                <div className={styles.projectMeta}>
                Shared by shareId: {item.shareId}
                </div>
              </div>
            ))
          ) : (
            <p>No shared projects found.</p>
          )}
        </div>
      </div>
    </>
  );
}
