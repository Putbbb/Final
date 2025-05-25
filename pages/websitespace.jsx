import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Websitespace.module.css";
import Template from "./Template";
import Toolbox from "./Toolbox";
import { useRouter } from "next/router";
import { generateSQL } from "./generateSQL";
import { useSession } from "next-auth/react";
 

export default function Websitespace() {
  const containerRef = useRef(null);
  const [sql, setSql] = useState("");
  const [zoom, setZoom] = useState(100);
  const [mode, setMode] = useState("select");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [expanded, setExpanded] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showModal, setShowModal] = useState(false); 
  const graphRef = useRef(null);
  const toolbarRef = useRef(null);
  const [activePanel, setActivePanel] = useState(null); // "templates", "toolbox", or null
  const [projectName, setProjectName] = useState("Untitled");
  const [inputValue, setInputValue] = useState("Untitled");
  const router = useRouter();
  const projectId = parseInt(router.query.project_id);
  const [isSaved, setIsSaved] = useState(true);
  const undoManagerRef = useRef(null);
  const [validationError, setValidationError] = useState("");
  const { data: session } = useSession();
  const shareId = router.query.share_id;
  const isShared = !!shareId; // true if viewing shared project


  useEffect(() => {
    // Register doubleLine shape globally (for restore)
    if (
      typeof window !== "undefined" &&
      window.mxGraph &&
      (!window.mxCellRenderer.prototype.shapes?.doubleLine)
    ) {
      function DoubleLineShape() {}
      DoubleLineShape.prototype = new window.mxConnector();
      DoubleLineShape.prototype.constructor = DoubleLineShape;

      DoubleLineShape.prototype.paintEdgeShape = function (c, pts) {
        c.begin();
        this.paintLine(c, pts, true);
        c.stroke();

        const offset = 4;
        const newPts = pts.map((p) => new window.mxPoint(p.x, p.y + offset));
        c.begin();
        this.paintLine(c, newPts, true);
        c.stroke();
      };

      window.mxCellRenderer.registerShape("doubleLine", DoubleLineShape);
    }

  }, []);

  useEffect(() => {
  if (shareId) {
    // ✅ CORRECT endpoint for loading a single shared project
    fetch(`/api/getSharedProject?share_id=${shareId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.projectData && graphRef.current) {
          const xml = mxUtils.parseXml(data.projectData);
          const decoder = new mxCodec(xml);
          const node = xml.documentElement;
          decoder.decode(node, graphRef.current.getModel());

          setProjectName(data.projectName);
          setInputValue(data.projectName);
          graphRef.current.setEnabled(true); // 🔒 Read-only
        }
      })
      .catch((err) => {
        console.error("❌ Error loading shared project:", err);
        alert("Failed to load shared project.");
      });
    } else if (projectId) {
    fetch(`/api/getSingleProject?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.projectName) {
          setProjectName(data.projectName);
          setInputValue(data.projectName);

          // ✅ Load the saved XML into mxGraph
            if (data.projectData && graphRef.current) {
              try {
                // Ensure doubleLine shape is registered before decoding
                if (
                  typeof window !== "undefined" &&
                  window.mxGraph &&
                  (!window.mxCellRenderer.prototype.shapes?.doubleLine)
                ) {
                  function DoubleLineShape() {}
                  DoubleLineShape.prototype = new window.mxConnector();
                  DoubleLineShape.prototype.constructor = DoubleLineShape;

                  DoubleLineShape.prototype.paintEdgeShape = function (c, pts) {
                    c.begin();
                    this.paintLine(c, pts, true);
                    c.stroke();

                    const offset = 4;
                    const newPts = pts.map((p) => new window.mxPoint(p.x, p.y + offset));
                    c.begin();
                    this.paintLine(c, newPts, true);
                    c.stroke();
                  };

                  window.mxCellRenderer.registerShape("doubleLine", DoubleLineShape);
                }

                const xml = mxUtils.parseXml(data.projectData);
                const decoder = new mxCodec(xml);
                const node = xml.documentElement;

              decoder.decode(node, graphRef.current.getModel());
              const graph = graphRef.current;

              graph.isCellResizable = function(cell) {
                return !cell.parent || cell.parent === graph.getDefaultParent();
              };

              graph.isCellSelectable = function(cell) {
                return !cell.parent || cell.parent === graph.getDefaultParent();
              };

              const model = graph.getModel();
              model.beginUpdate();
              try {
              Object.values(model.cells).forEach((cell) => {
                if (cell.vertex && Array.isArray(cell.children) && cell.children.length > 0) {
                  const outer = cell;
                  outer.children.forEach((child) => {
                    if (child.geometry && outer.geometry) {
                      child.geometry.x = 5;
                      child.geometry.y = 5;
                      child.geometry.width = outer.geometry.width - 10;
                      child.geometry.height = outer.geometry.height - 10;
                      child.visible = true; // ✅ make sure it renders

                      child.setConnectable(false);
                      child.setResizable(false);
                      graph.setCellStyles("resizable", "0", [child]);
                      graph.setCellStyles("movable", "0", [child]);
                      graph.setCellStyles("deletable", "0", [child]);

                    }
                });
                    graph.isCellSelectable = (cell) => {
                        return !cell.parent || cell.parent === graph.getDefaultParent();
                      };


                  model.setGeometry(cell, cell.geometry);
              }
            });

            } finally {
              model.endUpdate();
              graph.refresh();
            }
              generateSQL(graphRef, setSql, setValidationError);
            } catch (error) {
                console.error("Error loading diagram:", error);
              }
          }
        } else {
          console.error("Project not found");
        }
      })
      .catch((err) => console.error("❌ Error loading project:", err));
  }
}, [projectId,shareId]);


  const handleGenerateSQL = () => {
    generateSQL(graphRef, setSql,setValidationError); // ✅ pass both, and don't assign return value
  };

  const handleChangeProjectName = async () => {
    const newName = prompt("Enter new project name:");
    if (!newName) return;

  const project_id = parseInt(router.query.project_id);
    if (!project_id) {
      alert("Project ID not found in URL");
      return;
    }

    try {
      const response = await fetch('/api/updateProjectName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project_id, newProjectName: newName }),
    });

      const result = await response.json();
        if (result.success) {
          alert('✅ Project name updated!');
          setProjectName(newName);
          setInputValue(newName);
        } else {
          alert(result.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('❌ Error changing project name:', error);
        alert('Failed to change project name.');
      }
    };

  const handleSaveProject = async () => {
    if (!graphRef.current) {
      alert("Graph is not initialized yet!");
      return;
      }

  const encoder = new mxCodec();
  const node = encoder.encode(graphRef.current.getModel());
  const xml = mxUtils.getXml(node);

  const response = await fetch("/api/saveProject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: projectId,
      projectData: xml,
      projectName: projectName,
    }),
  });

  const result = await response.json();
  if (result.success) {
    alert("✅ Project saved successfully!");
    setIsSaved(true);
  } else {
    alert("❌ Failed to save the project.");
  }
};

