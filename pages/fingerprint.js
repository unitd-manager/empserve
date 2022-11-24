import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, Alert} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import API_PATH from '../config/api';
import {getEmployee, storeEmployee} from '../storage/store';
import { NavigationParams } from 'react-navigation';
import color from '../constants/colors';
import fonts from '../constants/fonts';
import ION from 'react-native-vector-icons/Ionicons'
import Button from '../components/Button';
interface Props {
  theme: Theme;
  navigation: NavigationParams;
}

export default function Fingerprint({ navigation }: Props) {
  const [biometry, setBiometry] = useState({
    available: null,
    biometryType: null,
    keysExist: null,
  });

  const [biometrySupport, setBiometrySupport] = useState(true);
  const [employee, setEmployee] = useState(false)

  const checkSensorAvailable = () => {
    ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
      const {available, biometryType} = resultObject;

      if (available && biometryType === ReactNativeBiometrics.TouchID) {
        setBiometrySupport(true);
      } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
       
      } else if (
        available &&
        biometryType === ReactNativeBiometrics.Biometrics
      ) {
       
        setBiometrySupport(true);
        console.log('Biometrics is supported');

      } else {
        routWitghout()
        setBiometrySupport(false);
        console.log('Biometrics not supported');
      }
    });
  };

  const checkData = () => {
    getEmployee().then(res => {
      if (res !== null) {
        console.log("okay " + res);
        setEmployee(res);
      } else {
        props.navigate.goBack();
      }
    });

  };

  useEffect(() => {
    checkData();
    checkSensorAvailable();
  }, []);
  const routWitghout = () =>{ 
    getEmployee().then(res => {
      if (res !== null) {
       
        setEmployee(res);
        res = JSON.parse(res)
        
        navigation.navigate('Profile', {
          emailId: res.emailId,
          password: res.password,
          employeeId: res.employeeId,
          staffName: res.staffName,
          attTypeDefault: res.attTypeDefault,
         
        });
      } else {
        props.navigate.goBack();
      }
    });
  }
  const fingerPrintLogin = () => {
    const employeeData = JSON.parse(employee);
    const emId = employeeData.employeeId;
    ReactNativeBiometrics.createSignature({
      promptMessage: 'Sign in with fingerprint',
      payload: emId,
    })
      .then(resultObject => {
        const {success, signature} = resultObject;
        console.log('fingerPrintLogin',signature)
        if (success) {
          verifySignature(signature, emId);
        }
      })
      .catch(e => {
        alert(
          'Failed to authenticate, please re-log and make sure fingerprint is available',
        );
        props.navigation.goBack();
      });
  };

  const verifySignature = (signature, payload) => {
    const formData = new FormData();
    fetch(API_PATH + 'fingerprint.php', {method: 'post', 
    header: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      sign: true,
      signature: signature,
      payload: payload
    }),
  
      })
      .then(res => res.json())
      .then(res => {
        console.log("Resp " + res.json);
        if (res.status === 'success') {
           reLogin();

        } else {
          alert('error');
        }
      });
  };

  const reLogin = () => {
    let emData = JSON.parse(employee);

    console.log("FInfer pay ", JSON.parse(employee));

    fetch(API_PATH + 'login.php', {
      method: 'post',
      header: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        // we will pass our input data to server
        email: emData.emailId,
        password: emData.password,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log("Finger print resp " ,responseJson);
        if (responseJson['status'] == 'Success') {
          console.log(responseJson);
          emData = {
            emailId: responseJson['data']['email'],
            password: responseJson['data']['password'],
            employeeId: responseJson['data']['employee_id'],
            staffName: responseJson['data']['staff_name'],
            attTypeDefault: responseJson['data']['attendance_type'],
           
          };
          storeEmployee(JSON.stringify(emData))
          navigation.navigate('Profile', emData);
        } else {
          alert('Account info changed, please re-login');
        }
      })
      .catch(err => {
        alert('Account info changed, please re-login - ', err)
      });
  };
  return (
    <View
      style={{
        display: 'flex',
        backgroundColor: 'white',
        height: '100%',
      
      }}>
        <View style={{height:80,backgroundColor:color.red,flexDirection:'row',alignItems:'center',padding:20}}> 
          <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:18}}>Fingerprint Login</Text>
        </View>
    
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ION name="finger-print" size={80}></ION>
      {biometrySupport && (
        <Button  onPress={fingerPrintLogin} title="Click to Verify Fingerprint">
        </Button>
      )}
      {!biometrySupport && (
        <Button title="Fingerprint is not available" containerStyle={{backgroundColor: color.grey,}}>

        </Button>
      )}
      </View>
      
    </View>
  );
}
