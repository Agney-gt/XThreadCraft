import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  twitterId: text("twitterId").unique(),
  twitterUsername: text("twitterUsername"),
  twitterAccessToken: text("twitterAccessToken"),
  twitterAccessSecret: text("twitterAccessSecret"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
})

export const tweets = pgTable("tweets", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  impressions: integer("impressions").default(0),
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  replies: integer("replies").default(0),
})

export const deletedTweets = pgTable("deleted_tweets", {
  id: uuid("id").defaultRandom().primaryKey(),
  tweetId: text("tweetId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  deletedAt: timestamp("deletedAt", { mode: "date" }).notNull(),
  impressions: integer("impressions"),
  likes: integer("likes"),
  retweets: integer("retweets"),
  replies: integer("replies"),
})

export const scheduledDeletions = pgTable("scheduled_deletions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tweetId: text("tweetId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  scheduledTime: timestamp("scheduledTime", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  executed: boolean("executed").default(false),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tweets: many(tweets),
  deletedTweets: many(deletedTweets),
  scheduledDeletions: many(scheduledDeletions),
}))

export const tweetsRelations = relations(tweets, ({ one }) => ({
  user: one(users, {
    fields: [tweets.userId],
    references: [users.id],
  }),
}))

export const deletedTweetsRelations = relations(deletedTweets, ({ one }) => ({
  user: one(users, {
    fields: [deletedTweets.userId],
    references: [users.id],
  }),
}))

export const scheduledDeletionsRelations = relations(scheduledDeletions, ({ one }) => ({
  user: one(users, {
    fields: [scheduledDeletions.userId],
    references: [users.id],
  }),
}))

