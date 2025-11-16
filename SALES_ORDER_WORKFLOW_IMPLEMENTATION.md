# Sales Order Workflow Implementation

## Overview

This document describes the complete implementation of the sales order fulfillment workflow from issue and approve through pick, pack, and ship operations.

## Architecture

### Services Layer (`src/services/salesOrders/`)

#### Core Files

1. **workflowTypes.ts** - Complete type definitions
   - Sales order statuses (created → completed)
   - Pick list types and statuses
   - Ship list types and statuses
   - Package types
   - Tracking information types
   - Request/response types

2. **workflowApi.ts** - API service implementations
   - Approval workflow APIs
   - Status management APIs
   - Packaging position APIs
   - Pick list management APIs
   - Ship list management APIs
   - Document generation APIs

3. **workflowUtils.ts** - Utility functions
   - Status configurations and colors
   - Status transition validation
   - Progress calculations
   - Formatting functions
   - Helper functions for workflow logic

### Modules Layer (`src/modules/`)

#### Pick Lists Module (`src/modules/pickLists/`)

1. **PickListProvider.tsx** - State management
   - Pick list state management
   - Item location tracking
   - Filter and pagination support

2. **PickListsScreen.tsx** - List view
   - Display all pick lists
   - Status badges and priority indicators
   - Progress tracking
   - Refresh and pagination

3. **PickListDetailScreen.tsx** - Detail view
   - Pick list information
   - Start/complete picking actions
   - Priority management
   - Item list with progress

4. **PickingScreen.tsx** - Picking interface
   - Location selection
   - Quantity input
   - Serial number scanning
   - Pick item functionality

#### Ship Lists Module (`src/modules/shipLists/`)

1. **ShipListProvider.tsx** - State management
   - Ship list state management
   - Package tracking
   - Filter and pagination support

2. **ShipListsScreen.tsx** - List view
   - Display all ship lists
   - Status badges and priority indicators
   - Progress tracking
   - Package count display

3. **ShipListDetailScreen.tsx** - Detail and packing view
   - Ship list information
   - Start/finish packing actions
   - Ship out functionality
   - Packing modal for items
   - Package management

#### Sales Orders Module Updates

1. **SalesOrderWorkflowScreen.tsx** - Workflow management
   - Order status display
   - Progress navigation bar
   - Workflow action buttons
   - Pick list and ship list links
   - Approval workflow
   - Status transitions

## Complete Workflow

### 1. Create Sales Order
```typescript
POST /sales-orders
Status: created
```

### 2. Submit & Approve (if required)
```typescript
POST /sales-orders/{id}/submission
Status: waitingApproval

POST /sales-orders/{id}/approval
Status: pending
```

### 3. Picking Phase
```typescript
// Create pick list
POST /packaging/sales-order/{id}
Status: picking

// Start picking
POST /pick-lists/{pickListId}/start
Status: inprogress

// Get locations for item
GET /pick-lists/{pickListId}/items/{itemId}/locations

// Pick items
POST /pick-lists/{pickListId}/items/{itemId}/collection

// Complete picking
POST /pick-lists/{pickListId}/completion
Status: completed
Sales Order Status: picked
```

### 4. Packing Phase
```typescript
// Get ship list
GET /shipping

// Start packing
POST /shipping/{shipListId}/start
Status: inprogress

// Pack items
POST /shipping/{shipListId}/items/{itemId}/packing

// Update package
POST /shipping/package/{packageId}/update

// Finish packing
POST /shipping/{shipListId}/finishing-packing
Status: readytoship
Sales Order Status: packed
```

### 5. Shipping Phase
```typescript
// Get rates
GET /shipping/{shipListId}/rates/{packageId}

// Book shipment
POST /shipping/{shipListId}/book-shipment

// Purchase label
POST /shipping/{shipListId}/shipping-label/{packageId}

// Ship out
POST /shipping/{shipListId}/shipping-out
Status: shipped
Sales Order Status: shipped
```

### 6. Complete
```typescript
PUT /sales-orders/{id}/status
{ "status": "completed" }
Status: completed
```

## Status Flow

### Sales Order Statuses
1. **created** - Order created, no inventory reservations
2. **waitingbackorder** - Items out of stock, PO will be made
3. **backorder** - Items out of stock, PO has been made
4. **waitingApproval** - Awaiting approval
5. **pending** - Acknowledged by warehouse
6. **picking** - At least one item being picked
7. **picked** - All items picked
8. **packing** - Order being packed
9. **packed** - All items packed
10. **readyForShipping** - Ready to ship
11. **waitingPersonalPickup** - Ready for customer pickup
12. **shipped** - Order shipped
13. **shipping** - Partial shipment
14. **completed** - Order completed
15. **canceled** - Order canceled

