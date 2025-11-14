# SparkAdmin Implementation Guide

## Overview
This document describes the implementation of the three main flows in the SparkAdmin mobile app.

## Project Structure

```
src/
├── components/          # Global reusable components
│   ├── Button.tsx
│   └── Input.tsx
├── modules/            # Feature modules
│   ├── auth/
│   │   └── LoginScreen/
│   │       ├── LoginScreen.tsx
│   │       ├── LoginScreenProvider.tsx
│   │       └── index.ts
│   ├── chat/
│   │   └── ChatScreen/
│   │       ├── ChatScreen.tsx
│   │       ├── ChatScreenProvider.tsx
│   │       ├── components/
│   │       │   ├── MessageBubble.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   └── notifications/
│       └── NotificationsScreen/
│           ├── NotificationsScreen.tsx
│           ├── NotificationsScreenProvider.tsx
│           ├── components/
│           │   ├── NotificationCard.tsx
│           │   ├── NotificationDetailModal.tsx
│           │   └── index.ts
│           └── index.ts
├── providers/          # Global providers/contexts
│   ├── AuthProvider.tsx
│   └── index.ts
├── services/           # API calls, types, transformations
│   ├── auth/
│   │   ├── api.ts
│   │   ├── const.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── chat/
│   │   ├── api.ts
│   │   ├── const.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── notifications/
│   │   ├── api.ts
│   │   ├── const.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
├── theme/              # Theme configuration
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── index.ts
└── App.tsx            # Main app with navigation and providers

```

## Features Implemented

### 1. Login Flow
- **Location**: `src/modules/auth/LoginScreen/`
- **Features**:
  - Email and password input fields
  - Form validation
  - Loading states
  - Error handling
  - Gradient header with Spark branding
- **Provider**: `LoginScreenProvider` manages form state
- **Global Provider**: `AuthProvider` manages authentication state

### 2. Chat Screen
- **Location**: `src/modules/chat/ChatScreen/`
- **Features**:
  - Message list with user/assistant bubbles
  - Text input with send button
  - File attachment support (via document picker)
  - Image/screenshot attachment support (via image picker)
  - Attachment preview with remove option
  - Empty state
  - Loading states
- **Provider**: `ChatScreenProvider` manages chat state and actions
- **Components**:
  - `MessageBubble`: Displays individual messages with attachments

### 3. Notifications Screen
- **Location**: `src/modules/notifications/NotificationsScreen/`
- **Features**:
  - List of notifications with status indicators
  - Unread notification highlighting
  - Pull-to-refresh
  - Notification detail modal
  - Actionable items with status badges (Pending/Completed/Failed)
  - Action buttons (View Details, Create Sales Order, etc.)
  - Empty state
- **Provider**: `NotificationsScreenProvider` manages notifications state
- **Components**:
  - `NotificationCard`: List item with notification summary
  - `NotificationDetailModal`: Full-screen modal with action items

## Navigation Structure

```
App (AuthProvider)
└── NavigationContainer
    └── Stack Navigator
        ├── Login Screen (if not authenticated)
        └── Main Tabs (if authenticated)
            ├── Chat Tab
            │   └── ChatScreenProvider
            │       └── ChatScreen
            └── Notifications Tab
                └── NotificationsScreenProvider
                    └── NotificationsScreen
```

## Theme

The app uses the Spark brand colors:
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Gradient**: Blue to Purple
- **Status Colors**: Success, Warning, Error, Info

## Mock Data

Currently, all API calls are mocked in the services layer:
- **Auth**: Mock login accepts any email/password
- **Chat**: Mock echo response
- **Notifications**: Mock notification with actionable order request

## Next Steps

To connect to real APIs:
1. Update the API functions in `src/services/*/api.ts`
2. Add API base URL configuration
3. Add proper error handling
4. Add authentication token management
5. Implement real-time updates for chat and notifications

## Running the App

```bash
npm install
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## Dependencies Added

- `expo-linear-gradient`: For gradient backgrounds
- `expo-image-picker`: For image/screenshot selection
- `expo-document-picker`: For file attachments
- `@react-navigation/native-stack`: For stack navigation
- `@react-navigation/bottom-tabs`: For tab navigation (already installed)
