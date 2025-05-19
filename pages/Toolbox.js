import React, { useRef, useEffect, useState } from "react";

export default function Toolbox({ graphRef }) {
  const toolbarRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.mxGraph && !window.doubleLineRegistered) {
      function DoubleLineShape() {}
      DoubleLineShape.prototype = new window.mxConnector();
      DoubleLineShape.prototype.constructor = DoubleLineShape;

      DoubleLineShape.prototype.paintEdgeShape = function (c, pts) {
        // Draw top line
        c.begin();
        this.paintLine(c, pts, true);
        c.stroke();

        // Offset bottom line
        const offset = 4;
        const newPts = pts.map(p => new window.mxPoint(p.x, p.y + offset));
        c.begin();
        this.paintLine(c, newPts, true);
        c.stroke();
      };

      window.mxCellRenderer.registerShape("doubleLine", DoubleLineShape);
      window.doubleLineRegistered = true;
    }
  }, []);

  useEffect(() => {
    if (!graphRef.current || !toolbarRef.current) return; // Prevent running if not ready
    const graph = graphRef.current;
    const toolbarContainer = toolbarRef.current;

    // Clear any existing toolbar items
    toolbarContainer.innerHTML = "";

    // Helper function to add a shape to the toolbox
    const addToolboxItem = (label, style, width, height, isDouble) => {
      let vertex;
      if (isDouble) {
        // Outer rectangle
        const outer = new window.mxCell("", new window.mxGeometry(0, 0, width, height), style);
        outer.setVertex(true);

        // Inner rectangle
        const inner = new window.mxCell(label, new window.mxGeometry(5, 5, width - 10, height - 10), style);
        inner.setVertex(true);
        inner.setConnectable(false);

        outer.insert(inner); // Attach inner shape
        vertex = outer;
      } else {
        vertex = new window.mxCell(label, new window.mxGeometry(0, 0, width, height), style);
        vertex.setVertex(true);
      }

      // Prevent selecting the inner cell
      graph.isCellSelectable = function (cell) {
        return !cell.parent || cell.parent === graph.getDefaultParent();
      };

      // Create the HTML element in the toolbox
      const toolbarItem = document.createElement("div");
      toolbarItem.style.width = width + "px";
      toolbarItem.style.height = height + "px";
      toolbarItem.style.border = "1px solid black";
      toolbarItem.style.display = "flex";
      toolbarItem.style.alignItems = "center";
      toolbarItem.style.justifyContent = "center";
      toolbarItem.style.margin = "5px";
      toolbarItem.style.cursor = "pointer";
      toolbarItem.style.background = "#f9f9f9";

      const miniGraphContainer = document.createElement("div");
      miniGraphContainer.style.width = `${width}px`;
      miniGraphContainer.style.height = `${height}px`;
      toolbarItem.appendChild(miniGraphContainer);

      // Make a mini preview
      const miniGraph = new window.mxGraph(miniGraphContainer);
      miniGraph.setEnabled(false);
      const miniParent = miniGraph.getDefaultParent();
      miniGraph.getModel().beginUpdate();
      try {
        miniGraph.insertVertex(miniParent, null, label, 0, 0, width, height, style);
      } finally {
        miniGraph.getModel().endUpdate();
      }

      // On click, add the shape to the main graph
      toolbarItem.addEventListener("click", () => {
        // FIX #1: Use graph.container
        const containerBounds = graph.container.getBoundingClientRect();
        const centerX = containerBounds.width / 2 - width / 2;
        const centerY = containerBounds.height / 2 - height / 2;

        // FIX #2: Use graph.getDefaultParent()
        const parent = graph.getDefaultParent();

        graph.getModel().beginUpdate();
        try {
          const newCell = graph.getModel().cloneCell(vertex);
          newCell.geometry.x = centerX;
          newCell.geometry.y = centerY;
          graph.addCell(newCell, parent);
        } finally {
          graph.getModel().endUpdate();
        }
      });

      // Handle resizing of inner shape
      graph.addListener(mxEvent.RESIZE_CELLS, (sender, evt) => {
        const cells = evt.getProperty("cells");
        const bounds = evt.getProperty("bounds");

        graph.getModel().beginUpdate();
        try {
          cells.forEach((cell, index) => {
            if (cell.children && cell.children.length > 0) {
              const outerGeometry = bounds[index];
              cell.geometry.width = outerGeometry.width;
              cell.geometry.height = outerGeometry.height;

              const inner = cell.children[0];
              if (inner) {
                inner.geometry.x = 5;
                inner.geometry.y = 5;
                inner.geometry.width = outerGeometry.width - 10;
                inner.geometry.height = outerGeometry.height - 10;
              }
            }
          });
        } finally {
          graph.getModel().endUpdate();
        }
      });

      toolbarContainer.appendChild(toolbarItem);
    };

    // Example: Associative Entity
    const addAssociativeEntity = (label, width, height) => {
      const outerRectangle = new window.mxCell("", new window.mxGeometry(0, 0, width, height),
        "shape=rectangle;fillColor=#FAE7EB;");
      outerRectangle.setVertex(true);

      const rhombus = new window.mxCell("Associative Entity", new window.mxGeometry(0, 0, width, height),
        "shape=rhombus;fillColor=#FAE7EB;");
      rhombus.geometry.relative = false;
      rhombus.setVertex(true);

      outerRectangle.insert(rhombus);

      const toolbarItem = document.createElement("div");
      toolbarItem.style.width = width + "px";
      toolbarItem.style.height = height + "px";
      toolbarItem.style.border = "1px solid black";
      toolbarItem.style.display = "flex";
      toolbarItem.style.alignItems = "center";
      toolbarItem.style.justifyContent = "center";
      toolbarItem.style.margin = "5px";
      toolbarItem.style.cursor = "pointer";
      toolbarItem.style.background = "#f9f9f9";

      // Optional preview if you want
      const miniGraphContainer = document.createElement("div");
      miniGraphContainer.style.width = `${width}px`;
      miniGraphContainer.style.height = `${height}px`;
      toolbarItem.appendChild(miniGraphContainer);

      const miniGraph = new window.mxGraph(miniGraphContainer);
      miniGraph.setEnabled(false);
      const miniParent = miniGraph.getDefaultParent();
      miniGraph.getModel().beginUpdate();
      try {
        const previewOuter = miniGraph.insertVertex(
          miniParent,
          null,
          "",
          0,
          0,
          width,
          height,
          "shape=rectangle;fillColor=#FAE7EB;"
        );
        miniGraph.insertVertex(
          previewOuter,
          null,
          "Associative Entity",
          0,
          0,
          width,
          height,
          "shape=rhombus;fillColor=#FAE7EB;"
        );
      } finally {
        miniGraph.getModel().endUpdate();
      }

      toolbarItem.addEventListener("click", () => {
        const graph = graphRef.current;
        if (!graph) return;

        const containerBounds = graph.container.getBoundingClientRect();
        const centerX = containerBounds.width / 2 - width / 2;
        const centerY = containerBounds.height / 2 - height / 2;

        const parent = graph.getDefaultParent();

        graph.getModel().beginUpdate();
        try {
          const newCell = graph.getModel().cloneCell(outerRectangle);
          newCell.geometry.x = centerX;
          newCell.geometry.y = centerY;
          graph.addCell(newCell, parent);
        } finally {
          graph.getModel().endUpdate();
        }
      });

      toolbarRef.current.appendChild(toolbarItem);
    };

   const addPartialKeyItem = (label, width, height) => {
  const graph = graphRef.current;
  const parent = graph.getDefaultParent();
  const dashedUnderline = "‒ ‒ ‒ ‒ ‒ ‒ ‒ ‒";

  const createPartialKeyCell = (value) => {
    const cell = new window.mxCell(
      `${value}\n${dashedUnderline}`,
      new window.mxGeometry(0, 0, width, height),
      "shape=ellipse;fillColor=#fff2cc;fontSize=12;align=center;verticalAlign=middle;whiteSpace=wrap;"
    );
    cell.setVertex(true);
    return cell;
  };

  const ellipseTemplate = createPartialKeyCell(label);

  const toolbarItem = document.createElement("div");
  toolbarItem.style.width = width + "px";
  toolbarItem.style.height = height + "px";
  toolbarItem.style.border = "1px solid black";
  toolbarItem.style.display = "flex";
  toolbarItem.style.alignItems = "center";
  toolbarItem.style.justifyContent = "center";
  toolbarItem.style.margin = "5px";
  toolbarItem.style.cursor = "pointer";
  toolbarItem.style.background = "#f9f9f9";

  const miniGraphContainer = document.createElement("div");
  miniGraphContainer.style.width = `${width}px`;
  miniGraphContainer.style.height = `${height}px`;
  toolbarItem.appendChild(miniGraphContainer);

  const miniGraph = new window.mxGraph(miniGraphContainer);
  miniGraph.setEnabled(false);
  const miniParent = miniGraph.getDefaultParent();
  miniGraph.getModel().beginUpdate();
  try {
    miniGraph.insertVertex(
      miniParent,
      null,
      `${label}\n${dashedUnderline}`,
      0,
      0,
      width,
      height,
      "shape=ellipse;fillColor=#fff2cc;fontSize=12;align=center;verticalAlign=middle;whiteSpace=wrap;"
    );
  } finally {
    miniGraph.getModel().endUpdate();
  }

  toolbarItem.addEventListener("click", () => {
    const newCell = createPartialKeyCell(label);
    graph.getModel().beginUpdate();
    try {
      newCell.geometry.x = 100;
      newCell.geometry.y = 100;
      graph.addCell(newCell, graph.getDefaultParent());
    } finally {
      graph.getModel().endUpdate();
    }
  });

  toolbarRef.current.appendChild(toolbarItem);

  // Prevent multiple listeners
  if (!graph.partialKeyListenerAdded) {
    const listener = (sender, evt) => {
      const cell = evt.getProperty("cell");
      const value = evt.getProperty("value");
      if (
        cell &&
        cell.style?.includes("shape=ellipse") &&
        cell.value?.includes(dashedUnderline)
      ) {
        const newLabel = typeof value === "string" ? value.split("\n")[0] : "";
        cell.setValue(`${newLabel}\n${dashedUnderline}`);
      }
    };
    graph.addListener(window.mxEvent.LABEL_CHANGED, listener);
    graph.partialKeyListenerAdded = true;
  }
};


    
    
    // Example: lines
    const addLineToolboxItem = (label, style) => {
      const toolbarItem = document.createElement("div");
      toolbarItem.style.width = "120px";
      toolbarItem.style.height = "5px";
      toolbarItem.style.margin = "8px 5px";
      toolbarItem.style.cursor = "pointer";
      toolbarItem.style.display = "flex";
      toolbarItem.style.alignItems = "center";

      const lineElement = document.createElement("div");
      lineElement.style.width = "100%";
      lineElement.style.height = "4px";
      lineElement.style.backgroundColor = "transparent";

      if (style.includes("dashed")) {
        lineElement.style.borderTop = "2px dashed black";
      } else if (style.includes("double")) {
        lineElement.style.borderTop = "1px solid black";
        lineElement.style.borderBottom = "1px solid black";
      } else {
        lineElement.style.backgroundColor = "black";
      }

      toolbarItem.appendChild(lineElement);

      toolbarItem.addEventListener("click", () => {
        const parent = graph.getDefaultParent();
        graph.getModel().beginUpdate();
        try {
          const source = graph.insertVertex(parent, null, "", 100, 100, 1, 1, "opacity=0");
          const target = graph.insertVertex(parent, null, "", 300, 100, 1, 1, "opacity=0");

          let edgeStyle = "strokeWidth=2;edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=none;";
          if (style.includes("dashed")) {
            edgeStyle += "dashed=1;";
          } else if (style.includes("double")) {
            edgeStyle = "shape=doubleLine;strokeWidth=2;edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=none;";
          }

          graph.insertEdge(parent, null, label, source, target, edgeStyle);
        } finally {
          graph.getModel().endUpdate();
        }
      });

      toolbarRef.current.appendChild(toolbarItem);
    };

    graph.layoutManager = new window.mxLayoutManager(graph);
    graph.layoutManager.getLayout = function (cell) {
      if (cell.isEdge()) {
        return new window.mxParallelEdgeLayout(graph);
      }
      return null;
    };
    // Add shapes to the toolbox
    addToolboxItem("Entity", "shape=rectangle;fillColor=lightblue", 120, 60, false);
    addToolboxItem("Weak Entity", "shape=rectangle;fillColor=lightblue", 120, 60, true);
    addAssociativeEntity("Associative Entity", 120, 60);
    addToolboxItem("Relationship", "shape=rhombus;fillColor=#CCECFF", 120, 60, false);
    addToolboxItem("Identifying Relationship", "shape=rhombus;fillColor=#CCECFF;strokeWidth=1", 120, 60, true);
    addToolboxItem("Attribute", "shape=ellipse;fillColor=lightyellow", 100, 50, false);
    addToolboxItem("Key Attribute (Underline)", "shape=ellipse;fillColor=lightyellow;fontStyle=4", 100, 50, false);

    // ✅ NEW: Real dashed underline version
    addPartialKeyItem("Partial Key", 100, 50);

    addToolboxItem("Multi-valued Attribute", "shape=ellipse;fillColor=lightyellow", 100, 50, true);
    addToolboxItem("Derived Attribute", "shape=ellipse;fillColor=lightyellow;dashed=1", 100, 50, false);

    // Add lines to the toolbox
    addLineToolboxItem("", "strokeWidth=2");
    addLineToolboxItem("", "strokeWidth=2;dashed=1");
    addLineToolboxItem("", "strokeWidth=2;double=1");


    setInitialized(true);
  }, [graphRef]);

  return (
    <div
      ref={toolbarRef}
      style={{
        padding: "10px",
        border: "1px solid black",
        background: "#f1f1f1",
        maxHeight: "300px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    />
  );
}
