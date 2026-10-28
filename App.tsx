import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';

import { AppTab } from './components/BottomNavigation';
import { styles } from './design/styles/appStyles';
import { colors } from './design/theme';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { CreateAccountScreen } from './screens/CreateAccountScreen';
import { CreateRoutineScreen } from './screens/CreateRoutineScreen';
import { FocusScreen } from './screens/FocusScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { RoutinesScreen } from './screens/RoutinesScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { Routine } from './types';

type Screen = 'welcome' | 'login' | 'create-account' | 'routine-form' | AppTab;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [returnTab, setReturnTab] = useState<AppTab>('today');
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
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
      setEditingRoutine(null);
      setIsLoading(false);
    });

    return () => listener?.data.subscription.unsubscribe();
  }, []);

  function navigate(tab: AppTab) {
    setEditingRoutine(null);
    setCurrentScreen(tab);
  }

  function createRoutine(fromTab: AppTab) {
    setEditingRoutine(null);
    setReturnTab(fromTab);
    setCurrentScreen('routine-form');
  }

  function editRoutine(routine: Routine) {
    setEditingRoutine(routine);
    setReturnTab('routines');
    setCurrentScreen('routine-form');
  }

  function confirmDeleteEditedRoutine() {
    if (!editingRoutine) return;

    Alert.alert(
      `Delete ${editingRoutine.name}?`,
      'This removes the routine from your active list. Your completed habit history will stay.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: async () => {
            const { error } = await supabase!
              .from('routines')
              .update({ archived_at: new Date().toISOString() })
              .eq('id', editingRoutine.id);

            if (error) Alert.alert('Could not delete routine', error.message);
            else {
              setEditingRoutine(null);
              setCurrentScreen('routines');
            }
          },
          style: 'destructive',
          text: 'Delete',
        },
      ],
    );
  }

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

  const fullName = session.user.user_metadata.full_name as string | undefined;

  return (
    <View style={styles.app}>
      {currentScreen === 'routine-form' && (
        <CreateRoutineScreen
          key={editingRoutine?.id ?? 'new-routine'}
          onCancel={() => setCurrentScreen(returnTab)}
          onDelete={editingRoutine ? confirmDeleteEditedRoutine : undefined}
          onSaved={() => setCurrentScreen(returnTab)}
          routine={editingRoutine}
          userId={session.user.id}
        />
      )}
      {currentScreen === 'today' && (
        <HomeScreen
          fullName={fullName}
          onCreateRoutine={() => createRoutine('today')}
          onNavigate={navigate}
          userId={session.user.id}
        />
      )}
      {currentScreen === 'routines' && (
        <RoutinesScreen
          onCreateRoutine={() => createRoutine('routines')}
          onEditRoutine={editRoutine}
          onNavigate={navigate}
          userId={session.user.id}
        />
      )}
      {currentScreen === 'focus' && <FocusScreen onNavigate={navigate} />}
      {currentScreen === 'progress' && (
        <ProgressScreen onNavigate={navigate} userId={session.user.id} />
      )}
      <StatusBar style="dark" />
    </View>
  );
}
