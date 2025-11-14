# API Integration Guide

## ✅ Localhost API Connected

The app is now configured to connect to your localhost API on port 5001.

## Configuration

**Development**: `http://localhost:5001`  
**Production**: `https://api.sparkinventory.com`

The app automatically uses localhost when running in development mode (`__DEV__`).

## API Endpoints Used

### 1. Authentication
```
POST /api/v1/authentication/login
Body: { username: string, password: string }
Response: { token, userId, tenantId, email, firstName, lastName }
```

### 2. Chat (AI Query)
```
POST /api/v1/ai/query
Headers: Authorization: Bearer <token>
Body: { query: string, context: {} }
Response: { response: string, suggestions: [] }
```

### 3. Notifications (Action Items)
```
GET /api/v1/action-items?status=pending
Headers: Authorization: Bearer <token>
Response: { data: [...], meta: {...} }

POST /api/v1/action-items/{id}/execute
Headers: Authorization: Bearer <token>
Response: { success: bool, message: string, result: {} }
```

## Testing Steps

### 1. Start Your Localhost API
Make sure your API is running on `http://localhost:5001`

### 2. Test Login
- Open the app
- Enter valid credentials from your API
- The app will call `POST /api/v1/authentication/login`
- On success, you'll be redirected to the main app

### 3. Test Chat
- Go to the Chat tab
- Type a message
- The app will call `POST /api/v1/ai/query` with your auth token
- You should see the AI response

### 4. Test Notifications
- Go to the Notifications tab
- The app will call `GET /api/v1/action-items?status=pending`
- You should see any pending action items
- Tap a notification to see details
- Click "Execute Action" to call `POST /api/v1/action-items/{id}/execute`

## Error Handling

The app includes comprehensive error handling:

- **Network errors**: Displays user-friendly error messages
- **Authentication errors**: Shows login errors
- **Timeout**: 30-second timeout for all requests
- **API errors**: Displays error messages from the API

## Debugging

### Check API Calls
All API calls go through `src/helpers/api.ts`. You can add console.log statements there to debug.

### Check Network Traffic
- iOS Simulator: Use Charles Proxy or similar
- Android Emulator: Use Android Studio's Network Inspector
- Physical Device: Use React Native Debugger

### Common Issues

**1. Cannot connect to localhost**
- iOS Simulator: Use `http://localhost:5001`
- Android Emulator: Use `http://10.0.2.2:5001` (update `src/services/config.ts`)
- Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:5001`)

**2. CORS errors**
- Make sure your API has CORS enabled for mobile requests
- Check that your API accepts requests from all origins in development

**3. SSL/HTTPS errors**
- Localhost uses HTTP, which is fine for development
- For production, ensure your API uses HTTPS

## Switching to Production

When ready to deploy, the app will automatically use `https://api.sparkinventory.com` when `__DEV__` is false.

To manually override, edit `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.sparkinventory.com', // Force production
  API_VERSION: 'v1',
  TIMEOUT: 30000,
};
```

## Files Modified

- ✅ `src/services/config.ts` - API configuration
- ✅ `src/helpers/api.ts` - HTTP request helper
- ✅ `src/services/auth/api.ts` - Real login endpoint
- ✅ `src/services/chat/api.ts` - Real AI query endpoint
- ✅ `src/services/notifications/api.ts` - Real action items endpoint
- ✅ `src/modules/chat/ChatScreen/ChatScreenProvider.tsx` - Pass auth token
- ✅ `src/modules/notifications/NotificationsScreen/NotificationsScreenProvider.tsx` - Pass auth token

## Next Steps

1. **Test login** with real credentials
2. **Test chat** with AI queries
3. **Test notifications** with action items
4. **Handle edge cases** (no internet, API down, etc.)
5. **Add loading states** where needed
6. **Add retry logic** for failed requests

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your API is running on port 5001
3. Check that endpoints match the API documentation
4. Ensure authentication tokens are being passed correctly
