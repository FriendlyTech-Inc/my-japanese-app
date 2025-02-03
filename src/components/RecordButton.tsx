import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { Audio } from 'expo-av';

interface Props {
  onRecordFinish: (audioUri: string) => void;
}

const RecordButton: React.FC<Props> = ({ onRecordFinish }) => {
  const theme = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // 録音時間のカウントアップ
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // ボタンのパルスアニメーション
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 波形アニメーション
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, pulseAnim, waveAnim]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('マイクの使用許可が必要です。');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('録音の開始に失敗しました', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        onRecordFinish(uri);
      }
    } catch (err) {
      console.error('録音の停止に失敗しました', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Surface style={styles.container}>
      {isRecording && (
        <>
          <Text style={styles.timer}>
            {formatTime(recordingTime)}
          </Text>
          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.wave,
                  {
                    height: 20 + index * 10,
                    transform: [{
                      scaleY: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3 + index * 0.1, 1],
                      })
                    }],
                    backgroundColor: theme.colors.primary,
                    opacity: 0.6 + index * 0.1,
                  }
                ]}
              />
            ))}
          </View>
        </>
      )}
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Button
          mode="contained"
          icon="microphone"
          style={[
            styles.button,
            isRecording && styles.recordingButton
          ]}
          contentStyle={styles.buttonContent}
          onPress={isRecording ? stopRecording : startRecording}
          labelStyle={styles.buttonLabel}
        >
          {isRecording ? '停止' : '話す'}
        </Button>
      </Animated.View>
      {isRecording && (
        <Text style={[styles.recordingText, { color: theme.colors.error }]}>
          録音中...
        </Text>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 24,
  },
  wave: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  buttonWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 32,
    paddingHorizontal: 32,
  },
  buttonContent: {
    height: 64,
  },
  buttonLabel: {
    fontSize: 18,
    letterSpacing: 1,
  },
  recordingButton: {
    backgroundColor: '#FF5252',
  },
  recordingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RecordButton; 