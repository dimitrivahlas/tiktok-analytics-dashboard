import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const tiktokAccounts = pgTable("tiktok_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  username: text("username").notNull(),
  profileUrl: text("profile_url").notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => tiktokAccounts.id),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  hashtags: text("hashtags").array(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tiktokAccounts: many(tiktokAccounts),
}));

export const tiktokAccountsRelations = relations(tiktokAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [tiktokAccounts.userId],
    references: [users.id],
  }),
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  account: one(tiktokAccounts, {
    fields: [videos.accountId],
    references: [tiktokAccounts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTikTokAccountSchema = createInsertSchema(tiktokAccounts).pick({
  userId: true,
  username: true,
  profileUrl: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  accountId: true,
  title: true,
  thumbnailUrl: true,
  videoUrl: true,
  views: true,
  likes: true,
  comments: true,
  shares: true,
  hashtags: true,
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const tiktokProfileSchema = z.object({
  profileUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => url.includes("tiktok.com/"),
      "Please enter a valid TikTok profile URL"
    ),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTikTokAccount = z.infer<typeof insertTikTokAccountSchema>;
export type TikTokAccount = typeof tiktokAccounts.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type TikTokProfileData = z.infer<typeof tiktokProfileSchema>;
