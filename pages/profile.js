import React, {Component} from 'react';
import GeoLocation from 'react-native-get-location';
import {
  Button,
  StyleSheet,
  FlatList,
  Image,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Modal, 
  TouchableOpacity,
} from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import API_PATH from '../config/api';
import { ScrollView } from 'react-native-gesture-handler';
import color from '../constants/colors';
import fonts from '../constants/fonts';
import ION from 'react-native-vector-icons/Ionicons'
import ANT from 'react-native-vector-icons/AntDesign'
import FA from 'react-native-vector-icons/FontAwesome'
import FEA from 'react-native-vector-icons/Feather'
import ENT from 'react-native-vector-icons/Entypo'
import api from '../config/apisauce';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      emailId: '', 
      employeeId: '',
      staffName: '',
      attendType: 'Check In',
      attendTypenight:'Check In',
      enableAndroidLocation: false,
      long: null,
      lat: null,
      isVerifyingLocation: false,
      modalVisible: false,
      projectListArray:[],
      project_id:'',
      project_title:'Select project here',
      dataSource:[],
      userProjectList:[],
      ifaddSite:false,
      lastProjectName:"",
      lastAttandanceId:"",
      ifcomplete:true
    };
  }
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }
  componentDidMount() {
    //this.getPermission();
    console.log(this.props.route.params.emailId)
    this.projectList();
    this.checkAttendance()
    return fetch(API_PATH + 'requestCustomers.php', {
      method: 'post',
      header: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
      
        email: this.props.route.params.emailId,
        employee_id: this.props.route.params.employeeId,
        attendanceType: this.state.attendType,
        staffName : this.props.route.params.staffName
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        if(responseJson == null){
          this.setState(
            {
              isLoading: false,
              dataSource: [],
            },
            function () {

            },
          );
        }else{
          this.setState(
            {
              isLoading: false,
              dataSource: responseJson,
            },
            function () {

            },
          );
        }
        
      })
      .catch(error => {
        console.error(error);
      });
  }

  getPermission() {
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

  fetchLocation = (type) => {
    if (this.state.enableAndroidLocation) {
      this.setState({isVerifyingLocation: true});
      GeoLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      }).then(position => {
        this.setState({long: position.longitude, lat: position.latitude});
        if(type == 'day'){
          this.checkInAttendance(position.latitude, position.longitude);
        }else{
          this.checkInAttendanceNight(position.latitude, position.longitude);
        }
        
        this.setState({isVerifyingLocation: false});
      });
    } else {
      this.getPermission();
    }
  };
 
  checkInAttendance = (_lat, _long) => {
   
    if (this.props.route.params.emailId) {
      if(this.state.project_id != ''){
        fetch(API_PATH + 'attendance.php', {
          method: 'POST',
          header: {
            Accept: 'application/json',
            'Content-type': 'application/json', 
          },
          body: JSON.stringify({
            email: this.props.route.params.emailId,
            attendanceType: this.state.attendType,
            lat: _lat,
            long: _long,
            project_id:this.state.project_id,
            attendance_id:this.state.lastAttandanceId
          }),
        })
          .then(response => response.json())
          .then(textResp => {
            console.log(textResp)
            let _attendType = this.state.attendType;
            if(_attendType == 'Check In'){
              this.setState({
                attendType:  'Check Out'
              });
            }else if (_attendType == 'Check Out'){
              this.setState({
                attendType:  'Marked',
              });
            }
            this.checkAttendance()
            Alert.alert('Success', 'Attendance Created !');
          });
      }else{
        Alert.alert('', 'Please Select Project');
      }
      
    } else {
      Alert.alert('Failed', 'Something went wrong, please login again');
    }
  };
  checkInAttendanceNight = (_lat, _long) => {
    console.log({
      email: this.props.route.params.emailId,
      attendanceType: this.state.attendType,
      lat: _lat,
      long: _long,
      project_id:this.state.project_id,
      attendance_id:this.state.lastAttandanceId
    })
    if (this.props.route.params.emailId) {
      if(this.state.project_id != ''){
        fetch(API_PATH + 'night_attendance.php', {
          method: 'POST',
          header: {
            Accept: 'application/json',
            'Content-type': 'application/json', 
          },
          body: JSON.stringify({
            email: this.props.route.params.emailId,
            attendanceType: this.state.attendTypenight,
            lat: _lat,
            long: _long,
            project_id:this.state.project_id,
            attendance_id:this.state.lastAttandanceId
          }),
        })
          .then(response => response.json())
          .then(res => {
            console.log(res)
            let _attendType = this.state.attendTypenight;
            if(_attendType == 'Check In'){
              this.setState({
                attendTypenight:  'Check Out',
              });
            }else if (_attendType == 'Check Out'){
              this.setState({
                attendTypenight:  'Marked',
              });
            }
            this.checkAttendance()
            Alert.alert('Success', 'Attendance Created !');
          });
      }else{
        Alert.alert('', 'Please Select Project');
      }
      
    } else {
      Alert.alert('Failed', 'Something went wrong, please login again');
    }
  };
  completeSite = () => {
    if(this.state.ifaddSite == true){
      console.log(this.state.lastAttandanceId)
      if (this.props.route.params.emailId) {
        if(this.state.project_id != ''){
          fetch(API_PATH + 'completeSite.php', {
            method: 'POST',
            header: {
              Accept: 'application/json',
              'Content-type': 'application/json', 
            },
            body: JSON.stringify({
              a_id: this.state.lastAttandanceId,
              email:this.props.route.params.emailId
            }),
          })
            .then(response => response.json())
            .then(responseJson => {
              console.log(responseJson)
              if(responseJson.status == 200){
                this.setState({project_title:'Select project here'})
                this.checkAttendance()
              }else{
                Alert.alert('Failed', 'Something went wrong, please login again');
              }
            });
        }else{
          Alert.alert('', 'Site Marked Completed');
        }
        
      } else {
        Alert.alert('Failed', 'Something went wrong, please login again');
      }
    }else{
      Alert.alert('Failed', 'Kindly Check Out of  pending Site');
    }
    
  };
  projectList = async() => {
   
    fetch(
      API_PATH +
        'project_list.php',
      {
        method: 'get',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        
        this.setState({
          projectListArray: responseJson
        });
      })
      .catch(error => {
        console.error(error);
      });
  };
  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: 'white',
          margin: 5,
        }}
      />
    );
  };
  markNightAttendance = (id) =>{
    console.log(id)
    fetch(
      API_PATH +
        'nightAttendanceSecond.php',
      {
        method: 'POST',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body:JSON.stringify({
          id:id
        })
      },
    )
      .then(response => response.json())
      .then(responseJson => {
       console.log(responseJson)
       if(responseJson.status == 200){
         this.checkAttendance()
       }
      })
      .catch(error => {
        console.error(error);
      });
  }
  checkAttendance = () => {
   
    var d = new Date()
    var month = '' + (d.getMonth() + 1)
    var day = '' + d.getDate()
    var year = d.getFullYear();
    if (month.length < 2){
      month = '0' + month;
    }
    if (day.length < 2){
      day = '0' + day;
    }
    
    var date = year+'-'+month+'-'+day;
     fetch(
      API_PATH +
        'addSite.php',
      {
        method: 'POST',
        header: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          date: date,
          email: this.props.route.params.emailId
        }),
      },
    )
      .then(response => response.json())
      .then(responseJson => {
          if(responseJson.status != 400){
            let lastRec = responseJson.data
            let lastItem = lastRec[lastRec.length - 1]
           
            let addSiteFormal = false
            if(lastItem.if_complete == '0'){

            
              if(lastItem.time_in != null && lastItem.leave_time != null && lastItem.night_time_in != null && lastItem.night_leave_time != null){
                addSiteFormal = true
              }else if(lastItem.time_in != null && lastItem.leave_time == null && lastItem.night_time_in == null && lastItem.night_leave_time == null){
                addSiteFormal = false
              }else if(lastItem.time_in == null && lastItem.leave_time == null && lastItem.night_time_in != null && lastItem.night_leave_time == null){
                addSiteFormal = false
              }else if(lastItem.time_in != null && lastItem.leave_time != null && lastItem.night_time_in != null && lastItem.night_leave_time == null){
                addSiteFormal = false
              }else if(lastItem.time_in != null && lastItem.leave_time != null && lastItem.night_time_in == null && lastItem.night_leave_time == null){
                addSiteFormal = true
              }else if(lastItem.time_in == null && lastItem.leave_time == null && lastItem.night_time_in != null && lastItem.night_leave_time != null){
                
                addSiteFormal = true
              }else if(lastItem.time_in != null && lastItem.leave_time == null && lastItem.night_time_in != null && lastItem.night_leave_time == null){
                addSiteFormal = false
              }
              
              this.setState({userProjectList:responseJson.data,
                ifaddSite:addSiteFormal,
                lastProjectName:lastItem.title,
                project_id:lastItem.project_id,lastAttandanceId:lastItem.attendance_id,ifcomplete:true})
  
              //MarkingLogic
  
              if(lastItem.time_in != null){
                if(lastItem.leave_time != null){
                  this.setState({
                    attendType: 'Marked'
                  });
                }else{
                  this.setState({
                    attendType: 'Check Out'
                  });
                }
              }else{
                this.setState({
                  attendType: 'Check In'
                });
              }
              if(lastItem.night_time_in != null){
                if(lastItem.night_leave_time != null){
                  this.setState({
                    attendTypenight: 'Marked'
                  });
                }else{
                  this.setState({
                    attendTypenight: 'Check Out'
                  });
                }
              }else{
                this.setState({
                  attendTypenight: 'Check In'
                });
              }
            }else{
              this.setState({userProjectList:responseJson.data,
                lastProjectName:"",
                project_id:"",lastAttandanceId:"",ifcomplete:false})
              addSiteFormal = true
              this.setState({ifaddSite:true})
              this.setState({
                attendType: 'Check In',
                attendTypenight:'Check In'
              });
            }
           
          }else{
            
            addSiteFormal = true
            this.setState({ifaddSite:true,ifcomplete:false,lastAttandanceId:""})
            this.setState({
              attendType: 'Check In',
              attendTypenight:'Check In'
            });
          }
      })
      .catch(error => {
        console.error(error);
      });
 
  };
  GetFlatListItem(customer_name, bookId, address, companyAddress) {
    
    this.props.navigation.navigate('Tasks', {
      empId: this.props.route.params.employeeId,
      custName: customer_name,
      bookId: bookId,
      address: address,
      companyAddress: companyAddress,
    });
  }
  

  render() {
    const { modalVisible } = this.state;
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.MainFirstContainer}>
       <View style={{height:80,backgroundColor:color.red,flexDirection:'row',alignItems:'center',padding:20}}> 
          <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:18}}>Welcome!  {this.props.route.params.staffName}</Text>
        </View>
          <ScrollView>
      
         <View style={{backgroundColor:'#fff',paddingVertical:20}}>
         {this.state.ifcomplete == true && ( <>
          <Text style={{textAlign:'center',fontFamily:fonts.Bold,fontSize:20}}>In Progress : </Text>
          <View style={{marginVertical:21,flexDirection:'row'}}>
         
         <View style={{width:'70%'}}>
           
           <Text style={{textAlign:'left',
          fontSize:17,
          marginHorizontal:10,fontFamily:fonts.Medium}}>{this.state.lastProjectName}</Text>
           </View>
          
          <TouchableOpacity onPress={()=>{
            this.completeSite()
          }} style={{backgroundColor:'red',
          width:100,flexDirection:'row',
          justifyContent:'center',padding:5,borderRadius:5,alignSelf:'center'}}>
            <Text style={{color:'#fff',borderRadius:5}}>Complete</Text>
          </TouchableOpacity>
        </View>
        <View style={{width:'90%',height:0.5,backgroundColor:color.grey,alignSelf:'center',marginBottom:20}}></View>
         </>)}
            {this.state.ifcomplete == false && (<>
            <View style={{margin:20}}>
            <Text style={styles.projectTitle}>Project Title</Text>
              <TouchableOpacity onPress={()=>{this.setModalVisible(true)}} style={styles.dropDown}>
                <Text style={styles.projectDropTitle}>{this.state.project_title}</Text>
                <ION name="chevron-down-sharp" size={25}></ION>
              </TouchableOpacity>
            </View>
            </>)} 
            <View style={styles.checkInButtonRow}>
              <View>
                <Text style={styles.labelOfAttendance}>Day Attendance</Text>
                {this.state.attendType == 'Marked' ? (<TouchableOpacity style={[styles.checkIn,{backgroundColor:"#009d37"}]}>
                        <ANT color={color.white} style={{marginTop:10}} size={25} name="check"></ANT>
                        <Text style={styles.checkButtonText}>Complete</Text>
                </TouchableOpacity>) : (<TouchableOpacity  onPress={() => {
                    if (!this.state.isVerifyingLocation) {
                      this.fetchLocation('day');
                    }
                  }} style={[styles.checkIn,{backgroundColor:this.state.attendType == 'Check Out' ? color.grey : color.red}]}>
                        <ANT color={color.white} style={{marginTop:10}} size={25} name={this.state.attendType == 'Check Out' ? "logout" : "login"}></ANT>
                        <Text style={styles.checkButtonText}>{
                    this.state.isVerifyingLocation
                      ? 'Loading..'
                      : this.state.attendType
                  }</Text>
                </TouchableOpacity>)}
                
              </View>
              <View style={{width:1,backgroundColor:color.grey,height:'100%'}}></View>
              <View>
              <Text style={styles.labelOfAttendance}>Night Attendance</Text>
              {this.state.attendTypenight == 'Marked' ? (<TouchableOpacity 
              style={[styles.checkIn,{backgroundColor:"#009d37"}]}>
                        <ANT color={color.white} style={{marginTop:10}} size={25} name="check"></ANT>
                        <Text style={styles.checkButtonText}>Complete</Text>
                </TouchableOpacity>) : (<TouchableOpacity  onPress={() => {
                    if (!this.state.isVerifyingLocation) {
                      this.fetchLocation('night');
                    }
                  }} style={[styles.checkIn,{backgroundColor:this.state.attendTypenight == 'Check Out' ? color.grey : color.red}]}>
                        <ANT color={color.white} style={{marginTop:10}} size={25} name={this.state.attendTypenight == 'Check Out' ? "logout" : "login"}></ANT>
                        <Text style={styles.checkButtonText}>{
                    this.state.isVerifyingLocation
                      ? 'Loading..'
                      : this.state.attendTypenight
                  }</Text>
                </TouchableOpacity>)}
              </View>
            </View>
         </View>
        
            <View >
            {this.state.userProjectList.reverse().map((item,index) => {
           return (<View style={styles.card}>
             <Text style={styles.labelOfAttendance}>Project</Text>
             <View>
             <Text style={styles.projectTitllecard}>{item.title}</Text>
             <View style={{width:'100%',height:0.5,backgroundColor:color.grey,alignSelf:'center',marginBottom:20}}></View>
               <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <View style={styles.attror}>
                      <View style={{padding:7,backgroundColor:color.red,borderRadius:10}}><FEA color="#fff" size={20} name="sun"></FEA></View>
                      <Text style={{fontSize:16,fontFamily:fonts.Medium,marginHorizontal:3}}>{item.time_in} | {item.leave_time}</Text>
                  </View>
                  <View>
                      
                      {item.night_time_in == null && item.night_leave_time == null && this.state.ifcomplete == false ? (<TouchableOpacity onPress={()=>{
                this.markNightAttendance(item.attendance_id)
              }} style={{
                width:'70%',
                marginHorizontal:10,
                height:30,
                backgroundColor:color.grey,
                justifyContent:'center',
                flexDirection:'row',
                alignItems:'center',
                borderRadius:5
              }}>
                <Text style={{color:'#fff',fontFamily:fonts.Medium}}>Night Attendance</Text>
              </TouchableOpacity>) : (<View style={styles.attror}>
                      <View style={{padding:7,backgroundColor:color.grey,borderRadius:10}}><FA color="#fff" size={20} name="moon-o"></FA></View>
                      <Text style={{fontSize:16,fontFamily:fonts.Medium,marginHorizontal:3}}>{item.night_time_in} | {item.night_leave_time}</Text>
                  </View>)}
                 </View>
               </View>
             
              
             </View>
           </View>)
        })}
            </View>
        
        {this.state.dataSource.map((item,index) => {
            return (
              <TouchableOpacity style={styles.card}  onPress={this.GetFlatListItem.bind( 
                this,
                item.customer_name,
                item.booking_id,
                item.town,
                {
                  flat: item.flat,
                  poCode: item.po_code,
                  companyId: item.company_id,
                  country: item.country_name,
                  street: item.street,
                },
              )}>
             <Text style={styles.labelOfAttendance}>{item.customer_name}</Text>
             <View>
             <Text style={styles.projectTitllecard}>M: {item.mobile}</Text>
             <Text style={styles.projectTitllecard}>Address: {item.town}</Text>
             <View style={{width:'100%',height:0.5,backgroundColor:color.grey,alignSelf:'center',marginBottom:20}}></View>
               <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <View style={styles.attror}>
                  <ENT color="green" size={20} name="dots-three-vertical"></ENT>
                      <Text style={{fontSize:16,fontFamily:fonts.Medium,marginHorizontal:3}}>Status : {item.status}</Text>
                  </View>
                  <View style={[styles.attror,{alignItems:'center'}]}>
                    <FA color="#000" size={25} name="clock-o"></FA>
                      <Text style={{fontSize:16,fontFamily:fonts.Medium,marginHorizontal:3}}>{item.time}</Text>
                  </View>
               </View>
             
              
             </View>
           </TouchableOpacity>
             
            )
          })}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:15,marginTop:20}}>
                  <Text style={styles.labelOfAttendance}>Project List</Text>
                  <TouchableOpacity onPress={()=>{this.setModalVisible(false)}}>
                  <ANT name="close" size={30}></ANT>
                  </TouchableOpacity>
                  
              </View>
              <FlatList
              contentContainerStyle={{paddingBottom: 140}}
              data={this.state.projectListArray}
              ItemSeparatorComponent={this.FlatListItemSeparator}
              renderItem={({item}) => (
                <TouchableOpacity style={{borderBottomWidth:1,padding:10}} onPress={()=>{
                  this.setModalVisible(false);
                  this.setState({
                    project_id: item.project_id,
                    project_title:item.title
                  })
                }}>
                  <Text
                  style={{color:color.grey,fontFamily:fonts.Medium,fontSize:17}}
                  >
                  {item.title}
                </Text>
                </TouchableOpacity>
               
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            </View>
          </View>
        </Modal>
          </ScrollView>
            
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainFirstContainer: {
    //justifyContent: 'center',
    flex: 1,
    backgroundColor:'#F5F5F6'
  },
  FirstView: {
    paddingBottom: 45,
    //marginTop: 130,
    position:'absolute',
    alignSelf:'center'
  },
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    height: '100%',
    //backgroundColor: 'white',
    borderRadius: 30,
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: {
      height: 1,
      width: 1,
    },
  },


  FlatListItemStyle: {
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  FlatListItemListStyle: {
    fontSize: 14,
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
    fontSize: 14,
    flexDirection: 'row',
    textAlign: 'right',
  },
 
  welcomeText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 30,
    width: '100%',
    color: 'black',
  },
  label:{
    fontSize:18,
    textAlign:'center',
    marginVertical:10,
    fontWeight:'bold'
  },
  centeredView: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "center",
    //marginTop: 22,
    backgroundColor:'#1c1e2152',
   
   
  },
  modalView: {
    //margin: 20,
    backgroundColor: "white",
    width:'100%',
    height:'50%',
    position: 'absolute',
    bottom:0,
    //borderRadius: 20,
    //padding: 35,
    //alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderTopLeftRadius:40,
    borderTopRightRadius:40
  },
  modalText:{
    margin:15,
    fontWeight:'bold',
    fontSize:19,
    textAlign:'center',
    color:'red'
  },
  projectTitle:{
    color:color.grey,
    fontFamily:fonts.SemiBold,
    fontSize:19
  },
  projectDropTitle:{
    color:color.grey,
    fontFamily:fonts.Regular,
    fontSize:16,
    width:'90%'
  },
  dropDown:{
    flexDirection:'row',
    minHeight:50,
    alignItems:'center',
    paddingHorizontal:10,
    justifyContent:'space-between',
    borderWidth:1,
    borderRadius:5,
    width:'100%',
    alignSelf:'center',
    borderColor:'#D5D6DC',
    marginVertical:10
  },
  checkInButtonRow:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center'
  },
  labelOfAttendance:{
    fontFamily:fonts.SemiBold,
    color:color.black,
    fontSize:19
  },
  checkIn:{
    width:'70%',
    backgroundColor:color.red,
    borderRadius:25,
    height:80,
    //flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center'
  },
  checkButtonText:{color:color.white,fontFamily:fonts.Medium,marginVertical:5},
  card:{
    padding:10,marginVertical:5,
    paddingVertical:20,
    backgroundColor:'#fff',
    width:'95%',
    alignSelf:'center',
    borderWidth:1,
    borderColor:'#D5D6DC',
    borderRadius:10
  },
  projectTitllecard:{
    fontFamily:fonts.Regular,
    fontSize:16
  },
  attror:{
    flexDirection:'row',alignItems:'center',justifyContent:'center'
  }
});
