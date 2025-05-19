import React from 'react';
import styles from '../styles/guide.module.css';

const WhatIsThisPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>What is this website?</h1>
        <p>This website helps users design ER diagrams and generate SQL code. You can:</p>
        <ul>
          <li>Create ER diagrams easily with drag-and-drop tools</li>
          <li>Use templates for common systems</li>
          <li>Automatically generate SQL</li>
          <li>Export for MySQL/PostgreSQL use</li>
        </ul>

        <h2>What is an ER diagram?</h2>
        <p>
          An Entity Relationship (ER) Diagram is a type of flowchart that illustrates how “entities” such as people, objects or concepts relate to each other within a system. ER Diagrams are most often used to design or debug relational databases in the fields of software engineering, business information systems, education and research. Also known as ERDs or ER Models, they use a defined set of symbols such as rectangles, diamonds, ovals and connecting lines to depict the interconnectedness of entities, relationships and their attributes. They mirror grammatical structure, with entities as nouns and relationships as verbs.
        </p>

        <p>
          ER diagrams are related to data structure diagrams (DSDs), which focus on the relationships of elements within entities instead of relationships between entities themselves. ER diagrams also are often used in conjunction with data flow diagrams (DFDs), which map out the flow of information for processes or systems.
        </p>

        <h2>History of ER models</h2>
        <p>
          Peter Chen (a.k.a. Peter Pin-Shan Chen), currently a faculty member at Carnegie-Mellon University in Pittsburgh, is credited with developing ER modeling for database design in the 1970s. While serving as an assistant professor at MIT’s Sloan School of Management, he published a seminal paper in 1976 titled “The Entity-Relationship Model: Toward a Unified View of Data.”
        </p>

        <p>
          In a broader sense, the depiction of the interconnectedness of things dates back to least ancient Greece, with the works of Aristotle, Socrates and Plato. It’s seen more recently in the 19th and 20th Century works of philosopher-logicians like Charles Sanders Peirce and Gottlob Frege.
        </p>

        <p>
          By the 1960s and 1970s, Charles Bachman and A.P.G. Brown were working with close predecessors of Chen’s approach. Bachman developed a type of Data Structure Diagram, named after him as the Bachman Diagram. Brown published works on real-world systems modeling. James Martin added ERD refinements. The work of Chen, Bachman, Brown, Martin and others also contributed to the development of Unified Modeling Language (UML), widely used in software design.
        </p>

        <h2>Uses of entity relationship diagrams</h2>
        <ul>
          <li><strong>Database design:</strong> ER diagrams are used to model and design relational databases, in terms of logic and business rules (in a logical data model) and in terms of the specific technology to be implemented (in a physical data model). In software engineering, an ER diagram is often an initial step in determining requirements for an information systems project. It’s also later used to model a particular database or databases. A relational database has an equivalent relational table and can potentially be expressed that way as needed.</li>
          <li><strong>Database troubleshooting:</strong> ER diagrams are used to analyze existing databases to find and resolve problems in logic or deployment. Drawing the diagram should reveal where it’s going wrong.</li>
          <li><strong>Business information systems:</strong> The diagrams are used to design or analyze relational databases used in business processes. Any business process that uses fielded data involving entities, actions and interplay can potentially benefit from a relational database. It can streamline processes, uncover information more easily and improve results.</li>
          <li><strong>Business process re-engineering (BPR):</strong> ER diagrams help in analyzing databases used in business process re-engineering and in modeling a new database setup.</li>
          <li><strong>Education:</strong> Databases are today’s method of storing relational information for educational purposes and later retrieval, so ER Diagrams can be valuable in planning those data structures.</li>
          <li><strong>Research:</strong> Since so much research focuses on structured data, ER diagrams can play a key role in setting up useful databases to analyze the data.</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatIsThisPage;