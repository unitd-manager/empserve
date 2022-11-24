import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet, 
  ScrollView,
} from 'react-native';
import FormGroup from '../components/FormGroup';
import CheckBox from '@react-native-community/checkbox';
import DropDownPicker from 'react-native-dropdown-picker';
import {getEmployee} from '../storage/store';
import API_PATH from '../config/api';
import color from '../constants/colors';
import fonts from '../constants/fonts';
import ANT from 'react-native-vector-icons/AntDesign'
import Button from '../components/Button';
import TextInput from '../components/TextInputC';

export default function ServiceReport(props) {
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState([
    {
      name: 'Routine Service',
      checked: false,
    },
    {
      name: 'T&C',
      checked: false,
    },
    {
      name: 'Repair',
      checked: false,
    },
    {
      name: 'Compliant Call',
      checked: false,
    },
    {
      name: 'Warranty',
      checked: false,
    },
    {
      name: 'Others',
      checked: false,
    },
  ]); 
  const [equipments, setEquipments] = useState([
    {
      type: 'Chiller',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
    {
      type: 'Pump',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
    {
      type: 'CT',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
    {
      type: 'AHU',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
    {
      type: 'FCU',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
    {
      type: 'Others',
      no: 0,
      id: '',
      model: '',
      serial: '',
      checked: false,
    },
  ]);
  const [workDone, setWorkDone] = useState([]);
  const [jobName, setJobName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [description, setDescription] = useState('');

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState([
    {label: 'Job Completed', value: 'Job Completed'},
    {label: 'Job Incomplete', value: 'Job Incomplete'},
    {label: 'Follow Up', value: 'Follow Up'},
  ]);

  const [emData, setEmData] = useState({});

  useEffect(() => {
    const newWorkDone = props.route.params.workDone.filter((x, i) => {
      return x.checked;
    });

    setWorkDone(newWorkDone);

    getEmployee().then(res => {
      const theEmData = JSON.parse(res);
      setEmData(theEmData);
    });
  }, []);

  const handleServiceType = index => {
    const list = [...serviceType];
    for (let i = 0; i < list.length; i++) {
      if (i !== index) {
        list[i]['checked'] = false;
      }
    }
    list[index]['checked'] = !list[index]['checked'];
    setServiceType(list);
  };

  const handleEquipments = (field, value, index) => {
    const list = [...equipments];
    list[index][field] = value;
    setEquipments(list);
  };
  return (
    <>
     <View style={{height:50,backgroundColor:color.red,alignItems:'center',paddingHorizontal:20,flexDirection:'row'}}> 
         <ANT style={{marginRight:10}} onPress={()=>this.props.navigation.goBack()} name="arrowleft" color="#fff" size={30}></ANT>
         <Text style={{color:color.white,fontFamily:fonts.SemiBold,fontSize:19}}>Task List</Text>
        </View>
        <ScrollView style={styles.container}>
     
     
        <TextInput
        placeholder="Name of Service"
          multiline={false}
          placeholderTextColor="grey"
          style={styles.textBox}
          onChangeText={val => setServiceName(val)}
          value={serviceName}
        />
        <TextInput
        placeholder="Job Name"
          multiline={false}
          style={styles.textBox}
          value={jobName}
          onChangeText={val => setJobName(val)}
        />
        <TextInput
          multiline={false}
          placeholder="Details"
          style={styles.textBox}
          value={description}
          onChangeText={val => setDescription(val)}
        />
      
      <TextInput
          multiline={false}
          placeholder="Address"
          style={styles.textBox}
          value={props.route.params.address}
  
        />
      <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
      <Text style={{color:color.grey,fontFamily:fonts.SemiBold,fontSize:17}}>Type of Service</Text>
        <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
          {serviceType.map((service, index) => {
            return (
              <View key={index} style={styles.checkBox}>
                <CheckBox
                  value={service.checked}
                  onValueChange={() => handleServiceType(index)}
                />
                <Text style={{color:color.grey,fontFamily:fonts.Medium,fontSize:15}}>{service.name}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
      <Text style={{color:color.grey,fontFamily:fonts.SemiBold,fontSize:17}}>Equipments</Text>
        <View>
          {equipments.map((equipment, i) => {
            return (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    value={equipment.checked}
                    onValueChange={() =>
                      handleEquipments('checked', !equipment.checked, i)
                    }
                  />
                  <Text style={{color:color.grey,fontFamily:fonts.Medium,fontSize:15}}>{equipment.type}</Text>
                </View>
                {equipment.checked === true && (
                  <>
                    <View style={{marginLeft: 20}}>
                      <View>
                        <Text>No. of Equipment</Text>
                        <TextInput
                          style={styles.textBox}
                          value={equipment.no}
                          keyboardType={'numeric'}
                          onChangeText={val =>
                            handleEquipments(
                              'no',
                              val.replace(/[^0-9]/g, ''),
                              i,
                            )
                          }
                        />
                      </View>
                      <View>
                        <Text>Equipment ID</Text>
                        <TextInput
                          style={styles.textBox}
                          value={equipment.id}
                          onChangeText={val => handleEquipments('id', val, i)}
                        />
                      </View>
                      <View>
                        <Text> Model No.</Text>
                        <TextInput
                          style={styles.textBox}
                          value={equipment.model}
                          onChangeText={val =>
                            handleEquipments('model', val, i)
                          }
                        />
                      </View>
                      <View>
                        <Text>Serial No.</Text>
                        <TextInput
                          style={styles.textBox}
                          value={equipment.serial}
                          onChangeText={val =>
                            handleEquipments('serial', val, i)
                          }
                        />
                      </View>
                    </View>
                  </>
                )}
              </>
            );
          })}
        </View>
      </View>
      <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
        <Text style={{color:color.grey,fontFamily:fonts.SemiBold,fontSize:17}}>WORK DESCRIPTION</Text>
      </View>
      <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
      <Text style={{color:color.grey,fontFamily:fonts.Medium,fontSize:17}}>- Task List</Text>
      {workDone.map((work, i) => {
          return <Text style={{color:'#000',fontFamily:fonts.Regular,fontSize:15}}>{work.value} {'\n'}</Text>;
        })}
      </View>
     

      
        <TextInput
         placeholder={'Arrival Time'}
          style={styles.textBox}
          value={arrivalTime}
          onChangeText={val => setArrivalTime(val)}
        />
     
        <TextInput
        placeholder={'Departure Time'}
          style={styles.textBox}
          value={departureTime}
          onChangeText={val => setDepartureTime(val)}
        />
     <View style={{width:'90%',alignSelf:'center',marginVertical:10}}>
      <Text style={{color:color.grey,fontFamily:fonts.SemiBold,fontSize:17}}>Work Status</Text>
      <DropDownPicker
          open={open}
          setValue={setWorkStatus}
          value={workStatus} 
          setOpen={setOpen}
          items={status}
          setItems={setStatus}
          listMode="MODAL"
          containerStyle={{backgroundColor:'transparent'}}
          style={{backgroundColor:'transparent',borderRadius:5}}
        />
      </View>
    
    
        <TextInput
        placeholder={'Remarks'}
          multiline={true}
          numberOfLines={5}
          style={styles.textBox}
          value={remarks}
          onChangeText={setRemarks}
        />
   
      <View style={styles.verifyButton}>
        <Button
        containerStyle={{alignSelf:'center'}}
          title="Continue"
          onPress={() => {
            const formData = new FormData();
            const newServiceType = serviceType.filter(
              service => service.checked === true,
            );
            const newServiceEquipments = equipments.filter(
              equipment => equipment.checked === true,
            );

            console.log(newServiceEquipments);

            formData.append('serviceName', serviceName);
            formData.append('jobName', jobName);
            formData.append('description', description);
            formData.append('serviceType', JSON.stringify(newServiceType));
            formData.append('equipments', JSON.stringify(newServiceEquipments));
            formData.append('address', props.route.params.address);
            formData.append('arrivalTime', arrivalTime);
            formData.append('departureTime', departureTime);
            formData.append('workStatus', workStatus);
            formData.append('remarks', remarks);
            formData.append(
              'companyAddress',
              JSON.stringify(props.route.params.companyAddress),
            );
            formData.append(
              'customerName',
              JSON.stringify(props.route.params.custName),
            );
            formData.append('employeeData', JSON.stringify(emData));
            formData.append('bookId', props.route.params.bookId);
            formData.append('service_report', true);

            // for (let [key, value] of formData) {
            //   console.log(`${key}: ${value}`);
            // }

            // console.log(formData);
            // fetch(API_PATH + 'serviceReport.php', {
            //   method: 'POST',
            //   body: formData,
            // })
            //   .then(res => res.text())
            //   .then(res => console.log(res));

            props.navigation.navigate('Digisign', {
              empId: props.route.params.employeeId,
              custName: props.route.params.custName,
              workDone: props.route.params.workDone,
              bookId: props.route.params.bookId,
              address: props.route.params.address,
              serviceReport: formData,
            });
            //   }
          }}
        />
      </View>
    </ScrollView>
    </>
    
  );
}

const styles = StyleSheet.create({
  textBox: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'grey',
    padding: 8,
    color: 'black',
  },
  container: {
    paddingHorizontal: 0,
    paddingTop: '5%',
  },
  checkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyButton: {
    marginTop: 20,
    borderRadius: 20,
    width: '100%',
    marginBottom: 40,
  },
});
