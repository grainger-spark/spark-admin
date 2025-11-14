# SparkAdmin

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Technical Documentation

### General Structure

```
/src
    /components -> Project global components
    /modules -> Modules are set of pages
    /navigation -> Main navigation handler
    /providers -> Providers/Context used in app
    /services -> Api calls, transformations, types for entities
    /helpers -> Global helpers (local storage, pagination, formatters, notifications)
    /theme -> Theme related files
    App.tsx -> Routes, pages and providers
```

### Module Structure

- **Every module can have multiple pages inside it and every page needs to be a part of some module.**
- Every module **needs** to have its own provider and every page **needs** to have its own provider.
- NO logic inside pages.
- ALL pages and providers are initialized in `App.tsx`

Example:

```
📂 modules
  📂 home
    📂 HomeScreen
      📂 components
        SomeComponent.tsx
        index.ts
      HomeScreen.tsx
      index.ts
```

### Services Structure

- Represents entities inside our project.
- CRUD api calls, transformations, initial values (const) and types for that entity.
- DO NOT import anything from pages to services
- **Should NOT contain helper functions**
- **All services need to be imported from "services"**. (watch for index files and their export)

```javascript
import { useUsers, initialUser, User } from 'services';
```

Example:

```
📂 services
  📂 users
    api.ts
    index.ts
    transformations.ts
    types.ts
    const.ts
```

### Import/Export

- **We do not export as default.** (unless all devs agree that we have a special case)

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
