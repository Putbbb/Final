import { pgTable, integer, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const account = pgTable('account', {
  userId: serial('user_id').primaryKey(),
  businessEmail: varchar('business_email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const project = pgTable('project', {
  projectId: serial('project_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => account.userId, { onUpdate: 'cascade', onDelete: 'cascade' }),
  projectName: varchar('project_name', { length: 255 }).notNull().default('untitled'),
  projectData: text('project_data'),
  creationDate: timestamp('creation_date').defaultNow(),
});

export const sharedWorkspace = pgTable('shared_workspace', {
  shareId: serial('share_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => account.userId, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => project.projectId, { onDelete: 'cascade' }),
  shareName: varchar('share_name', { length: 255 }).notNull(),
});