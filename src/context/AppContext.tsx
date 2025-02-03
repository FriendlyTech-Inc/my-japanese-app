import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextState {
  language: string;
  setLanguage: (lang: string) => void;
  completedLessons: number[];
  markLessonComplete: (lessonId: number) => void;
}

export const AppContext = createContext<AppContextState>({
  language: 'en',
  setLanguage: () => {},
  completedLessons: [],
  markLessonComplete: () => {},
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) setLanguageState(savedLang);

        const savedProgress = await AsyncStorage.getItem('completedLessons');
        if (savedProgress) {
          setCompletedLessons(JSON.parse(savedProgress));
        }
      } catch (err) {
        console.log('Error loading from storage', err);
      }
    })();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const markLessonComplete = async (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      await AsyncStorage.setItem('completedLessons', JSON.stringify(updated));
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        completedLessons,
        markLessonComplete,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}; 