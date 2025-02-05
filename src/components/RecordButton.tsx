import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Button, Text, Surface, useTheme, Portal, Dialog } from 'react-native-paper';
import { Audio } from 'expo-av';
import NetInfo from '@react-native-community/netinfo';
import i18n from '../i18n/i18n';
import { shadows } from '../theme';

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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

  const checkNetworkStatus = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  };

  const startRecording = async () => {
    try {
      const isConnected = await checkNetworkStatus();
      if (!isConnected) {
        setErrorMessage(i18n.t('network_error'));
        setShowErrorDialog(true);
        return;
      }

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setErrorMessage(i18n.t('mic_permission'));
        setShowErrorDialog(true);
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
      setRetryCount(0);
    } catch (err) {
      console.error(i18n.t('recording_start_error'), err);
      setErrorMessage(i18n.t('recording_start_error'));
      setShowErrorDialog(true);
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
      } else {
        throw new Error('No recording URI');
      }
    } catch (err) {
      console.error(i18n.t('recording_stop_error'), err);
      setErrorMessage(i18n.t('recording_stop_error'));
      setShowErrorDialog(true);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= MAX_RETRIES) {
      setErrorMessage(i18n.t('max_retries_reached'));
      return;
    }
    setRetryCount(prev => prev + 1);
    setShowErrorDialog(false);
    await startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.colors.surface,
  };

  return (
    <>
      <Surface style={containerStyle}>
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
            {isRecording ? i18n.t('stop') : i18n.t('speak')}
          </Button>
        </Animated.View>
        {isRecording && (
          <Text style={[styles.recordingText, { color: theme.colors.error }]}>
            {i18n.t('recording')}
          </Text>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showErrorDialog} onDismiss={() => setShowErrorDialog(false)}>
          <Dialog.Title>{i18n.t('error_title')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{errorMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowErrorDialog(false)}>{i18n.t('cancel')}</Button>
            {retryCount < MAX_RETRIES && (
              <Button onPress={handleRetry}>{i18n.t('retry')}</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5%',
    borderRadius: 16,
    ...shadows.medium,
  },
  timer: {
    width: '100%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: '5%',
  },
  waveContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: '8%',
  },
  wave: {
    width: '4%',
    marginHorizontal: '1%',
    borderRadius: 2,
  },
  buttonWrapper: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 28,
    overflow: 'hidden',
  },
  button: {
    width: '100%',
    borderRadius: 28,
  },
  buttonContent: {
    minHeight: 56,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF5252',
  },
  recordingText: {
    width: '100%',
    textAlign: 'center',
    marginTop: '4%',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RecordButton; 