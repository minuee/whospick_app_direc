import React, {useContext, useEffect, useState} from 'react';
import {Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {isEmpty, isEmptyArr} from '../../../common/Utils';
import {apiObject} from '../../../common/API';

import {Button, Divider, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import Modal from 'react-native-modal';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

const PassMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {passDirectorAuth} = useContext(UserTokenContext);

  const [dataList, setDataList] = useState([]);

  const [passType, setPassType] = useState(0);
  const [isOpendIndex, setIsOpendIndex] = useState([]);

  const [auditionNo, setAuditionNo] = useState({audition_no: ''});
  const [isOpendAuditionList, setIsOpendAuditionList] = useState(false);
  const [auditionList, setAuditionList] = useState([]);

  const _onChangePassTypePress = type => {
    if (passType === type) {
      return null;
    } else {
      setDataList([]);
    }

    switch (type) {
      case 0:
        setPassType(type);
        break;

      case 1:
        setPassType(type);
        break;

      case 2:
        setPassType(type);
        break;

      case 3:
        setPassType(type);
        break;
    }
  };

  const _onTogglePress = index => {
    let tmpArr = [...isOpendIndex];

    if (tmpArr.indexOf(index) > -1) {
      tmpArr.splice(tmpArr.indexOf(index), 1);
    } else {
      tmpArr.push(index);
    }

    setIsOpendIndex(tmpArr);
  };

  const _getAuditionApplicantList = async () => {
    try {
      const apiResult = await apiObject.getAuditionApplicantList({
        audition_no: auditionNo.audition_no,
        pass_type_no: passType,
      });

      setDataList(apiResult.list);
      setAuditionList([{audition_no: '', title: '??????'}, ...apiResult.audition_list]);
    } catch (error) {
      console.log('_getAuditionApplicantList -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _changePassStatus = async (audition_apply_no, pass_yn) => {
    try {
      await apiObject.changePassStatus({audition_apply_no: audition_apply_no, pass_yn: pass_yn});

      _getAuditionApplicantList();

      Toast.showWithGravity(`${!pass_yn ? '???' : ''}?????? ?????????????????????.`, Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('_getAuditionApplicantList -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _onChangePassStatus = (audition_apply_no, pass_yn) => {
    Alert.alert('[??????]', `?????? ????????? ${!pass_yn ? '???' : ''}?????? ?????????????????????????`, [
      {
        text: '??????',
        style: 'cancel',
      },
      {
        text: `${!pass_yn ? '???' : ''}??????`,
        style: 'destructive',
        onPress: () => {
          _changePassStatus(audition_apply_no, pass_yn);
        },
      },
    ]);
  };

  useEffect(() => {
    passDirectorAuth && _getAuditionApplicantList();
  }, [passType, auditionNo]);

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="#e5293e"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'light-content', animated: true}}
        leftComponent={{
          icon: 'menu',
          size: scale(25),
          color: 'white',
          onPress: () => props.navigation.toggleDrawer(),
        }}
        centerComponent={{text: '???????????????', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={
          passDirectorAuth && {
            icon: 'search',
            size: scale(25),
            color: 'white',
            onPress: () => props.navigation.navigate('Search'),
          }
        }
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {passDirectorAuth ? (
          <ScrollView>
            <View style={{...styles.viewScrollInner}}>
              {auditionList.length !== 1 ? (
                <>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: scale(1),
                      borderRadius: scale(5),
                      borderColor: '#e5293e',
                      padding: scale(10),
                      marginBottom: scale(25),
                    }}
                    onPress={() => setIsOpendAuditionList(true)}>
                    <Text>{isEmpty(auditionNo.audition_no) ? '??????' : auditionNo.title}</Text>
                    <Icon name={'keyboard-arrow-down'} type="material" size={scale(25)} color="#e5293e" />
                  </TouchableOpacity>
                  <View style={{...styles.viewPassTypeArea}}>
                    <Button
                      title="?????????"
                      titleStyle={{
                        fontSize: scale(14),
                        fontWeight: 'bold',
                        color: passType === 0 ? 'white' : '#e5293e',
                      }}
                      buttonStyle={{
                        width: scale(75),
                        height: scale(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: passType === 0 ? '#e5293e' : 'white',
                        borderRadius: scale(25),
                        borderWidth: passType === 0 ? 0 : scale(1),
                        borderColor: passType === 0 ? null : '#e5293e',
                      }}
                      onPress={() => _onChangePassTypePress(0)}
                    />
                    <Button
                      title="1?????????"
                      titleStyle={{
                        fontSize: scale(14),
                        fontWeight: 'bold',
                        color: passType === 1 ? 'white' : '#e5293e',
                      }}
                      buttonStyle={{
                        width: scale(75),
                        height: scale(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: passType === 1 ? '#e5293e' : 'white',
                        borderRadius: scale(25),
                        borderWidth: passType === 1 ? 0 : scale(1),
                        borderColor: passType === 1 ? null : '#e5293e',
                      }}
                      onPress={() => _onChangePassTypePress(1)}
                    />
                    <Button
                      title="2?????????"
                      titleStyle={{
                        fontSize: scale(14),
                        fontWeight: 'bold',
                        color: passType === 2 ? 'white' : '#e5293e',
                      }}
                      buttonStyle={{
                        width: scale(75),
                        height: scale(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: passType === 2 ? '#e5293e' : 'white',
                        borderRadius: scale(25),
                        borderWidth: passType === 2 ? 0 : scale(1),
                        borderColor: passType === 2 ? null : '#e5293e',
                      }}
                      onPress={() => _onChangePassTypePress(2)}
                    />
                    <Button
                      title="3?????????"
                      titleStyle={{
                        fontSize: scale(14),
                        fontWeight: 'bold',
                        color: passType === 3 ? 'white' : '#e5293e',
                      }}
                      buttonStyle={{
                        width: scale(75),
                        height: scale(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: passType === 3 ? '#e5293e' : 'white',
                        borderRadius: scale(25),
                        borderWidth: passType === 3 ? 0 : scale(1),
                        borderColor: passType === 3 ? null : '#e5293e',
                      }}
                      onPress={() => _onChangePassTypePress(3)}
                    />
                  </View>
                  <View
                    style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginVertical: scale(15)}}
                  />
                </>
              ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>
                    ????????? ????????? ????????? ????????? :(
                  </Text>
                  <Text style={{fontSize: scale(16), marginBottom: scale(20)}}>????????? ????????? ???????????????????</Text>
                  <TouchableOpacity
                    style={{
                      borderRadius: scale(5),
                      backgroundColor: '#e5293e',
                      paddingVertical: scale(5),
                      paddingHorizontal: scale(12),
                    }}
                    onPress={() => props.navigation.navigate('AuditionAdd', {isEdit: false})}>
                    <Text style={{color: 'white', fontSize: scale(16)}}>???????????? ????????? ???????????? ?????? ????????????!</Text>
                  </TouchableOpacity>
                </View>
              )}
              {dataList.map((item, index) => (
                <View style={{...styles.viewRolesArea}} key={`roles_${index}`}>
                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
                    onPress={() => _onTogglePress(`roles_${index}`)}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontSize: scale(16), fontWeight: 'bold', color: '#e5293e'}}>{item.role_name}</Text>
                      <Text style={{fontSize: scale(12), marginHorizontal: scale(5)}}>{`${
                        passType === 0 ? '??????' : `${passType}??? ??????`
                      }??????`}</Text>
                      <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`${item.item.length}???`}</Text>
                    </View>
                    <Icon
                      name={isOpendIndex.includes(`roles_${index}`) ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      color="#707070"
                      size={scale(25)}
                    />
                  </TouchableOpacity>
                  {isOpendIndex.includes(`roles_${index}`) ? (
                    <View style={{marginTop: scale(15)}}>
                      {item.item.map((d, i) => (
                        <TouchableOpacity
                          key={`actorList_${index}${i}`}
                          style={{...styles.viewUpActorArea}}
                          activeOpacity={1}
                          onPress={() => props.navigation.navigate('ActorDetail', {actor_no: d.actor_no})}>
                          <FastImage
                            source={{uri: d.profile_image}}
                            style={{...styles.imgUpActor}}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                          <View style={{...styles.viewUpActorInfo}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{`${d.name}  `}</Text>
                              <Text
                                style={{
                                  ...styles.txtActorPrivate,
                                  fontSize: scale(12),
                                }}>{`${d.age}???     ${d.height}cm/${d.weight}kg`}</Text>
                            </View>
                            <Text style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                              {item.role_name} ???
                            </Text>
                            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
                            <View style={{...styles.viewActorTagArea}}>
                              <Text
                                style={{
                                  ...styles.txtActorPrivate,
                                  color: '#e5293e',
                                  fontSize: scale(12),
                                  textDecorationLine: 'underline',
                                }}>
                                {d.mobile_no}
                              </Text>
                              {passType !== 3 && (
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <TouchableOpacity
                                    style={{
                                      borderRadius: scale(5),
                                      backgroundColor: '#999999',
                                      paddingVertical: scale(2),
                                      paddingHorizontal: scale(5),
                                      marginRight: scale(5),
                                    }}
                                    onPress={() => _onChangePassStatus(d.audition_apply_no, false)}>
                                    <Text style={{color: 'white'}}>?????????</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={{
                                      borderRadius: scale(5),
                                      backgroundColor: '#e5293e',
                                      paddingVertical: scale(2),
                                      paddingHorizontal: scale(5),
                                    }}
                                    onPress={() => _onChangePassStatus(d.audition_apply_no, true)}>
                                    <Text style={{color: 'white'}}>??????</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                  <View
                    style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginVertical: scale(15)}}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{textAlign: 'center', fontSize: scale(16)}}>
              {'?????? ????????? ??????????????????!\n????????? ????????? ??? ?????? ????????? ??????????????????!'}
            </Text>
          </View>
        )}
      </SafeAreaView>
      <Modal
        isVisible={isOpendAuditionList}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpendAuditionList(false)}
        onBackButtonPress={() => setIsOpendAuditionList(false)}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView>
            {auditionList.map((item, index) => (
              <View key={`audition_${index}`}>
                <TouchableOpacity
                  style={{paddingVertical: scale(10)}}
                  onPress={() => {
                    setAuditionNo(item);
                    setIsOpendAuditionList(false);
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: scale(20),
                      color: item.audition_no === auditionNo.audition_no ? '#e5293e' : 'black',
                    }}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
                <Divider style={{width: '80%', alignSelf: 'center'}} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default PassMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewScrollInner: {
    padding: scale(15),
  },
  viewPassTypeArea: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
  },
  viewUpActorArea: {
    ...Platform.select({
      ios: {
        shadowColor: '#ddd',
        shadowOffset: {
          width: scale(2),
          height: scale(2),
        },
        shadowRadius: scale(2),
        shadowOpacity: 1,
      },
      android: {
        elevation: scale(2),
      },
    }),
    marginBottom: scale(20),
    flexDirection: 'row',
    flex: 1,
    borderRadius: scale(5),
    backgroundColor: 'white',
  },
  imgUpActor: {
    flex: 1,
    height: scale(100),
    borderTopLeftRadius: scale(5),
    borderBottomLeftRadius: scale(5),
  },
  viewUpActorInfo: {
    flex: 2,
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
  },
  viewActorTagArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewActorPrivate: {
    flexDirection: 'row',
  },
  txtActorPrivate: {
    fontSize: scale(10),
    color: '#e5293e',
  },
});
