import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';

import { styles } from './design/styles/appStyles';
import { colors } from './design/theme';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { CreateAccountScreen } from './screens/CreateAccountScreen';
import { CreateRoutineScreen } from './screens/CreateRoutineScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

// Screen names are kept as simple strings instead of using a navigation library.
type GuestScreen = 'welcome' | 'login' | 'create-account';
type MemberScreen = 'today' | 'create-routine';

export default function App() {
  // LOGIC / NAVIGATION: Remember the login session and current screen.
  const [session, setSession] = useState<Session | null>(null);
  const [guestScreen, setGuestScreen] = useState<GuestScreen>('welcome');
  const [memberScreen, setMemberScreen] = useState<MemberScreen>('today');
  const [isLoading, setIsLoading] = useState(true);

  // LOGIC / AUTHENTICATION: Restore and monitor the Supabase session.
  useEffect(() => {
    // Supabase restores a previous login when the app opens.
    supabase?.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // Keep the screen in sync after sign in, sign up, or sign out.
    const listener = supabase?.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      setMemberScreen('today');
      setGuestScreen('welcome');
      setIsLoading(false);
    });

    // Remove the listener when the component closes.
    return () => listener?.data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Supabase setup needed</Text>
        <Text style={styles.message}>
          Copy .env.example to .env and add your Supabase URL and publishable key.
        </Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.message}>Opening Bloom...</Text>
      </View>
    );
  }

  // SCREEN SELECTION: Logged-out users see the welcome and account screens.
  if (!session) {
    return (
      <View style={styles.app}>
        {guestScreen === 'welcome' && (
          <WelcomeScreen
            onCreateAccount={() => setGuestScreen('create-account')}
            onLogin={() => setGuestScreen('login')}
          />
        )}
        {guestScreen === 'login' && (
          <AuthScreen
            onBack={() => setGuestScreen('welcome')}
            onCreateAccount={() => setGuestScreen('create-account')}
          />
        )}
        {guestScreen === 'create-account' && (
          <CreateAccountScreen
            onBack={() => setGuestScreen('welcome')}
            onLogin={() => setGuestScreen('login')}
          />
        )}
        <StatusBar style="dark" />
      </View>
    );
  }

  // The display name was saved as authentication metadata during registration.
  const fullName = session.user.user_metadata.full_name as string | undefined;

  // SCREEN SELECTION: Logged-in users see Today or Create Routine.
  return (
    <View style={styles.app}>
      {memberScreen === 'today' ? (
        <HomeScreen
          fullName={fullName}
          onCreateRoutine={() => setMemberScreen('create-routine')}
          userId={session.user.id}
        />
      ) : (
        <CreateRoutineScreen
          onCancel={() => setMemberScreen('today')}
          onSaved={() => setMemberScreen('today')}
          userId={session.user.id}
        />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

