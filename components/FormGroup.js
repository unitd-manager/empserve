import React from 'react';
import {View, Text} from 'react-native';

export default function FormGroup({label, ...props}) {
  return (
    <>
      <Text style={{marginBottom: 10, marginTop: 10}}>{label} :</Text>
      {props.children}
      <View
        style={{
          width: '100%',
          backgroundColor: 'black',
          height: 1,
          marginTop: 10,
        }}></View>
    </>
  );
}
