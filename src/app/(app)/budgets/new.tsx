import { ArrowLeft, Save } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { getCategories, saveBudget } from '@/lib/db';

export default function NewBudgetScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; category?: string; limit?: string }>();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const isEditing = Boolean(params.id);

  const [category, setCategory] = useState(params.category ?? '');
  const [limit, setLimit] = useState(params.limit ?? '');
  const [categories] = useState(() => getCategories('expense'));

  const palette = useMemo(
    () => ({
      background: colors.background,
      surface: colors.backgroundElement,
      border: isDark ? '#334155' : '#E2E8F0',
      text: colors.text,
      textSecondary: colors.textSecondary,
      muted: isDark ? '#94A3B8' : '#64748B',
      field: isDark ? '#0F172A' : '#F8FAFC',
      inputBorder: isDark ? '#334155' : '#CBD5E1',
      accent: '#10B981',
    }),
    [colors, isDark]
  );

  const handleSave = () => {
    const cleanedCategory = category.trim();
    const parsedLimit = Number(limit);

    if (!cleanedCategory || !Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      Alert.alert('Missing details', 'Choose a category and enter a valid monthly limit.');
      return;
    }

    saveBudget({
      id: isEditing ? Number(params.id) : undefined,
      category: cleanedCategory,
      limit_amount: parsedLimit,
      period: 'monthly',
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Edit budget' : 'New budget' }} />
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={18} color={palette.textSecondary} />
              <Text style={[styles.backText, { color: palette.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: palette.text }]}>{isEditing ? 'Edit budget' : 'New budget'}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.card,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Category</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Groceries, Rent, Transport..."
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />

              {categories.length > 0 && (
                <View style={styles.categorySuggestions}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.categorySuggestion,
                        {
                          backgroundColor: `${palette.accent}22`,
                          borderColor: `${palette.accent}66`,
                        },
                      ]}
                      onPress={() => setCategory(item.name)}
                    >
                      <Text style={[styles.categorySuggestionText, { color: palette.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Monthly limit</Text>
              <TextInput
                value={limit}
                onChangeText={setLimit}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: palette.accent }]}
              onPress={handleSave}
            >
              <Save size={18} color="#0F172A" />
              <Text style={styles.saveButtonText}>{isEditing ? 'Update budget' : 'Save budget'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  fieldRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  categorySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  categorySuggestion: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categorySuggestionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
