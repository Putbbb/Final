export const generateSQL = (graphRef, setSql, setValidationError) => {
  if (!graphRef?.current) {
    console.error("Graph not initialized.");
    return;
  }
    const graph = graphRef.current;
    const model = graph.getModel();
    const cells = model.cells;

    let sqlBlocked = false;
    let validationMessages = [];

    const isDoubleEdge = (style) => {
      if (!style) return false;
      return style.includes("shape=doubleLine"); // ✅ only match true double edges
    };


    const getCellStyle = (cell) => {
      return cell.children?.[0]?.style || cell.style || "";
    };
    const getCellValue = (cell) => {
      if (!cell) return "";
      if (cell.children?.length > 0 && typeof cell.children[0].value === "string") {
        return cell.children[0].value.trim();
      }
      return typeof cell.value === "string" ? cell.value.trim() : "";
    };

    const findParentVertex = (cell) => {
      if (!cell || !cell.id) return null;

  const modelCells = Object.values(graph.getModel().cells);

  // Climb up recursively to find the top-most parent
  let current = cell;
  while (true) {
    const parent = modelCells.find((potentialParent) =>
      potentialParent.vertex &&
      Array.isArray(potentialParent.children) &&
      potentialParent.children.some((c) => c.id === current.id)
    );
    if (!parent) break;
    current = parent;
  }

  return current;
};

Object.values(cells).forEach((cell) => {
  if (cell.edge) {
    console.log("🔗 Edge style check:", {
      id: cell.id,
      source: getCellValue(findParentVertex(cell.source)),
      target: getCellValue(findParentVertex(cell.target)),
      style: cell.style
    });
  }
});



    console.log("📦 All cells:");
    Object.values(cells).forEach((cell) => {
      if (cell.vertex) {
        const isGrouped = Array.isArray(cell.children) && cell.children.length > 0;
        const displayValue = getCellValue(cell);
        const displayStyle = getCellStyle(cell);

        console.log(isGrouped ? "🧩 Grouped Vertex:" : "🔷 Vertex:", {
          id: cell.id,
          value: displayValue,
          style: displayStyle,
          children: isGrouped
            ? cell.children.map((c) => ({
                id: c.id,
                value: c.value,
                style: c.style,
              }))
            : undefined,
        });
      } else if (cell.edge) {
          console.log("🔗 Edge:", {
            id: cell.id,
            value: cell.value,
            source: findParentVertex(cell.source)?.value || '',
            target: findParentVertex(cell.target)?.value || '',
            style: cell.style,
          });

      }
    });

    const entities = {};
    const attributes = {};
    const associativeEntities = [];
    const multiValuedAttributes = [];
    const weakRelationships = [];
    const entitiesByName = {};
    const identifyingRelationshipIds = [];
    const weakEntityIds = new Set();
    const identifyingRelationshipMap = {};


    // Detect entities and attributes
    Object.values(cells).forEach((cell) => {
      if (cell.vertex && cell.style) {
        if (getCellStyle(cell).includes("rectangle")) {
        const isWeak =
          cell.children?.some(child =>
            child.style?.includes("rectangle") &&
            child.geometry &&
            child.geometry.width < cell.geometry.width &&
            child.geometry.height < cell.geometry.height
          );


        let name = getCellValue(cell);

        if (!entitiesByName[name]) {
          entitiesByName[name] = {
            name,
            attributes: [],
            primaryKey: null,
            isWeak,
            weakType: isWeak ? "non-identifying" : undefined, // ✅ initialize weakType
          };
        }

        // ✅ Always update if this instance is weak
        if (isWeak) {
          entitiesByName[name].isWeak = true;
          entitiesByName[name].weakType = "non-identifying"; // default
        }

        // ✅ If this one is a weak version, mark it
        if (isWeak) {
          entitiesByName[name].isWeak = true;
        }

        const outer = findParentVertex(cell);
          if (outer && outer.id) {
            entities[outer.id] = entitiesByName[name];
          }


          console.log("📦 ENTITY REGISTERED:", name, "→", cell.id);

        } else if (getCellStyle(cell).includes("ellipse")) {
          let name = getCellValue(cell);  
          if ((!name || name.trim() === "") && cell.children && cell.children.length > 0) {
            const child = cell.children[0];
            if (child.value && typeof child.value === "string") {
              name = child.value;
            }
          }
          // ✅ Take only the first line (in case of \n), then trim it
          name = name?.split("\n")[0].trim();

          // ✅ Check if the cleaned name is just dashes/spaces
          const cleaned = name.replace(/[-‒–—\s\r]+/g, "");
          if (!cleaned) return;

          const isDerived = getCellStyle(cell).includes("dashed=1");
          const isMultiValued = cell.children && cell.children.length > 0 &&
            cell.children[0].style && cell.children[0].style.includes("ellipse");

          const rawValue = cell.value?.toString() || "";

          const isKey = getCellStyle(cell).includes("fontStyle=4") ||
                        rawValue.includes("‒") || rawValue.includes("—") || rawValue.includes("–");

          const isPartialKey = rawValue.toLowerCase().includes("partial") ||
                              rawValue.includes("‒") ||
                              getCellStyle(cell).includes("dashed=1");

          attributes[cell.id] = {
            name: name || "unnamed_attribute",
            isKey,
            isPartialKey, // ✅ add this
            isDerived,
            isMultiValued,
            parentEntity: null,
          };

          console.log("📦 ENTITY REGISTERED:", name, "->", cell.id);

        }
      }
    });
    console.log("🧱 Final Entity Types:");
    Object.entries(entitiesByName).forEach(([name, e]) =>
      console.log(`${name}: isWeak=${e.isWeak}`)
    );

    // Link attributes to entities
    Object.values(cells).forEach((cell) => {
      if (cell.edge) {
      const source = findParentVertex(cell.source);
      const target = findParentVertex(cell.target);
      console.log("🔗 EDGE:", {
        label: cell.value,
        source: source?.value || getCellValue(source),
        target: target?.value || getCellValue(target),
        sourceId: source?.id,
        targetId: target?.id,
        style: cell.style,
      });
        if (source && target) {
          const sourceName = getCellValue(source);
          const targetName = getCellValue(target);

          if (entitiesByName[sourceName] && attributes[target.id]) {
            const attr = attributes[target.id];
            attr.parentEntity = sourceName;
            entitiesByName[sourceName].attributes.push(attr);

            if (attr.isKey && !entitiesByName[sourceName].primaryKey) {
              entitiesByName[sourceName].primaryKey = attr.name;
            }
          } else if (entitiesByName[targetName] && attributes[source.id]) {
            const attr = attributes[source.id];
            attr.parentEntity = targetName;
            entitiesByName[targetName].attributes.push(attr);

            if (attr.isKey && !entitiesByName[targetName].primaryKey) {
              entitiesByName[targetName].primaryKey = attr.name;
            }
          }
          if (source && target && entities[source.id] && entities[target.id]) {
            const fromEntity = entities[source.id];
            const toEntity = entities[target.id];

            const pkName = fromEntity.primaryKey || `${fromEntity.name.toLowerCase()}_id`;

            // ⚠️ Prevent duplicate FK injection
            const alreadyExists = toEntity.attributes.some(attr => attr.name === pkName && attr.references === fromEntity.name);
            if (!alreadyExists) {
              toEntity.attributes.unshift({
                name: pkName,
                isKey: false,
                isDerived: false,
                references: fromEntity.name,
                notNull: isDoubleEdge(cell.style), // ✅ force NOT NULL for double edge
              });
            }
          }
      }
    }
    });

    Object.values(entitiesByName).forEach((entity) => {
      if (entity.attributes.length === 0) {
        validationMessages.push(`❌ Entity "${entity.name}" has no attributes.`);
        sqlBlocked = true;
      }

      // ✅ Check for at least one underlined (key) attribute
      const hasKeyAttr = entity.attributes.some(attr => attr.isKey);

      if (!entity.isWeak && !hasKeyAttr) {
        validationMessages.push(`❌ Strong entity "${entity.name}" must have at least one key attribute (underlined).`);
        sqlBlocked = true;
      }
    });


    // Detect relationships and associative entities
    Object.values(cells).forEach((cell) => {
    const style = getCellStyle(cell);
    const isRhombus = style.includes("rhombus");

    // Skip if this rhombus is part of an associative entity (inside rectangle)
    const parentStyle = getCellStyle(findParentVertex(cell));
    const isGrouped = parentStyle?.includes("rectangle");
    const isStandaloneRel = isRhombus && !isGrouped;

    if (cell.vertex && isStandaloneRel)

 {
      const relName = getCellValue(cell) || "UnnamedRelationship";

        const connectedEntities = [];
        const assocAttributes = [];
        const edgeLabels = [];

        console.log(`🔍 Testing identifying condition for relationship id=${cell.id}, label=${getCellValue(cell)}`);

        // ✅ Treat double-rhombus as identifying relationship
        const isIdentifying = (() => {
          let connectsToWeak = false;
          let allWeakEdgesDouble = true;

          Object.values(cells).forEach(edge => {
            if (!edge.edge) return;

            const source = findParentVertex(edge.source);
            const target = findParentVertex(edge.target);

            const isFromThisRel = source?.id === cell.id || target?.id === cell.id;
            if (!isFromThisRel) return;

            const other = source?.id === cell.id ? target : source;
            const otherId = other?.id;

            const isWeakEntity = !!(otherId && entities[otherId]?.isWeak);
            const isDouble = isDoubleEdge(edge.style || "");

            if (isWeakEntity) {
              connectsToWeak = true;
              if (!isDouble) {
                allWeakEdgesDouble = false;
              }
            }
          });

          return connectsToWeak && allWeakEdgesDouble;
        })();


          console.log(`🔍 Relationship "${getCellValue(cell)}" isIdentifying: ${isIdentifying}`);

        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const otherCell = edge.source === cell ? edge.target : edge.source;

            const edgeStyle = edge.style || "";



            if (!otherCell || !otherCell.id) return;

            if (entities[otherCell.id]) {
              connectedEntities.push(entities[otherCell.id]);
            } else if (attributes[otherCell.id]) {
              assocAttributes.push(attributes[otherCell.id]);
            }

            let label = (edge.value || "").toLowerCase();
            if (!label && edge.source && typeof edge.source.value === "string") label = edge.source.value.toLowerCase();
            if (!label && edge.target && typeof edge.target.value === "string") label = edge.target.value.toLowerCase();
            edgeLabels.push(label);
          }
        });

        const labelCounts = edgeLabels.reduce((acc, label) => {
  if (label.includes('m') || label.includes('n')) acc.many++;
  else if (label.includes('1')) acc.one++;
  return acc;
}, { one: 0, many: 0 });

const isManyToMany = labelCounts.many >= 2;
const isOneToOne = labelCounts.one === 2;
const isOneToMany = labelCounts.one === 1 && labelCounts.many === 1;


console.log("🔍 Testing identifying condition for:", getCellValue(cell));

if (connectedEntities.length === 2 && isIdentifying) {
  identifyingRelationshipIds.push(cell.id);
  console.warn("⚠️ Marked as identifying:", getCellValue(cell), "| id:", cell.id);


  // ✅ Ensure weak entities are marked
  connectedEntities.forEach(e => {
  if (e.isWeak) {
    entitiesByName[e.name].weakType = "identifying"; // ← mark weak type explicitly
  }
  });

            console.log("🔎 Relationship being processed:", {
              id: cell.id,
              rawValue: cell.value,
              getValue: getCellValue(cell),
              children: cell.children?.map(c => ({
                id: c.id,
                value: c.value,
                style: c.style
              }))
            });

          const edgesConnected = Object.values(cells).filter(edge =>
            edge.edge && (edge.source === cell || edge.target === cell)
          );

          let hasWeakEntity = false;
          let allEdgesToWeakAreDouble = true;

          for (const edge of edgesConnected) {
            const otherCell = edge.source === cell ? edge.target : edge.source;
            const otherEntity = entities[otherCell?.id];
            const edgeStyle = edge.style || "";

            // 👇 Debug log
            console.log("🔍 Checking edge between:", {
              from: getCellValue(cell),
              to: otherEntity?.name,
              isWeak: otherEntity?.isWeak,
              edgeStyle: edgeStyle,
              isDouble: isDoubleEdge(edgeStyle),
            });

            if (otherEntity?.isWeak) {
              hasWeakEntity = true;
              if (!isDoubleEdge(edgeStyle)) {
                allEdgesToWeakAreDouble = false;
                sqlBlocked = true;  // ✅ CRITICAL FIX!
                validationMessages.push(
                  `❌ Edge from identifying relationship "${relName}" to weak entity "${otherEntity.name}" must use a double edge.`
                );
              }
            }
          }

          if (!hasWeakEntity) {
            validationMessages.push(`❌ Identifying relationship "${relName}" must connect to at least one weak entity.`);
            sqlBlocked = true;  // ✅ Important
            return;
          }

        if (!allEdgesToWeakAreDouble) {
  // ⚠️ Still mark these weak entities so they aren't wrongly flagged later
  connectedEntities.forEach(e => {
    if (e.isWeak) {
      entitiesByName[e.name].weakType = "identifying";
    }
  });
  validationMessages.push(`❌ Edge(s) from identifying relationship "${relName}" to weak entity must use double lines.`);
  sqlBlocked = true;
  return;
}

  const relType = isManyToMany
    ? "many-to-many"
    : isOneToOne
    ? "one-to-one"
    : "one-to-many"; // default fallback

  weakRelationships.push({
    name: relName,
    entities: connectedEntities,
    type: relType, // ✅ must be a string
    identifying: true,
    attributes: assocAttributes,
  });
}

      }
    });


      // ✅ Collect weak entities that are covered by identifying relationships
      weakRelationships.forEach(rel => {
        rel.entities.forEach(e => {
          if (e.isWeak) {
            entitiesByName[e.name].weakType = "identifying";
          }
        });
      });

     Object.values(entities).forEach((e) => {
      if (!e.isWeak) return;


      const weakType = e.weakType || "non-identifying";
      const keyAttrs = e.attributes.filter(attr => attr.isKey);
      const hasPartialKey = keyAttrs.length === 1 && keyAttrs[0].isPartialKey;

        console.log("🔍 Final weak relationships:", weakRelationships);
  console.log("🔍 Entity:", e.name, "→ weakType:", weakType, "hasPartialKey:", hasPartialKey);

      // Check if it's using a partial key (based on name or special characters)
      const usesPartialKey = keyAttrs.some(attr =>
        attr.name?.includes("‒") || attr.name?.toLowerCase().includes("partial")
      );

      // ❌ Partial key in a weak entity that is NOT identifying → invalid
      if (weakType !== "identifying" && usesPartialKey) {
        validationMessages.push(
          `❌ Partial key cannot be used in weak entity "${e.name}" because it is not in an identifying relationship.`
        );
        sqlBlocked = true;
      }

      if (weakType === "identifying") {
        const rel = weakRelationships.find(r =>
              r.entities.some(ent => ent.name === e.name)
            );

            const relType = rel?.type || "unknown";

            const requiresPartial = relType === "one-to-many" || relType === "many-to-many";

            if (requiresPartial && !hasPartialKey) {
              validationMessages.push(
                `❌ Weak entity "${e.name}" is in a ${relType.replace(/-/g, " ")} identifying relationship and must have exactly one partial key (with dashed underline).`
              );
              sqlBlocked = true;
            }
            if (!requiresPartial && !hasPartialKey) {
                  console.log(`ℹ️ Weak entity "${e.name}" is in a 1:1 identifying relationship – partial key is optional.`);
                }

                if (hasPartialKey && !requiresPartial && relType === "one-to-one") {
                  console.log(`✅ "${e.name}" uses a partial key in 1:1 — accepted.`);
                }
              } else {
                const hasPrimaryKey = keyAttrs.length >= 1 && keyAttrs.every(attr => !attr.isPartialKey);
                if (!hasPrimaryKey) {
                  validationMessages.push(
                    `❌ Weak entity "${e.name}" is not in an identifying relationship and must use a proper primary key.`
                  );
                  sqlBlocked = true;
                }
              }
            });


    // ✅ Step 4: Detect Associative Entities (only rhombus inside rectangle)
    Object.values(cells).forEach((cell) => {
      if (cell.vertex && getCellStyle(cell).includes("rhombus")) {
        const assocRelName = getCellValue(cell)?.trim();
        if (!assocRelName) return;

        // ✅ Require rhombus to be inside a rectangle
        const parent = findParentVertex(cell);
        const parentStyle = parent?.style || "";
        if (!parentStyle.includes("rectangle")) {
          console.log(`⛔ Skipped associative detection for "${assocRelName}" – not grouped in rectangle.`);
          return;
        }

        // ✅ Skip if already marked as identifying
        if (identifyingRelationshipIds.includes(cell.id)) {
          console.log(`⛔ Skipped associative detection for "${assocRelName}" – identifying.`);
          return;
        }

        const connectedEntities = [];
        const assocAttributes = [];

        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const other = edge.source === cell ? edge.target : edge.source;
            if (!other || !other.id) return;

            const otherId = findParentVertex(other)?.id;

            if (entities[otherId]) {
              connectedEntities.push(entities[otherId]);
            } else if (attributes[otherId]) {
              assocAttributes.push(attributes[otherId]);
            }
          }
        });

        if (connectedEntities.length === 2) {
          associativeEntities.push({
            name: assocRelName,
            entities: connectedEntities,
            attributes: assocAttributes,
          });
          console.log("📦 Associative Entity detected (grouped rhombus):", assocRelName);
        }
      }
    });


    // ✅ Run validation AFTER the loop
    console.log("🔎 Checking associative entities:", associativeEntities);
    associativeEntities.forEach((ae) => {
      if (!ae.attributes || ae.attributes.length === 0) {
        validationMessages.push(
          `❌ Associative entity "${ae.name}" must have at least one attribute.`
        );
        sqlBlocked = true;
      }
    });



    // ✅ STEP: Ensure every entity is connected to at least one relationship
    const connectedEntityIds = new Set();

    Object.values(cells).forEach((cell) => {
      if (cell.edge) {
        const source = findParentVertex(cell.source);
        const target = findParentVertex(cell.target);

        // Only mark connected if the *other* end is a relationship
        if (source && target) {
          const sourceIsEntity = !!entities[source.id];
          const targetIsEntity = !!entities[target.id];

          const sourceIsRel = getCellStyle(source).includes("rhombus");
          const targetIsRel = getCellStyle(target).includes("rhombus");

          if (sourceIsEntity && targetIsRel) {
            connectedEntityIds.add(source.id);
          } else if (targetIsEntity && sourceIsRel) {
            connectedEntityIds.add(target.id);
          }
        }
        console.log("🔍 Entity connectivity check:");
          Object.entries(entities).forEach(([id, e]) => {
            console.log(`- ${e.name} (id=${id}): connected=${connectedEntityIds.has(id)}`);
          });
      }
    });


    Object.values(cells).forEach((cell) => {
      if (cell.edge) {
        const source = findParentVertex(cell.source);
        const target = findParentVertex(cell.target);

        if (source && entities[source.id]) {
          connectedEntityIds.add(entities[source.id]?.name);  // ✅ use name
        }
        if (target && entities[target.id]) {
          connectedEntityIds.add(entities[target.id]?.name);  // ✅ use name
        }
      }
    });

    // ✅ Check all unique entity names
    Object.entries(entities).forEach(([id, entity]) => {
      if (!connectedEntityIds.has(id)) {
        validationMessages.push(`❌ Entity "${entity.name}" must be connected to at least one relationship.`);
        sqlBlocked = true;
      }
    });

    // ✅ Validate each relationship or associative entity is linked to at least two entities
    Object.values(cells).forEach((cell) => {
      if (cell.vertex && !cell.parent?.vertex) {
        const style = getCellStyle(cell);

        const isRhombus = style.includes("rhombus");
        const isAssociative =
          style.includes("rectangle") &&
          cell.children?.some((child) => getCellStyle(child).includes("rhombus"));

        if (isRhombus || isAssociative) {
          const relationshipId = cell.id;
          const relName = getCellValue(cell) || "Unnamed Relationship";
          const connectedEntities = new Set();

          Object.values(cells).forEach((edge) => {
            if (!edge.edge) return;

            const source = findParentVertex(edge.source);
            const target = findParentVertex(edge.target);

            // ✅ Only count if one end is this relationship and the other is an entity
            if (source?.id === relationshipId && target?.id && entities[target.id]) {
              connectedEntities.add(target.id);
            } else if (target?.id === relationshipId && source?.id && entities[source.id]) {
              connectedEntities.add(source.id);
            }
          });

          // ✅ Debug
          console.log(`🔗 Relationship "${relName}" connected to entities:`, [...connectedEntities]);

          if (connectedEntities.size < 2) {
            validationMessages.push(
              `❌ Relationship "${relName}" must connect to at least two entities.`
            );
            sqlBlocked = true;
          }
        }
      }
    });

    // ✅ Detect invalid attributes on strong relationships
    Object.values(cells).forEach((cell) => {
      if (
        cell.vertex &&
        getCellStyle(cell).includes("rhombus") &&
        findParentVertex(cell)?.style?.includes("rectangle") // ✅ only grouped rhombus inside rectangle
      ) {        
        const relName = getCellValue(cell) || "Unnamed Relationship";
        const isGrouped = cell.children?.some((child) =>
          getCellStyle(child).includes("rhombus")
        );

        // ✅ Only check plain rhombus (not grouped/double or associative)
        if (!isGrouped) {
          const hasAttribute = Object.values(cells).some((edge) => {
            if (!edge.edge) return false;

            const source = findParentVertex(edge.source);
            const target = findParentVertex(edge.target);

            const connectedToThis =
              source?.id === cell.id || target?.id === cell.id;

            const other = source?.id === cell.id ? target : source;

            return (
              connectedToThis &&
              other &&
              getCellStyle(other).includes("ellipse") && // ✅ it's an attribute
              !entities[other.id] // ✅ not an entity
            );
          });

          if (hasAttribute) {
            validationMessages.push(
              `❌ Strong relationship "${relName}" cannot have attributes.`
            );
            sqlBlocked = true;
          }
        }
      }
    });

    // ✅ Detect missing cardinality on entity ↔ relationship edges
    Object.values(cells).forEach((edge) => {
      if (!edge.edge) return;

      const source = findParentVertex(edge.source);
      const target = findParentVertex(edge.target);

      if (!source || !target) return;

      const sourceStyle = getCellStyle(source);
      const targetStyle = getCellStyle(target);

      const sourceIsEntity = !!entities[source.id];
      const targetIsEntity = !!entities[target.id];

      const sourceIsRelationship = sourceStyle.includes("rhombus");
      const targetIsRelationship = targetStyle.includes("rhombus");

      const sourceIsAssocEntity = sourceStyle.includes("rectangle") &&
        source.children?.some(child => getCellStyle(child).includes("rhombus"));

      const targetIsAssocEntity = targetStyle.includes("rectangle") &&
        target.children?.some(child => getCellStyle(child).includes("rhombus"));

      const isValidLink =
        (sourceIsEntity && (targetIsRelationship || targetIsAssocEntity)) ||
        (targetIsEntity && (sourceIsRelationship || sourceIsAssocEntity));

      if (isValidLink) {
        const label = (edge.value || "").toLowerCase().trim();

      if (!/[1nm]/i.test(label)) {
        const fromName = getCellValue(source);
          const toName = getCellValue(target);
          validationMessages.push(
            `❌ Line between "${fromName}" and "${toName}" must have a relationship type (e.g., 1, N, M).`
          );
          sqlBlocked = true;
        }
      }
    });

    let sqlOutput = "";
    const generatedTables = new Set();

    weakRelationships.forEach((rel) => {
      
      if (sqlBlocked) return; 
      const [a, b] = rel.entities;
      const [strong, weak] =
        a.isWeak && !b.isWeak ? [b, a] :
        b.isWeak && !a.isWeak ? [a, b] :
        [a, b];

      const strongPK = strong.primaryKey || `${strong.name.toLowerCase()}_id`;
      const weakPK = weak.primaryKey || `${weak.name.toLowerCase()}_id`;

      if (rel.identifying && rel.type === "one-to-many") {
        if (!weak.attributes.find(attr => attr.name === strongPK)) {
          weak.attributes.unshift({ name: strongPK, isKey: true, isDerived: false });
        }
        if (!weak.attributes.find(attr => attr.name === weakPK)) {
          weak.attributes.push({ name: weakPK, isKey: true, isDerived: false });
        }

        rel.attributes.forEach(attr => {
          if (!attr.isDerived && !weak.attributes.find(a => a.name === attr.name)) {
            weak.attributes.push({ name: attr.name, isKey: false, isDerived: false });
          }
        });

        weak.primaryKey = `${strongPK}, ${weakPK}`;
      }
      if (rel.identifying && rel.type === "one-to-one") {
        const [main, secondary] = rel.entities;
        const mainPK = main.primaryKey || `${main.name.toLowerCase()}_id`;

        // Remove old mainPK if it exists
        secondary.attributes = secondary.attributes.filter(attr => attr.name !== mainPK);

        // Detect and mark the partial key
        let partialKeyName = null;
        for (const attr of secondary.attributes) {
          if (
            attr.name.toLowerCase().includes("id") &&
            attr.name !== mainPK &&
            !attr.references
          ) {
            partialKeyName = attr.name;
            attr.isKey = true; // ✅ mark it
            break;
          }
        }

        const partialKeyExists = !!partialKeyName;
        console.log("🧠 partialKeyExists:", partialKeyExists);

        // Inject mainPK with correct rule
        if (!partialKeyExists) {
          // ✅ No partial key: use PRIMARY KEY
          secondary.attributes.unshift({
            name: mainPK,
            isKey: true,
            isDerived: false,
            unique: false,
            references: main.name,
            notNull: true 
          });
        } else {
          // ✅ Has partial key: use UNIQUE FK
          secondary.attributes.unshift({
            name: mainPK,
            isKey: false,
            isDerived: false,
            unique: true,
            references: main.name
          });
        }

        // ✅ Build lines without "PRIMARY KEY" in column
        let lines = secondary.attributes
          .filter(attr => attr.name && attr.name.trim() !== "" && attr.name !== "PRIMARY KEY")
          .map(attr => {
            let line = `  ${attr.name} INT`;
            if (attr.notNull) line += " NOT NULL";
            if (attr.unique) line += " UNIQUE";
            if (attr.references) line += ` REFERENCES ${attr.references}(${mainPK})`;
            return line;
          });

        // ✅ Add composite PRIMARY KEY (mainPK, partialKey) at the bottom
        if (mainPK && partialKeyName && mainPK !== partialKeyName) {
          lines.push(`  PRIMARY KEY (${mainPK}, ${partialKeyName})`);
        }

        console.log("✅ FINAL SQL:");
        console.log(`CREATE TABLE ${secondary.name} (\n${lines.join(",\n")}\n);`);

        // ✅ Final SQL
        secondary.sql = `CREATE TABLE ${secondary.name} (\n${lines.join(",\n")}\n);`;
        sqlOutput += secondary.sql + "\n\n";  // ✅ <-- ADD THIS
        generatedTables.add(secondary.name); 
      }

      if (rel.type === "many-to-many" && rel.attributes.length > 0) {
  // Treat as associative entity
  const pkA = a.primaryKey || `${a.name.toLowerCase()}_id`;
  const pkB = b.primaryKey || `${b.name.toLowerCase()}_id`;
  const relName = rel.name || `${a.name}_${b.name}`;

  sqlOutput += `CREATE TABLE ${relName} (\n`;
  sqlOutput += `  ${pkA} INT,\n`;
  sqlOutput += `  ${pkB} INT,\n`;

  rel.attributes.forEach(attr => {
    const name = attr.name.toLowerCase().replace(/\s+/g, "_");
    let dataType = "VARCHAR(255)";
    if (name.includes("id")) dataType = "INT";
    else if (name.includes("date") || name.includes("time")) dataType = "DATE";
    else if (name.includes("price") || name.includes("amount") || name.includes("score")) dataType = "FLOAT";
    else if (name.includes("is_") || name.startsWith("has") || name.startsWith("can_")) dataType = "BOOLEAN";
    else if (name.includes("grade")) dataType = "CHAR(1)";
    else if (name.includes("count") || name.includes("number")) dataType = "INT";
    sqlOutput += `  ${name} ${dataType},\n`;
  });

  sqlOutput += `  PRIMARY KEY (${pkA}, ${pkB}),\n`;
  sqlOutput += `  FOREIGN KEY (${pkA}) REFERENCES ${a.name}(${pkA}) ON DELETE CASCADE,\n`;
  sqlOutput += `  FOREIGN KEY (${pkB}) REFERENCES ${b.name}(${pkB}) ON DELETE CASCADE\n`;
  sqlOutput += ");\n\n";

  return; // skip the normal M:N block
}


    });

    // ✅ Handle 1:1 Strong Entity Relationships (non-identifying only)
    Object.values(cells).forEach((cell) => {
      if (cell.vertex && getCellStyle(cell).includes("rhombus")) {
        const connectedEntities = [];

        // Find entities connected to this relationship
        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const other = edge.source === cell ? edge.target : edge.source;
            if (entities[other?.id]) connectedEntities.push(entities[other.id]);
          }
        });

        // ✅ Only continue if exactly 2 strong entities are connected
        if (connectedEntities.length === 2) {
          const [a, b] = connectedEntities;
          if (a.isWeak || b.isWeak) return; // skip if any is weak

          // Check if it's 1:1
          const edgeLabels = [];
          Object.values(cells).forEach((edge) => {
            if (edge.edge && (edge.source === cell || edge.target === cell)) {
              const label = (edge.value || "").toLowerCase();
              edgeLabels.push(label);
            }
          });
          const oneCount = edgeLabels.filter(l => l.includes("1")).length;
          if (oneCount !== 2) return; // not a 1:1

          // Pick one as main (FK will go into secondary)
          const main = a;
          const secondary = b;
          const mainPK = main.primaryKey || `${main.name.toLowerCase()}_id`;

          if (generatedTables.has(secondary.name)) return; // skip if already done

          // ✅ Inject FK with UNIQUE constraint
          if (!secondary.attributes.find(attr => attr.name === mainPK)) {
            secondary.attributes.unshift({
              name: mainPK,
              isKey: false,
              isDerived: false,
              unique: true,
              references: main.name
            });
          }

          // Build SQL
         const lines = secondary.attributes
            .filter(attr => attr.name && attr.name.trim() !== "")
            .map(attr => {
              let line = `  ${attr.name} INT`;
              if (attr.unique) line += " UNIQUE";
              if (attr.references) line += ` REFERENCES ${attr.references}(${mainPK})`;
              return line;
            });

          const pkAttr = secondary.attributes.find(attr => attr.isKey);
          if (pkAttr && !lines.some(line => line.includes("PRIMARY KEY"))) {
            lines.push(`  PRIMARY KEY (${pkAttr.name})`);
          }

          secondary.sql = `CREATE TABLE ${secondary.name} (\n${lines.join(",\n")}\n);`;
          sqlOutput += secondary.sql + "\n\n";
          generatedTables.add(secondary.name);
        }
      }
    });

    // ✅ Handle 1:N Strong Entity Relationships (non-identifying only)
    Object.values(cells).forEach((cell) => {
      if (cell.vertex && getCellStyle(cell).includes("rhombus")) {
        const connectedEntities = [];

        // Find connected entities
        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const other = edge.source === cell ? edge.target : edge.source;
            if (entities[other?.id]) connectedEntities.push(entities[other.id]);
          }
        });

        if (connectedEntities.length !== 2) return;

        const [a, b] = connectedEntities;
        if (a.isWeak || b.isWeak) return; // only strong entities here

        // Check edge labels
        const edgeLabels = [];
        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const label = (edge.value || "").toLowerCase();
            edgeLabels.push(label);
          }
        });

        const hasOne = edgeLabels.some(l => l.includes("1"));
        const hasMany = edgeLabels.some(l => l.includes("n") || l.includes("m"));

        if (!(hasOne && hasMany)) return; // must be 1:N

        // Determine main (1) and child (N)
        const oneSide = edgeLabels[0].includes("1") ? a : b;
        const manySide = oneSide === a ? b : a;
        const mainPK = oneSide.primaryKey || `${oneSide.name.toLowerCase()}_id`;


        // Inject FK into N-side
        if (!manySide.attributes.find(attr => attr.name === mainPK)) {
          manySide.attributes.unshift({
            name: mainPK,
            isKey: false,
            isDerived: false,
            unique: false,
            references: oneSide.name
          });
        }
      }
    });

    // ✅ Handle Many-to-Many Relationships (strong entities only)
    Object.values(cells).forEach((cell) => {
  if (cell.vertex && getCellStyle(cell).includes("rhombus")) {
    const cellName = getCellValue(cell)?.trim() || (cell.children?.[0]?.value || "").trim();

    const isAlreadyAssoc = associativeEntities.some(ae => ae.name === cellName);
    if (isAlreadyAssoc) return; // ✅ SKIP already handled as associative entity

    const connectedEntities = [];

        // Detect connected entities
        Object.values(cells).forEach((edge) => {
          if (edge.edge && (edge.source === cell || edge.target === cell)) {
            const other = edge.source === cell ? edge.target : edge.source;
            if (entities[other?.id]) connectedEntities.push(entities[other.id]);
          }
        });

        if (connectedEntities.length !== 2) return;
        const [a, b] = connectedEntities;
        if (a.isWeak || b.isWeak) return;

        // Count edge labels
        const edgeLabels = [];
    Object.values(cells).forEach((edge) => {
      if (edge.edge && (edge.source === cell || edge.target === cell)) {
        const label = (edge.value || "").toLowerCase().trim();
        edgeLabels.push(label);
      }
    });

        const manyCount = edgeLabels.filter(l => l.includes("m") || l.includes("n")).length;
    if (manyCount < 2) return;

    const relName = cellName || `${a.name}_${b.name}`;
    const pkA = a.primaryKey || `${a.name.toLowerCase()}_id`;
    const pkB = b.primaryKey || `${b.name.toLowerCase()}_id`;

    let sql = `CREATE TABLE ${relName} (\n`;
    sql += `  ${pkA} INT,\n`;
    sql += `  ${pkB} INT,\n`;
    sql += `  PRIMARY KEY (${pkA}, ${pkB}),\n`;
    sql += `  FOREIGN KEY (${pkA}) REFERENCES ${a.name}(${pkA}),\n`;
    sql += `  FOREIGN KEY (${pkB}) REFERENCES ${b.name}(${pkB})\n`;
    sql += `);\n\n`;

    sqlOutput += sql;
  }
});



    // Generate entity tables
    Object.values(entitiesByName).forEach((entity) => {
      if (generatedTables.has(entity.name)) return;
      generatedTables.add(entity.name);

      sqlOutput += `CREATE TABLE ${entity.name} (\n`;

      let attrLines = entity.attributes
        .filter(attr =>
          attr.name &&
          attr.name.trim() !== "" &&
          !/^[-\s‒–—]+$/.test(attr.name)
        )
        .map(attr => {
          console.log("⚠️ SQL attr name:", JSON.stringify(attr.name));  // ADD THIS LINE
          const dataType = attr.name.includes("id") ? "INT" : "VARCHAR(255)";
          const unique = attr.unique ? " UNIQUE" : "";
          return `  ${attr.name} ${dataType}${unique}`;
        });

      entity.attributes.forEach(attr => {
        if (attr.references) {
          attrLines.push(`  FOREIGN KEY (${attr.name}) REFERENCES ${attr.references}(${attr.name})`);
        }
      });


      if (entity.primaryKey && entity.primaryKey.includes(",")) {
        attrLines.push(`  PRIMARY KEY (${entity.primaryKey})`);
      } else {
        const keyAttr = entity.attributes.find(a => a.isKey);
        if (keyAttr) {
          attrLines = attrLines.map(line =>
            line.startsWith(`  ${keyAttr.name} `)
              ? `${line} PRIMARY KEY`
              : line
          );
        }
      }

      weakRelationships.forEach(rel => {
        if (rel.identifying) {
          if (rel.type === "one-to-many") {
            const [strong, weak] =
              rel.entities[0].isWeak ? [rel.entities[1], rel.entities[0]] :
              rel.entities[1].isWeak ? [rel.entities[0], rel.entities[1]] :
              [rel.entities[0], rel.entities[1]];

            if (weak.name === entity.name) {
              const strongPK = strong.primaryKey || `${strong.name.toLowerCase()}_id`;
              attrLines.push(`  FOREIGN KEY (${strongPK}) REFERENCES ${strong.name}(${strongPK}) ON DELETE CASCADE`);
            }
          } else if (rel.type === "one-to-one") {
            const [main, secondary] = rel.entities;
            if (secondary.name === entity.name) {
              const mainPK = main.primaryKey || `${main.name.toLowerCase()}_id`;
              attrLines.push(`  FOREIGN KEY (${mainPK}) REFERENCES ${main.name}(${mainPK})`);
            }
          }
        }
      });

      sqlOutput += attrLines.join(",\n") + "\n);\n\n";
    });

    // Multi-valued attributes
    multiValuedAttributes.forEach((attr) => {
      const parent = attr.parentEntity;
      const parentId = `${parent.toLowerCase()}_id`;
      const attrName = attr.name.replace(/\s+/g, "_");
      const tableName = attrName.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join("_");
      sqlOutput += `CREATE TABLE ${tableName} (\n`;
      sqlOutput += `  ${parentId} INT,\n`;
      sqlOutput += `  ${attrName} VARCHAR(20),\n`;
      sqlOutput += `  PRIMARY KEY (${parentId}, ${attrName}),\n`;
      sqlOutput += `  FOREIGN KEY (${parentId}) REFERENCES ${parent}(${parentId}) ON DELETE CASCADE\n`;
      sqlOutput += ");\n\n";
    });

    // ✅ Associative Entity SQL Generation (with foreign keys and attribute types)
    associativeEntities.forEach((assoc) => {
        const [a, b] = assoc.entities;

        const getPrimaryKey = (entity) => {
          if (entity.primaryKey) return entity.primaryKey;
          const keyAttr = entity.attributes.find(attr => attr.isKey);
          return keyAttr ? keyAttr.name : `${entity.name.toLowerCase()}_id`;
        };

        const pkA = getPrimaryKey(a);
        const pkB = getPrimaryKey(b);

        sqlOutput += `CREATE TABLE ${assoc.name} (\n`;
        sqlOutput += `  ${pkA} INT,\n`;
        sqlOutput += `  ${pkB} INT,\n`;

        assoc.attributes.forEach(attr => {
          if (!attr.isDerived) {
            const name = attr.name.toLowerCase().replace(/\s+/g, "_");
            let dataType = "VARCHAR(255)";
            if (name.includes("id")) dataType = "INT";
            else if (name.includes("date") || name.includes("time")) dataType = "DATE";
            else if (name.includes("price") || name.includes("amount") || name.includes("score")) dataType = "FLOAT";
            else if (name.includes("is_") || name.startsWith("has") || name.startsWith("can_")) dataType = "BOOLEAN";
            else if (name.includes("grade")) dataType = "CHAR(1)";
            else if (name.includes("count") || name.includes("number")) dataType = "INT";
            sqlOutput += `  ${name} ${dataType},\n`;
          }
        });
        sqlOutput += `  PRIMARY KEY (${pkA}, ${pkB}),\n`;
        sqlOutput += `  FOREIGN KEY (${pkA}) REFERENCES ${a.name}(${pkA}) ON DELETE CASCADE,\n`;
        sqlOutput += `  FOREIGN KEY (${pkB}) REFERENCES ${b.name}(${pkB}) ON DELETE CASCADE\n`;
        sqlOutput += ");\n\n";
      });
      console.log("🧪 SQL BLOCKED:", sqlBlocked);
      console.log("📋 Validation Messages:", validationMessages);


      if (sqlBlocked) {
        console.warn("🚫 SQL blocked due to validation errors.");
        setValidationError(validationMessages.join("\n"));
        setSql(""); // clear any partial SQL
        return;
      }
      console.log("📝 FINAL SQL OUTPUT:\n", sqlOutput);

      setValidationError(""); // clear old error
      setSql(sqlOutput);
      localStorage.setItem("generatedSQL", sqlOutput);


    };