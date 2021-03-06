import React, {useEffect, useContext, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';

import {AddComma} from './src/common/Utils';
import {apiObject} from './src/common/API';

import SplashScreen from 'react-native-splash-screen';
import {NavigationContainer} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import AnimateNumber from 'react-native-animate-number';

import AuthStack from './src/screens/AuthStack';
import AppStack from './src/screens/AppStack';

import UserTokenContext from './src/Context/UserTokenContext';

import {Auth} from '@psyrenpark/auth';
import CodePush from './src/common/CodePush';
import FCM from './src/common/FCMContainer';

const App = () => {
  const {isSessionAlive, setUserInfo} = useContext(UserTokenContext);
  const [splashScreen, setSplashScreen] = useState(true);

  const [actorCount, setActorCount] = useState(0);
  const [directorCount, setDirectorCount] = useState(0);

  useEffect(() => {
    const _getUserCount = async () => {
      try {
        const apiResult = await apiObject.getUserCount();

        setActorCount(apiResult.actor_count);
        setDirectorCount(apiResult.director_count);
      } catch (error) {
        console.log('_getUserCount -> error', error);
      }
    };

    const _getUserInfo = async () => {
      try {
        const apiResult = await apiObject.getUserInfo();

        if (apiResult.director_privacy_input_yn) {
          const {
            is_actor,
            is_director,
            mobile_no,
            point,
            profile_image_no,
            profile_image_url,
            referral_code,
            registered_actor,
            user_email,
            user_name,
            director_auth_yn,
          } = apiResult;
          setUserInfo({
            isSessionAlive: true,
            userEmail: user_email,
            userImage: profile_image_url,
            userName: user_name,
            userPhone: mobile_no,
            userPoint: point,
            isActor: is_actor,
            is_director: is_director,
            userCode: referral_code,
            haveProfile: registered_actor,
            userImageNo: profile_image_no,
            passDirectorAuth: director_auth_yn,
          });
        }
      } catch (error) {
        console.log('App -> _getUserInfo -> error', error);
      }
    };

    const _isSessionAlive = async () => {
      Auth.currentSessionProcess(
        async success => {
          _getUserInfo();
          setTimeout(() => {
            setSplashScreen(false);
          }, 2500);
        },
        error => {
          setTimeout(() => {
            setSplashScreen(false);
          }, 2500);
        }
      );
    };

    _getUserCount();
    _isSessionAlive();

    setTimeout(() => {
      SplashScreen.hide();
    }, 0);
  }, []);

  return splashScreen ? (
    <View style={{...StyleSheet.absoluteFill, flex: 1}}>
      <CodePush />
      <StatusBar translucent={true} backgroundColor={'transparent'} barStyle={'light-content'} animated={true} />
      <FastImage
        source={require('./assets/images/splash.png')}
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white', marginTop: '20%'}}>
          <Text style={{fontWeight: 'bold'}}>
            <AnimateNumber
              value={directorCount}
              timing="linear"
              formatter={val => {
                return AddComma(Math.floor(val));
              }}
            />
            ???
          </Text>
          ??? ???????????????{' '}
          <Text style={{fontWeight: 'bold'}}>
            <AnimateNumber
              value={actorCount}
              timing="linear"
              formatter={val => {
                return AddComma(Math.floor(val));
              }}
            />
            ???
          </Text>
          ??? ????????????
        </Text>
      </FastImage>
    </View>
  ) : (
    <NavigationContainer>
      {isSessionAlive ? (
        <FCM>
          <AppStack />
        </FCM>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default App;
