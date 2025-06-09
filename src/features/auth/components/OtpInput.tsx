import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../../config/theme';

export type Iprops = {
  otp:string[],
  setOtp: (otp: string[]) => void,
  error?: boolean
}
const ThemeOTPInput = ({otp, setOtp, error}:Iprops) => {
  // const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<any>>([]);

  const handleChangeText = (text: string, index: number) => {
    // Filter out non-numeric characters
    const filteredText = text

    if (filteredText.length > 0) {
      const newOtp = [...otp];
      newOtp[index] = filteredText;
      setOtp(newOtp);

      // Move to the next input if there's another one
      if (index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = ''; // Clear the previous input
        setOtp(newOtp);
        inputRefs.current[index - 1].focus(); // Move focus to the previous input
      }
    } else if (e.nativeEvent.key === 'Backspace' && otp[index] !== '') {
      const newOtp = [...otp];
      newOtp[index] = ''; // Clear the current input
      setOtp(newOtp);
    }
  };

  return (
    <View style={[styles.container]}>
      {otp.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => inputRefs.current[index] = ref}
          style={[styles.input, error && styles.errorBorder, {borderColor: otp.length == 4 ? theme.colors.primary : "#ccc"}]}
          keyboardType="numeric"
          maxLength={1}
          value={value}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 60,
    gap: 15,
  },
  input: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 8,
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 2,
},
});

export default ThemeOTPInput;
