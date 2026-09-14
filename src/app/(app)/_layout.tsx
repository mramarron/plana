import { GlassContainer } from 'expo-glass-effect';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { ChartPie, CircleDollarSign, PiggyBank, Target } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, useColorScheme, View } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const isDark = colorScheme === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const tabBarBackgroundStyle = {
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.42)',
  };


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.wrapper}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: keyboardVisible
              ? { display: 'none' }
              : {
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 18,
                borderTopWidth: 0,
                borderRadius: 28,
                height: 58,
                paddingHorizontal: 8,
                marginHorizontal: 40,
                backgroundColor: 'transparent',
                shadowOpacity: 0,
                elevation: 0,
              },
            tabBarBackground: () => (
              <GlassContainer
                spacing={14}
                style={[styles.tabBarBackground, tabBarBackgroundStyle]}
                // This native glass effect is supported on iOS 26+ and falls back to a regular View elsewhere.
              />
            ),
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarInactiveBackgroundColor: 'transparent',
            tabBarItemStyle: {
              borderRadius: 18,
              marginHorizontal: 2,
              paddingVertical: 4,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
            },
          }}>
          <Tabs.Screen
            name="overview"
            options={{
              title: 'Overview',
              tabBarIcon: ({ color, size }) => <ChartPie color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: 'Transactions',
              tabBarIcon: ({ color, size }) => <CircleDollarSign color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="budgets"
            options={{
              title: 'Budgets',
              tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="goals"
            options={{
              title: 'Goals',
              tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
            }}
          />
        </Tabs>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
