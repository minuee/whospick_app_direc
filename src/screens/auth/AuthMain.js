import React, {useContext, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import scale from '../../common/Scale';
import {isIOS, screenHeight} from '../../common/Utils';
import {apiObject} from '../../common/API';

import LoadingContext from '../../Context/LoadingContext';
import UserTokenContext from '../../Context/UserTokenContext';

import {Auth, AuthType} from '@psyrenpark/auth';

import {Header, Button, Input} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import KakaoLogins, {KAKAO_AUTH_TYPES} from '@react-native-seoul/kakao-login';
import {NaverLogin, getProfile} from '@react-native-seoul/naver-login';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';

import jwt_decode from 'jwt-decode';

GoogleSignin.configure();

const naverKeys = {
  kConsumerKey: 'J_ArOWEtkqvzspEq59Qy',
  kConsumerSecret: '6n_famNnbf',
  kServiceAppName: '후즈픽(감독)',
  kServiceAppUrlScheme: 'whospickdirectornaverauth',
};

const AuthMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {setUserInfo} = useContext(UserTokenContext);

  const refInputPass = useRef(null);

  const [requestDataForm, setRequestDataForm] = useState({
    email: __DEV__ ? 'test0004@ruu.kr' : '',
    password: __DEV__ ? 'zxcv123@' : '',
  });

  const [sosialInfo, setSosialInfo] = useState({
    email: '',
    password: '',
  });

  const _getUserInfo = async isSocial => {
    try {
      const apiResult = await apiObject.getUserInfo(loading => setIsLoading(loading));

      if (!apiResult.director_privacy_input_yn) {
        if (isSocial) {
          props.navigation.navigate('SignUp', {
            TAB_INDEX: 2,
            USER_EMAIL: sosialInfo.email,
            USER_PASS: sosialInfo.password,
            MYINFO: apiResult,
          });
        } else {
          props.navigation.navigate('SignUp', {
            TAB_INDEX: 2,
            USER_EMAIL: requestDataForm.email,
            USER_PASS: requestDataForm.password,
            MYINFO: apiResult,
          });
        }
      } else {
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
      console.log('_getUserInfo -> error', error);
      if (error.response.data.not_director) {
        Alert.alert('[안내]', "이 계정은 '배우용'으로 설정되어있습니다.\n'감독용'으로도 함께 사용하시겠어요?", [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: () => _addUserType(),
          },
        ]);
      }
    }
  };

  const _addUserType = async () => {
    try {
      const apiResult = await apiObject.addUserType(loading => setIsLoading(loading));

      console.log(apiResult);

      _getUserInfo();
    } catch (error) {
      console.log('_addUserType -> error: ', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onSignInPress = async () => {
    try {
      Auth.signInProcess(
        {
          authType: AuthType.EMAIL,
          email: requestDataForm.email,
          password: requestDataForm.password,
        },
        async success => {
          console.log('_onSignInPress -> success', '로그인 성공==');
          _getUserInfo();
        },
        async needConfirm => {
          console.log('_onSignInPress -> needConfirm', '이메일 인증 필요==');
          props.navigation.navigate('SignUp', {
            TAB_INDEX: 1,
            USER_EMAIL: requestDataForm.email,
            USER_PASS: requestDataForm.password,
          });
        },
        error => {
          console.log('_onSignInPress -> error', error);
          Toast.show('아이디 또는 비밀번호가 틀렸습니다.\n확인 후 다시 시도해주세요.', Toast.SHORT);
        },
        loading => setIsLoading(loading)
      );
    } catch (error) {
      Toast.show('아이디 또는 비밀번호가 틀렸습니다.\n확인 후 다시 시도해주세요.', Toast.SHORT);
      console.log('_onSignInPress -> error', error);
    }
  };

  const _socialSignUp = async (email, uuid, type) => {
    console.log('type', type);
    console.log('uuid', uuid);
    console.log('email', email);
    let signUpType;
    switch (type) {
      case 'KAKAO':
        signUpType = AuthType.KAKAO;
        break;

      case 'APPLE':
        signUpType = AuthType.APPLE;
        break;

      case 'GOOGLE':
        signUpType = AuthType.GOOGLE;
        break;

      case 'NAVER':
        signUpType = AuthType.NAVER;
        break;
    }
    await Auth.signUpProcess(
      {
        email: email,
        password: uuid,
        authType: signUpType,
        lang: 'ko',
        cognitoRegComm: {
          user_type: 'DIRECTOR',
          signup_device: 'APP',
        },
      },
      async data => {
        _getUserInfo(true);
      },
      error => {
        console.log('_socialSignUp -> error: ', error);
        Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      }
    );
  };

  const _onKaKaoPress = () => {
    KakaoLogins.login([KAKAO_AUTH_TYPES.Talk, KAKAO_AUTH_TYPES.Account])
      .then(result => {
        console.log(result);
        _getKaKaoProfile();
      })
      .catch(err => {
        if (err.code === 'E_CANCELLED_OPERATION') {
          console.log(err.message);
        } else {
          console.log(`Login Failed: ${err.code} ${err.message}`);
          Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
      });
  };

  const _getKaKaoProfile = () => {
    KakaoLogins.getProfile()
      .then(result => {
        console.log(result);
        setSosialInfo({email: result.email, password: result.id});
        Toast.showWithGravity('처리중입니다...', Toast.SHORT, Toast.CENTER);
        _socialSignUp(result.email, result.email, 'KAKAO');
      })
      .catch(err => {
        console.log(`Get Profile Failed:${err.code} ${err.message}`);
        Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      });
  };

  const _onNaverPress = () => {
    NaverLogin.login(naverKeys, async (err, token) => {
      if (err) {
      } else {
        console.log('_onNaverPress :: ', '네이버 로그인 성공===');
        _getNaverProfile(token.accessToken);
      }
    });
  };

  const _getNaverProfile = async token => {
    const naverProfile = await getProfile(token);
    if (naverProfile.resultcode === '024') {
      console.log('naverProfile.message', naverProfile.message);
      Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      return;
    }
    setSosialInfo({email: naverProfile.response.email, password: naverProfile.response.id});
    Toast.showWithGravity('처리중입니다...', Toast.SHORT, Toast.CENTER);
    _socialSignUp(naverProfile.response.email, naverProfile.response.id, 'NAVER');
    console.log('naverProfile', naverProfile);
  };

  const _onApplePress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      if (credentialState === appleAuth.State.AUTHORIZED) {
        console.log('_onApplePress :: 로그인 성공===');
        const identityToken = appleAuthRequestResponse.identityToken;
        const decodeToken = jwt_decode(identityToken);

        setSosialInfo({email: decodeToken.email, password: decodeToken.sub});
        Toast.showWithGravity('처리중입니다...', Toast.SHORT, Toast.CENTER);
        _socialSignUp(decodeToken.email, decodeToken.sub, 'APPLE');
      }
    } catch (e) {
      console.log(e);
      Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      // if (e.code !== appleAuth.Error.CANCELED && e.code !== appleAuth.Error.UNKNOWN) {
      //   Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      // }
    }
  };

  const _onGooglePress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleInfo = await GoogleSignin.signIn();
      console.log('googleInfo', googleInfo.user.email);
      setSosialInfo({email: googleInfo.user.email, password: googleInfo.user.id});
      Toast.showWithGravity('처리중입니다...', Toast.SHORT, Toast.CENTER);
      _socialSignUp(googleInfo.user.email, googleInfo.user.id, 'GOOGLE');
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        return null;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
        return null;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        return null;
      } else {
        // some other error happened
        Toast.show('로그인 과정에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
      }
    }
  };

  // const [keyboardIsOpen, setKeyboardIsOpen] = useState(true);
  // Keyboard.addListener('keyboardDidShow', () => {
  //   setKeyboardIsOpen(false);
  // });
  // Keyboard.addListener('keyboardDidHide', () => {
  //   setKeyboardIsOpen(true);
  // });

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{
          translucent: true,
          backgroundColor: 'transparent',
          barStyle: 'dark-content',
          animated: true,
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={{...styles.viewInner}}>
              <Text style={{...styles.txtLabel}}>Login</Text>
              <Input
                label={'Your E-mail'}
                placeholder={'email@address.com'}
                inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                containerStyle={{paddingHorizontal: 0}}
                maxLength={25}
                keyboardType="email-address"
                value={requestDataForm.email}
                onChangeText={text => setRequestDataForm({...requestDataForm, email: text})}
                onSubmitEditing={() => refInputPass.current.focus()}
                autoCapitalize="none"
              />
              <Input
                ref={refInputPass}
                label={'Password'}
                placeholder={'Password'}
                inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                containerStyle={{paddingHorizontal: 0}}
                maxLength={25}
                secureTextEntry={true}
                value={requestDataForm.password}
                onChangeText={text => setRequestDataForm({...requestDataForm, password: text})}
                onSubmitEditing={() => _onSignInPress()}
              />
              <Button
                title="Login"
                titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                disabled={!(requestDataForm.email !== '' && requestDataForm.password !== '')}
                buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                onPress={() => _onSignInPress()}
                loading={isLoading}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: scale(20),
                }}>
                <Text style={{color: '#999999', fontSize: scale(12)}}>로그인이 안되시나요? </Text>
                <TouchableOpacity onPress={() => props.navigation.navigate('ResetPass')}>
                  <Text style={{color: '#e5293e', fontSize: scale(12)}}>비밀번호 찾기</Text>
                </TouchableOpacity>
              </View>
              <View style={{...styles.viewSocialArea}}>
                <TouchableOpacity onPress={() => _onKaKaoPress()}>
                  <FastImage
                    source={require('../../../assets/images/drawable-xxxhdpi/kakao.png')}
                    style={{width: scale(40), height: scale(40)}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => _onNaverPress()}>
                  <FastImage
                    source={require('../../../assets/images/drawable-xxxhdpi/naver.png')}
                    style={{width: scale(40), height: scale(40)}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => _onGooglePress()}>
                  <FastImage
                    source={require('../../../assets/images/drawable-xxxhdpi/google.png')}
                    style={{width: scale(40), height: scale(40)}}
                  />
                </TouchableOpacity>
                {isIOS() && (
                  <TouchableOpacity onPress={() => _onApplePress()}>
                    <FastImage
                      source={require('../../../assets/images/drawable-xxxhdpi/apple.png')}
                      style={{width: scale(40), height: scale(40)}}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* {keyboardIsOpen && (
              <View style={{...styles.viewFindPassArea, borderTopWidth: scale(1), borderColor: '#dddddd'}}>
                <Text style={{color: '#999999', fontSize: scale(12)}}>계정이 없으신가요? </Text>
                <TouchableOpacity onPress={() => props.navigation.navigate('SignUp')}>
                  <Text style={{color: '#e5293e', fontSize: scale(12)}}>회원가입하러 가기</Text>
                </TouchableOpacity>
              </View>
            )} */}
          </View>
        </TouchableWithoutFeedback>
        <View
          style={{
            ...styles.viewFindPassArea,
            borderTopWidth: scale(1),
            borderColor: '#dddddd',
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: '#999999', fontSize: scale(12)}}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => props.navigation.navigate('SignUp')}>
              <Text style={{color: '#e5293e', fontSize: scale(12)}}>회원가입하러 가기</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: scale(15),
              marginBottom: scale(5),
            }}>
            <TouchableOpacity onPress={() => props.navigation.navigate('TOS')}>
              <Text style={{...styles.txtCopyRight, marginRight: scale(15)}}>이용약관</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.navigation.navigate('PP')}>
              <Text style={{...styles.txtCopyRight}}>개인정보처리방침</Text>
            </TouchableOpacity>
          </View>
          <Text style={{...styles.txtCopyRight, textAlign: 'center'}}>ⓒ Whospick Corp.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AuthMain;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: screenHeight,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    flex: 1,
    paddingHorizontal: scale(25),
  },
  txtLabel: {
    fontSize: scale(30),
    fontWeight: 'bold',
    color: '#e5293e',
    marginBottom: scale(25),
  },
  viewFindPassArea: {
    paddingVertical: scale(20),
  },
  viewSocialArea: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  txtCopyRight: {
    fontSize: scale(10),
    color: '#999999',
  },
});
