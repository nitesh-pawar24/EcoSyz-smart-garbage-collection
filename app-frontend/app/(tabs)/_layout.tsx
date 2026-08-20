import { Tabs } from 'expo-router';
import { Home, Map, MoreHorizontal, PlaySquare, QrCode } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

function ScanTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{
      width: 58, height: 58, borderRadius: 29,
      backgroundColor: focused ? '#5046e5' : '#6B5BFF',
      justifyContent: 'center', alignItems: 'center',
      marginTop: -28,
      shadowColor: '#6B5BFF', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5, shadowRadius: 10, elevation: 12,
      borderWidth: 3, borderColor: 'white',
    }}>
      <QrCode size={26} color="white" />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const tabBarHeight = Platform.OS === 'ios' ? 62 + insets.bottom : 68 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          borderTopWidth: 0, elevation: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: theme.dark ? 0.3 : 0.08,
          shadowRadius: 16,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 4 : insets.bottom + 12,
          height: tabBarHeight,
          backgroundColor: theme.tabBar,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.2,
        },
        tabBarItemStyle: { paddingTop: 2, overflow: 'visible' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color, focused }) => <Map size={22} color={color} strokeWidth={focused ? 2.5 : 2} /> }} />

      {/* Centre Scan */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <ScanTabIcon focused={focused} />,
          tabBarLabel: () => (
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary, marginTop: 6, letterSpacing: 0.3 }}>SCAN</Text>
          ),
        }}
      />

      <Tabs.Screen name="tutorial" options={{ title: 'Tutorial', tabBarIcon: ({ color, focused }) => <PlaySquare size={22} color={color} strokeWidth={focused ? 2.5 : 2} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, focused }) => <MoreHorizontal size={22} color={color} strokeWidth={focused ? 2.5 : 2} /> }} />
    </Tabs>
  );
}