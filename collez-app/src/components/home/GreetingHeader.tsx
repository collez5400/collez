import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

interface GreetingHeaderProps {
  fullName: string;
  avatarUrl?: string | null;
  onAvatarPress: () => void;
  onLightningPress: () => void;
}

function getGreeting() {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function GreetingHeader({
  fullName,
  avatarUrl,
  onAvatarPress,
  onLightningPress,
}: GreetingHeaderProps) {
  const firstName = fullName.trim().split(' ')[0] ?? 'Scholar';
  return (
    <View style={styles.container}>
      <Pressable onPress={onAvatarPress} style={styles.avatarButton}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>COLLEZ</Text>
        <Text style={styles.greeting}>{getGreeting()}, {firstName}!</Text>
      </View>

      <Pressable onPress={onLightningPress} style={styles.actionButton}>
        <MaterialIcons name="bolt" size={22} color={Colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Colors.outline}66`,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
  },
  brand: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.lg,
    letterSpacing: 1.1,
  },
  greeting: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