### Pick List Statuses
- **pending** - Not started
- **inprogress** - Currently picking
- **completed** - Picking complete
- **canceled** - Canceled

### Ship List Statuses
- **pending** - Not started
- **inprogress** - Currently packing
- **readytoship** - Ready for shipping
- **shipped** - Shipped
- **canceled** - Canceled

## Features Implemented

### Pick List Features
- ✅ List all pick lists with filters
- ✅ View pick list details
- ✅ Start picking workflow
- ✅ View item locations with quantities
- ✅ Pick items from locations
- ✅ Serial number tracking
- ✅ Lot number tracking
- ✅ Expiry date tracking
- ✅ Progress tracking
- ✅ Partial completion support
- ✅ Priority management
- ✅ Complete pick list

### Ship List Features
- ✅ List all ship lists with filters
- ✅ View ship list details
- ✅ Start packing workflow
- ✅ Pack items into packages
- ✅ Create new packages
- ✅ Add items to existing packages
- ✅ Update package dimensions/weight
- ✅ View shipping rates
- ✅ Book shipments
- ✅ Purchase shipping labels
- ✅ Void shipping labels
- ✅ Finish packing
- ✅ Ship out
- ✅ Priority management

### Sales Order Workflow Features
- ✅ Submit for approval
- ✅ Approve orders
- ✅ Start picking (create pick list)
- ✅ View progress navigation
- ✅ Link to pick lists
- ✅ Link to ship lists
- ✅ Change status
- ✅ Cancel orders
- ✅ Complete orders

## Usage Examples

### Using Pick Lists

```typescript
import { PickListProvider, PickListsScreen } from './modules/pickLists';

// Wrap in provider
<PickListProvider>
  <PickListsScreen onPickListPress={(pickList) => {
    // Navigate to detail screen
  }} />
</PickListProvider>
```

### Using Ship Lists

```typescript
import { ShipListProvider, ShipListsScreen } from './modules/shipLists';

// Wrap in provider
<ShipListProvider>
  <ShipListsScreen onShipListPress={(shipList) => {
    // Navigate to detail screen
  }} />
</ShipListProvider>
```

### Using Workflow Screen

```typescript
import { SalesOrderWorkflowScreen } from './modules/salesOrders';

<SalesOrderWorkflowScreen
  orderId={orderId}
  onBack={() => navigation.goBack()}
  onViewPickList={(pickListId) => {
    // Navigate to pick list
  }}
  onViewShipList={(shipListId) => {
    // Navigate to ship list
  }}
/>
```

## API Integration

All API calls require authentication:

```typescript
const { user } = useAuth();

// Example API call
const pickLists = await workflowApi.pickList.getPickLists(
  params,
  user?.token,
  user?.tenantId
);
```

## State Management

Each module uses React Context for state management:

- **PickListProvider** - Manages pick list state
- **ShipListProvider** - Manages ship list state
- **SalesOrdersProvider** - Manages sales order state

## Styling

All screens follow the app's design system:
- Background: `#F2F2F7`
- Cards: White with shadow
- Primary actions: `#007AFF`
- Success actions: `#34C759`
- Danger actions: `#FF3B30`
- Text: `#000000` (primary), `#8E8E93` (secondary)

## Error Handling

All API calls include comprehensive error handling:
- Try-catch blocks
- User-friendly error messages
- Loading states
- Retry mechanisms via pull-to-refresh

## Offline Support

Consider implementing:
- Local caching of pick/ship lists
- Queue for offline actions
- Sync when connection restored

## Testing Recommendations

1. **Unit Tests**
   - Test utility functions
   - Test status transitions
   - Test progress calculations

2. **Integration Tests**
   - Test API calls
   - Test state management
   - Test navigation flows

3. **E2E Tests**
   - Test complete workflow
   - Test picking process
   - Test packing process
   - Test shipping process

## Future Enhancements

1. **Barcode Scanning**
   - Integrate barcode scanner
   - Auto-fill item IDs
   - Auto-fill serial numbers

2. **Batch Operations**
   - Bulk pick multiple items
   - Bulk pack multiple items
   - Batch print labels

3. **Analytics**
   - Picking efficiency metrics
   - Packing time tracking
   - Shipping cost analysis

4. **Notifications**
   - Push notifications for status changes
   - Alerts for high-priority orders
   - Completion notifications

5. **Advanced Features**
   - Wave picking
   - Zone picking
   - Multi-warehouse support
   - Route optimization

## Support

For issues or questions:
- Check API documentation: https://api.sparkinventory.com/swagger/index.html
- Review this implementation guide
- Check console logs for detailed error messages

## Version History

- **v1.0.0** - Initial implementation
  - Complete workflow from create to ship
  - Pick list management
  - Ship list management
  - Approval workflow
  - Status management
