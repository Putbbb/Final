import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function Template({ onTemplateSelect }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // The categories you want to show
  const templateCategories = [
    { title: "All Templates", subcategories: [] },
    { title: "Recommended", subcategories: [] },
    {
      title: "By Personal Use",
      subcategories: ["Personal Website", "Portfolio Website", "Photography Website"],
    },
    {
      title: "By Learning & Education",
      subcategories: ["Educational Website", "Non-Profit/Charity Website"],
    },
    {
      title: "By Information & Knowledge",
      subcategories: ["Blog/Content Website", "News Website", "Wiki/Informational Website"],
    },
    {
      title: "By Entertainment & Media",
      subcategories: ["Entertainment Website", "Gaming Website"],
    },
    {
      title: "By Niche-Specific",
      subcategories: [
        "Eyeglasses Website",
        "Jewelry Website",
        "Phone Accessories Website",
        "Electronic Devices Website",
        "Clothing Website",
        "Logo Design Website",
      ],
    },
  ];
  useEffect(() => {
  const autoExpand = {};
  if (searchTerm.trim()) {
    templateCategories.forEach((cat) => {
      autoExpand[cat.title] = true;
    });
  } else {
    // Collapse all if no search
    templateCategories.forEach((cat) => {
      autoExpand[cat.title] = false;
    });
  }
  setExpanded(autoExpand);
}, [searchTerm]);

  const toggleCategory = (category) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Called when a user clicks a subcategory
  const handleSubcategoryClick = (templateName) => {
    if (onTemplateSelect) {
      onTemplateSelect(templateName);
    }
  };

  // Optional: filter subcategories by searchTerm
  const filteredCategories = templateCategories
  .map((cat) => {
    if (!searchTerm.trim()) return cat;

    const filteredSubs = cat.subcategories.filter((sub) =>
      sub.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return { ...cat, subcategories: filteredSubs };
  })
  .filter((cat) => {
    // Show all if no search, otherwise only keep categories that have results
    return !searchTerm.trim() || cat.subcategories.length > 0;
  });
  return (
    <div style={{ padding: "10px" }}>
      <h3>Templates</h3>

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <FaSearch style={{ position: "absolute", left: 10, top: 10, color: "#888" }} />
        <input
          type="text"
          placeholder="Search Templates"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: 30, width: "90%", height: "30px" }}
        />
      </div>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {filteredCategories.map((cat, i) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            {/* Category header row */}
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                padding: "6px",
                background: "#f0f0f0",
                borderRadius: "4px",
              }}
              onClick={() => toggleCategory(cat.title)}
            >
              <span>{cat.title}</span>
              {cat.subcategories.length > 0 && (
                <>
                  {expanded[cat.title] ? <FaChevronDown /> : <FaChevronRight />}
                </>
              )}
            </div>

            {/* Subcategories (templates) */}
            {expanded[cat.title] && cat.subcategories.length > 0 && (
              <ul style={{ marginLeft: 20, marginTop: 4 }}>
                {cat.subcategories.map((sub, idx) => (
                  <li
                    key={idx}
                    style={{
                      cursor: "pointer",
                      background: "#fff",
                      margin: "4px 0",
                      padding: "4px",
                      borderRadius: "4px",
                    }}
                    onClick={() => handleSubcategoryClick(sub)}
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
