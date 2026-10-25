import { useState, type ReactNode } from 'react';
import { ArrowLeft, LockKeyhole, Mail, Sprout, UserRound } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BloomLogo } from '../components/BloomLogo';
import { styles } from '../design/styles/createAccountStyles';
import { colors } from '../design/theme';
import { supabase } from '../lib/supabase';

type Props = {
  onBack: () => void;
  onLogin: () => void;
};

export function CreateAccountScreen({ onBack, onLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function signUp() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Missing details', 'Enter your name and email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Type the same password in both boxes.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Save the display name as authentication metadata.
        data: { full_name: fullName.trim() },
      },
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Could not create account', error.message);
    } else if (!data.session) {
      // No session means email confirmation is enabled in Supabase.
      Alert.alert('Check your email', 'Open the confirmation link, then return and log in.', [
        { text: 'OK', onPress: onLogin },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" onPress={onBack} style={styles.iconButton}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
            <BloomLogo compact />
          </View>

          <View style={styles.hero}>
            <View style={styles.sproutCircle}>
              <Sprout color={colors.primary} size={30} />
            </View>
            <Text style={styles.title}>Start your growth.</Text>
            <Text style={styles.subtitle}>Create your account and take the first small step.</Text>
          </View>

          <Field icon={<UserRound color={colors.muted} size={20} />} label="Full name">
            <TextInput
              autoComplete="name"
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={fullName}
            />
          </Field>
          <Field icon={<Mail color={colors.muted} size={20} />} label="Email address">
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={email}
            />
          </Field>
          <Field icon={<LockKeyhole color={colors.muted} size={20} />} label="Password">
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </Field>
          <Field icon={<LockKeyhole color={colors.muted} size={20} />} label="Confirm password">
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />
          </Field>

          <Pressable disabled={isLoading} onPress={signUp} style={styles.primaryButton}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.accountRow}>
            <Text style={styles.accountText}>Already have an account? </Text>
            <Pressable onPress={onLogin}>
              <Text style={styles.accountLink}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = { children: ReactNode; icon: ReactNode; label: string };

function Field({ children, icon, label }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {icon}
        {children}
      </View>
    </View>
  );
}

