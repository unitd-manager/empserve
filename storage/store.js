import AsyncStorage from '@react-native-async-storage/async-storage';

const storeEmployee = async data => {
  try {
    await AsyncStorage.setItem('@employee', data);
    return true;
  } catch (error) {
    console.log(error);
  }
};

const getEmployee = async () => {
  try {
    const value = await AsyncStorage.getItem('@employee');
    if (value !== null) {
      return value;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
  }
};

export {storeEmployee, getEmployee};
