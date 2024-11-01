import React, { createContext, useState, ReactNode, FC, useContext, useEffect } from 'react';
import { Audio, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';

export const BACKGROUND_SOUNDS: Record<string, AVPlaybackSource> = {
  marketplace: require('../../../assets/sounds/background/marketplace.wav'),
  music: require('../../../assets/sounds/background/music.mp3'),
  music2: require('../../../assets/sounds/background/music2.mp3'),
  music3: require('../../../assets/sounds/background/music3.mp3'),
  musicMarketBells: require('../../../assets/sounds/background/music_market_bells.mp3'),
  village: require('../../../assets/sounds/background/village.mp3'),
};

export const ONE_SHOT_SOUNDS: Record<string, AVPlaybackSource> = {
  click: require('../../../assets/sounds/one_shot/click.wav'),
  coinBagHit: require('../../../assets/sounds/one_shot/coin_bag_hit.wav'),
  coinBagShake: require('../../../assets/sounds/one_shot/coin_bag_shake.mp3'),
  stone: require('../../../assets/sounds/one_shot/stone.wav'),
  sword: require('../../../assets/sounds/one_shot/sword.mp3'),
  whooshHi: require('../../../assets/sounds/one_shot/whoosh_hi.wav'),
  whooshLo: require('../../../assets/sounds/one_shot/whoosh_lo.wav'),
};

// TODO review this config
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: false,
  playThroughEarpieceAndroid: false,
});

interface SoundContextState {
  backgroundSound: keyof typeof BACKGROUND_SOUNDS | null;
  setBackgroundSound: (sound: keyof typeof BACKGROUND_SOUNDS) => void;
  oneShotSound: keyof typeof ONE_SHOT_SOUNDS | null;
  setOneShotSound: (sound: keyof typeof ONE_SHOT_SOUNDS) => void;
}

const initialState: SoundContextState = {
  backgroundSound: null,
  setBackgroundSound: () => {},
  oneShotSound: null,
  setOneShotSound: () => {},
};

export const SoundContext = createContext<SoundContextState | null>(initialState);

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundContextProvider');
  }
  return context;
};

export const SoundContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [backgroundSound, setBackgroundSound] = useState<keyof typeof BACKGROUND_SOUNDS | null>(
    null
  );
  const [oneShotSound, setOneShotSound] = useState<keyof typeof ONE_SHOT_SOUNDS | null>(null);

  const [loadedSounds, setLoadedSounds] = useState<
    Record<keyof typeof BACKGROUND_SOUNDS | keyof typeof ONE_SHOT_SOUNDS, Audio.Sound>
  >({});

  useEffect(() => {
    // pre-load all one shot sounds
    Object.keys(ONE_SHOT_SOUNDS).forEach(async (key) => {
      try {
        const { status, sound } = await Audio.Sound.createAsync(ONE_SHOT_SOUNDS[key]);
        if (!status.isLoaded) {
          console.error('error loading sound', key);
          return;
        }
        setLoadedSounds((prev) => ({ ...prev, [key]: sound }));
      } catch (e) {
        console.error('sound error', key, e);
      }
    });
    // unload all sounds on unmount
    return () => {
      Object.keys(loadedSounds).forEach((key) => {
        loadedSounds[key].unloadAsync();
      });
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!oneShotSound) {
        return;
      }
      try {
        const sound = loadedSounds[oneShotSound];

        sound.setOnPlaybackStatusUpdate(async (updatedStatus: AVPlaybackStatus) => {
          if (updatedStatus.isLoaded && updatedStatus.didJustFinish) {
            await sound.setPositionAsync(0);
            setOneShotSound(null);
          }
        });
        await sound.playAsync();
      } catch (e) {
        console.error('sound error', oneShotSound, e);
      }
    })();
  }, [oneShotSound]);

  return (
    <SoundContext.Provider
      value={{
        backgroundSound,
        setBackgroundSound,
        oneShotSound,
        setOneShotSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};
