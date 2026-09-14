import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign } from 'lucide-react-native';
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
import { addTransaction } from '@/lib/db';

const defaultType = 'income';

const typeMeta = {
  income: {
    label: 'Income',
    accent: '#10B981',
    icon: ArrowUpRight,
    placeholder: 'Salary, freelance, sale...',
  },
  expense: {
    label: 'Expense',
    accent: '#EF4444',
    icon: ArrowDownLeft,
    placeholder: 'Groceries, rent, bills...',
  },
  loan: {
    label: 'Loan',
    accent: '#A78BFA',
    icon: BadgeDollarSign,
    placeholder: 'Loan or repayment',
  },
};

export default function NewTransactionScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const initialType = params.type && typeMeta[params.type as keyof typeof typeMeta] ? params.type : defaultType;

  const [type, setType] = useState<'income' | 'expense' | 'loan'>(initialType as 'income' | 'expense' | 'loan');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

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
    }),
    [colors, isDark]
  );

  const meta = typeMeta[type];
  const Icon = meta.icon;

  const handleSave = () => {
    const cleanedAmount = Number(amount);

    if (!title.trim() || !Number.isFinite(cleanedAmount) || cleanedAmount <= 0) {
      Alert.alert('Missing details', 'Please enter a description and a valid amount greater than zero.');
      return;
    }

    addTransaction({
      type,
      category: category.trim() || meta.label,
      amount: cleanedAmount,
      note: title.trim(),
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add transaction' }} />
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
            <Text style={[styles.title, { color: palette.text }]}>New {meta.label}</Text>
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
                      backgroundColor:
                        type === key ? `${item.accent}22` : palette.field,
                      borderColor: type === key ? item.accent : palette.border,
                    },
                  ]}
                  onPress={() => setType(key as 'income' | 'expense' | 'loan')}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${item.accent}22` }]}>
                    <item.icon size={16} color={item.accent} />
                  </View>
                  <Text style={[styles.typeText, { color: palette.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={meta.placeholder}
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
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Amount</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
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
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Category</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Optional category"
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
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: meta.accent },
              ]}
              onPress={handleSave}
            >
              <Icon size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save {meta.label}</Text>
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
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
