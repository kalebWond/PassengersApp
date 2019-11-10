import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, PermissionsAndroid,
  Keyboard, TextInput, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SettingsModal from './modal';
import { changeLanguage } from '../actions/changeLanguage';
import { database } from '../config/firebase';
import * as Progress from 'react-native-progress';

class Registration extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = { 
      phoneNumber: '+251',
      hasLocationPermission: '',
      modalVisible: false,
      key: '',
      loading: false
    };
  }

  static navigationOptions = ({ navigation}) => {
    return {
      title: 'Registration',
      headerTintColor: '#333',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#888',
      },
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('toggleModal')}>
          <Icon name="cog" size={30} style={{paddingRight: 15, paddingLeft: 18, marginRight: 5}} color="#888" />
        </TouchableOpacity>
      )
    }
  }

  componentDidMount= () => {
    this.props.navigation.setParams({ toggleModal: this._toggleModal });

    var that = this;
    async function requestLocationPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'ባለጋሪ ተጓዥ App Location Permission',
            message:
              'ባለጋሪ ተጓዥ App needs access to your Location ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You have the Location permission');
          that.setState({hasLocationPermission: true})
        } else {
          console.log('Location permission denied');
          that.setState({hasLocationPermission: false})
        }
      } catch (err) {
        console.warn(err);
      }
    }

    requestLocationPermission();

    // database.ref('/passengers').on('value', (data) => {
    //   if(data.val() != null) {
    //     setTimeout(() => {
    //       console.log(data.val()[this.state.key]);
    //     }, 100);
    //   }
    //   else { console.log("It was null") } 
    // })
  }
  
  _toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  onSubmit = () => {
    this.setState({ loading: true });
    Keyboard.dismiss();
    if(this.state.phoneNumber.trim().length >= 4 && this.state.phoneNumber.length > 9) {
      let key = database.ref('/passengers').push().key;
      database.ref('/passengers').child(key).set({ phoneNumber: this.state.phoneNumber}, () => {
        this.setState({ loading: false })
        this.props.navigation.navigate("Map", {
          "phone": this.state.phoneNumber,
          "hasLocationPermission": this.state.hasLocationPermission,
          "key": key
        });

      });

    }
    else {alert(this.props.phrases.registerAlert)}
  }

 render() {
   let progressBar = (<Progress.Bar style={{ width: "75%"}} color="#FFCE54" indeterminate={true} width={null} />)
   return (
   <View style={styles.container}>
      <StatusBar backgroundColor="grey"
              barStyle="light-content" />
      <Text style={styles.title}>{this.props.phrases.enterPhoneNumber}</Text>
      <View style={styles.inputContainer}>
        {/* <Text style={{fontSize: 20}}>+251</Text>  */}
        <TextInput
          defaultValue="+251 "
          maxLength={13}
          keyboardType={'phone-pad'}
          style={styles.phoneInput}
          onChangeText={(text) => this.setState({phoneNumber: text})}
          value={this.state.phoneNumber}
        />
      </View>
      <TouchableOpacity style={styles.button}
        onPress={this.onSubmit} disabled={this.state.loading} >
        <Text style={{fontSize: 20, color: "white", fontWeight: 'bold'}}>{this.props.phrases.register}</Text>
      </TouchableOpacity>
      { this.state.loading ? progressBar : null }
      <Image style={styles.img}
            source={require('../assests/img/car-4.png')}
          />
      <SettingsModal toggleModal={this._toggleModal} modalVisible={this.state.modalVisible}
        onChangeLanguage={this.props.onChangeLanguage} />
   </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-evenly",
    height: "100%"
  },
  title: {
    paddingTop: 30,
    paddingBottom: 10,
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%"
  },
  phoneInput: {
    flex: 1,
    borderColor: '#25bbf4',
    borderWidth: 1,
    padding: 10,
    // paddingLeft: 5,
    fontSize: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: -50
  },
  button: {
    width: "80%",
    alignItems: "center",
    backgroundColor: "#156fca", 
    padding: 10,
    borderRadius: 50,
    marginTop: -50,
    elevation: 5

  },
  img: {
    width: 300,
    height: 250
  }
  });

  const mapStateToProps = (state) => {
    return {
      phrases: state.language.phrases
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      onChangeLanguage: (language) => dispatch(changeLanguage(language))
    }
  }
export default connect(mapStateToProps, mapDispatchToProps)(Registration);
