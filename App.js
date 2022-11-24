import {NavigationContainer} from '@react-navigation/native';
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import UsersManager from './pages/UsersManager';

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <UsersManager />
      </NavigationContainer>
    );
  }
}
// AppRegistry.registerComponent('UsersManager', () => UsersManager);
