# Sales Order Workflow - Testing Guide

## Quick Start

I've added a **"Workflow"** button to the Sales Order Detail screen. Here's how to integrate and test it:

## Integration Steps

### 1. Update Your Navigation

In your navigation file where you handle sales orders, add the workflow screen and connect it:

```typescript
import { 
  SalesOrderDetailScreen,
  SalesOrderWorkflowScreen 
} from './modules/salesOrders';

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

// In your Stack Navigator
<Stack.Screen 
  name="SalesOrderDetail" 
  component={SalesOrderDetailScreen}
  options={{ title: 'Order Details' }}
/>

<Stack.Screen 
  name="SalesOrderWorkflow" 
  component={SalesOrderWorkflowScreen}
  options={{ title: 'Order Workflow' }}
/>

<Stack.Screen 
  name="PickLists" 
  component={PickListsScreen}
  options={{ title: 'Pick Lists' }}
/>

<Stack.Screen 
  name="PickListDetail" 
  component={PickListDetailScreen}
  options={{ title: 'Pick List' }}
/>

<Stack.Screen 
  name="Picking" 
  component={PickingScreen}
  options={{ title: 'Pick Items' }}
/>

<Stack.Screen 
  name="ShipLists" 
  component={ShipListsScreen}
  options={{ title: 'Ship Lists' }}
/>

<Stack.Screen 
  name="ShipListDetail" 
  component={ShipListDetailScreen}
  options={{ title: 'Ship List' }}
/>
```

### 2. Pass the Workflow Handler

When rendering `SalesOrderDetailScreen`, pass the `onManageWorkflow` prop:

```typescript
<SalesOrderDetailScreen
  orderId={orderId}
  onEdit={(order) => {
    navigation.navigate('SalesOrderEdit', { orderId: order.id });
  }}
  onDelete={(order) => {
    // Handle delete
  }}
  onBack={() => navigation.goBack()}
  onManageWorkflow={(order) => {
    // Navigate to workflow screen
    navigation.navigate('SalesOrderWorkflow', { 
      orderId: order.id 
    });
  }}
/>
```

### 3. Wrap with Providers

Make sure your app is wrapped with the necessary providers:

```typescript
import { SalesOrdersProvider } from './modules/salesOrders';
import { PickListProvider } from './modules/pickLists';
import { ShipListProvider } from './modules/shipLists';

function App() {
  return (
    <SalesOrdersProvider>
      <PickListProvider>
        <ShipListProvider>
          {/* Your navigation */}
        </ShipListProvider>
      </PickListProvider>
    </SalesOrdersProvider>
  );
}
```

## Testing the Complete Flow

### Step 1: View Sales Order
1. Navigate to your sales orders list
2. Select an existing order
3. You'll now see a green **"Workflow"** button in the header

### Step 2: Access Workflow
1. Click the **"Workflow"** button
2. You'll see the workflow screen with:
   - Order status and details
   - Progress tracking (items ordered/picked/shipped)
   - Available workflow actions based on status

### Step 3: Test Approval (if needed)
If your order requires approval:
1. Click **"Submit for Approval"**
2. Click **"Approve Order"**
3. Status changes to `pending`

### Step 4: Start Picking
1. Click **"Start Picking"** button
2. A pick list is automatically created
3. Click **"View Pick List"** link
4. You'll see the pick list detail screen

### Step 5: Pick Items
1. In pick list detail, click **"Start Picking"**
2. Click on an item to pick
3. Select a location
4. Enter quantity
5. Scan serial numbers (if required)
6. Click **"Pick Item"**
7. Repeat for all items
8. Click **"Complete Picking"**

### Step 6: Pack Items
1. Navigate to Ship Lists (or from workflow screen)
2. Find the ship list for your order
3. Click **"Start Packing"**
4. Click on an item
5. Enter quantity to pack
6. Select "New Package" or existing package
7. Click **"Pack"**
8. Repeat for all items
9. Click **"Finish Packing"**

### Step 7: Ship
1. In ship list detail, click **"Ship Out"**
2. Confirm the shipment
3. Status changes to `shipped`

### Step 8: Complete
1. Return to workflow screen
2. Click **"Mark as Completed"**
3. Order is now complete!

## Quick Test Checklist

- [ ] Can see "Workflow" button on order detail
- [ ] Workflow screen shows order information
- [ ] Can submit for approval
- [ ] Can approve order
- [ ] Can start picking (creates pick list)
- [ ] Can navigate to pick list
- [ ] Can pick items from locations
- [ ] Can complete pick list
- [ ] Can navigate to ship list
- [ ] Can pack items into packages
- [ ] Can finish packing
- [ ] Can ship out
- [ ] Can mark as completed

