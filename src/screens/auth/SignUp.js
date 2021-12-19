import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  UIManager,
  LayoutAnimation,
  Keyboard,
  Alert,
  TextInput,
} from 'react-native';

import scale from '../../common/Scale';
import {screenWidth, _chkEmail, _chkPwd, _chkPhone, isEmpty} from '../../common/Utils';
import {apiObject, IMAGE_URL} from '../../common/API';

import LoadingContext from '../../Context/LoadingContext';
import UserTokenContext from '../../Context/UserTokenContext';

import {Header, Button, Input, Icon} from 'react-native-elements';
import Modal from 'react-native-modal';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-simple-toast';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-picker';
import {TabView} from 'react-native-tab-view';

import {Auth, AuthType} from '@psyrenpark/auth';
import {Storage} from '@psyrenpark/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const options = {
  title: '사진 촬영 & 선택',
  cancelButtonTitle: '취소',
  takePhotoButtonTitle: '사진 촬영',
  chooseFromLibraryButtonTitle: '사진 선택',
  mediaType: 'photo',
  maxWidth: 1024,
  maxHeight: 1024,
  storageOptions: {
    skipBackup: true,
    cameraRoll: false,
    path: 'images',
  },
};

const SignUp = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {userEmail} = useContext(UserTokenContext);

  const refScrollView = useRef(null);

  const [inputData, setInputData] = useState({
    userEmail: props.route.params ? props.route.params.USER_EMAIL : '',
    confirmCode: '',
    userName: props.route.params ? props.route.params.MYINFO.user_name : '',
    userPhone: props.route.params ? props.route.params.MYINFO.mobile_no : '',
    userBirth: props.route.params ? new Date(props.route.params.MYINFO.birth_dt * 1000) : new Date(),
    userPass: props.route.params ? props.route.params.USER_PASS : '',
    recommendCode: '',
    showPass: false,
    emailMessage: '',
    passMessage: '8자 이상의 영문, 숫자, 특수문자 조합',
    confirmCodeMessage: '',
    phoneMessage: '',
    careerHistory: [{category: '', list: [{year: '', title: ''}]}],
    careerImages: [],
  });

  const [index, setIndex] = useState(props.route.params ? props.route.params.TAB_INDEX : 0);
  const [routes] = useState([
    {key: 'one', title: '이메일비밀번호'},
    {key: 'two', title: '인증번호'},
    {key: 'three', title: '추가정보'},
  ]);
  const [signUpProgress, setSignupProgress] = useState('33%');

  const [isModalBirthOpend, setIsModalBirthOpend] = useState(false);

  const _onSignUpProgress = async () => {
    Keyboard.dismiss();
    switch (index) {
      case 0:
        Auth.signUpProcess(
          {
            email: inputData.userEmail,
            password: inputData.userPass,
            authType: AuthType.EMAIL,
            lang: 'ko',
            cognitoRegComm: {
              user_type: 'DIRECTOR',
              signup_type: 'APP',
            },
          },
          async success => {
            setIndex(1);
          },
          error => {
            console.log('error => 가입실패 : ', error);
            setInputData({
              ...inputData,
              emailMessage: '이미 사용중인 이메일이거나 사용이 제한된 이메일입니다.',
            });
          },
          loading => setIsLoading(loading)
        );
        break;

      case 1:
        Auth.confirmSignUpProcess(
          {
            email: inputData.userEmail,
            password: inputData.userPass,
            authType: AuthType.EMAIL,
            code: inputData.confirmCode,
          },
          async success => {
            setIndex(2);
          },
          error => {
            setInputData({
              ...inputData,
              confirmCodeMessage: '인증번호가 올바르지 않습니다. 다시 입력해주세요.',
            });
            console.log('error => 인증실패 : ', error);
          },
          loading => setIsLoading(loading)
        );
        break;

      case 2:
        try {
          let imageArr = [];

          if (inputData.careerImages.length) {
            const imageUploadResult = await apiObject.imageUpload({url: inputData.careerImages}, loading =>
              setIsLoading(loading)
            );

            imageArr = imageUploadResult.image_no;
          }
          const apiResult = await apiObject.applyUserInfo(
            {
              name: inputData.userName,
              mobile_no: inputData.userPhone,
              birth_dt: Math.floor(inputData.userBirth.getTime() / 1000),
              referral_code: inputData.recommendCode,
              career_list: inputData.careerHistory,
              image_list: imageArr,
            },
            loading => setIsLoading(loading)
          );

          console.log(apiResult);
          Toast.showWithGravity('환영합니다 :)\n다시 한 번 로그인 해주세요.', Toast.SHORT, Toast.CENTER);
          props.navigation.goBack(null);
        } catch (error) {
          console.log('_onSignUpProgress -> 2', error);
          Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
        break;
    }
  };

  const _onCheckType = () => {
    switch (index) {
      case 0:
        return !(
          inputData.userEmail !== '' &&
          inputData.userPass !== '' &&
          inputData.emailMessage === '' &&
          inputData.passMessage === '8자 이상의 영문, 숫자, 특수문자 조합' &&
          _chkEmail(inputData.userEmail) &&
          _chkPwd(inputData.userPass)
        );

      case 1:
        return !(inputData.confirmCode.length === 6 && inputData.confirmCodeMessage === '');

      case 2:
        return !(inputData.userName !== '' && inputData.userPhone !== '' && _chkPhone(inputData.userPhone));

      default:
        return false;
    }
  };

  const _onDeleteCareerHistoryPress = (mainIndex, subIndex) => {
    if (isEmpty(subIndex)) {
      Alert.alert('[안내]', `'경력 ${mainIndex + 1}' 전체를 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.`, [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          onPress: () => {
            let tmpArr = [...inputData.careerHistory];

            tmpArr.splice(mainIndex, 1);

            setInputData({...inputData, careerHistory: tmpArr});
          },
        },
      ]);
    } else {
      Alert.alert(
        '[안내]',
        `'경력 ${mainIndex + 1}'의 '${subIndex + 1}번째' 경력을 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            onPress: () => {
              let tmpArr = [...inputData.careerHistory];

              tmpArr[mainIndex].list.splice(subIndex, 1);

              setInputData({...inputData, careerHistory: tmpArr});
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    switch (index) {
      case 1:
        setSignupProgress('66%');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        break;
      case 2:
        setSignupProgress('100%');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        break;
    }
  }, [index]);

  const _onImagePicker = () => {
    if (inputData.careerImages.length === 4) {
      Alert.alert(
        '[안내]',
        '최대 이미지 갯수를 초과했습니다.\n사진 제거 후 다시 시도해주세요.',
        [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
        {cancelable: false}
      );
      return null;
    }

    ImagePicker.showImagePicker(options, async image => {
      const userId = userEmail.split('@')[0];
      if (image.didCancel) {
      } else if (image.error) {
        console.log('ImagePicker Error: ', image.error);
        Alert.alert(
          '[안내]',
          '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
          [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
          {cancelable: false}
        );
      } else {
        const result = await fetch(image.uri);
        const blob = await result.blob();
        let fileName = blob._data.name;
        let extensionName = fileName.split('.')[1];
        let now_timestamp = Math.floor(new Date().getTime() / 1000);
        fileName = `${userId}_${now_timestamp}.${extensionName}`;

        try {
          const storageUrl = await Storage.put(
            {
              key: `profile/${fileName}`,
              object: blob,
              config: {
                contentType: 'image',
              },
            },
            loading => setIsLoading(loading)
          );

          let tmpArr = [...inputData.careerImages];

          tmpArr.push(`${IMAGE_URL}${storageUrl.key}`);

          setInputData({...inputData, careerImages: tmpArr});
        } catch (error) {
          console.log('_onImagePicker -> error', error);
          Alert.alert(
            '[안내]',
            '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
            [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
            {cancelable: false}
          );
        }
      }
    });
  };

  const _onDeleteImagePress = i => {
    Alert.alert(
      '[안내]',
      `${i + 1}번째 사진을 삭제하겠습니까?`,
      [
        {text: '취소', onPress: () => console.log('OK Pressed'), style: 'cancel'},
        {
          text: '삭제',
          onPress: () => {
            let tmpArr = [...inputData.careerImages];

            tmpArr.splice(i, 1);
            setInputData({...inputData, careerImages: tmpArr});
          },
        },
      ],
      {cancelable: false}
    );
  };

  const renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return (
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Input
              label={'이메일'}
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'이메일주소입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
              containerStyle={{paddingHorizontal: 0}}
              maxLength={25}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={text => setInputData({...inputData, userEmail: text})}
              value={inputData.userEmail}
              errorMessage={inputData.emailMessage}
              onBlur={() => {
                if (!_chkEmail(inputData.userEmail)) {
                  setInputData({...inputData, emailMessage: '이메일 형식이 올바르지 않습니다.'});
                }
              }}
              onFocus={() =>
                setInputData({
                  ...inputData,
                  emailMessage: '',
                })
              }
            />
            <Input
              label={'비밀번호'}
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'비밀번호입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{
                borderBottomWidth: 0,
                marginTop: scale(5),
                borderRadius: scale(35),
                backgroundColor: '#e7ebed',
                paddingRight: scale(10),
              }}
              containerStyle={{paddingHorizontal: 0}}
              secureTextEntry={!inputData.showPass}
              rightIcon={{
                name: !inputData.showPass ? 'eye-outline' : 'eye-off-outline',
                type: 'material-community',
                color: '#d4d4d4',
                size: scale(25),
                onPress: () => {
                  setInputData({...inputData, showPass: !inputData.showPass});
                },
              }}
              onChangeText={text => setInputData({...inputData, userPass: text})}
              value={inputData.userPass}
              errorMessage={inputData.passMessage}
              onBlur={() => {
                if (!_chkPwd(inputData.userPass)) {
                  setInputData({
                    ...inputData,
                    passMessage: '비밀번호 형식이 올바르지 않습니다.\n8자 이상의 영문, 숫자, 특수문자 조합',
                  });
                }
              }}
              onFocus={() =>
                setInputData({
                  ...inputData,
                  passMessage: '8자 이상의 영문, 숫자, 특수문자 조합',
                })
              }
            />
          </ScrollView>
        );

      case 'two':
        return (
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Input
              label={'이메일 인증번호'}
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'인증번호입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{
                borderBottomWidth: 0,
                marginTop: scale(5),
                borderRadius: scale(35),
                backgroundColor: '#e7ebed',
                paddingRight: scale(10),
              }}
              containerStyle={{paddingHorizontal: 0}}
              maxLength={6}
              keyboardType="number-pad"
              onChangeText={text => setInputData({...inputData, confirmCode: text})}
              value={inputData.confirmCode}
              errorMessage={inputData.confirmCodeMessage}
              onFocus={() =>
                setInputData({
                  ...inputData,
                  confirmCodeMessage: '',
                })
              }
              onSubmitEditing={() => inputData.confirmCode.length === 6 && _onSignUpProgress()}
            />
          </ScrollView>
        );

      case 'three':
        return (
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Input
              label={
                <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold'}}>
                  이름
                  <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                </Text>
              }
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'이름입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
              containerStyle={{paddingHorizontal: 0}}
              onChangeText={text => setInputData({...inputData, userName: text})}
              value={inputData.userName}
            />
            <Input
              label={
                <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold'}}>
                  핸드폰번호
                  <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                </Text>
              }
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'핸드폰번호입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
              containerStyle={{paddingHorizontal: 0}}
              keyboardType="phone-pad"
              maxLength={11}
              onChangeText={text => setInputData({...inputData, userPhone: text})}
              value={inputData.userPhone}
            />
            {/* <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold', marginBottom: scale(5)}}>
              생년월일
              <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
            </Text>
            <View style={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', marginBottom: scale(20)}}>
              <TouchableOpacity
                style={{
                  ...styles.viewListBoxContainer,
                  borderColor: '#dddddd',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}
                onPress={() => setIsModalBirthOpend(true)}>
                <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getFullYear()}년`}</Text>
                <Icon name="ios-chevron-down" type="ionicon" />
                <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getMonth() + 1}월`}</Text>
                <Icon name="ios-chevron-down" type="ionicon" />
                <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getDate()}일`}</Text>
                <Icon name="ios-chevron-down" type="ionicon" />
              </TouchableOpacity>
            </View> */}
            <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold', marginBottom: scale(5)}}>
              활동경력
            </Text>
            {inputData.careerHistory.map((item, careerIndex) => (
              <View key={`careerHistory_${careerIndex}`} style={{marginBottom: scale(15)}}>
                <View
                  style={{
                    backgroundColor: '#dddddd',
                    paddingVertical: scale(3),
                    paddingHorizontal: scale(5),
                    marginBottom: scale(5),
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text>{`경력 ${careerIndex + 1}`}</Text>
                  {careerIndex !== 0 ? (
                    <TouchableOpacity onPress={() => _onDeleteCareerHistoryPress(careerIndex)}>
                      <Text style={{color: '#e5293e'}}>경력삭제</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInput
                  style={{...styles.inputEdit}}
                  placeholder="활동 및 수상 (예: 영화, 드라마, 수상 등등)"
                  value={item.category}
                  padding={0}
                  onChangeText={text => {
                    let tmpArr = [...inputData.careerHistory];
                    tmpArr[careerIndex].category = text;
                    setInputData({...inputData, careerHistory: tmpArr});
                  }}
                  returnKeyType="done"
                />
                {item.list.map((d, i) => (
                  <View key={`careerHistoryDesc_${i}`}>
                    <View style={{...styles.viewCareerHistoryArea}}>
                      {i !== 0 ? (
                        <TouchableOpacity
                          style={{
                            marginBottom: scale(10),
                            marginRight: scale(10),
                            flex: 0.4,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderRadius: scale(5),
                            borderColor: '#e5293e',
                            alignItems: 'center',
                          }}
                          onPress={() => _onDeleteCareerHistoryPress(careerIndex, i)}>
                          <Text style={{color: '#e5293e'}}>삭제</Text>
                        </TouchableOpacity>
                      ) : null}
                      <TextInput
                        style={{...styles.inputEdit, flex: 1, marginRight: scale(10)}}
                        placeholder="연도"
                        value={d.year}
                        padding={0}
                        onChangeText={text => {
                          let tmpArr = [...inputData.careerHistory];
                          tmpArr[careerIndex].list[i].year = text;
                          setInputData({...inputData, careerHistory: tmpArr});
                        }}
                        returnKeyType="done"
                        keyboardType="number-pad"
                        maxLength={4}
                      />
                      <TextInput
                        style={{...styles.inputEdit, flex: 2}}
                        placeholder="내용"
                        value={d.title}
                        padding={0}
                        onChangeText={text => {
                          let tmpArr = [...inputData.careerHistory];
                          tmpArr[careerIndex].list[i].title = text;
                          setInputData({...inputData, careerHistory: tmpArr});
                        }}
                        returnKeyType="done"
                      />
                    </View>
                    {i === inputData.careerHistory[careerIndex].list.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => {
                          let tmpArr = [...inputData.careerHistory];
                          tmpArr[careerIndex].list.push({year: '', title: ''});
                          setInputData({...inputData, careerHistory: tmpArr});
                        }}
                        style={{marginBottom: scale(15)}}>
                        <Icon name="ios-add-circle-outline" type="ionicon" size={scale(40)} color="#dddddd" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
                {careerIndex === inputData.careerHistory.length - 1 ? (
                  <Button
                    title="경력추가"
                    titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: 'black'}}
                    type="outline"
                    buttonStyle={{borderColor: '#dddddd'}}
                    icon={{name: 'ios-add', type: 'ionicon', color: '#e5293e'}}
                    iconRight={true}
                    onPress={() => {
                      let tmpArr = [...inputData.careerHistory];
                      tmpArr.push({category: '', list: [{year: '', title: ''}]});
                      setInputData({...inputData, careerHistory: tmpArr});
                    }}
                  />
                ) : null}
              </View>
            ))}
            <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold', marginBottom: scale(5)}}>
              활동사진등록
            </Text>
            <View style={{...styles.viewCareerImagesArea}}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#e5e5e5',
                  height: scale(75),
                  width: scale(75),
                  justifyContent: 'center',
                  marginRight: scale(5),
                }}
                onPress={() => _onImagePicker()}>
                <Icon name="add-a-photo" size={scale(25)} color="white" />
                <Text
                  style={{
                    fontSize: scale(12),
                    color: '#979797',
                    position: 'absolute',
                    left: scale(3),
                    bottom: scale(3),
                  }}>{`${inputData.careerImages.length}/4`}</Text>
              </TouchableOpacity>
              <ScrollView
                ref={refScrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                onContentSizeChange={() => refScrollView.current.scrollToEnd()}>
                {inputData.careerImages.map((item, ii) => (
                  <TouchableOpacity key={`actorImage_${ii}`} onLongPress={() => _onDeleteImagePress(ii)}>
                    <FastImage
                      source={{uri: item}}
                      style={{height: scale(75), width: scale(75), marginRight: scale(5)}}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(20)}}>
              <Text style={{color: '#e5293e', fontSize: scale(14)}}>! </Text>
              <Text>작품의 포스터, 촬영현장, 티켓 등 활동을 증명할 수 있는 사진을 업로드해주세요.</Text>
            </Text>
            {/* <Input
              label={'추천인코드'}
              labelStyle={{fontSize: scale(14), color: '#222222'}}
              placeholder={'추천인코드입력'}
              inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
              inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
              containerStyle={{paddingHorizontal: 0}}
              errorMessage={
                <Text style={{fontSize: scale(12), color: '#707070'}}>
                  <Text style={{color: '#e5293e', fontSize: scale(14)}}>! </Text>
                  <Text>
                    자신의 추천인 코드를 입력하면 <Text style={{color: '#e5293e', fontWeight: 'bold'}}>50원</Text> 적립!
                  </Text>
                </Text>
              }
              errorStyle={{marginBottom: scale(15)}}
              onChangeText={text => setInputData({...inputData, recommendCode: text})}
              value={inputData.recommendCode}
            /> */}
          </ScrollView>
        );
    }
  };

  return (
    <KeyboardAvoidingView style={{...styles.container}} behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
        <View style={{...styles.viewInner}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={{...styles.txtLabel}}>Sign Up</Text>
            {index === 2 && (
              <Button
                title="저장"
                type="clear"
                titleStyle={{color: '#e5293e'}}
                disabled={_onCheckType()}
                loading={isLoading}
                loadingProps={{color: '#e5293e'}}
                onPress={() => _onSignUpProgress()}
              />
            )}
          </View>
          <View style={{width: '100%', backgroundColor: '#e7ebed', height: scale(5), marginBottom: scale(25)}}>
            <View style={{backgroundColor: '#e5293e', flex: 1, width: signUpProgress}} />
          </View>
          <TabView
            swipeEnabled={false}
            renderTabBar={() => null}
            navigationState={{index, routes}}
            renderScene={renderTabs}
            onIndexChange={setIndex}
          />
          {index !== 2 && (
            <Button
              title="NEXT"
              titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
              disabled={_onCheckType()}
              buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
              onPress={() => _onSignUpProgress()}
              loading={isLoading}
            />
          )}
        </View>
      </SafeAreaView>
      {/* <Modal
        isVisible={isModalBirthOpend}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsModalBirthOpend(false)}
        onBackButtonPress={() => setIsModalBirthOpend(false)}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
          <DatePicker
            date={inputData.userBirth}
            mode="date"
            style={{width: screenWidth}}
            onDateChange={date => setInputData({...inputData, userBirth: date})}
            maximumDate={new Date()}
          />
        </SafeAreaView>
      </Modal> */}
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    flex: 1,
    paddingHorizontal: scale(25),
    paddingBottom: scale(25),
  },
  txtLabel: {
    fontSize: scale(30),
    fontWeight: 'bold',
    color: '#e5293e',
    marginBottom: scale(10),
  },
  viewFindPassArea: {
    paddingVertical: scale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModalContainer: {
    backgroundColor: 'white',
    borderRadius: scale(5),
    padding: scale(10),
    justifyContent: 'space-between',
  },
  inputEdit: {
    borderRadius: scale(5),
    borderWidth: scale(1),
    borderColor: '#dddddd',
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    marginBottom: scale(15),
    fontSize: scale(14),
  },
  viewCareerHistoryArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCareerImagesArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(5),
  },
});
