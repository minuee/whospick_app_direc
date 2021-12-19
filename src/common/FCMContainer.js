import {useEffect, useCallback} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {apiObject} from './API';

const FCMContainer = ({children}, props) => {
  const _registerToken = async fcmToken => {
    try {
      await apiObject.applyPushToken({
        token_value: fcmToken,
      });
    } catch (error) {
      console.log('ERROR: _registerToken');
      console.log(error.response.data);
    }
  };

  const _updateTokenToServer = useCallback(async () => {
    try {
      const fcmToken = await messaging().getToken();
      console.log(fcmToken);
      _registerToken(fcmToken);
    } catch (error) {
      console.log('ERROR: _updateTokenToServer');
      console.log(error);
    }
  }, []);

  const _requestPermission = useCallback(async () => {
    try {
      // User has authorised
      const authStatus = await messaging().requestPermission();
      console.log('authStatus',authStatus);
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('enabled',enabled);
      
      //await _updateTokenToServer();
    } catch (error) {
      // User has rejected permissions
      console.log("you can't handle push notification",error);
    }
  }, [_updateTokenToServer]);

  const _checkPermission = useCallback(async () => {
    try {
      const enabled = await messaging().hasPermission();
      if (enabled !== -1) {
        // user has permissions
        _updateTokenToServer();
      } else {
        // user doesn't have permission
        _requestPermission();
      }
    } catch (error) {
      console.log('ERROR: _checkPermission', error);
      console.log(error);
    }
  }, [_updateTokenToServer, _requestPermission]);

  useEffect(() => {
    _checkPermission();

    // 포그라운드 알림
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   console.log(remoteMessage);
    //   Alert.alert(
    //     remoteMessage.notification.title,
    //     remoteMessage.notification.body,
    //     [
    //       {
    //         text: '확인',
    //         style: 'cancel',
    //       },
    //     ],
    //     {cancelable: false}
    //   );
    // });

    // return unsubscribe;
  }, [_checkPermission]);

  return children;
};

export default FCMContainer;