## Navigation Example (Complete)

Here's a complete example of how to set up your navigation:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Providers
import { 
  SalesOrdersProvider,
  PickListProvider,
  ShipListProvider,
} from './modules';

// Screens
import {
  SalesOrdersListScreen,
  SalesOrderDetailScreen,
  SalesOrderWorkflowScreen,
} from './modules/salesOrders';

import {
  PickListsScreen,
  PickListDetailScreen,
  PickingScreen,
} from './modules/pickLists';

import {
  ShipListsScreen,
  ShipListDetailScreen,
} from './modules/shipLists';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* Sales Orders */}
      <Stack.Screen 
        name="SalesOrdersList" 
        component={SalesOrdersListScreen}
      />
      
      <Stack.Screen name="SalesOrderDetail">
        {({ navigation, route }) => (
          <SalesOrderDetailScreen
            orderId={route.params.orderId}
            onEdit={(order) => {
              navigation.navigate('SalesOrderEdit', { orderId: order.id });
            }}
            onDelete={(order) => {
              // Handle delete
              navigation.goBack();
            }}
            onBack={() => navigation.goBack()}
            onManageWorkflow={(order) => {
              navigation.navigate('SalesOrderWorkflow', { 
                orderId: order.id 
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SalesOrderWorkflow">
        {({ navigation, route }) => (
          <SalesOrderWorkflowScreen
            orderId={route.params.orderId}
            onBack={() => navigation.goBack()}
            onViewPickList={(pickListId) => {
              navigation.navigate('PickListDetail', { pickListId });
            }}
            onViewShipList={(shipListId) => {
              navigation.navigate('ShipListDetail', { shipListId });
            }}
          />
        )}
      </Stack.Screen>

      {/* Pick Lists */}
      <Stack.Screen 
        name="PickLists" 
        component={PickListsScreen}
      />
      
      <Stack.Screen name="PickListDetail">
        {({ navigation, route }) => (
          <PickListDetailScreen
            pickListId={route.params.pickListId}
            onBack={() => navigation.goBack()}
            onPickItem={(pickList, item) => {
              navigation.navigate('Picking', { 
                pickList, 
                item 
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Picking">
        {({ navigation, route }) => (
          <PickingScreen
            pickList={route.params.pickList}
            item={route.params.item}
            onBack={() => navigation.goBack()}
            onComplete={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      {/* Ship Lists */}
      <Stack.Screen 
        name="ShipLists" 
        component={ShipListsScreen}
      />
      
      <Stack.Screen name="ShipListDetail">
        {({ navigation, route }) => (
          <ShipListDetailScreen
            shipListId={route.params.shipListId}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <SalesOrdersProvider>
        <PickListProvider>
          <ShipListProvider>
            <AppNavigator />
          </ShipListProvider>
        </PickListProvider>
      </SalesOrdersProvider>
    </NavigationContainer>
  );
}
```

## What You'll See

### Sales Order Detail Screen
- **Green "Workflow" button** in the header (next to Edit and Delete)
- Click it to access the workflow management screen

### Workflow Screen
- Order status with color-coded badge
- Progress bars showing picked/shipped/billed items
- Action buttons based on current status:
  - Submit for Approval
  - Approve Order
  - Start Picking
  - Mark as Completed
  - Cancel Order
- Links to view pick lists and ship lists

### Pick List Screens
- List of all pick lists with progress
- Detail view with items to pick
- Picking interface with location selection
- Serial number scanning support

### Ship List Screens
- List of all ship lists with package counts
- Packing interface with package management
- Ship out functionality

## Troubleshooting

### "Workflow button not showing"
- Make sure you passed the `onManageWorkflow` prop to `SalesOrderDetailScreen`

### "Navigation error"
- Ensure all screens are registered in your Stack Navigator
- Check that route params match the expected names

### "Authentication error"
- Make sure user is logged in
- Check that `user.token` and `user.tenantId` are available

### "API errors"
- Verify your `.env` file has correct API_BASE_URL
- Check network connectivity
- Review console logs for detailed error messages

## Next Steps

1. **Start the app**: `npm start`
2. **Navigate to a sales order**
3. **Click the "Workflow" button**
4. **Follow the flow**: Approve → Pick → Pack → Ship → Complete

You're all set to test the complete sales order fulfillment workflow! 🚀
