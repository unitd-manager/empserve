import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {TouchableOpacity, Text} from 'react-native';

import HomeScreen from './home';
import Login from './login';
import Register from './register';
import Profile from './profile';
import Tasks from './tasks';
import Digisign from './digisign';
import Fingerprint from './fingerprint';
import ServiceReport from './ServiceReport';

const Stack = createStackNavigator();
// const UsersManager = StackNavigator({
//   Home: {screen: HomeScreen},
//   Login: {screen: Login},
//   Register: {screen: Register},
//   Profile: {screen: Profile},
// });

/*     <Stack.Screen name="Home" component={HomeScreen} />
headerRight: () => (
  <TouchableOpacity
    onPress={() => navigation.navigate('Home')}
    style={{margin: 10, backgroundColor: 'orange', padding: 10}}>
    <Text style={{color: '#ffffff'}}>Home</Text>
  </TouchableOpacity>
),
*/
const UsersManager = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={({navigation}) => ({
          title: 'CS EmpServe - Login',
        })}
      />
      <Stack.Screen
        name="Fingerprint"
        component={Fingerprint}
        options={({navigation}) => ({
          title: 'Fingerprint Login',
          headerLeft: () => null,
        })}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{title: 'Customer List', headerShown: false}}
      />
      <Stack.Screen
        name="Tasks"
        component={Tasks}
        options={{title: 'Task List'}}
      />
      <Stack.Screen
        name="ServiceReport"
        component={ServiceReport}
        options={{title: 'Service Report'}}
      />
      <Stack.Screen
        name="Digisign"
        component={Digisign}
        options={{title: 'Digisign'}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={({navigation}) => ({
          title: 'Register',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{margin: 10, backgroundColor: 'orange', padding: 10}}>
              <Text style={{color: '#ffffff'}}>Home</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};
export default UsersManager;
