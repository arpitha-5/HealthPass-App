# Chat Module

## Purpose
Supports user ↔ hospital support chat threads.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chats` | ✅ | Start (or resume) chat thread with a hospital |
| GET | `/api/chats` | ✅ | List all user's chat threads |
| GET | `/api/chats/:threadId/messages` | ✅ | Get messages in a thread |
| POST | `/api/chats/:threadId/messages` | ✅ | Send a message |

## Thread Lifecycle

```
POST /api/chats { hospitalId }
  → find existing active thread for (userId, hospitalId)
  → if none → create new ChatThread
  → return thread

POST /api/chats/:threadId/messages { content }
  → verify thread belongs to user
  → verify thread.isActive = true
  → create ChatMessage (senderType: USER)
  → update thread.updatedAt
```

## Sender Types (ChatSenderType enum)
- `USER` — patient
- `HOSPITAL` — hospital support staff (via their panel)
- `SYSTEM` — automated messages

## Chat Categories (from Product.md)
- Appointment support
- Doctor availability
- Hospital facilities
- Insurance query
- Report collection
- Billing clarification

## Files

| File | Responsibility |
|---|---|
| `chat.repository.ts` | Prisma: findOrCreate thread, messages CRUD |
| `chat.service.ts` | Ownership validation, active check |
| `chat.controller.ts` | Thin |
| `chat.router.ts` | Inline Zod schemas (simple module) |

## Extension Points
- Hospital panel can call `createMessage` with `senderType: HOSPITAL`
- Set `ChatThread.isActive = false` to disable chat for a specific hospital
- Push notifications on new message can be added in `chat.service.ts`
