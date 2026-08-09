import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '@/screens/HomeScreen';
import { LevelSelectScreen } from '@/screens/LevelSelectScreen';
import { GameplayScreen } from '@/screens/GameplayScreen';
import { PauseScreen } from '@/screens/PauseScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Back-stack hygiene notes:
 * - Home -> LevelSelect -> Gameplay is a normal push stack; system back
 *   pops one screen at a time with no duplicate screens (React Navigation
 *   de-dupes by route key, and we never push the same route twice).
 * - Pause is presented as a native modal on top of Gameplay rather than a
 *   push, so Gameplay's mounted state (and therefore the ViewModel/session
 *   hook state) is preserved underneath — no remount, no lost progress.
 * - Gameplay disables the swipe-back gesture so an accidental edge-swipe
 *   can't silently abandon a session; the hardware back button is
 *   intercepted inside GameplayScreen to open Pause instead of popping.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Gameplay" component={GameplayScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="Pause"
        component={PauseScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack.Navigator>
  );
}
