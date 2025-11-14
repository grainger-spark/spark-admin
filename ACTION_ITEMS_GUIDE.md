# Action Items Implementation Guide

## ✅ Updated for Real API

The notifications system has been updated to properly handle action items from your Spark Inventory API.

## Type System

### Action Types
```typescript
type ActionType = 
  | 'create_sales_order'    // ✅ Fully implemented
  | 'update_sales_order'    // ⚠️ Not yet implemented on backend
  | 'not_actionable'        // ⚠️ Throws error if executed
```

### Action Item Data Structure

**Common Fields** (all action items):
- `emailSubject` - Original email subject
- `emailFrom` - Sender email address
- `emailMessageId` - Unique message identifier
- `summary` - AI-generated summary
- `orderNumbers` - (optional) Related order numbers

**Create Sales Order** specific fields:
- `customerName` - Customer name (required)
- `items[]` - Array of items with name, quantity, price, etc.
- `customerId`, `customerEmail`, `customerPhoneNumber`
- Shipping address fields
- `note`, `internalNote`, `paymentTerms`, `paymentMethod`

**Update Sales Order** specific fields:
- `orderNumber` - Order to update (e.g., "SO-123")
- `requestedChanges` - Description of changes
- `items[]` - Modified items
- `notes` - Additional notes

**Not Actionable** specific fields:
- `reason` - Why it's not actionable

## API Endpoints

### Fetch Action Items
```
GET /api/v1/users/me/action-items?isCompleted=false&sortBy=createdAt&sortDirection=desc
```

**Query Parameters:**
- `isCompleted` - `true` (completed), `false` (pending), or omit (all)
- `sortBy` - Field to sort by (default: `createdAt`)
- `sortDirection` - `asc` or `desc`

**Response:**
```json
{
  "data": [
    {
      "id": "guid",
      "actionType": "create_sales_order",
      "description": "Customer requests to order...",
      "isCompleted": false,
      "data": {
        "emailSubject": "New Order Request",
        "emailFrom": "customer@example.com",
        "summary": "...",
        "customerName": "John Smith",
        "items": [...]
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "completedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRows": 5,
    "totalPages": 1
  }
}
```

### Execute Action Item
```
POST /api/v1/users/me/action-items/{id}/execute
```

**Response:**
```json
{
  "success": true,
  "message": "Sales order created successfully",
  "resultId": "550e8400-e29b-41d4-a716-446655440000",
  "resultType": "SalesOrder",
  "resultData": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "SO-1/001-2025",
    "customerName": "John Smith",
    "total": 155.00
  }
}
```

## UI Implementation

### Notification List
- Shows pending action items (isCompleted=false)
- Displays action type as title (e.g., "Create Sales Order - customer@example.com")
- Shows AI summary as message
- Unread indicator for pending items

### Notification Detail Modal
- **Header**: Gradient with close button
- **Metadata**: Shows email from, subject
- **Action Items Section**: 
  - Action type badge
  - Status badge (⚡ Pending / ✓ Completed / ⏳ Executing)
  - Description
  - Email metadata (from, subject)
  - Action buttons:
    - "View Details" - Shows parsed data in alert
    - Action button (e.g., "Create Order") - Executes the action

### Action Execution Flow

1. User taps action button (e.g., "Create Order")
2. Confirmation dialog appears
3. On confirm:
   - Button shows loading state
   - Status changes to "⏳ Executing"
   - API call to `/execute` endpoint
4. On success:
   - Success alert with message
   - Modal closes
   - Notifications list refreshes (item removed from pending)
5. On error:
   - Error alert with message
   - Item remains in pending state

### Action Type Configuration

```typescript
const ACTION_TYPE_CONFIG = {
  create_sales_order: {
    title: 'Create Sales Order',
    icon: 'cart',
    actionLabel: 'Create Order',
    canExecute: true,  // ✅ Fully supported
  },
  update_sales_order: {
    title: 'Update Sales Order',
    icon: 'create',
    actionLabel: 'Review Changes',
    canExecute: false,  // ⚠️ Backend not implemented
  },
  not_actionable: {
    title: 'Needs Review',
    icon: 'alert-circle',
    actionLabel: 'Mark as Reviewed',
    canExecute: false,  // ⚠️ Throws BadRequestException
  },
};
```

## Status Handling

The API only has `isCompleted` (boolean), but the UI supports 3 states:

- **Pending**: `isCompleted=false`
- **Completed**: `isCompleted=true`
- **Executing**: Local UI state while API call is in progress

## Error Handling

### Not Implemented Actions
If user tries to execute `update_sales_order` or `not_actionable`:
```
Alert: "This action type is not yet supported. Please handle manually."
```

### API Errors
- **400**: "Action item is already completed"
- **501**: "This action type is not yet supported"
- **Other**: "Failed to execute action item"

## Data Display

### View Details Button
Shows parsed data in an alert:
- Email from
- Email subject
- Summary
- Customer name (for sales orders)
- Items list (for sales orders)

### In Production
Consider replacing the alert with:
- A detailed modal
- Navigation to a pre-filled form
- Expandable sections in the notification detail

## Files Updated

- ✅ `src/services/notifications/types.ts` - Complete type definitions
- ✅ `src/services/notifications/api.ts` - API integration with proper mapping
- ✅ `src/modules/notifications/NotificationsScreen/components/NotificationDetailModal.tsx` - Enhanced UI with execution
- ✅ `src/modules/notifications/NotificationsScreen/NotificationsScreen.tsx` - Added refresh callback
- ✅ `src/modules/notifications/NotificationsScreen/NotificationsScreenProvider.tsx` - Fetch pending items

## Testing

1. **Login** to the app
2. **Navigate** to Notifications tab
3. **View** pending action items from your API
4. **Tap** a notification to see details
5. **Tap** "View Details" to see parsed data
6. **Tap** "Create Order" (only for create_sales_order type)
7. **Confirm** execution
8. **Verify** success message and item removal

## Next Steps

### Recommended Enhancements

1. **Pre-fill Forms**: Use action item data to pre-fill sales order creation forms
2. **Navigation**: Navigate to created entity after execution
3. **Tabs**: Add "Completed" tab to view completed action items
4. **Badge Counter**: Show pending count on tab icon
5. **Rich Details**: Replace alert with detailed modal showing all data fields
6. **Retry Logic**: Handle failed executions with retry option
7. **Offline Support**: Queue actions when offline

### Backend Improvements Needed

1. Implement `update_sales_order` execution
2. Handle `not_actionable` properly (or remove from execution)
3. Add failed state tracking
4. Add retry mechanism for failed executions
5. Add progress tracking for long-running actions

## Type Safety

All action item data is properly typed:

```typescript
// Type guard example
if (actionItem.type === 'create_sales_order') {
  const data = actionItem.data as CreateSalesOrderData;
  console.log(data.customerName); // ✅ Type-safe
  console.log(data.items); // ✅ Type-safe
}
```

The UI will gracefully handle any action type, even if not in the config, by showing a generic "View" button that cannot be executed.
