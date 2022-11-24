import { StyleSheet, Text, View,TextInput } from 'react-native';
import React from 'react';

import color from '../constants/colors';
import fonts from '../constants/fonts';

const TextInputC = ({placeholder,onChangeText,secureTextEntry=false,icon,value=""}) => {
  return (
    <>
    <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
    <Text style={{color:color.grey,fontFamily:fonts.SemiBold,fontSize:17}}>{placeholder}</Text>
    <View style={{height:50,borderWidth:1,borderRadius:5,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
      <TextInput defaultValue={value} secureTextEntry={secureTextEntry} onChangeText={onChangeText} style={{width:'90%'}}></TextInput>
      {icon}
    </View>
    </View>
    </>
  );
};

export default TextInputC;

const styles = StyleSheet.create({});
