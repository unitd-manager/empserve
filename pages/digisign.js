import React, {Component} from 'react';
import GeoLocation from 'react-native-get-location';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import API_PATH from '../config/api';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {Fragment} from 'react';
import Signature from 'react-native-signature-canvas';
import color from '../constants/colors';
import fonts from '../constants/fonts';
import ANT from 'react-native-vector-icons/AntDesign'
export default class Digisign extends Component {
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
      isConfirming: false,
      successfulConfirmation: 0,
      workDone: [],
    };

    this.signElement = React.createRef();
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
    //this.setState({bookingId: theBookId});
    this.setState({custName: theCustName});

    const newWorkDone = this.props.route.params.workDone.filter((x, i) => {
      return x.checked;
    });

    this.setState({
      workDone: newWorkDone,
    });

    return fetch(
      API_PATH +
        'digisign.php?' +
        new URLSearchParams({
          employee_id: this.props.route.params.employeeId,
        }),
      {
        method: 'get',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
      },
    )
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(responseJson => {
        console.log(responseJson);

        this.setState(
          {
            isLoading: false,
            dataSource: responseJson,
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
    Alert.alert(value);
  }

  fetchLocation = () => {
    const words = this.props.route.params.custName.split('-');
    this.setState({bookId: words[0]});
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

  createItems = item => {
    if (item.length > 0) {
      console.log('not else');
      return item.map((x, i) => {
        return (
          <Text
            style={styles.FlatListItemStyle}
            onPress={this.GetFlatListItem.bind(this, x.serviceHeading)}>
            {/* {x.serviceHeading} */}
            {'\n'}
            <Text style={styles.time}>{x.value}</Text>
          </Text>
        );
      });
    } else {
      console.log('jump to else');
      return (
        <View style={[styles.FlatListItemStyle, {paddingVertical: 10}]}>
          <Text
            style={[
              styles.time,
              {
                fontFamily: fonts.Medium,
              },
            ]}>
            {item.value}
          </Text>
        </View>
      );
    }
  };

  handleClear = () => {
    this.signElement.current.clearSignature();
  };

  handleConfirm = () => {
    this.signElement.current.readSignature();
  };

  handleSignature = signature => {
    this.setState({isConfirming: true});
    const workDone = this.props.route.params.workDone.filter(el => {
      return el.checked;
    });
    const formData = new FormData();
    formData.append('signature', signature);
    formData.append('employee_id', this.props.route.params.employeeId);
    formData.append('bookingIdParam', this.props.route.params.bookId);
    fetch(API_PATH + 'digisign.php', {method: 'POST', body: formData})
      .then(res => res.json())
      .then(resJson => {
        if (resJson.status === 'success') {
          workDone.map((x, i) => {
            const dataToSend = {
              bookingIdParam: this.props.route.params.bookId,
              service: x.value,
              valuelist_id: x.valuelist_id,
            };
            console.log(dataToSend);
            fetch(API_PATH + 'taskSubmit.php', {
              method: 'POST',
              body: JSON.stringify(dataToSend),
            })
              .then(res => res.json())
              .then(resJson => {
                console.log(resJson);
              });
          });
          Alert.alert('Customer Signed !');
          /*SweetAlert.showAlertWithOptions({
            title: 'Customer Signed',
            subTitle: '',
            confirmButtonTitle: 'OK',
            otherButtonTitle: 'Cancel',
            style: 'success',
            cancellable: true
          },
            callback => console.log('callback'));  */
          this.props.navigation.navigate('Profile');
          this.setState({isConfirming: false});
        } else {
          Alert.alert('An error occured, please try again later !');
          this.setState({isConfirming: false});
        }
      });
    fetch(API_PATH + 'serviceReport.php', {
      method: 'POST',
      body: this.props.route.params.serviceReport,
    })
      .then(res => res.text())
      .then(res => console.log(res));
  };

  render() {
    console.log('workdone', this.props.route.params.workDone);
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }
 
    return (
      <>
        <View style={{height:50,backgroundColor:color.red,alignItems:'center',paddingHorizontal:20,flexDirection:'row'}}> 
         <ANT style={{marginRight:10}} onPress={()=>this.props.navigation.goBack()} name="arrowleft" color="#fff" size={30}></ANT>
         <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:19}}>DigiSign</Text>
        </View>
        <View style={styles.MainContainer}>
        <Text style={styles.heading}>List of works completed</Text>
          <View style={{flex:2}}>
            <FlatList
              data={this.state.workDone}
              ItemSeparatorComponent={this.FlatListItemSeparator}
              renderItem={({item}) => (
                <Fragment>
                  {item.checked ? this.createItems(item) : <></>}
                </Fragment>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
          <Text style={styles.heading}>Signature</Text>
          <View style={{flex: 2, marginTop: '1%'}}>
            <Signature
              ref={this.signElement}
              onOK={this.handleSignature}
              webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
              style={{
               
                borderColor:color.grey,
                borderWidth: 1,
                width:'90%',
                alignSelf:'center'
              }}
              confirmText="Confirm"></Signature>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              onPress={() => this.handleClear()}
              style={[styles.BtnSign, {borderWidth:1,borderColor:color.grey,backgroundColor:'transparent'}]}>
              <Text style={{color:color.black,fontFamily:fonts.Medium,fontSize:19}}>Clear</Text>
            </TouchableOpacity>
            {this.state.isConfirming ? (
              <TouchableOpacity style={styles.BtnSign}>
                <Text style={{color:color.white,fontFamily:fonts.Medium,fontSize:19}}>Confirming...</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => this.handleConfirm()}
                style={styles.BtnSign}>
                <Text style={{color:color.white,fontFamily:fonts.Medium,fontSize:19}}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </>
        
      
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
    color: color.grey,
    fontFamily:fonts.SemiBold
  },
  BtnSign: {
    backgroundColor: 'red',
    height: 35, 
    color: '#FFFFFF',
    minWidth: 100,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 5,
  },
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
 
    marginBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor:'#fff'
  },

  FlatListItemStyle: {
    backgroundColor: 'white',
    paddingLeft: 10,
    fontSize: 14,
    borderStyle: 'solid',
    fontFamily:fonts.Medium,
    borderBottomWidth:1,
    width:'95%',alignSelf:'center',
    borderColor:'grey'
  },
  FlatListItemListStyle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  time: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 16,
    textAlign: 'left',
  },
  status: {
    flex: 1,
    fontSize: 14,
    flexDirection: 'row',
    textAlign: 'right',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  verifyButton: {
    marginBottom: 10,
    borderRadius: 20,
    width: '100%',
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    borderRadius: 20,
    width: '100%',
    color: 'black',
  },
});
