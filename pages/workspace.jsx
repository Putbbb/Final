import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Workspace.module.css";
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


        if (event.key === "Backspace") {
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
    <button onClick={() => handlePanelToggle("toolbox")}>
      <img src="/pic/shape.png" alt="Tools" />
      {activePanel === "toolbox" && <span className={styles.iconLabel}>Tools</span>}
    </button>
  </div>

  <div className={styles.panelContent}>
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
            router.push('/wireframe');
          }}
        >
          Preview Website Wireframe
        </button>

        {/* ✅ Export Diagram (.xml) */}

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

