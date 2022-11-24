// to update image to reflect in apk
//react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
//if the apk does not reflect the changes : in terminal change the directory to android and run
// ./gradlew clean 
//to create aab - cd android - ./gradlew assembleRelease
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Keyboard,
  ImageBackground,
  Image,
} from 'react-native';
// import { StackNavigator } from 'react-navigation';
import API_PATH from '../config/api';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userEmail: '',
      userPassword: '',
      attTypeDefault: '',
    };
  }

  login = () => {
    console.log('login');
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
            // redirect to profile page
            //alert(response.json(employee_id));
            //alert(responseJson['data']['employee_id']);
            console.log(responseJson['data']['employee_id']);
            this.props.navigation.navigate('Fingerprint');
            // this.props.navigation.navigate('Profile', {
            //   emailId: this.state.userEmail,
            //   employeeId : responseJson['data']['employee_id'],
            //   staffName : responseJson['data']['staff_name'],
            //   attTypeDefault : responseJson['data']['attendance_type'],
            // });
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
      //source={require('./images/login_image1.jpg')}
  render() {
    console.log('this is api', API_PATH);
    return (
      <View>
       <View>
        <ImageBackground  source={require('./images/login_image1.jpg')} style={styles.imageContainer}>
          <Text style={styles.IntroText}></Text>
          <View style={styles.container}>
            <Text style={{padding: 5, margin: 10, color: 'black'}}>
              {this.state.email}
            </Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor = "grey"
              style={styles.textBox}
              onChangeText={userEmail => this.setState({userEmail})}
            />
            <TextInput
              placeholder="Password"
              multiline={false}
              secureTextEntry={true}
              placeholderTextColor = "grey"
              style={styles.textBox}
              onChangeText={pass => this.setState({userPassword:pass})}
            />

            <Text onPress={this.login} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Text>
          </View>
          <View><Text style={styles.bottomText}>A Product of Cubosale{'\n'} www.cubosale.com</Text></View>
          </ImageBackground>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainFirstContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  container: {
    borderRadius: 10,
    marginBottom:40,
    marginTop:30,
    marginLeft:20,
    //backgroundColor: 'orange',
  },
  imageContainer:{
    height:'100%',
  },
  textBox: {
    width: '75%',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'grey',
    padding: 8,
    color:'black',
  }, 
  loginButton: {
    width: '75%',
    padding: 12,
    backgroundColor: '#695cc6',
    borderRadius: 10,
    marginTop:5,
    fontSize: 15,
    color:'white',
    //fontWeight:"bold",
  }, 
  loginButtonText: {
    color:'white',
    alignItems: 'center',

  }, 
  IntroText: {
    color:'blue',
    fontSize: 20,
    marginTop: 35,
    marginLeft:10,
  },
  bottomText: {
    color:'white',
    fontWeight:"bold",
    fontSize: 12,
    marginTop: 185,
    padding: 20,
    alignItems: 'center',
    //borderWidth: 4,
    //borderRadius: 10,
    //borderColor: 'red',
    textAlign:'right',
  },
});

// AppRegistry.registerComponent('login', () => login);
