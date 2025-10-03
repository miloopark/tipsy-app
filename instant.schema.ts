// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      type: i.string().optional(),
    }),
    friend_requests: i.entity({
      createdAt: i.number(),
      fromUser: i.string(),
      status: i.string(),
      toUser: i.string(),
    }),
    game_states: i.entity({
      category: i.string().optional(),
      payload: i.any().optional(),
      phase: i.string(),
      roomId: i.string(),
      turnUser: i.string().optional(),
      updatedAt: i.number(),
    }),
    messages: i.entity({
      createdAt: i.number(),
      expiresAt: i.number().optional(),
      roomId: i.string(),
      senderId: i.string(),
      text: i.string(),
    }),
    rooms: i.entity({
      createdAt: i.number(),
      createdBy: i.string(),
      localPlayers: i.any().optional(),
      members: i.any(),
      name: i.string(),
      isPublic: i.boolean().optional(), // For public dashboard
      status: i.string().optional(), // 'open' | 'in-progress' | 'finished'
      maxPlayers: i.number().optional(),
    }),
    users: i.entity({
      createdAt: i.number(),
      email: i.string().unique().indexed().optional(),
      nickname: i.string(),
      nicknameLower: i.string().indexed().optional(),
      // Firebase auth fields
      firebaseUid: i.string().unique().indexed().optional(),
      phone: i.string().unique().indexed().optional(),
      phoneHash: i.string().indexed().optional(), // For contact matching
      photoURL: i.string().optional(),
      // Stats for leaderboard
      gamesPlayed: i.number().optional(),
      gamesWon: i.number().optional(),
      totalPoints: i.number().optional(),
    }),
  },
  links: {},
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
