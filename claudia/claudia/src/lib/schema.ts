import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["donor", "ngo", "admin"]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
]);
export const pledgeStatusEnum = pgEnum("pledge_status", [
  "pledged",
  "acknowledged",
  "fulfilled",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("donor"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const ngoProfiles = pgTable("ngo_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  primarySdg: integer("primary_sdg").notNull(),
  status: approvalStatusEnum("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  ngoId: uuid("ngo_id")
    .notNull()
    .references(() => ngoProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  sdg: integer("sdg").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const pledges = pgTable("pledges", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  donorId: uuid("donor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: pledgeStatusEnum("status").notNull().default("pledged"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