const handleExportSQL = () => {
  if (!sql) {
    alert("No SQL to export!");
    return;
  }

  const blob = new Blob([sql], { type: "text/sql" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName || "project"}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleExportDiagram = () => {
  if (!graphRef.current) {
    alert("Graph is not initialized.");
    return;
  }

  const graph = graphRef.current;

  const scale = 1;
  const bounds = graph.getGraphBounds();
  const svgDoc = mxUtils.createXmlDocument();
  const svgRoot = svgDoc.createElementNS("http://www.w3.org/2000/svg", "svg");

  svgRoot.setAttribute("width", Math.ceil(bounds.width * scale + 10));
  svgRoot.setAttribute("height", Math.ceil(bounds.height * scale + 10));
  svgRoot.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgRoot.setAttribute("version", "1.1");

  svgDoc.appendChild(svgRoot);

  const svgCanvas = new mxSvgCanvas2D(svgRoot);
  svgCanvas.translate(-bounds.x + 5, -bounds.y + 5);
  svgCanvas.scale(scale);

  const imgExport = new mxImageExport();
  imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

  const svgData = new XMLSerializer().serializeToString(svgRoot);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });

  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // Optional: white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const pngDataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = `${projectName || "diagram"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  image.src = url;
};







useEffect(() => {
  const handleRouteChange = (url) => {
    if (!isSaved && !confirm("You have unsaved changes. Are you sure you want to leave?")) {
      router.events.emit("routeChangeError");
      throw "Route change aborted.";
    }
  };

  router.events.on("routeChangeStart", handleRouteChange);
  return () => {
    router.events.off("routeChangeStart", handleRouteChange);
  };
}, [isSaved]);

