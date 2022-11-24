import React, {Component} from 'react';
import GeoLocation from 'react-native-get-location';
import {
 
  AppRegistry,
  StyleSheet,
  ImageBackground,
  FlatList,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import API_PATH from '../config/api';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import CheckBox from '@react-native-community/checkbox';
import color from '../constants/colors';
import fonts from '../constants/fonts';
import Button from '../components/Button'
import ANT from 'react-native-vector-icons/AntDesign'
export default class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userEmail: '',
      custName: '',
      bookId: '',
      lat: null,
      long: null,
      enableAndroidLocation: false,
      isVerifyingLocation: false,
    };

    if (Platform.OS === 'android') {
      this.getPermission();
    }
  }

  getPermission() {
    console.log('asking permission');
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then(data => {
        this.setState({enableAndroidLocation: true});
      })
      .catch(() => {
        this.setState({enableAndroidLocation: false});
        Alert.alert(
          'Location',
          'You need to activate location to verify location !',
        );
      });
  }

  componentDidMount() {
    const theBookId = this.props.route.params.bookId;
    const theCustName = this.props.route.params.custName;
    this.setState({bookId: theBookId});
    this.setState({custName: theCustName});

    return fetch(API_PATH + 'tasks.php', {
      method: 'post',
      header: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        // we will pass our input data to server
        employee_id: this.props.route.params.employeeId,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('datasource', responseJson);

        const theDataSource = responseJson.map((x, i) => {
          return {...x, checked: false};
        });

        console.log('mapped', theDataSource);

        this.setState(
          {
            isLoading: false,
            dataSource: theDataSource,
          },
          function () {
            // In this block you can do something with new state.
          },
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 0,
          width: '100%',
          backgroundColor: '#607D8B',
          margin: 5,
        }}
      />
    );
  };

  GetFlatListItem(value) {
    // console.log('state bookId', this.state.bookId);
    alert(this.state.bookId);
    this.props.navigation.navigate('Digisign', {
      empId: this.props.route.params.employeeId,
      custName: this.state.custName,
      bookId: this.state.bookId,
    });
  }

  fetchLocation = () => {
    const words = this.props.route.params.bookId;
    this.setState({bookId: words});
    if (this.state.enableAndroidLocation) {
      this.setState({isVerifyingLocation: true});
      GeoLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      }).then(position => {
        this.setState({long: position.longitude, lat: position.latitude});
        this.sendLocation(
          position.latitude,
          position.longitude,
          this.state.bookId,
        );
      });
    } else {
      this.getPermission();
    }
  };

  sendLocation = (lat, long, bookId) => {
    if (lat && long != null) {
      //alert(bookId);
      const formData = new FormData();
      formData.append('latitude', lat);
      formData.append('longitude', long);
      fetch(API_PATH + 'tasks.php', {
        method: 'POST',
        header: {
          Accept: 'text/html',
          'Content-type': 'text/html',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: long,
          bookingIdParam: bookId,
        }),
        // body: formData,
      })
        .then(response => response.text())
        .then(textResp => {
          if (textResp.indexOf('updated successfully') >= 0) {
            Alert.alert('Success', 'Location Updated !');
          } else {
            Alert.alert('Failed', 'Something went wrong');
          }
          this.setState({isVerifyingLocation: false});
        })
        .catch(e => {
          Alert.alert('Failed', 'Something went wrong');
          this.setState({isVerifyingLocation: false});
        });
      // .then(jsonResp => console.log(jsonResp));
    } else {
      Alert.alert('Failed', 'Please Pick Location First !');
    }
  };

  handleCheckBox = index => {
    const list = [...this.state.dataSource];
    list[index]['checked'] = !list[index]['checked'];
    this.setState({dataSource: list});
  };

  render() {
    if (this.state.isLoading) {
      return ( 
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }
 
    return (
      <View style={styles.MainFirstContainer}>
         <View style={{height:50,backgroundColor:color.red,alignItems:'center',paddingHorizontal:20,flexDirection:'row'}}> 
         <ANT style={{marginRight:10}} onPress={()=>this.props.navigation.goBack()} name="arrowleft" color="#fff" size={30}></ANT>
         <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:19}}>Task List</Text>
        </View>
         <View style={{height:80,backgroundColor:color.red,flexDirection:'row',alignItems:'center',padding:20}}> 
          <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:18}}>{this.state.custName}</Text>
        </View>
          {this.state.isVerifyingLocation ? (
            <Button containerStyle={{backgroundColor:color.grey,alignSelf:'center'}} title="Loading..." />
          ) : (
            <Button
              title="Verify Location"
              onPress={this.fetchLocation}
              containerStyle={{alignSelf:'center'}}
            />
          )}
       

        <View style={styles.MainContainer}>
          <FlatList
            data={this.state.dataSource}
            renderItem={({item, index}) => (
              <View>
                {item.serviceHeading !== undefined && (
                  <Text style={styles.serviceHeading}>
                    {item.serviceHeading}
                  </Text>
                )} 

                <View style={styles.FlatListItemStyle}>
                  <CheckBox 
                  boxType="circle"
                    value={item.checked}
                    onValueChange={() => this.handleCheckBox(index)}
                  />
                  <Text style={{fontSize: 15,fontFamily:fonts.Medium,width:'80%'}}>{item.value}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.verifyButton}>
            <Button
              title="Continue"
              containerStyle={{alignSelf:'center'}}
              onPress={() => {
                this.props.navigation.navigate('ServiceReport', {
                  empId: this.props.route.params.employeeId,
                  custName: this.state.custName,
                  workDone: this.state.dataSource,
                  bookId: this.state.bookId,
                  address: this.props.route.params.address,
                  companyAddress: this.props.route.params.companyAddress,
                });
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainFirstContainer: {
    justifyContent: 'center',
    flex: 1
  },
  FirstView: {
    paddingBottom: 45,
  },
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
    marginBottom: 10,
  },

  FlatListItemStyle: {
    backgroundColor: 'white',
    padding: 15,
    borderWidth: 1,
    borderColor:'#D5D6DC',
    flexDirection: 'row',
    marginVertical:5,
    width:'95%',
    alignSelf:'center',
    paddingHorizontal:10,
    alignItems:'center',
    borderRadius:10
  },
  FlatListItemListStyle: {
    padding: 10,
    fontSize: 15,
    fontWeight: 'normal',
  },
  time: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 14,
    textAlign: 'left',
  },
  status: {
    flex: 1,
    fontSize: 26,
    flexDirection: 'row',
    textAlign: 'right',
  },
  imageContainer: {
    height: 100,
  },
  verifyButton: {
    marginTop: 20,
    borderRadius: 20,
    width: '100%',
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    borderRadius: 20,
    width: '100%',
    color: 'black',
  },
  serviceHeading: {
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    marginBottom: 10,
    marginTop: 5,
    textAlign:'center'
  },
});
