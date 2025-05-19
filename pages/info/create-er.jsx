import React from 'react';
import styles from '../../styles/guide2.module.css'; // fixed path

const CreateERPage = () => {
  return (
    <div className={styles.container} style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <div className={styles.content}>
        <h1>The components and features of an ER diagram</h1>
        <p>
          ER Diagrams are composed of entities, relationships and attributes. They also depict cardinality, which defines relationships in terms of numbers. Here’s a glossary:
        </p>

        <h3>Entity</h3>
        <p>
          A definable thing—such as a person, object, concept or event—that can have data stored about it. Think of entities as nouns. Examples: a customer, student, car or product. Typically shown as a rectangle.
        </p>
        <img src="/pic/entity1.png" alt="Entity" width="400" />

        <p>
          <strong>Entity type:</strong> A group of definable things, such as students or athletes, whereas the entity would be the specific student or athlete. Other examples: customers, cars or products.
        </p>
        <p>
          <strong>Entity set:</strong> Same as an entity type, but defined at a particular point in time, such as students enrolled in a class on the first day. Other examples: Customers who purchased last month, cars currently registered in Florida. A related term is instance, in which the specific person or car would be an instance of the entity set.
        </p>
        <p>
          <strong>Entity categories:</strong> Entities are categorized as strong, weak or associative. A <strong>strong entity</strong> can be defined solely by its own attributes, while a <strong>weak entity</strong> cannot. An associative entity associates entities (or elements) within an entity set.
        </p>

        <img src="/pic/entity2.png" alt="Weak Entity" width="400" />
        <img src="/pic/entity3.png" alt="Associative Entity" width="400" />

        <h3>Entity keys:</h3>
        <p>
          Refers to an attribute that uniquely defines an entity in an entity set. Entity keys can be super, candidate or primary.
          <br /><strong>Super key:</strong> A set of attributes (one or more) that together define an entity in an entity set.
          <br /><strong>Candidate key:</strong> A minimal super key, meaning it has the least possible number of attributes to still be a super key. An entity set may have more than one candidate key.
          <br /><strong>Primary key:</strong> A candidate key chosen by the database designer to uniquely identify the entity set.
          <br /><strong>Foreign key:</strong> Identifies the relationship between entities.
        </p>

        <h3>Relationship</h3>
        <p>
          How entities act upon each other or are associated with each other. Think of relationships as verbs. For example, the named student might register for a course. The two entities would be the student and the course, and the relationship depicted is the act of enrolling, connecting the two entities in that way. Relationships are typically shown as diamonds or labels directly on the connecting lines.
        </p>
        <img src="/pic/er-relationship-v2.png" alt="Relationship" width="400" />

        <p><strong>Recursive relationship:</strong> The same entity participates more than once in the relationship.</p>

        <h3>Attribute</h3>
        <p>A property or characteristic of an entity. Often shown as an oval or circle.</p>
        <img src="/pic/er-attribute-group.png" alt="Attributes" width="400" />

        <p><strong>Descriptive attribute:</strong> A property or characteristic of a relationship (versus of an entity.)</p>

        <p>
          <strong>Attribute categories:</strong> Attributes are categorized as simple, composite, derived, as well as single-value or multi-value.
          <br /><strong>Simple:</strong> Means the attribute value is atomic and can’t be further divided, such as a phone number.
          <br /><strong>Composite:</strong> Sub-attributes spring from an attribute.
          <br /><strong>Derived:</strong> Attributed is calculated or otherwise derived from another attribute, such as age from a birthdate.
        </p>
        <img src="/pic/er-derived.png" alt="Derived Attribute" width="400" />

        <p><strong>Multi-value:</strong> More than one attribute value is denoted, such as multiple phone numbers for a person.</p>
        <img src="/pic/er-multivalued.png" alt="Multivalued Attribute" width="400" />

        <p><strong>Single-value:</strong> Just one attribute value. The types can be combined, such as: simple single-value attributes or composite multi-value attributes.</p>

        <br /><br />
        <h2>How to draw a basic ER diagram</h2>
        <ol>
          <li><strong>Purpose and scope:</strong> Define the purpose and scope of what you’re analyzing or modeling.</li>
          <li><strong>Entities:</strong> Identify the entities that are involved. When you’re ready, start drawing them in rectangles (or your system’s choice of shape) and labeling them as nouns.</li>
          <li><strong>Relationships:</strong> Determine how the entities are all related. Draw lines between them to signify the relationships and label them. Some entities may not be related, and that’s fine. In different notation systems, the relationship could be labeled in a diamond, another rectangle or directly on top of the connecting line.</li>
          <li><strong>Attributes:</strong> Layer in more detail by adding key attributes of entities. Attributes are often shown as ovals.</li>
          <li><strong>Cardinality:</strong> Show whether the relationship is 1-1, 1-many or many-to-many.</li>
        </ol>

        <h2>More tips for ER diagrams</h2>
        <ol>
          <li>Show the level of detail necessary for your purpose. You might want to draw a conceptual, logical or physical model, depending on the detail needed. (See above for descriptions of those levels.)</li>
          <li>Watch for redundant entities or relationships.</li>
          <li>If you’re troubleshooting a database problem, watch for holes in relationships or missing entities or attributes.</li>
          <li>Make sure all your entities and relationships are labeled.</li>
          <li>You can translate relational tables and ER diagrams back and forth, if that helps you achieve your goal.</li>
          <li>Make sure the ER diagram supports all the data you need to store.</li>
          <li>There may be different valid approaches to an ER diagram. As long as it provides the necessary information for its scope and purpose, it’s good.</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateERPage;
