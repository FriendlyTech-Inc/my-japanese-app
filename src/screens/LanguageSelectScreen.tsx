import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

export default function LanguageSelectScreen({ navigation }: Props) {
  const { setLanguage } = useContext(AppContext);

  const handleLanguageSelect = async (lang: string) => {
    await setLanguage(lang);
    i18n.locale = lang;
    navigation.replace('LessonList');
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => handleLanguageSelect('en')}
      >
        English
      </Button>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => handleLanguageSelect('ja')}
      >
        日本語
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    marginVertical: 8,
    width: '80%',
  },
}); 