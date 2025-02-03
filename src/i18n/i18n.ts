import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    appName: "Japanese Learning App",
    selectLanguage: "Select Language",
    english: "English",
    japanese: "Japanese",
    lessons: "Lessons",
    start_quiz: "Start Quiz",
    correct: "Correct",
    incorrect: "Incorrect",
    your_score: "Your Score",
    next: "Next",
    finish: "Finish"
  },
  ja: {
    appName: "日本語学習アプリ",
    selectLanguage: "言語を選択",
    english: "英語",
    japanese: "日本語",
    lessons: "レッスン一覧",
    start_quiz: "クイズ開始",
    correct: "正解",
    incorrect: "不正解",
    your_score: "スコア",
    next: "次へ",
    finish: "終了"
  }
};

const i18n = new I18n(translations);

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default i18n; 