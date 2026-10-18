import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sun } from 'lucide-react-native';
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
import { styles } from '../design/styles/authStyles';
import { colors } from '../design/theme';
import { supabase } from '../lib/supabase';

type Props = {
  onBack: () => void;
  onCreateAccount: () => void;
};

export function AuthScreen({ onBack, onCreateAccount }: Props) {
  // LOGIC: Remember the login form values and whether a request is running.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // LOGIC: Validate the form and ask Supabase to log the user in.
  async function signIn() {
    // Validate before sending a request to Supabase.
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase!.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    // A successful login is picked up by the auth listener in App.tsx.
    if (error) Alert.alert('Could not sign in', error.message);
  }

  // DESIGN / LAYOUT: The JSX below describes what appears on the screen.
  // Its visual styling is in design/styles/authStyles.ts.
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
            <View style={styles.sunCircle}>
              <Sun color={colors.primary} size={30} />
            </View>
            <Text style={styles.title}>Welcome back.</Text>
            <Text style={styles.subtitle}>Log in and keep growing at your own pace.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputRow}>
              <Mail color={colors.muted} size={20} />
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9AA3B2"
                style={styles.input}
                value={email}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <LockKeyhole color={colors.muted} size={20} />
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9AA3B2"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye color={colors.muted} size={20} />
                ) : (
                  <EyeOff color={colors.muted} size={20} />
                )}
              </Pressable>
            </View>

            <Pressable disabled={isLoading} onPress={signIn} style={styles.primaryButton}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </Pressable>

            <View style={styles.accountRow}>
              <Text style={styles.accountText}>New to Bloom? </Text>
              <Pressable onPress={onCreateAccount}>
                <Text style={styles.accountLink}>Create Account</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.reassurance}>
            <Text style={styles.reassuranceTitle}>Your progress is waiting for you.</Text>
            <Text style={styles.reassuranceText}>
              A few minutes today can make tomorrow feel lighter.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

