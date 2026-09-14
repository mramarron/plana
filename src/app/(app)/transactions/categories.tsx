import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
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

import { Stack, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { CategoryRow, getCategories, saveCategory, TransactionType } from '@/lib/db';

const typeMeta = {
  income: {
    label: 'Income',
    accent: '#10B981',
    icon: ArrowUpRight,
  },
  expense: {
    label: 'Expense',
    accent: '#EF4444',
    icon: ArrowDownLeft,
  },
  loan: {
    label: 'Loan',
    accent: '#A78BFA',
    icon: BadgeDollarSign,
  },
};

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

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
      surfaceStrong: isDark ? '#1E293B' : '#F8FAFC',
    }),
    [colors, isDark]
  );

  const [type, setType] = useState<TransactionType>('income');
  const [categories, setCategories] = useState<CategoryRow[]>(() => getCategories('income'));
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    setCategories(getCategories(type));
  }, [type]);

  const meta = typeMeta[type];
  const Icon = meta.icon;

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Missing category', 'Please enter a category name first.');
      return;
    }

    saveCategory(type, newCategory);
    setNewCategory('');
    setCategories(getCategories(type));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Categories' }} />
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
              <Text style={[styles.backText, { color: palette.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: palette.text }]}>Categories</Text>
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
            <View style={styles.typeSelector}>
              {Object.entries(typeMeta).map(([key, item]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === key ? `${item.accent}22` : palette.field,
                      borderColor: type === key ? item.accent : palette.border,
                    },
                  ]}
                  onPress={() => setType(key as TransactionType)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${item.accent}22` }]}>
                    <item.icon size={16} color={item.accent} />
                  </View>
                  <Text style={[styles.typeText, { color: palette.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Add {meta.label.toLowerCase()} category</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder={`Add a ${meta.label.toLowerCase()} category`}
                  placeholderTextColor={palette.muted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: palette.field,
                      color: palette.text,
                      borderColor: palette.inputBorder,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: meta.accent }]}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.addButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: palette.text }]}>{meta.label} categories</Text>
            </View>

            {categories.length === 0 ? (
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No categories saved yet. Add a {meta.label.toLowerCase()} category to reuse it later.
              </Text>
            ) : (
              <View style={styles.categoryList}>
                {categories.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: palette.surfaceStrong,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <View style={[styles.categoryBadge, { backgroundColor: `${meta.accent}22` }]}>
                      <Icon size={14} color={meta.accent} />
                    </View>
                    <Text style={[styles.categoryName, { color: palette.text }]}>{item.name}</Text>
                  </View>
                ))}
              </View>
            )}
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  typeIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listHeader: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryList: {
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
