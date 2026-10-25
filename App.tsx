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

// A small string state is enough for the five screens in Iteration 1.
type Screen = 'welcome' | 'login' | 'create-account' | 'today' | 'create-routine';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isLoading, setIsLoading] = useState(true);

  // Restore the saved session, then listen for login and logout changes.
  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCurrentScreen(data.session ? 'today' : 'welcome');
      setIsLoading(false);
    });

    const listener = supabase?.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setCurrentScreen(newSession ? 'today' : 'welcome');
      setIsLoading(false);
    });

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

  if (!session) {
    return (
      <View style={styles.app}>
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onCreateAccount={() => setCurrentScreen('create-account')}
            onLogin={() => setCurrentScreen('login')}
          />
        )}
        {currentScreen === 'login' && (
          <AuthScreen
            onBack={() => setCurrentScreen('welcome')}
            onCreateAccount={() => setCurrentScreen('create-account')}
          />
        )}
        {currentScreen === 'create-account' && (
          <CreateAccountScreen
            onBack={() => setCurrentScreen('welcome')}
            onLogin={() => setCurrentScreen('login')}
          />
        )}
        <StatusBar style="dark" />
      </View>
    );
  }

  // The display name was saved as authentication metadata during registration.
  const fullName = session.user.user_metadata.full_name as string | undefined;

  return (
    <View style={styles.app}>
      {currentScreen === 'create-routine' ? (
        <CreateRoutineScreen
          onCancel={() => setCurrentScreen('today')}
          onSaved={() => setCurrentScreen('today')}
          userId={session.user.id}
        />
      ) : (
        <HomeScreen
          fullName={fullName}
          onCreateRoutine={() => setCurrentScreen('create-routine')}
          userId={session.user.id}
        />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

