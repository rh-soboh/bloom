import { Sprout } from 'lucide-react-native';
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native';

import { BloomLogo } from '../components/BloomLogo';
import { styles } from '../design/styles/welcomeStyles';
import { colors } from '../design/theme';

type Props = {
  onCreateAccount: () => void;
  onLogin: () => void;
};

export function WelcomeScreen({ onCreateAccount, onLogin }: Props) {
  // The buttons ask App.tsx to change the current screen.
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <BloomLogo />

        <Image
          resizeMode="cover"
          source={require('../assets/bloom-welcome.png')}
          style={styles.illustration}
        />

        <View style={styles.promise}>
          <View style={styles.badge}>
            <Sprout color={colors.green} size={14} />
            <Text style={styles.badgeText}>SMALL STEPS. REAL GROWTH.</Text>
          </View>
          <Text style={styles.title}>Build better habits,{`\n`}one day at a time.</Text>
          <Text style={styles.description}>
            Make room for what matters. Your routines, focus and progress, all in one place.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onCreateAccount} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </Pressable>
          <Pressable onPress={onLogin} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </Pressable>
          <Text style={styles.note}>A fresh start, at your own pace.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

