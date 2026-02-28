import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { D } from '../theme/tokens';

interface StepDotsProps {
  total: number;
  current: number;
  style?: ViewStyle;
}

export default function StepDots({ total, current, style }: StepDotsProps) {
  const anims = useRef(
    Array.from({ length: total }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    anims.forEach((anim, idx) => {
      Animated.spring(anim, {
        toValue: idx === current ? 1 : 0,
        useNativeDriver: false,
        speed: 14,
        bounciness: 6,
      }).start();
    });
  }, [current]);

  return (
    <View style={[styles.row, style]}>
      {anims.map((anim, idx) => {
        const width = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 24] });
        const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View
            key={idx}
            style={[styles.dot, { width, opacity }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: D.accent,
  },
});
