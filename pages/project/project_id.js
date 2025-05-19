import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const { project_id } = router.query;
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (project_id) {
      fetch(`/api/getProject?project_id=${project_id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📜 Project Data:", data);
          setProject(data);
        })
        .catch((err) => console.error("❌ Error fetching project:", err));
    }
  }, [project_id]);

  // ✅ Load saved progress when opening the project
  useEffect(() => {
    if (project_id) {
      const savedData = localStorage.getItem(`project_${project_id}`);
      if (savedData) {
        console.log("✅ Loaded saved project:", project_id);
      } else {
        console.warn("❌ No saved progress found.");
      }
    }
  }, [project_id]);

  if (!project) return <p>Loading workspace...</p>;

  return (
    <div>
      <h1>Workspace: {project.project_name}</h1>
      <p>Project ID: {project.project_id}</p>
    </div>
  );
}
