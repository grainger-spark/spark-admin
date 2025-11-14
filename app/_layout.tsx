import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { App } from '../src/App';

export default function RootLayout() {
  return (
    <>
      <App />
      <StatusBar style="auto" />
    </>
  );
}
