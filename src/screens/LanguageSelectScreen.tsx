import React, { useContext } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';
import { spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

export default function LanguageSelectScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setLanguage } = useContext(AppContext);
  const [scaleAnim] = React.useState(new Animated.Value(0.9));
  const [opacityAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    await setLanguage(lang);
    i18n.locale = lang;
    navigation.replace('LessonList');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.welcomeCard}>
        <Text variant="displayMedium" style={styles.title}>
          日本語学習アプリ
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Japanese Learning App
        </Text>
      </Surface>

      <Animated.View style={[
        styles.buttonContainer,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          onPress={() => handleLanguageSelect('en')}
        >
          English
        </Button>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          onPress={() => handleLanguageSelect('ja')}
        >
          日本語
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  welcomeCard: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.medium,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginVertical: spacing.sm,
    borderRadius: 12,
    ...shadows.small,
  },
  buttonLabel: {
    fontSize: 18,
    letterSpacing: 1,
  },
  buttonContent: {
    height: 56,
  },
}); 