# Architecture Clarifications

## Important Distinctions

### Rooms vs Calls

#### **Rooms** (Room Service)
- **Chat-based group rooms** similar to 2go platform
- Multiple users can join and chat together
- Text messages, images, videos, stickers, GIFs
- Public or private visibility
- Can have optional entry fees (paid rooms)
- Roles: Host, Admin, Moderator, Member
- Features:
  - Group messaging
  - Typing indicators
  - Message history
  - Member management
  - Moderation (mute, kick)
  - Room categories/topics
- **NOT for audio/video streaming**

#### **Calls** (Call Service)
- **Audio and video calls** (1-on-1 or group)
- Real-time voice/video communication using WebRTC
- Per-minute billing for paid calls
- Features:
  - Audio calls
  - Video calls
  - Call duration tracking
  - Automatic billing every 10-30 seconds
  - Insufficient funds handling
- Different from chat rooms

#### **Chat** (Chat Service)
- **1-on-1 direct messaging**
- Private conversations between two users
- Features:
  - Text messages
  - Media sharing
  - Read receipts
  - Message deletion
  - Encryption
- Different from group rooms

### Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      User Communication                      │
├─────────────────────┬───────────────────┬───────────────────┤
│   1-on-1 Chat       │   Group Rooms     │   Audio/Video     │
│   (Chat Service)    │  (Room Service)   │  (Call Service)   │
├─────────────────────┼───────────────────┼───────────────────┤
│ • Private messages  │ • Group chat      │ • 1-on-1 calls    │
│ • Two users only    │ • Multiple users  │ • Group calls     │
│ • Media sharing     │ • Text/Media      │ • WebRTC          │
│ • Encrypted         │ • Public/Private  │ • Per-min billing │
│ • Read receipts     │ • Paid entry      │ • Audio + Video   │
│ • Message history   │ • Moderation      │                   │
└─────────────────────┴───────────────────┴───────────────────┘
```

### Examples

**Room Service Use Cases:**
- "Tech Talk Room" - public room where people discuss technology
- "Lagos Events" - room for Lagos-based users to chat
- "VIP Creator Room" - paid entry room with 50 coins
- "Friends Hangout" - private room for invited members only

**Call Service Use Cases:**
- User calls creator for 1-on-1 video consultation
- Group voice call with 5 people
- Paid audio call with per-minute billing

**Chat Service Use Cases:**
- Direct message to a friend
- Private conversation with a creator
- Sending photos/videos privately

## Economic Model

### Rooms
- **Entry Fees**: Optional paid entry (e.g., 10-50 coins)
- Host earns from entry fees (80% revenue, 20% platform)
- No per-minute billing for rooms
- Gifting can happen in rooms (separate gift events)

### Calls
- **Per-Minute Billing**: Continuous deduction every 10-30 seconds
- Creator earns per minute (80% revenue, 20% platform)
- Automatic call termination when coins run out
- Rate: 10 coins per minute (configurable)

### Chat
- Free 1-on-1 messaging
- No direct monetization
- Gifting can happen in chats (separate gift events)
