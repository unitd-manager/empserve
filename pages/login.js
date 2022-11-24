
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,

  Keyboard,
  ImageBackground,
  Image,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import API_PATH from '../config/api';
import {getEmployee, storeEmployee} from '../storage/store';
import Button from '../components/Button'
import TextInputC from '../components/TextInputC';
import FA from 'react-native-vector-icons/FontAwesome'
import color from '../constants/colors';
import ANT from 'react-native-vector-icons/AntDesign'
import fonts from '../constants/fonts';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userEmail: '',
      userPassword: '',
      attTypeDefault: '',
      isLoggingIn: false,
      loading:false
    };
  }

  componentDidMount() {
    getEmployee().then(res => {
      if (res !== false) {
        const employeeData = JSON.parse(res);
        this.props.navigation.navigate('Fingerprint', employeeData);

      }
    });
  }

  login = () => {
    this.setState({isLoggingIn: true,loading:true});
    const {userEmail, userPassword} = this.state;
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (userEmail == '') {
      //alert("Please enter Email address");
      this.setState({email: 'Please enter Email address'});
    } else if (reg.test(userEmail) === false) {
      //alert("Email is Not Correct");
      this.setState({email: 'Email is Not Correct'});
      return false;
    } else if (userPassword == '') {
      this.setState({email: 'Please enter password'});
    } else {
      fetch(API_PATH + 'login.php', {
        method: 'post',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          // we will pass our input data to server
          email: userEmail,
          password: userPassword,
        }),
      })
        .then(response => response.json())
        .then(responseJson => {
          //if (responseJson == 'ok') {
          if (responseJson['status'] == 'Success') {
            console.log(responseJson['data']['password']);
            storeEmployee(
              JSON.stringify({
                emailId: this.state.userEmail,
                employeeId: responseJson['data']['employee_id'],
                staffName: responseJson['data']['staff_name'],
                attTypeDefault: responseJson['data']['attendance_type'],
                password: responseJson['data']['password']
              }),
            );
            this.sendPublicKey(responseJson['data']['employee_id'], {
              emailId: this.state.userEmail,
              employeeId: responseJson['data']['employee_id'],
              staffName: responseJson['data']['staff_name'],
              attTypeDefault: responseJson['data']['attendance_type'],
              

            });
          } else {
            this.setState({isLoggingIn: false,loading:false});
            alert('Wrong Login Details');
          }
        })
        .catch(error => {
          this.setState({isLoggingIn: false,loading:false});
          console.error(error);
        });
    }

    Keyboard.dismiss();
  };

  loginInstant = () => {
    
    const {userEmail, userPassword} = this.state;
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (userEmail == '') {
      //alert("Please enter Email address");
      this.setState({email: 'Please enter Email address'});
    } else if (reg.test(userEmail) === false) {
      //alert("Email is Not Correct");
      this.setState({email: 'Email is Not Correct'});
      return false;
    } else if (userPassword == '') {
      this.setState({email: 'Please enter password'});
    } else {
      fetch(API_PATH + 'login.php', {
        method: 'post',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          // we will pass our input data to server
          email: userEmail,
          password: userPassword,
        }),
      })
        .then(response => response.json())
        .then(responseJson => {
          //if (responseJson == 'ok') {
          if (responseJson['status'] == 'Success') {
            console.log("Code " , responseJson['data']['password']);
            storeEmployee(
              JSON.stringify({
                emailId: this.state.userEmail,
                employeeId: responseJson['data']['employee_id'],
                staffName: responseJson['data']['staff_name'],
                attTypeDefault: responseJson['data']['attendance_type'],
                password: responseJson['data']['password']
              }),
            );
            console.log("Log osdj ", JSON.stringify({
              emailId: this.state.userEmail,
              employeeId: responseJson['data']['employee_id'],
              staffName: responseJson['data']['staff_name'],
              attTypeDefault: responseJson['data']['attendance_type'],
              password: responseJson['data']['password']
            }));

            this.sendPublicKey(responseJson['data']['employee_id'], {
              emailId: this.state.userEmail,
              employeeId: responseJson['data']['employee_id'],
              staffName: responseJson['data']['staff_name'],
              attTypeDefault: responseJson['data']['attendance_type'],
              password: responseJson['data']['password']
            });
          } else {
            alert('Wrong Login Details');
          }
        })
        .catch(error => {
          console.error(error);
        });
    }

    Keyboard.dismiss();
  };

   sendPublicKey = async (employeeId, employeeData) => {

    const { available } = await ReactNativeBiometrics.isSensorAvailable()
    if(available == true){
      ReactNativeBiometrics.createKeys('Confirm fingerprint') 
      .then(resultObject => {
        const {publicKey} = resultObject;
        console.log(publicKey);
        const formData = new FormData();
        formData.append('public_key', publicKey);
        formData.append('employee_id', employeeId);
        fetch(API_PATH + 'fingerprint.php', {method: 'POST', body: formData})
          .then(res => res.json())
          .then(res => {
            console.log("Error is here " ,res.status);
            if (res.status === 'success') {
              
              this.props.navigation.navigate('Profile', {
                emailId: employeeData.emailId,
                employeeId: employeeData.employeeId,
                staffName: employeeData.staffName,
                attTypeDefault: employeeData.attTypeDefault,
              });
              this.setState({isLoggingIn: false,loading:false});
            } else {
              this.setState({isLoggingIn: false,loading:false});
              alert('authentication error, please try again');
            }
          })
          .catch(e => {
            console.log(e);
            alert('authentication error, please try again');
            this.setState({isLoggingIn: false});
          });
      })
      .catch(e => {
        alert(
          'Authentication failed, please check your internet connection and make sure your fingerprint is enabled',
          this.setState({isLoggingIn: false}),
        );
      });
    }else{
      this.props.navigation.navigate('Profile', {
        emailId: employeeData.emailId,
        employeeId: employeeData.employeeId,
        staffName: employeeData.staffName,
        attTypeDefault: employeeData.attTypeDefault,
      });
    }
    
  };
  render() {
    return (
      <View style={{flex:1}}>
            <View style={styles.container}>
              {/* <Image style={{width:'100%',resizeMode:'cover'}} source={require('../assets/triangle.png')}></Image> */}
              <View style={{height:120,backgroundColor:color.red,flexDirection:'row',alignItems:'center',padding:20,width:'100%',marginBottom:50}}> 
              <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:25}}>Login</Text>
        </View>
              <TextInputC icon={<FA size={20} color={color.grey} name="envelope-o"></FA>} placeholder="Email" onChangeText={userEmail => this.setState({userEmail})}></TextInputC>
              <TextInputC icon={<ANT size={28} color={color.grey} name="lock"></ANT>} secureTextEntry={true} placeholder="Password" onChangeText={pass => this.setState({userPassword: pass})}></TextInputC>
              
            <Button onPress={()=>{this.login()}} loading={this.state.loading} title="Sign in"></Button>
            </View>
            
              <Text style={styles.bottomText}>
                A Product of Cubosale{'\n'} www.cubosale.com
              </Text>
     
          
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
  container: {
    borderRadius: 10,
    justifyContent:'center',
    alignItems:'center'
  },
 
  bottomText: {
    color: color.grey,
    fontFamily: fonts.Medium,
    fontSize: 15,
    textAlign: 'center',
    marginTop:100,
    // position:'absolute',
    // bottom:20,
    alignSelf:'center'
  },
});

