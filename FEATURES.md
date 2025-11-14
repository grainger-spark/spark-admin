# Features Overview

## 🔐 Login Screen

**Visual Design:**
- Gradient header (blue → purple) with "✨ SPARK" logo
- "Admin Portal" subtitle
- Clean white form area
- Email and password inputs with labels
- Primary blue "Sign In" button
- Error message display
- Loading state on button

**Functionality:**
- Form validation (requires email and password)
- Mock authentication (accepts any credentials)
- Automatic navigation to main app on success
- Error handling with user feedback

---

## 💬 Chat Screen

**Visual Design:**
- Message bubbles (blue for user, gray for assistant)
- Timestamp on each message
- Image previews in messages
- File attachment indicators
- Bottom input bar with:
  - 📎 Attach file button
  - 📷 Camera/screenshot button
  - Text input field
  - Send button (disabled when empty)
- Attachment preview chips (removable)
- Empty state message

**Functionality:**
- Send text messages
- Attach files via document picker
- Attach images via image picker
- Remove attachments before sending
- Message history display
- Auto-scroll to new messages
- Loading indicator while sending

---

## 🔔 Notifications Screen

**Visual Design:**

### List View:
- Card-based layout
- Each notification shows:
  - Bell icon in circular container
  - Title (e.g., "Agent email received: New Order Request")
  - Timestamp (day, date, time + "X days ago")
  - Message preview (2 lines max)
  - "ACTION ITEMS (1)" badge with lightning icon
  - Unread indicator (blue dot + blue left border)
- Pull-to-refresh
- Empty state message

### Detail Modal:
- Full-screen modal
- Gradient header (blue → purple) with:
  - Bell icon
  - Close button
- Scrollable content:
  - Full notification title
  - Complete timestamp
  - Full message in gray box
  - "⚡ ACTION ITEMS" section with:
    - Numbered action items (#1, #2, etc.)
    - Action title
    - Status badge (⚡ Pending / ✓ Completed / ✗ Failed)
    - Full description
    - "View Details" button (outline)
    - "Create Sales Order" button (primary)

**Functionality:**
- Fetch notifications on load
- Pull-to-refresh
- Mark as read when opened
- Open detail modal on tap
- Action buttons (ready for API integration)
- Status tracking for action items

---

## 🎨 Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

**Typography:**
- H1: 32px, Bold
- H2: 24px, Bold
- H3: 20px, Semibold
- Body: 16px, Regular
- Caption: 12px, Regular

**Spacing:**
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

---

## 📱 Navigation

**Tab Bar:**
- Two tabs: Chat and Notifications
- Icons change color when active (blue)
- Header shows screen title
- Primary blue header background

**Authentication Flow:**
- Unauthenticated: Shows Login screen
- Authenticated: Shows Main tabs
- No back button after login (stack reset)

---

## 🔌 API Integration Points

All mock APIs are in `src/services/*/api.ts`:

1. **Auth API** (`src/services/auth/api.ts`):
   - `loginApi(credentials)` → User
   - `logoutApi()` → void

2. **Chat API** (`src/services/chat/api.ts`):
   - `sendMessageApi(content, attachments)` → ChatMessage

3. **Notifications API** (`src/services/notifications/api.ts`):
   - `fetchNotificationsApi()` → Notification[]
   - `markAsReadApi(notificationId)` → void

Replace these with real API calls to connect to your backend.

---

## 📦 Dependencies

**Navigation:**
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs

**UI:**
- expo-linear-gradient (gradients)
- @expo/vector-icons (icons)

**File Handling:**
- expo-image-picker (images/screenshots)
- expo-document-picker (file attachments)

**Core:**
- react-native
- expo
- typescript
