import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '../../config/theme';
import { ComicProgressBar } from '../shared/ComicProgressBar';

interface XpProgressBarProps {
  progress: number;
  xpNeededToNextRank: number;
}

export function XpProgressBar({ progress, xpNeededToNextRank }: XpProgressBarProps) {
  return (
    <ComicProgressBar
      progress={progress}
      label="Progress to next rank"
      valueLabel={`${xpNeededToNextRank} XP left`}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.transparent,
  },
});
