import { Sprout } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { styles } from '../design/styles/bloomLogoStyles';
import { colors } from '../design/theme';

type Props = {
  compact?: boolean;
};

export function BloomLogo({ compact = false }: Props) {
  // DESIGN HELPER: Display the same Bloom logo at two possible sizes.
  const markSize = compact ? 38 : 48;

  return (
    <View style={styles.logo}>
      <View style={[styles.mark, { height: markSize, width: markSize }]}>
        <Sprout color={colors.white} size={compact ? 23 : 30} strokeWidth={1.8} />
      </View>
      <Text style={[styles.name, compact && styles.compactName]}>Bloom</Text>
    </View>
  );
}

