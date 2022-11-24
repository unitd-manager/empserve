import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View
} from 'react-native';
import color from '../constants/colors'
import fonts from '../constants/fonts';
const Button = ({title, containerStyle, onPress, loading,disabled=false,addbuttonText}) => {
  return (
    <>
    {disabled ==false ? (<TouchableOpacity
      disabled={loading}
      onPress={onPress}
      style={[styles.button, containerStyle]}>
      {loading ? (<ActivityIndicator color="#fff" />) : (<Text style={[styles.buttonText,addbuttonText]}>{title}</Text>)}
    </TouchableOpacity>) : (<View style={[styles.button, containerStyle,{backgroundColor:'#01AF001A'}]}><Text style={styles.buttonText}>{title}</Text></View>)}
    </>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.red,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width:'90%',
    marginTop:20
  },
  buttonText: {
    fontSize: 19,
    color: color.white,
    fontFamily: fonts.SemiBold,
  },
});