// 🔽 INSERT BELOW THIS
useEffect(() => {
  const handleBeforeUnload = (event) => {
    if (!isSaved) {
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [isSaved]);




useEffect(() => {
  if (!window.mxEvent) return;

  const checkAndAttachListener = () => {
    if (graphRef.current && graphRef.current.getModel) {
      const model = graphRef.current.getModel();
      const mxEvent = window.mxEvent;

      const markUnsaved = () => {
        console.log("🔄 Marked unsaved");
        setIsSaved(false);
      };

      model.addListener(mxEvent.CHANGE, markUnsaved);

      return () => {
        model.removeListener(mxEvent.CHANGE, markUnsaved);
      };
    }
  };

  const cleanup = checkAndAttachListener();
  return cleanup || undefined;
}, [graphRef.current]);




  useEffect(() => {
    // Dynamically load mxClient.js
    const script = document.createElement("script");
    script.src = "/mxClient.js"; // Path to mxClient.js in public folder
    script.onload = initGraph; // Call initGraph after mxClient.js loads
    document.body.appendChild(script);


    function initGraph() {
      if (!window.mxClient) {
        console.error("mxClient failed to load. Check the path.");
        return;
      }
    
      if (!mxClient.isBrowserSupported()) {
        console.error("Browser not supported by mxGraph.");
        return;
      }
    
      const container = containerRef.current;
      const graph = new window.mxGraph(container);
      graphRef.current = graph;
      const parent = graph.getDefaultParent();
      graph.setPanning(true);
      graph.panningHandler.useLeftButtonForPanning = true;


      const undoManager = new window.mxUndoManager();
      undoManagerRef.current = undoManager;


      const listener = (sender, evt) => {
        undoManager.undoableEditHappened(evt.getProperty("edit"));
      };

      graph.getModel().addListener(window.mxEvent.UNDO, listener);
      graph.getView().addListener(window.mxEvent.UNDO, listener);

    
      console.log("Initializing Graph...");
    
      graph.getModel().beginUpdate();
      graph.setCellsSelectable(true);
      graph.setCellsMovable(true);
      graph.graphHandler.moveEnabled = true;
      graph.graphHandler.setSelectEnabled(true);
      graph.container.style.cursor = "default";
      new window.mxRubberband(graph);
      graph.getModel().endUpdate();

      if (!projectId && !shareId) {
      const savedData = localStorage.getItem("graphData");
      if (savedData) {
        const doc = window.mxUtils.parseXml(savedData);
        const codec = new window.mxCodec(doc);
        codec.decode(doc.documentElement, graph.getModel());
      }
    }

            // Listen to model changes and save automatically
      graph.getModel().addListener(window.mxEvent.CHANGE, () => {
        const encoder = new window.mxCodec();
        const node = encoder.encode(graph.getModel());
        const xml = window.mxUtils.getXml(node);
        localStorage.setItem("graphData", xml);
      });

      document.addEventListener("keydown", (event) => {
        if (!containerRef.current || !containerRef.current.graph) return;
        const graph = containerRef.current.graph;


        if (
  event.key === "Backspace" &&
  !(event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable)
) {
  if (graph.isEnabled() && !graph.isEditing()) {
    graph.removeCells(graph.getSelectionCells()); // 🚀 Delete selected elements
    event.preventDefault(); // Prevent browser's back behavior
  }
}

        if ((event.ctrlKey || event.metaKey) && event.key === "z") {
          if (graph.isEnabled() && graph.undoManager) {
            graph.undoManager.undo(); 
            event.preventDefault(); 
          }
        }

        if ((event.ctrlKey || event.metaKey) && event.key === "y") {
          if (graph.isEnabled() && graph.undoManager) {
            graph.undoManager.redo(); 
            event.preventDefault();
          }
        }
      });

      container.graph = graph; 
      container.parent = graph.getDefaultParent();

      // 🔥 Save the graph globally for debugging in the console
      window.graph = graph; 
   

    };
    
  }, []);

 
  const toggleMode = (newMode) => {
    setMode(newMode);
    const container = containerRef.current;
    if (container?.graph) {
      const graph = container.graph;
  
      console.log("Switching to Mode:", newMode);
      console.log("Graph Handler Object:", graph.graphHandler);
  
      graph.getModel().beginUpdate(); // 🔥 Force graph to apply changes
  
      if (newMode === "select") {
        console.log("✅ Enabling Select Mode");
  
        // ✅ Disable Panning Mode
        graph.setPanning(false);
        graph.panningHandler.useLeftButtonForPanning = false;
  
        // ✅ Enable Object Movement
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
        graph.graphHandler.moveEnabled = true;
        graph.graphHandler.setSelectEnabled(true);
        graph.container.style.cursor = "default";
  
        // ✅ Enable drag interaction
        graph.graphHandler.guidesEnabled = true;
      } 
      else if (newMode === "pan") {
        console.log("✅ Enabling Pan Mode");
  
        // ✅ Enable Panning
        graph.setPanning(true);
        graph.panningHandler.useLeftButtonForPanning = true;
  
        // ❌ Disable Object Movement
        graph.setCellsSelectable(false);
        graph.graphHandler.setSelectEnabled(false);
        graph.graphHandler.moveEnabled = false;
  
        graph.container.style.cursor = "grab";
        graph.panningHandler.ignoreCell = true;
        graph.panningHandler.isForcePanningEvent = (me) => {
          return (
            me.getState() == null ||
            me.getState().cell == null ||
            me.getEvent().metaKey ||
            me.getEvent().ctrlKey ||
            me.getEvent().button === 1
          );
        };
      }
  
      graph.getModel().endUpdate(); // 🔥 Apply the changes
    }
  };

  const zoomIn = () => {
    if (zoom < 150) {
      const newZoom = zoom + 25;
      setZoom(newZoom);
      applyZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (zoom > 25) {
      const newZoom = zoom - 25;
      setZoom(newZoom);
      applyZoom(newZoom);
    }
  };

    
  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
    console.log("Sidebar expanded:", !isSidebarExpanded);
  };

  const toggleCategory = (category) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

 
 const handleTemplateClick = (template) => {
    setShowModal(true);

    setTimeout(() => {
      if (!graphRef.current) {
          console.error("Graph is not initialized yet!");
          return;
      }
      const graph = graphRef.current;
      const parent = graph.getDefaultParent();
      const container = containerRef.current;

      if (!container) {
          console.error("Graph container is missing!");
          return;
      }

      graph.getModel().clear();
      if (template === "Personal Website") {
        createPersonalWebsiteTemplate();
      } else if (template === "Educational Website") {
        createEducationalWebsiteTemplate();
      } else if (template === "Blog/Content Website") {
        createBlogContentWebsiteTemplate();
      } else if (template == "Entertainment Website") {
        createEntertainmentWebsiteTemplate();
      } else if (template == "Eyeglasses Website") {
        createEyeglassesWebsiteTemplate();
      }

      const layout = new mxHierarchicalLayout(graph);
      layout.orientation = mxConstants.DIRECTION_WEST;
      layout.execute(parent);

      // Center the diagram in the workspace
      const bounds = graph.getGraphBounds();
      const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
      const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
      graph.view.setTranslate(x, y);
      
    }, 200);
  };

  const handleZoomChange = (event) => {
    const zoomLevel = parseInt(event.target.value, 10);
    setZoom(zoomLevel);
    applyZoom(zoomLevel);
  };

  const applyZoom = (zoomLevel) => {
    const container = containerRef.current;
    if (container?.graph) {
      const graph = container.graph;
      const scale = zoomLevel / 100;
      graph.view.scaleAndTranslate(scale, 0, 0);
    }
  };

  const handlePanelToggle = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const createPersonalWebsiteTemplate = () => {
      const container = containerRef.current;
      if (!container) return;
    
      const graph = window.graph; // Ensure we're using the global graph instance
      const parent = graph.getDefaultParent();
    
      graph.getModel().beginUpdate();
      try {

        console.log("Creating ER Diagram...");

        // ✅ Ensure cells are selectable and movable
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
        // Define main entities (rectangles)
        const vertexStyle = "shape=rectangle;fillColor=lightgray;fontColor=black;movable=1";
    
        const userVertex = graph.insertVertex(parent, null, "User", 50, 150, 140, 60, vertexStyle);
        const websiteVertex = graph.insertVertex(parent, null, "Website", 250, 150, 140, 60, vertexStyle);
        const pageVertex = graph.insertVertex(parent, null, "Page", 450, 150, 140, 60, vertexStyle);
        const componentVertex = graph.insertVertex(parent, null, "Component", 650, 80, 140, 60, vertexStyle);
        const mediaVertex = graph.insertVertex(parent, null, "Media", 650, 220, 140, 60, vertexStyle);
        const formVertex = graph.insertVertex(parent, null, "Form", 850, 150, 140, 60, vertexStyle);
        const submissionVertex = graph.insertVertex(parent, null, "Form Submission", 1050, 150, 160, 60, vertexStyle);
    
        // ✅ Ensure relationships (diamonds) are also movable
        const relationStyle = "shape=rhombus;fillColor=lightblue;fontColor=black;movable=1";
        const ownsVertex = graph.insertVertex(parent, null, "Owns", 160, 160, 60, 50, relationStyle);
        const containsVertex = graph.insertVertex(parent, null, "Contains", 360, 160, 60, 50, relationStyle);
        const hasVertex = graph.insertVertex(parent, null, "Has", 560, 90, 60, 50, relationStyle);
        const includesVertex = graph.insertVertex(parent, null, "Includes", 560, 230, 60, 50, relationStyle);
        const submitsVertex = graph.insertVertex(parent, null, "Submits", 960, 160, 60, 50, relationStyle);
    
        // ✅ Make attributes (ellipses) movable
        const attributeStyle = "shape=ellipse;fillColor=lightgreen;fontColor=black;movable=1";
        const userId = graph.insertVertex(parent, null, "user_id", 20, 80, 100, 40, attributeStyle);
        const websiteTitle = graph.insertVertex(parent, null, "title", 220, 80, 100, 40, attributeStyle);
        const pageName = graph.insertVertex(parent, null, "page_name", 420, 80, 100, 40, attributeStyle);
        const mediaType = graph.insertVertex(parent, null, "file_type", 620, 280, 100, 40, attributeStyle);
        const formName = graph.insertVertex(parent, null, "form_name", 820, 80, 100, 40, attributeStyle);
        const submissionData = graph.insertVertex(parent, null, "user_input", 1020, 80, 120, 40, attributeStyle);
    
        // Define relationships (without arrows)
        const style = "edgeStyle=elbowEdgeStyle;strokeColor=black;endArrow=none;";
    
        graph.insertEdge(parent, null, "1", userVertex, ownsVertex, style);
        graph.insertEdge(parent, null, "M", ownsVertex, websiteVertex, style);
    
        graph.insertEdge(parent, null, "1", websiteVertex, containsVertex, style);
        graph.insertEdge(parent, null, "M", containsVertex, pageVertex, style);
    
        graph.insertEdge(parent, null, "1", pageVertex, hasVertex, style);
        graph.insertEdge(parent, null, "M", hasVertex, componentVertex, style);
    
        graph.insertEdge(parent, null, "1", pageVertex, includesVertex, style);
        graph.insertEdge(parent, null, "M", includesVertex, formVertex, style);
    
        graph.insertEdge(parent, null, "1", formVertex, submitsVertex, style);
        graph.insertEdge(parent, null, "M", submitsVertex, submissionVertex, style);
    
        graph.insertEdge(parent, null, "1", componentVertex, mediaVertex, style);
    
        // Connect attributes
        graph.insertEdge(parent, null, "", userVertex, userId, style);
        graph.insertEdge(parent, null, "", websiteVertex, websiteTitle, style);
        graph.insertEdge(parent, null, "", pageVertex, pageName, style);
        graph.insertEdge(parent, null, "", mediaVertex, mediaType, style);
        graph.insertEdge(parent, null, "", formVertex, formName, style);
        graph.insertEdge(parent, null, "", submissionVertex, submissionData, style);

        const layout = new mxHierarchicalLayout(graph);
        layout.orientation = mxConstants.DIRECTION_WEST; // 🔄 Set to Horizontal Layout
        layout.execute(parent);
    
        // Center the diagram in the workspace
        const bounds = graph.getGraphBounds();
        const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
        const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
        graph.view.setTranslate(x, y);
    
      } finally {
        graph.getModel().endUpdate();
      }
    };

    const createEducationalWebsiteTemplate = () => {
      const container = containerRef.current;
      if (!container) return;
    
      const graph = window.graph; // Use global graph instance
      const parent = graph.getDefaultParent();
    
      graph.getModel().beginUpdate();
      try {
        console.log("Creating Educational Website ER Diagram...");
    
        // ✅ Ensure cells are selectable & movable
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
    
        // ✅ Define styles
        const entityStyle = "shape=rectangle;fillColor=lightgray;fontColor=black;movable=1";
        const relationStyle = "shape=rhombus;fillColor=lightblue;fontColor=black;movable=1";
        const attributeStyle = "shape=ellipse;fillColor=lightgreen;fontColor=black;movable=1";
    
        // ✅ Define Entities
        const student = graph.insertVertex(parent, null, "Student", 50, 150, 140, 60, entityStyle);
        const teacher = graph.insertVertex(parent, null, "Teacher", 250, 50, 140, 60, entityStyle);
        const course = graph.insertVertex(parent, null, "Course", 250, 250, 140, 60, entityStyle);
        const lesson = graph.insertVertex(parent, null, "Lesson", 450, 250, 140, 60, entityStyle);
        const exam = graph.insertVertex(parent, null, "Exam", 650, 250, 140, 60, entityStyle);
        const submission = graph.insertVertex(parent, null, "Submission", 850, 250, 140, 60, entityStyle);
    
        // ✅ Define Relationships
        const enrollsIn = graph.insertVertex(parent, null, "Enrolls In", 160, 180, 80, 50, relationStyle);
        const teaches = graph.insertVertex(parent, null, "Teaches", 260, 120, 80, 50, relationStyle);
        const has = graph.insertVertex(parent, null, "Has", 360, 250, 80, 50, relationStyle);
        const takes = graph.insertVertex(parent, null, "Takes", 560, 250, 80, 50, relationStyle);
        const submits = graph.insertVertex(parent, null, "Submits", 760, 250, 80, 50, relationStyle);
    
        // ✅ Define Attributes
        const studentId = graph.insertVertex(parent, null, "student_id", 20, 80, 100, 40, attributeStyle);
        const teacherId = graph.insertVertex(parent, null, "teacher_id", 220, 10, 100, 40, attributeStyle);
        const courseName = graph.insertVertex(parent, null, "course_name", 220, 320, 100, 40, attributeStyle);
        const lessonTitle = graph.insertVertex(parent, null, "lesson_title", 420, 320, 100, 40, attributeStyle);
        const examScore = graph.insertVertex(parent, null, "exam_score", 620, 320, 100, 40, attributeStyle);
        const submissionDate = graph.insertVertex(parent, null, "submission_date", 820, 320, 120, 40, attributeStyle);
    
        // ✅ Define Edges (Relationships)
        const style = "edgeStyle=orthogonalEdgeStyle;strokeColor=black;endArrow=none;rounded=1;";

        graph.insertEdge(parent, null, "1", student, enrollsIn, style);
        graph.insertEdge(parent, null, "M", enrollsIn, course, style);
        
        graph.insertEdge(parent, null, "1", teacher, teaches, style);
        graph.insertEdge(parent, null, "M", teaches, course, style);
        
        graph.insertEdge(parent, null, "1", course, has, style);
        graph.insertEdge(parent, null, "M", has, lesson, style);
        
        graph.insertEdge(parent, null, "1", student, takes, style);
        graph.insertEdge(parent, null, "M", takes, exam, style);
        
        graph.insertEdge(parent, null, "1", student, submits, style);
        graph.insertEdge(parent, null, "M", submits, submission, style);
        
    
        // ✅ Connect Attributes
        graph.insertEdge(parent, null, "", student, studentId, style);
        graph.insertEdge(parent, null, "", teacher, teacherId, style);
        graph.insertEdge(parent, null, "", course, courseName, style);
        graph.insertEdge(parent, null, "", lesson, lessonTitle, style);
        graph.insertEdge(parent, null, "", exam, examScore, style);
        graph.insertEdge(parent, null, "", submission, submissionDate, style);

        const layout = new mxHierarchicalLayout(graph);
        layout.orientation = mxConstants.DIRECTION_WEST; // 🔄 Set to Horizontal Layout
        layout.execute(parent);
    
        console.log("Educational Website ER Diagram Created! ✅");
        const bounds = graph.getGraphBounds();
        const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
        const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
        graph.view.setTranslate(x, y);
    
      } finally {
        graph.getModel().endUpdate();
      }
    };

    const createBlogContentWebsiteTemplate = () => {
      const container = containerRef.current;
      if (!container) return;
    
      const graph = window.graph; // Use the global graph instance
      const parent = graph.getDefaultParent();
    
      graph.getModel().beginUpdate();
      try {
        console.log("Creating Blog/Content Website ER Diagram...");
    
        // ✅ Ensure cells are selectable & movable
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
    
        // ✅ Define styles
        const entityStyle = "shape=rectangle;fillColor=lightgray;fontColor=black;movable=1";
        const relationStyle = "shape=rhombus;fillColor=lightblue;fontColor=black;movable=1";
        const attributeStyle = "shape=ellipse;fillColor=lightgreen;fontColor=black;movable=1";
    
        // ✅ Define Entities
        const user = graph.insertVertex(parent, null, "User", 50, 150, 140, 60, entityStyle);
        const post = graph.insertVertex(parent, null, "Post", 250, 150, 140, 60, entityStyle);
        const comment = graph.insertVertex(parent, null, "Comment", 450, 150, 140, 60, entityStyle);
        const category = graph.insertVertex(parent, null, "Category", 250, 50, 140, 60, entityStyle);
        const tag = graph.insertVertex(parent, null, "Tag", 250, 250, 140, 60, entityStyle);
        const media = graph.insertVertex(parent, null, "Media", 450, 250, 140, 60, entityStyle);
    
        // ✅ Define Relationships
        const writes = graph.insertVertex(parent, null, "Writes", 160, 160, 80, 50, relationStyle);
        const has = graph.insertVertex(parent, null, "Has", 360, 160, 80, 50, relationStyle);
        const belongsTo = graph.insertVertex(parent, null, "Belongs To", 260, 100, 80, 50, relationStyle);
        const taggedWith = graph.insertVertex(parent, null, "Tagged With", 260, 220, 80, 50, relationStyle);
        const includes = graph.insertVertex(parent, null, "Includes", 460, 220, 80, 50, relationStyle);
    
        // ✅ Define Attributes
        const userId = graph.insertVertex(parent, null, "user_id", 20, 80, 100, 40, attributeStyle);
        const username = graph.insertVertex(parent, null, "username", 20, 220, 100, 40, attributeStyle);
    
        const postId = graph.insertVertex(parent, null, "post_id", 220, 80, 100, 40, attributeStyle);
        const title = graph.insertVertex(parent, null, "title", 220, 280, 100, 40, attributeStyle);
        const content = graph.insertVertex(parent, null, "content", 320, 80, 100, 40, attributeStyle);
    
        const commentId = graph.insertVertex(parent, null, "comment_id", 420, 80, 100, 40, attributeStyle);
        const commentText = graph.insertVertex(parent, null, "comment_text", 420, 220, 120, 40, attributeStyle);
    
        const categoryId = graph.insertVertex(parent, null, "category_id", 220, 10, 100, 40, attributeStyle);
        const categoryName = graph.insertVertex(parent, null, "category_name", 320, 10, 120, 40, attributeStyle);
    
        const tagId = graph.insertVertex(parent, null, "tag_id", 220, 320, 100, 40, attributeStyle);
        const tagName = graph.insertVertex(parent, null, "tag_name", 320, 320, 100, 40, attributeStyle);
    
        const mediaId = graph.insertVertex(parent, null, "media_id", 420, 320, 100, 40, attributeStyle);
        const fileType = graph.insertVertex(parent, null, "file_type", 520, 320, 100, 40, attributeStyle);
    
        // ✅ Define Edges (Relationships)
        const style = "edgeStyle=orthogonalEdgeStyle;strokeColor=black;endArrow=none;rounded=1;";
    
        graph.insertEdge(parent, null, "1", user, writes, style);
        graph.insertEdge(parent, null, "M", writes, post, style);
    
        graph.insertEdge(parent, null, "1", post, has, style);
        graph.insertEdge(parent, null, "M", has, comment, style);
    
        graph.insertEdge(parent, null, "1", post, belongsTo, style);
        graph.insertEdge(parent, null, "M", belongsTo, category, style);
    
        graph.insertEdge(parent, null, "1", post, taggedWith, style);
        graph.insertEdge(parent, null, "M", taggedWith, tag, style);
    
        graph.insertEdge(parent, null, "1", post, includes, style);
        graph.insertEdge(parent, null, "M", includes, media, style);
    
        // ✅ Connect Attributes
        graph.insertEdge(parent, null, "", user, userId, style);
        graph.insertEdge(parent, null, "", user, username, style);
    
        graph.insertEdge(parent, null, "", post, postId, style);
        graph.insertEdge(parent, null, "", post, title, style);
        graph.insertEdge(parent, null, "", post, content, style);
    
        graph.insertEdge(parent, null, "", comment, commentId, style);
        graph.insertEdge(parent, null, "", comment, commentText, style);
    
        graph.insertEdge(parent, null, "", category, categoryId, style);
        graph.insertEdge(parent, null, "", category, categoryName, style);
    
        graph.insertEdge(parent, null, "", tag, tagId, style);
        graph.insertEdge(parent, null, "", tag, tagName, style);
    
        graph.insertEdge(parent, null, "", media, mediaId, style);
        graph.insertEdge(parent, null, "", media, fileType, style);
    
        console.log("Blog/Content Website ER Diagram Created! ✅");
    
        const layout = new mxHierarchicalLayout(graph);
        layout.orientation = mxConstants.DIRECTION_WEST; // 🔄 Set to Horizontal Layout
        layout.execute(parent);
    
        // Center the diagram in the workspace
        const bounds = graph.getGraphBounds();
        const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
        const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
        graph.view.setTranslate(x, y);
    
      } finally {
        graph.getModel().endUpdate();
      }
    };

    const createEntertainmentWebsiteTemplate = () => {
      const container = containerRef.current;
      if (!container) return;
    
      const graph = window.graph; // Use the global graph instance
      const parent = graph.getDefaultParent();
    
      graph.getModel().beginUpdate();
      try {
        console.log("Creating Entertainment Website ER Diagram...");
    
        // ✅ Ensure cells are selectable & movable
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
    
        // ✅ Define styles
        const entityStyle = "shape=rectangle;fillColor=lightgray;fontColor=black;movable=1";
        const relationStyle = "shape=rhombus;fillColor=lightblue;fontColor=black;movable=1";
        const attributeStyle = "shape=ellipse;fillColor=lightgreen;fontColor=black;movable=1";
    
        // ✅ Define Entities
        const user = graph.insertVertex(parent, null, "User", 50, 150, 140, 60, entityStyle);
        const subscription = graph.insertVertex(parent, null, "Subscription", 250, 50, 140, 60, entityStyle);
        const movie = graph.insertVertex(parent, null, "Movie", 250, 150, 140, 60, entityStyle);
        const tvShow = graph.insertVertex(parent, null, "TV Show", 250, 250, 140, 60, entityStyle);
        const music = graph.insertVertex(parent, null, "Music", 250, 350, 140, 60, entityStyle);
        const review = graph.insertVertex(parent, null, "Review", 450, 150, 140, 60, entityStyle);
        const category = graph.insertVertex(parent, null, "Category", 450, 50, 140, 60, entityStyle);
        const media = graph.insertVertex(parent, null, "Media", 650, 150, 140, 60, entityStyle);
    
        // ✅ Define Relationships
        const subscribes = graph.insertVertex(parent, null, "Subscribes", 160, 90, 80, 50, relationStyle);
        const reviews = graph.insertVertex(parent, null, "Reviews", 360, 150, 80, 50, relationStyle);
        const belongsTo1 = graph.insertVertex(parent, null, "Belongs To", 360, 80, 80, 50, relationStyle);
        const belongsTo2 = graph.insertVertex(parent, null, "Belongs To", 360, 280, 80, 50, relationStyle);
        const belongsTo3 = graph.insertVertex(parent, null, "Belongs To", 360, 380, 80, 50, relationStyle);
        const includes = graph.insertVertex(parent, null, "Includes", 560, 150, 80, 50, relationStyle);
    
        // ✅ Define Attributes
        const userId = graph.insertVertex(parent, null, "user_id", 20, 80, 100, 40, attributeStyle);
        const username = graph.insertVertex(parent, null, "username", 20, 220, 100, 40, attributeStyle);
    
        const subscriptionId = graph.insertVertex(parent, null, "subscription_id", 220, 10, 120, 40, attributeStyle);
        const subscriptionType = graph.insertVertex(parent, null, "subscription_type", 320, 10, 140, 40, attributeStyle);
    
        const movieId = graph.insertVertex(parent, null, "movie_id", 220, 100, 100, 40, attributeStyle);
        const tvShowId = graph.insertVertex(parent, null, "tvshow_id", 220, 280, 100, 40, attributeStyle);
        const musicId = graph.insertVertex(parent, null, "music_id", 220, 380, 100, 40, attributeStyle);
        const title = graph.insertVertex(parent, null, "title", 320, 100, 100, 40, attributeStyle);
        const genre = graph.insertVertex(parent, null, "genre", 320, 280, 100, 40, attributeStyle);
        const releaseDate = graph.insertVertex(parent, null, "release_date", 320, 380, 120, 40, attributeStyle);
    
        const reviewId = graph.insertVertex(parent, null, "review_id", 420, 80, 100, 40, attributeStyle);
        const rating = graph.insertVertex(parent, null, "rating", 420, 220, 100, 40, attributeStyle);
    
        const categoryId = graph.insertVertex(parent, null, "category_id", 420, 10, 100, 40, attributeStyle);
        const categoryName = graph.insertVertex(parent, null, "category_name", 520, 10, 120, 40, attributeStyle);
    
        const mediaId = graph.insertVertex(parent, null, "media_id", 620, 220, 100, 40, attributeStyle);
        const fileType = graph.insertVertex(parent, null, "file_type", 720, 220, 100, 40, attributeStyle);
    
        // ✅ Define Edges (Relationships)
        const style = "edgeStyle=orthogonalEdgeStyle;strokeColor=black;endArrow=none;rounded=1;";
    
        graph.insertEdge(parent, null, "1", user, subscribes, style);
        graph.insertEdge(parent, null, "M", subscribes, subscription, style);
        
        graph.insertEdge(parent, null, "1", user, reviews, style);
        graph.insertEdge(parent, null, "M", reviews, review, style);
        
        graph.insertEdge(parent, null, "1", movie, belongsTo1, style);
        graph.insertEdge(parent, null, "M", belongsTo1, category, style);
        
        graph.insertEdge(parent, null, "1", tvShow, belongsTo2, style);
        graph.insertEdge(parent, null, "M", belongsTo2, category, style);
        
        graph.insertEdge(parent, null, "1", music, belongsTo3, style);
        graph.insertEdge(parent, null, "M", belongsTo3, category, style);
        
        graph.insertEdge(parent, null, "1", movie, includes, style);
        graph.insertEdge(parent, null, "M", includes, media, style);
        
        graph.insertEdge(parent, null, "1", review, includes, style);
        graph.insertEdge(parent, null, "M", includes, media, style);
    
        // ✅ Connect Attributes
        graph.insertEdge(parent, null, "", user, userId, style);
        graph.insertEdge(parent, null, "", user, username, style);
        
        graph.insertEdge(parent, null, "", subscription, subscriptionId, style);
        graph.insertEdge(parent, null, "", subscription, subscriptionType, style);
        
        graph.insertEdge(parent, null, "", movie, movieId, style);
        graph.insertEdge(parent, null, "", movie, title, style);
        
        graph.insertEdge(parent, null, "", tvShow, tvShowId, style);
        graph.insertEdge(parent, null, "", tvShow, genre, style);
        
        graph.insertEdge(parent, null, "", music, musicId, style);
        graph.insertEdge(parent, null, "", music, releaseDate, style);
        
        graph.insertEdge(parent, null, "", review, reviewId, style);
        graph.insertEdge(parent, null, "", review, rating, style);
        
        graph.insertEdge(parent, null, "", category, categoryId, style);
        graph.insertEdge(parent, null, "", category, categoryName, style);
        
        graph.insertEdge(parent, null, "", media, mediaId, style);
        graph.insertEdge(parent, null, "", media, fileType, style);

        const layout = new mxHierarchicalLayout(graph);
        layout.orientation = mxConstants.DIRECTION_WEST; // 🔄 Set to Horizontal Layout
        layout.execute(parent);
        
        const bounds = graph.getGraphBounds();
        const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
        const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
        graph.view.setTranslate(x, y);

    
      } finally {
        graph.getModel().endUpdate();
      }
    };

    const createEyeglassesWebsiteTemplate = () => {
      const container = containerRef.current;
      if (!container) return;
    
      const graph = window.graph; // Use the global graph instance
      const parent = graph.getDefaultParent();
    
      graph.getModel().beginUpdate();
      try {
        console.log("Creating Eyeglasses Website ER Diagram...");
    
        // ✅ Ensure cells are selectable & movable
        graph.setCellsSelectable(true);
        graph.setCellsMovable(true);
    
        // ✅ Define styles
        const entityStyle = "shape=rectangle;fillColor=lightgray;fontColor=black;movable=1";
        const relationStyle = "shape=rhombus;fillColor=lightblue;fontColor=black;movable=1";
        const attributeStyle = "shape=ellipse;fillColor=lightgreen;fontColor=black;movable=1";
    
        // ✅ Define Entities
        const user = graph.insertVertex(parent, null, "User", 50, 150, 140, 60, entityStyle);
        const order = graph.insertVertex(parent, null, "Order", 250, 50, 140, 60, entityStyle);
        const eyeglasses = graph.insertVertex(parent, null, "Eyeglasses", 250, 150, 140, 60, entityStyle);
        const review = graph.insertVertex(parent, null, "Review", 450, 150, 140, 60, entityStyle);
        const category = graph.insertVertex(parent, null, "Category", 250, 250, 140, 60, entityStyle);
        const brand = graph.insertVertex(parent, null, "Brand", 450, 50, 140, 60, entityStyle);
        const payment = graph.insertVertex(parent, null, "Payment", 650, 150, 140, 60, entityStyle);
    
        // ✅ Define Relationships
        const places = graph.insertVertex(parent, null, "Places", 160, 90, 80, 50, relationStyle);
        const orders = graph.insertVertex(parent, null, "Orders", 360, 90, 80, 50, relationStyle);
        const reviews = graph.insertVertex(parent, null, "Reviews", 360, 220, 80, 50, relationStyle);
        const belongsTo = graph.insertVertex(parent, null, "Belongs To", 260, 200, 80, 50, relationStyle);
        const manufacturedBy = graph.insertVertex(parent, null, "Manufactured By", 460, 100, 100, 50, relationStyle);
        const paysWith = graph.insertVertex(parent, null, "Pays With", 560, 150, 80, 50, relationStyle);
    
        // ✅ Define Attributes
        const userId = graph.insertVertex(parent, null, "user_id", 20, 80, 100, 40, attributeStyle);
        const username = graph.insertVertex(parent, null, "username", 20, 220, 100, 40, attributeStyle);
    
        const orderId = graph.insertVertex(parent, null, "order_id", 220, 10, 100, 40, attributeStyle);
        const orderDate = graph.insertVertex(parent, null, "order_date", 320, 10, 120, 40, attributeStyle);
    
        const eyeglassesId = graph.insertVertex(parent, null, "eyeglasses_id", 220, 100, 120, 40, attributeStyle);
        const modelName = graph.insertVertex(parent, null, "model_name", 320, 100, 120, 40, attributeStyle);
        const frameMaterial = graph.insertVertex(parent, null, "frame_material", 320, 220, 140, 40, attributeStyle);
        const price = graph.insertVertex(parent, null, "price", 320, 280, 100, 40, attributeStyle);
    
        const reviewId = graph.insertVertex(parent, null, "review_id", 420, 80, 100, 40, attributeStyle);
        const rating = graph.insertVertex(parent, null, "rating", 420, 220, 100, 40, attributeStyle);
        const comment = graph.insertVertex(parent, null, "comment", 420, 280, 120, 40, attributeStyle);
    
        const categoryId = graph.insertVertex(parent, null, "category_id", 220, 320, 100, 40, attributeStyle);
        const categoryName = graph.insertVertex(parent, null, "category_name", 320, 320, 120, 40, attributeStyle);
    
        const brandId = graph.insertVertex(parent, null, "brand_id", 420, 10, 100, 40, attributeStyle);
        const brandName = graph.insertVertex(parent, null, "brand_name", 520, 10, 120, 40, attributeStyle);
    
        const paymentId = graph.insertVertex(parent, null, "payment_id", 620, 220, 100, 40, attributeStyle);
        const paymentMethod = graph.insertVertex(parent, null, "payment_method", 720, 220, 140, 40, attributeStyle);
        const totalAmount = graph.insertVertex(parent, null, "total_amount", 720, 280, 140, 40, attributeStyle);
    
        // ✅ Define Edges (Relationships)
        const style = "edgeStyle=orthogonalEdgeStyle;strokeColor=black;endArrow=none;rounded=1;";

        // ✅ Ensure all relationships are properly connected
        graph.insertEdge(parent, null, "1", user, places, style);
        graph.insertEdge(parent, null, "M", places, order, style);
        
        graph.insertEdge(parent, null, "1", order, orders, style);
        graph.insertEdge(parent, null, "M", orders, eyeglasses, style);
        
        graph.insertEdge(parent, null, "1", user, reviews, style);
        graph.insertEdge(parent, null, "M", reviews, review, style);
        
        graph.insertEdge(parent, null, "1", eyeglasses, belongsTo, style);
        graph.insertEdge(parent, null, "M", belongsTo, category, style);
        
        graph.insertEdge(parent, null, "1", eyeglasses, manufacturedBy, style);
        graph.insertEdge(parent, null, "M", manufacturedBy, brand, style);
        
        graph.insertEdge(parent, null, "1", order, paysWith, style);
        graph.insertEdge(parent, null, "M", paysWith, payment, style);
        
        // ✅ Ensure attributes are properly connected
        graph.insertEdge(parent, null, "", user, userId, style);
        graph.insertEdge(parent, null, "", user, username, style);
        
        graph.insertEdge(parent, null, "", order, orderId, style);
        graph.insertEdge(parent, null, "", order, orderDate, style);
        
        graph.insertEdge(parent, null, "", eyeglasses, eyeglassesId, style);
        graph.insertEdge(parent, null, "", eyeglasses, modelName, style);
        graph.insertEdge(parent, null, "", eyeglasses, frameMaterial, style);
        graph.insertEdge(parent, null, "", eyeglasses, price, style);
        
        graph.insertEdge(parent, null, "", review, reviewId, style);
        graph.insertEdge(parent, null, "", review, rating, style);
        graph.insertEdge(parent, null, "", review, comment, style);
        
        graph.insertEdge(parent, null, "", category, categoryId, style);
        graph.insertEdge(parent, null, "", category, categoryName, style);
        
        graph.insertEdge(parent, null, "", brand, brandId, style);
        graph.insertEdge(parent, null, "", brand, brandName, style);
        
        graph.insertEdge(parent, null, "", payment, paymentId, style);
        graph.insertEdge(parent, null, "", payment, paymentMethod, style);
        graph.insertEdge(parent, null, "", payment, totalAmount, style);
        
    
        const layout = new mxHierarchicalLayout(graph);
        layout.orientation = mxConstants.DIRECTION_WEST; // 🔄 Ensure a horizontal layout
        layout.intraCellSpacing = 50; // 🔧 Space out relationships
        layout.interRankCellSpacing = 80; // 🔧 Space out hierarchy levels
        layout.execute(parent);
        
        const bounds = graph.getGraphBounds();
        const x = (container.offsetWidth - bounds.width) / 2 - bounds.x;
        const y = (container.offsetHeight - bounds.height) / 2 - bounds.y;
        graph.view.setTranslate(x, y);
    
      } finally {
        graph.getModel().endUpdate();
      }
    };
    
  
return (
  <>
    <div className={styles.bar}>
      <img className={styles.logo} src="/pic/logo.png" alt="Logo" />
      <img className={styles.dropdown} src="/pic/dropdown.png" alt="Dropdown" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.nameInput}
      />
      <button onClick={handleChangeProjectName} className={styles.changeBtn}>
        Change
      </button>
    </div>

    <p style={{ marginLeft: "20px", fontWeight: "bold" }}>
      Current project name: {projectName}
    </p>

    {/* Sidebar */}
    <aside className={`${styles.sidebar} ${activePanel ? styles.expanded : ""}`}>
  <div className={styles.sidebarIcons}>
    <button onClick={() => handlePanelToggle("templates")}>
      <img src="/pic/template.png" alt="Work Template" />
      {activePanel === "templates" && <span className={styles.iconLabel}>Work Template</span>}
    </button>
    <button onClick={() => handlePanelToggle("toolbox")}>
      <img src="/pic/shape.png" alt="Tools" />
      {activePanel === "toolbox" && <span className={styles.iconLabel}>Tools</span>}
    </button>
  </div>

  <div className={styles.panelContent}>
    {activePanel === "templates" && <Template onTemplateSelect={handleTemplateClick} />}
    {activePanel === "toolbox" && <Toolbox graphRef={graphRef} />}
  </div>
</aside>

    {/* Main Workspace */}
    <main className={styles.workspace}>
  <div ref={containerRef} className={styles.graphContainer}></div>

  {validationError ? (
    <div style={{ color: "red", whiteSpace: "pre-wrap", marginTop: "20px" }}>
      <h4>⚠️ Diagram Error(s) Detected:</h4>
      <pre>{validationError}</pre>
    </div>
  ) : (
    sql && (
      <div style={{ marginTop: "20px" }}>
        <h4 style={{ marginBottom: "8px" }}>Generated SQL:</h4>

        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: "transparent",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          {sql}
        </div>

        {/* ✅ Export SQL Button */}
        <button
          onClick={handleExportSQL}
          className={styles.exportButton}
          style={{ marginTop: "10px" }}
        >
          Export SQL
        </button>

        {/* ✅ Preview Wireframe Button */}
        <button
          className="mt-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
          localStorage.setItem("projectName", projectName);
            router.push('/wireframe');
          }}
        >
          Preview Website Wireframe
        </button>

      
    

        {/* ✅ Export Diagram (.png) */}
        <button
  className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded"
  onClick={handleExportDiagram}
>
  Export Diagram
</button>
      </div>
    )
  )}
</main>


    {/* Top Bar */}
    <div className={styles.topBar}>
      <img className={styles.accicon} src="/pic/Account.png" alt="Acc" />
      <img className={styles.addicon} src="/pic/add.png" alt="Add" />
      <div className={styles.separator}></div>
      <img className={styles.Popularicon} src="/pic/Popular.png" alt="popular" />
      <button className={styles.createProjectButton} onClick={handleGenerateSQL}>
        Create SQL
      </button>

      {!isShared && (
        <>
          <button className={styles.createProjectButton} onClick={handleSaveProject}>
            Save Project
          </button>
          <button
            className={styles.createProjectButton}
            onClick={async () => {
              const shareName = prompt("Enter share name:");
              if (!shareName) return;

              const userId = session?.user?.id;
              if (!userId || !projectId) {
                alert("Missing user or project info.");
                return;
              }

              if (!graphRef.current) {
                alert("Graph is not initialized.");
                return;
              }

              const encoder = new window.mxCodec();
              const node = encoder.encode(graphRef.current.getModel());
              const xml = window.mxUtils.getXml(node);

              try {
                const saveRes = await fetch("/api/saveProject", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    projectId,
                    projectData: xml,
                    projectName,
                  }),
                });

                const saveData = await saveRes.json();
                if (!saveData.success) {
                  alert("❌ Save failed. Cannot share until saved.");
                  return;
                }

                const shareRes = await fetch("/api/shareWorkspace", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId, projectId, shareName }),
                });

                const shareData = await shareRes.json();
                if (shareData.success) {
                  alert("✅ Shared successfully!");
                } else {
                  alert("❌ Failed to share: " + (shareData.error || "Unknown error"));
                }
              } catch (err) {
                console.error("❌ Error:", err);
                alert("Something went wrong while saving or sharing.");
              }
            }}
          >
            Share
          </button>
        </>
      )}
    </div>

    {/* Bottom Bar */}
    <div className={styles.bottomBar}>
      <button
        className={mode === "select" ? styles.active : ""}
        onClick={() => toggleMode("select")}
      >
        <img className={styles.cursor} src="/pic/Cursor.png" alt="cursor" />
      </button>

      <button
        className={mode === "pan" ? styles.active : ""}
        onClick={() => toggleMode("pan")}
      >
        <img className={styles.hand} src="/pic/Hand.png" alt="hand" />
      </button>

      <div className={styles.separator}></div>
      <button onClick={() => undoManagerRef.current.undo()}>
        <img src="/pic/turn_left.png" alt="undo" />
      </button>
      <button onClick={() => undoManagerRef.current.redo()}>
        <img src="/pic/turn_right.png" alt="redo" />
      </button>

      <div className={styles.separator}></div>
      <button onClick={zoomIn}>
        <img src="/pic/Zoom_In.png" alt="zoom in" />
      </button>
      <select value={zoom} onChange={handleZoomChange}>
        <option value="25">25%</option>
        <option value="50">50%</option>
        <option value="75">75%</option>
        <option value="100">100%</option>
        <option value="125">125%</option>
        <option value="150">150%</option>
      </select>
      <button onClick={zoomOut}>
        <img src="/pic/Zoom_Out.png" alt="zoom out" />
      </button>
    </div>
  </>
);

}

