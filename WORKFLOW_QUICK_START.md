# Sales Order Workflow - Quick Start Guide

## What Was Implemented

A complete sales order fulfillment system from order creation through picking, packing, and shipping.

## File Structure

```
src/
├── services/salesOrders/
│   ├── workflowTypes.ts       # All type definitions
│   ├── workflowApi.ts         # API service layer
│   ├── workflowUtils.ts       # Utility functions
│   └── index.ts               # Exports
│
├── modules/
│   ├── pickLists/
│   │   ├── PickListProvider.tsx        # State management
│   │   ├── PickListsScreen.tsx         # List view
│   │   ├── PickListDetailScreen.tsx    # Detail view
│   │   ├── PickingScreen.tsx           # Picking interface
│   │   └── index.ts
│   │
│   ├── shipLists/
│   │   ├── ShipListProvider.tsx        # State management
│   │   ├── ShipListsScreen.tsx         # List view
│   │   ├── ShipListDetailScreen.tsx    # Packing/shipping
│   │   └── index.ts
│   │
│   └── salesOrders/
│       ├── SalesOrderWorkflowScreen.tsx # Workflow management
│       └── ... (existing files)
```

## Integration Steps

### 1. Add to Navigation

```typescript
// In your navigation file
import {
  PickListProvider,
  PickListsScreen,
  PickListDetailScreen,
  PickingScreen,
} from './modules/pickLists';

import {
  ShipListProvider,
  ShipListsScreen,
  ShipListDetailScreen,
} from './modules/shipLists';

import { SalesOrderWorkflowScreen } from './modules/salesOrders';

// Add routes
<Stack.Screen name="PickLists" component={PickListsScreen} />
<Stack.Screen name="PickListDetail" component={PickListDetailScreen} />
<Stack.Screen name="Picking" component={PickingScreen} />
<Stack.Screen name="ShipLists" component={ShipListsScreen} />
<Stack.Screen name="ShipListDetail" component={ShipListDetailScreen} />
<Stack.Screen name="SalesOrderWorkflow" component={SalesOrderWorkflowScreen} />
```

### 2. Wrap with Providers

```typescript
// In your App.tsx or navigation setup
<PickListProvider>
  <ShipListProvider>
    <SalesOrdersProvider>
      {/* Your navigation */}
    </SalesOrdersProvider>
  </ShipListProvider>
</PickListProvider>
```

### 3. Link from Sales Order Detail

```typescript
// In SalesOrderDetailScreen
import { SalesOrderWorkflowScreen } from '../SalesOrderWorkflowScreen';

// Add button
<TouchableOpacity
  onPress={() => navigation.navigate('SalesOrderWorkflow', { orderId: order.id })}
>
  <Text>Manage Workflow</Text>
</TouchableOpacity>
```

## Basic Usage

### View Pick Lists

```typescript
import { PickListsScreen } from './modules/pickLists';

<PickListsScreen
  onPickListPress={(pickList) => {
    navigation.navigate('PickListDetail', { pickListId: pickList.id });
  }}
/>
```

### View Ship Lists

```typescript
import { ShipListsScreen } from './modules/shipLists';

<ShipListsScreen
  onShipListPress={(shipList) => {
    navigation.navigate('ShipListDetail', { shipListId: shipList.id });
  }}
/>
```

### Manage Order Workflow

```typescript
import { SalesOrderWorkflowScreen } from './modules/salesOrders';

<SalesOrderWorkflowScreen
  orderId={orderId}
  onBack={() => navigation.goBack()}
  onViewPickList={(pickListId) => {
    navigation.navigate('PickListDetail', { pickListId });
  }}
  onViewShipList={(shipListId) => {
    navigation.navigate('ShipListDetail', { shipListId });
  }}
/>
```

## Workflow Steps

### 1. Create Order
- Use existing sales order creation
- Order status: `created`

### 2. Approve (if needed)
- Open workflow screen
- Click "Submit for Approval"
- Click "Approve Order"
- Status: `pending`

### 3. Pick Items
- Click "Start Picking" in workflow screen
- Creates pick list automatically
- Navigate to pick list
- Click "Start Picking"
- For each item:
  - Click item
  - Select location
  - Enter quantity
  - Scan serial numbers (if required)
  - Click "Pick Item"
- Click "Complete Picking"
- Status: `picked`

### 4. Pack Items
- Navigate to ship lists
- Open ship list for order
- Click "Start Packing"
- For each item:
  - Click item
  - Enter quantity
  - Select package (new or existing)
  - Click "Pack"
- Click "Finish Packing"
- Status: `packed`

### 5. Ship
- In ship list detail
- Click "Ship Out"
- Status: `shipped`

### 6. Complete
- In workflow screen
- Click "Mark as Completed"
- Status: `completed`

## API Configuration

Ensure your `.env` file has:

```
API_BASE_URL=https://api.sparkinventory.com
API_VERSION=v1
```

## Common Issues

### Authentication Errors
- Ensure `user.token` and `user.tenantId` are available
- Check token expiration
- Re-login if needed

### Status Transition Errors
- Check allowed transitions in `workflowUtils.ts`
- Verify order is in correct status
- Review API error messages

### Missing Data
- Ensure all required fields are provided
- Check API documentation for required parameters
- Validate data before submission

## Testing

### Test Pick List Flow
1. Create a sales order with items
2. Submit and approve
3. Start picking
4. Pick all items
5. Complete pick list
6. Verify status changes

### Test Ship List Flow
1. Complete pick list first
2. Navigate to ship lists
3. Start packing
4. Pack all items
5. Finish packing
6. Ship out
7. Verify status changes

### Test Complete Workflow
1. Create order → Approve → Pick → Pack → Ship → Complete
2. Verify all status transitions
3. Check navigation bar updates
4. Verify item quantities

## Next Steps

1. **Add to Main Navigation**
   - Add "Pick Lists" tab/menu item
   - Add "Ship Lists" tab/menu item
   - Add workflow button to order detail

2. **Customize UI**
   - Adjust colors to match your brand
   - Add custom icons
   - Modify layouts as needed

3. **Add Features**
   - Barcode scanning
   - Print labels
   - Batch operations
   - Analytics

4. **Optimize**
   - Add caching
   - Implement offline support
   - Add loading skeletons
   - Optimize re-renders

## Support

- Full documentation: `SALES_ORDER_WORKFLOW_IMPLEMENTATION.md`
- API docs: https://api.sparkinventory.com/swagger/index.html
- Check console for detailed errors

## Summary

You now have a complete, production-ready sales order fulfillment system with:
- ✅ 15 sales order statuses
- ✅ Pick list management
- ✅ Ship list management
- ✅ Approval workflow
- ✅ Progress tracking
- ✅ Serial/lot/expiry tracking
- ✅ Package management
- ✅ Shipping integration
- ✅ Complete status flow

All screens are fully functional and ready to integrate into your navigation!
