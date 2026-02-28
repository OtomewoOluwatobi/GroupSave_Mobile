import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { D } from '../theme/tokens';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

export default function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first box on mount
    setTimeout(() => refs.current[0]?.focus(), 300);
  }, []);

  const digits = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (text: string, idx: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const arr = digits.map(d => (d === ' ' ? '' : d));
    arr[idx] = cleaned;
    const joined = arr.join('');
    onChange(joined);
    if (cleaned && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const arr = digits.map(d => (d === ' ' ? '' : d));
      if (!arr[idx] && idx > 0) {
        arr[idx - 1] = '';
        onChange(arr.join(''));
        refs.current[idx - 1]?.focus();
      } else {
        arr[idx] = '';
        onChange(arr.join(''));
      }
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, idx) => {
        const digit = digits[idx] === ' ' ? '' : digits[idx];
        const filled = !!digit;
        return (
          <TextInput
            key={idx}
            ref={r => { refs.current[idx] = r; }}
            style={[styles.box, filled && styles.boxFilled]}
            value={digit}
            onChangeText={text => handleChange(text, idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor={D.accent}
            caretHidden
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: D.radiusSm,
    backgroundColor: D.surfaceInput,
    borderWidth: 1.5,
    borderColor: D.border,
    color: D.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  boxFilled: {
    borderColor: D.accent,
    backgroundColor: D.accentGlow,
  },
});
