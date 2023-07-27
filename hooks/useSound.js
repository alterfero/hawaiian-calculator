import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { audioFiles } from "../constant";

export function useSound() {
  const [sound, setSound] = useState();

  const playSounds = useCallback(async function (audioPaths) {
    for (let i = 0; i < audioPaths.length; i++) {
      const path = audioPaths[i];

      const [audio] = await Asset.loadAsync(audioFiles[path]);
      const { sound } = await Audio.Sound.createAsync(audio, { shouldPlay: true });
      await sound.playAsync();

      // This will ensure that the next audio file doesn't start playing
      // until the current one has finished
      await sound.getStatusAsync().then((status) => {
        if (status.isLoaded) {
          return new Promise((resolve) => {
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                resolve();
              }
            });
          });
        }
      });
    }

  }, []);

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync().catch((error) => {
          console.error(error);
        });
      }
      : undefined;
  }, [sound]);

  return { playSounds };
}
