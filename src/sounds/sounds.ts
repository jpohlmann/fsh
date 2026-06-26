import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const bloopSource = require('../../assets/sounds/bloop.wav');
const splashSource = require('../../assets/sounds/splash.wav');

type SoundName = 'bloop' | 'splash';

const sources: Record<SoundName, number> = {
  bloop: bloopSource,
  splash: splashSource,
};

const volumes: Record<SoundName, number> = {
  bloop: 0.85,
  splash: 0.9,
};

const players: Partial<Record<SoundName, ReturnType<typeof createAudioPlayer>>> = {};
let audioModeSet = false;

async function ensureReady(name: SoundName) {
  if (!audioModeSet) {
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeSet = true;
  }

  if (!players[name]) {
    const player = createAudioPlayer(sources[name]);
    player.volume = volumes[name];
    players[name] = player;
  }

  return players[name]!;
}

function play(name: SoundName, onError: () => void) {
  void (async () => {
    try {
      const player = await ensureReady(name);
      player.seekTo(0);
      player.play();
    } catch {
      onError();
    }
  })();
}

export function playBloop() {
  play('bloop', () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  });
}

export function playSplash() {
  play('splash', () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  });
}
