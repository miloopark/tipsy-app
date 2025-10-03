# InstantDB Schema Configuration

## App ID
`023237b2-90a4-4124-831c-e2634fb6d20b`

## Dashboard URL
https://instantdb.com/dash

---

## Schema Setup Instructions

1. Navigate to https://instantdb.com/dash
2. Select your app: `023237b2-90a4-4124-831c-e2634fb6d20b`
3. Go to the **Schema** or **Explorer** tab
4. Create the following entities with their attributes:

---

## Entities (Collections)

### 1. **users**
Main user/player collection for storing Loopy usernames and authentication.

**Attributes:**
- `id` - **string** (primary key)
- `nickname` - **string** (required) - Display name for the user
- `nicknameLower` - **string** (optional) - Lowercase version for case-insensitive search
- `createdAt` - **number** (required) - Timestamp of user creation

**Indexes (recommended):**
- Index on `nicknameLower` for fast username searches
- Unique constraint on `id`

---

### 2. **friend_requests**
Manages friend connections between users.

**Attributes:**
- `id` - **string** (primary key)
- `fromUser` - **string** (required) - User ID who sent the request
- `toUser` - **string** (required) - User ID who receives the request
- `status` - **string** (required) - One of: "pending", "accepted", "rejected"
- `createdAt` - **number** (required) - Timestamp of request creation

**Indexes (recommended):**
- Index on `fromUser` for querying sent requests
- Index on `toUser` for querying incoming requests
- Index on `status` for filtering by status

---

### 3. **rooms**
Loopy game rooms where players gather to play games together.

**Attributes:**
- `id` - **string** (primary key)
- `name` - **string** (required) - Display name of the room
- `createdBy` - **string** (required) - User ID of room creator
- `members` - **json** (required) - Array of user IDs in the room
- `localPlayers` - **json** (optional) - Array of objects: `[{ name: string }]` for offline players
- `createdAt` - **number** (required) - Timestamp of room creation

**Indexes (recommended):**
- Index on `createdBy` for user's rooms
- Index on `members` if supported (array contains queries)

---

### 4. **messages**
Chat messages within rooms.

**Attributes:**
- `id` - **string** (primary key)
- `roomId` - **string** (required) - Room this message belongs to
- `senderId` - **string** (required) - User ID of message sender
- `text` - **string** (required) - Message content
- `createdAt` - **number** (required) - Timestamp of message
- `expiresAt` - **number** (optional) - Timestamp when message should expire

**Indexes (recommended):**
- Index on `roomId` for room-specific message queries
- Compound index on `roomId` + `createdAt` for sorted message history

---

### 5. **game_states**
Shared game state for multiplayer games within rooms.

**Attributes:**
- `id` - **string** (primary key)
- `roomId` - **string** (required) - Room this game state belongs to
- `phase` - **string** (required) - Current game phase: "idle", "playing"
- `turnUser` - **string** (optional) - User ID of current turn player
- `category` - **string** (optional) - Current game category/topic
- `payload` - **json** (optional) - Any additional game-specific data
- `updatedAt` - **number** (required) - Timestamp of last update

**Indexes (recommended):**
- Unique index on `roomId` (one game state per room)

---

### 6. **pings**
Test collection for verifying InstantDB connectivity.

**Attributes:**
- `id` - **string** (primary key)
- `createdAt` - **number** (required) - Timestamp
- `text` - **string** (required) - Test message

---

## Permissions (Important!)

For each entity, set appropriate permissions:

### Development/Testing (Permissive):
```
read: true
create: true
update: true
delete: true
```

### Production (Recommended):
- **users**: Users can read all, create/update their own
- **friend_requests**: Users can read their own, create new, update their own
- **rooms**: Users can read rooms they're members of, create new rooms
- **messages**: Users can read messages in their rooms, create messages
- **game_states**: Users can read/update game states in their rooms
- **pings**: Public read/write for testing

---

## Quick Setup Checklist

- [ ] Navigate to InstantDB dashboard
- [ ] Select app ID: `023237b2-90a4-4124-831c-e2634fb6d20b`
- [ ] Create `users` entity with 4 attributes
- [ ] Create `friend_requests` entity with 5 attributes
- [ ] Create `rooms` entity with 6 attributes
- [ ] Create `messages` entity with 6 attributes
- [ ] Create `game_states` entity with 7 attributes
- [ ] Create `pings` entity with 3 attributes
- [ ] Set permissions for each entity
- [ ] Test by creating a username in the app

---

## Troubleshooting

**"validation failed for coerced-query" error:**
- This means the schema is not defined or attributes are missing
- Check that all entities exist in the dashboard
- Verify attribute names match exactly (case-sensitive)
- Ensure attribute types are correct

**"permission denied" error:**
- Check entity permissions in the dashboard
- For development, set all permissions to `true`

**Connection issues:**
- Verify you're signed in as guest: Check console logs for `[instant:ensureGuestAuth]`
- Check network connectivity
- Verify APP_ID matches: `023237b2-90a4-4124-831c-e2634fb6d20b`

---

## Testing After Setup

After creating the schema:

1. Open the app
2. Click "Sign in / Continue"
3. Enter a nickname (e.g., "TestUser")
4. Click Save
5. Check for success or error messages
6. Verify in InstantDB dashboard that a user was created

If successful, you should see the user appear in the `users` collection in the dashboard!
