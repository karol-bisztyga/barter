import React, { createContext, useState, ReactNode, FC, useContext, useEffect } from 'react';
import { Audio, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';

export const BACKGROUND_SOUNDS: Record<string, AVPlaybackSource> = {
  marketplace: require('../../../assets/sounds/background/marketplace.wav'),
  music: require('../../../assets/sounds/background/music.wav'),
  musicMarketBells: require('../../../assets/sounds/background/music_market_bells.wav'),
  village: require('../../../assets/sounds/background/village.wav'),
};

export const ONE_SHOT_SOUNDS: Record<string, AVPlaybackSource> = {
  click: require('../../../assets/sounds/one_shot/click.wav'),
  coinBagHit: require('../../../assets/sounds/one_shot/coin_bag_hit.wav'),
  coinBagShake: require('../../../assets/sounds/one_shot/coin_bag_shake.mp3'),
  stone: require('../../../assets/sounds/one_shot/stone.wav'),
  sword: require('../../../assets/sounds/one_shot/sword.mp3'),
  whooshHi: require('../../../assets/sounds/one_shot/whoosh_hi.wav'),
  whooshLo: require('../../../assets/sounds/one_shot/whoosh_lo.wav'),
  writing: require('../../../assets/sounds/one_shot/writing.wav'),
  fire: require('../../../assets/sounds/one_shot/fire.wav'),
};

// TODO review this config
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: false,
  playThroughEarpieceAndroid: false,
});

type OneShotSound = keyof typeof ONE_SHOT_SOUNDS;
type BackgroundSound = keyof typeof BACKGROUND_SOUNDS;

const BACKGROUND_SOUND_VOLUME = 0.3;

interface SoundContextState {
  playSound: (sound: OneShotSound) => Promise<void>;
  playBackgroundSound: () => void;

  // settings
  musicOn: boolean;
  setMusicOn: (value: boolean) => void;
  soundsOn: boolean;
  setSoundsOn: (value: boolean) => void;
}

const initialState: SoundContextState = {
  playSound: async () => {},
  playBackgroundSound: () => {},

  musicOn: false,
  setMusicOn: () => {},
  soundsOn: false,
  setSoundsOn: () => {},
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
  // for background sounds
  const [backgroundSound, setBackgroundSound] = useState<keyof typeof BACKGROUND_SOUNDS | null>(
    null
  );
  const [currentBackgroundSoundObject, setCurrentBackgroundSoundObject] =
    useState<Audio.Sound | null>(null);

  const [nextBackgroundSoundObject, setNextBackgroundSoundObject] = useState<Audio.Sound | null>(
    null
  );
  const [nextBackgroundSound, setNextBackgroundSound] = useState<
    keyof typeof BACKGROUND_SOUNDS | null
  >(null);
  const [backgroundSounFinished, setBackgroundSoundFinished] = useState(false);

  // for one shots
  const [loadedSounds, setLoadedSounds] = useState<
    Record<keyof typeof BACKGROUND_SOUNDS | keyof typeof ONE_SHOT_SOUNDS, Audio.Sound>
  >({});

  // for settings
  const [musicOn, setMusicOn] = useState(false);
  const [soundsOn, setSoundsOn] = useState(true);

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
    let sound: Audio.Sound | null = null;

    (async () => {
      if (!musicOn || !backgroundSound) {
        return;
      }
      const soundResult = await Audio.Sound.createAsync(BACKGROUND_SOUNDS[backgroundSound]);
      if (!soundResult.status.isLoaded) {
        console.error('error loading sound', backgroundSound);
        return;
      }
      sound = soundResult.sound;
      setCurrentBackgroundSoundObject(sound);

      let nextSoundSet = false;
      sound.setOnPlaybackStatusUpdate(async (updatedStatus: AVPlaybackStatus) => {
        if (!updatedStatus.isLoaded) {
          return;
        }
        const duration = updatedStatus.durationMillis || null;
        // we want to start loading the next background sound before the current one finishes so there's no "gap"
        if (!nextSoundSet && duration && updatedStatus.positionMillis > 0.8 * duration) {
          const randomBackgroundSound = getRandomBackgroundSound(backgroundSound);
          nextSoundSet = true;
          setNextBackgroundSound(randomBackgroundSound);
        }
        if (updatedStatus.didJustFinish) {
          setBackgroundSoundFinished(true);
        }
      });

      await sound.setVolumeAsync(BACKGROUND_SOUND_VOLUME);
      await sound.playAsync();
    })();

    return () => {
      setCurrentBackgroundSoundObject(null);
      sound && sound.unloadAsync();
    };
  }, [backgroundSound]);

  useEffect(() => {
    if (!backgroundSounFinished) {
      return;
    }
    if (nextBackgroundSound) {
      // assign
      setBackgroundSound(nextBackgroundSound);
      setCurrentBackgroundSoundObject(nextBackgroundSoundObject);
      // clear
      setNextBackgroundSound(null);
      setNextBackgroundSoundObject(null);
    }
    setBackgroundSoundFinished(false);
  }, [backgroundSounFinished]);

  useEffect(() => {
    (async () => {
      if (!nextBackgroundSound) {
        return;
      }
      const soundObject = await Audio.Sound.createAsync(BACKGROUND_SOUNDS[nextBackgroundSound]);
      setNextBackgroundSoundObject(soundObject.sound);
    })();
  }, [nextBackgroundSound]);

  useEffect(() => {
    if (!currentBackgroundSoundObject) {
      if (musicOn) {
        playBackgroundSound();
      }
      return;
    }
    if (musicOn) {
      currentBackgroundSoundObject.playAsync();
    } else {
      currentBackgroundSoundObject.pauseAsync();
    }
  }, [musicOn]);

  useEffect(() => {
    if (soundsOn) {
      playSound('click');
    }
  }, [soundsOn]);

  // for one shots
  const playSound = async (sound: OneShotSound) => {
    if (!soundsOn) {
      return;
    }
    const soundObject = loadedSounds[sound];
    if (!soundObject) {
      return;
    }
    const currentStatus = await soundObject.getStatusAsync();
    if (currentStatus.isLoaded && currentStatus.isPlaying) {
      await soundObject.stopAsync();
    }

    soundObject.setOnPlaybackStatusUpdate(async (updatedStatus: AVPlaybackStatus) => {
      if (updatedStatus.isLoaded && updatedStatus.didJustFinish) {
        await soundObject.setPositionAsync(0);
      }
    });
    await soundObject.playAsync();
  };

  // for backgrounds
  const getRandomBackgroundSound = (currentBackgroundSound: BackgroundSound | null) => {
    const keys = Object.keys(BACKGROUND_SOUNDS);
    let newKey = null;
    while (!newKey || newKey === currentBackgroundSound) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      newKey = keys[randomIndex] as BackgroundSound;
    }
    return newKey;
  };

  const playBackgroundSound = () => {
    if (!musicOn || backgroundSound) {
      return;
    }
    const newBackgroundSound = getRandomBackgroundSound(backgroundSound);
    setBackgroundSound(newBackgroundSound);
  };

  return (
    <SoundContext.Provider
      value={{
        playSound,
        playBackgroundSound,

        musicOn,
        setMusicOn,
        soundsOn,
        setSoundsOn,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};
