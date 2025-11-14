# SparkAdmin

A modern React Native mobile application built with Expo for inventory management and administration. Features include user authentication, real-time chat, notifications, and profile management with a clean, responsive UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.23-000000.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 💬 **Real-time Chat** - Instant messaging functionality
- 🔔 **Push Notifications** - Stay updated with important alerts
- 👤 **Profile Management** - User settings and preferences
- 📱 **Cross-platform** - Works on iOS, Android, and Web
- 🎨 **Modern UI** - Clean and intuitive interface
- ⚡ **Performance Optimized** - Built with React Native's new architecture

## Requirements

- Node.js 18+ 
- npm or yarn
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Expo Go app (for testing on physical devices)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SparkAdmin.git
   cd SparkAdmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # API Configuration (optional - defaults are provided)
   API_BASE_URL=https://your-api-url.com
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your preferred platform**
   
   In the output, you'll find options to open the app in a:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) - for quick testing on physical devices

## Project Structure

This project follows a modular architecture pattern with clear separation of concerns:

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

## API Integration

The app integrates with a RESTful API for backend services. Configuration is handled in `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'https://sparkbackend.ngrok.app' : 'https://api.sparkinventory.com',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
};
```

## Available Scripts

- `npm start` - Start the development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device  
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality checks
- `npm run reset-project` - Reset to blank project template

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and patterns
- Use TypeScript for all new code
- Ensure all pages have corresponding providers
- Keep business logic out of UI components
- Export named functions only (no default exports unless necessary)

## Troubleshooting

### Common Issues

**Metro bundler not starting**
```bash
npx expo start --clear
```

**Dependencies not installing correctly**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build fails on iOS**
```bash
cd ios && pod install && cd ..
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the [Expo documentation](https://docs.expo.dev/)
- Review our [Project Structure](#project-structure) documentation

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
