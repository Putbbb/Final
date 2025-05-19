import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Project.module.css';

export default function ProjectPage() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [projects, setProjects] = useState([]);
  const [menuIndex, setMenuIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/getProjects?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.projects)) {
            setProjects(data.projects);
          } else {
            console.error("❌ Projects data is not an array!", data);
          }
        })
        .catch((err) => console.error('❌ Error fetching projects:', err));
    }
  }, [session]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const createProjectAndNavigate = async (destination) => {
    if (!session || !session.user) {
      alert('Please log in first!');
      return;
    }

    try {
      const response = await fetch('/api/createProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await response.json();
      if (!response.ok || !data.project_id) {
        alert(data.error || 'Something went wrong');
        return;
      }

      alert('✅ Project created successfully!');
      setProjects([...projects, data]);
      localStorage.setItem(`project_type_${data.project_id}`, destination);

      const route = destination === "websitespace"
        ? `/websitespace?project_id=${data.project_id}`
        : `/workspace?project_id=${data.project_id}`;

      router.push(route);
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      alert('Failed to create project');
    }
  };

  const handleMenuClick = (e, index) => {
    e.stopPropagation();
    setMenuIndex(menuIndex === index ? null : index);
  };

  const handleDelete = async (e, project_id) => {
  e.stopPropagation();
  const confirmDelete = window.confirm("Are you sure you want to delete this project?");
  if (!confirmDelete) return;

  try {
    const response = await fetch('/api/deleteProject', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project_id }),
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || 'Failed to delete project');
      return;
    }

    alert('✅ Project deleted!');
    setProjects((prev) => prev.filter((proj) => proj.project_id !== project_id));
  } catch (err) {
    console.error('❌ Error deleting project:', err);
    alert('Failed to delete project');
  }
};


  const handleMove = (e, project_id) => {
    e.stopPropagation();
    alert(`Move project ${project_id}`);
    // TODO: connect with move logic
  };

  const handleArchive = (e, project_id) => {
    e.stopPropagation();
    alert(`Archive project ${project_id}`);
    // TODO: connect with archive logic
  };

  useEffect(() => {
  const handleClickOutside = (e) => {
    const projectCards = document.querySelectorAll(`.${styles.projectCard}`);
    const clickedInsideCard = Array.from(projectCards).some(card => card.contains(e.target));
    if (!clickedInsideCard) setMenuIndex(null);
  };

  window.addEventListener("click", handleClickOutside);
  return () => window.removeEventListener("click", handleClickOutside);
}, []);


  return (
    <>
      <div className={styles.bar}>
        <img className={styles.logo} src="/pic/logo.png" alt="Logo" />
      </div>

      <div className={styles.sidebar}>
        <ul>
          <li className={styles.active}>Projects</li>
          <li>Folders</li>
          <li>Archive</li>
        </ul>
      </div>

      <div className={styles.main}>
        <header className={styles.header}>
        <h1>My Projects</h1>
          <div className={styles.searchContainer}>
          <input
  type="text"
  placeholder="Search"
  className={styles.searchInput}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

          </div>
        </header>


        <div className={styles.topBar}>
          <img className={styles.accicon} src="/pic/Account.png" alt="Acc" />
          <img className={styles.listicon} src="/pic/List.png" alt="List" />
          <img className={styles.icon} src="/pic/Icons.png" alt="Icons" />
          <img className={styles.sorticon} src="/pic/Sorting.png" alt="Sort" />
          <div className={styles.dropdownContainer}>
            <button className={styles.createProjectButton} onClick={toggleDropdown}>
              Create project
            </button>
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <div
                  className={styles.dropdownItem}
                  onClick={() => createProjectAndNavigate('workspace')}
                >
                  <strong>Work Project</strong>
                  <p>Enable to generate UI preview</p>
                </div>
                <hr className={styles.divider} />
                <div
                  className={styles.dropdownItem}
                  onClick={() => createProjectAndNavigate('websitespace')}
                >
                  <strong>Website Project</strong>
                </div>
              </div>
            )}

            <button
  className={styles.createProjectButton}
  onClick={async () => {
    router.push('/sharedprojects');
  }}
>
  View Shared Projects
</button>
          </div>
        </div>

        <div className={styles.projectsContainer}>
          {projects.filter(project =>
  (project.project_name || "Untitled").toLowerCase().includes(searchTerm.toLowerCase())
).length > 0 ? (
  projects
    .filter(project =>
      (project.project_name || "Untitled").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((project, index) => {

              if (!project.project_id) return null;

              return (
  <div
    key={project.project_id || `fallback-${index}`}
    className={styles.projectCard}
    onClick={() => {
      const savedDestination = localStorage.getItem(`project_type_${project.project_id}`);
      const destination = savedDestination === "websitespace"
        ? `/websitespace?project_id=${project.project_id}`
        : `/workspace?project_id=${project.project_id}`;
      router.push(destination);
    }}
  >
    <div className={styles.cardIcon}>
      🗂️
    </div>
    <h3>{project.project_name || "Untitled"}</h3>
    <button
      className={styles.optionsButton}
      onClick={(e) => handleMenuClick(e, index)}
    >
      ⋯
    </button>

    {menuIndex === index && (
      <div className={styles.optionsMenu}>
        <button onClick={(e) => handleDelete(e, project.project_id)}>Delete</button>
        <button onClick={(e) => handleMove(e, project.project_id)}>Move</button>
        <button onClick={(e) => handleArchive(e, project.project_id)}>Archive</button>
      </div>
    )}
  </div>
);
            })
          ) : (
            <p>No projects found. Create a new one!</p>
          )}
        </div>
      </div>
    </>
  );
}
