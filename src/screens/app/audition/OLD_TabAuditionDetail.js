import React, {useCallback, useContext, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmpty, isEmptyArr, isIOS, screenWidth, YYYYMMDD} from '../../../common/Utils';
import {apiObject} from '../../../common/API';

import {Button, Divider, Header, Icon, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {Tab, Tabs} from 'native-base';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';
import {useFocusEffect} from '@react-navigation/native';

import LoadingContext from '../../../Context/LoadingContext';

import LoadingIndicator from '../../../Component/LoadingIndicator';

const HEADER_MAX_HEIGHT = scale(400);
const HEADER_MIN_HEIGHT = scale(100);
const IMAGE_MAX_HEIGHT = scale(200);
const IMAGE_MIN_HEIGHT = scale(75);

const TabAuditionDetail = props => {
  const [dataList, setDataList] = useState({
    poster_list: [],
    genre_text_list: [],
    title: '',
    company: '',
    recruit_list_readable: [],
    notice_list: [],
  });

  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [opendIndex, setOpendIndex] = useState(null);
  const [pointerEvents, setPointerEvents] = useState('auto');

  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const animation = useRef(new Animated.ValueXY({x: 0, y: HEADER_MAX_HEIGHT})).current;
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (
        (isScrollEnabled && scrollOffset <= 0 && gestureState.dy > 20) ||
        (!isScrollEnabled && gestureState.dy < -20)
      ) {
        return true;
      } else {
        return false;
      }
    },
    onPanResponderGrant: (evt, gestureState) => {
      animation.extractOffset();
    },
    onPanResponderMove: (evt, gestureState) => {
      animation.setValue({x: 0, y: gestureState.dy});
    },
    onPanResponderRelease: (evt, gestureState) => {
      setPointerEvents('none');
      if (Number(JSON.stringify(animation.y)) < HEADER_MIN_HEIGHT) {
        Animated.spring(animation.y, {
          toValue: 0,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (Number(JSON.stringify(animation.y)) > HEADER_MAX_HEIGHT) {
        Animated.spring(animation.y, {
          toValue: 0,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (gestureState.dy < -20) {
        setIsScrollEnabled(true);
        Animated.spring(animation.y, {
          toValue: -HEADER_MAX_HEIGHT + HEADER_MIN_HEIGHT,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (gestureState.dy > 20) {
        setIsScrollEnabled(false);
        Animated.spring(animation.y, {
          toValue: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      }
    },
  });

  const animatedHeight = {
    transform: animation.getTranslateTransform(),
  };

  const headerY = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageHeight = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [IMAGE_MIN_HEIGHT, IMAGE_MAX_HEIGHT],
    extrapolate: 'clamp',
  });
  const imageTranslateX = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [-screenWidth / 2.8, 0],
    extrapolate: 'clamp',
  });

  const opacityValue = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT + HEADER_MIN_HEIGHT / 2, HEADER_MAX_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const textOpacityValue = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT + HEADER_MIN_HEIGHT / 2, HEADER_MAX_HEIGHT],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const textTranslateX = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [0, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  const _getAuditionInfo = async () => {
    try {
      const apiResult = await apiObject.getAuditionInfo(
        {
          audition_no: props.route.params.audition_no,
        },
        loading => setIsLoading(loading)
      );

      setDataList(apiResult);
    } catch (error) {
      console.log('_getAuditionInfo -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _deleteAuditionNotice = async (audition_notice_no, audition_no) => {
    try {
      await apiObject.deleteAuditionNotice({
        audition_notice_no,
        audition_no,
      });
      setOpendIndex(null);
    } catch (error) {
      console.log('_deleteAuditionNotice -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _onDeleteNoticePress = (audition_notice_no, audition_no) => {
    Alert.alert('[??????]', '?????? ????????? ??????????????? ?????????????????????????', [
      {
        text: '??????',
        style: 'cancel',
      },
      {
        text: '??????',
        style: 'destructive',
        onPress: () => {
          _deleteAuditionNotice(audition_notice_no, audition_no).then(_getAuditionInfo());
        },
      },
    ]);
  };

  const _closeAudition = async audition_no => {
    try {
      await apiObject.closeAudition({audition_no: audition_no});
      Toast.showWithGravity('????????? ????????? ??????????????????.', Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('_closeAudition -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _onClosePress = audition_no => {
    Alert.alert('[??????]', '?????? ????????? ????????? ?????????????????????????', [
      {
        text: '??????',
        style: 'cancel',
      },
      {
        text: '??????',
        onPress: () => {
          // ?????? API
          _closeAudition(audition_no);
        },
      },
    ]);
  };

  const _changeNoticeStatus = async audition_no => {
    try {
      await apiObject.changeNoticeStatus({audition_no: audition_no, public_yn: !dataList.notice_public_yn});

      setDataList({...dataList, notice_public_yn: !dataList.notice_public_yn});

      Toast.showWithGravity('?????? ??????????????? ????????? ??????????????????.', Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('_changeNoticeStatus -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  // const _onChangeStatusPress = audition_no => {
  //   if (!dataList.notice_public_yn) {
  //     Alert.alert('[??????]', '?????? ??????????????? ?????? ?????? ????????? ????????????????', [
  //       {
  //         text: '??????',
  //         style: 'cancel',
  //       },
  //       {
  //         text: '??????',
  //         onPress: () => {
  //           // ?????? API
  //           _changeNoticeStatus(audition_no);
  //         },
  //       },
  //     ]);
  //   } else {
  //     Alert.alert('[??????]', '?????? ??????????????? ?????? ????????? ????????????????', [
  //       {
  //         text: '??????',
  //         style: 'cancel',
  //       },
  //       {
  //         text: '??????',
  //         onPress: () => {
  //           // ?????? API
  //           _changeNoticeStatus(audition_no);
  //         },
  //       },
  //     ]);
  //   }
  // };

  const _saveAudition = async audition_no => {
    try {
      await apiObject.saveAudition({audition_no: audition_no});

      Toast.showWithGravity("???????????? ??????????????????.\n'?????????'?????? ???????????????.", Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('_saveAudition -> error', error);
      Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
    }
  };

  const _onSavePress = audition_no => {
    Alert.alert('[??????]', '?????? ????????? ????????? ?????????????????????????', [
      {
        text: '??????',
        style: 'cancel',
      },
      {
        text: '??????',
        onPress: () => {
          _saveAudition(audition_no);
          _getAuditionInfo();
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      _getAuditionInfo();
    }, [])
  );

  return (
    <View style={{...styles.container}} pointerEvents={pointerEvents}>
      <Header
        backgroundColor="#e5293e"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'light-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(25),
          color: 'white',
          onPress: () => props.navigation.goBack(),
        }}
        centerComponent={{
          text: props.route.params.HEADER,
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <Animated.View
          style={{
            height: headerY,
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: scale(15),
          }}>
          <Animated.View
            style={{
              height: imageHeight,
              width: imageHeight,
              transform: [{translateX: imageTranslateX}],
              // height: IMAGE_MIN_HEIGHT,
              // width: IMAGE_MIN_HEIGHT,
            }}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{flex: 1, width: null, height: null, borderRadius: scale(10)}}
            />
          </Animated.View>
          <Animated.View style={{opacity: opacityValue}}>
            <Text style={{fontSize: scale(20), color: '#e5293e', fontWeight: 'bold'}}>{`[${dataList.company}]`}</Text>
          </Animated.View>
          <Animated.View style={{opacity: opacityValue}}>
            <Text style={{fontSize: scale(20), fontWeight: 'bold', textAlign: 'center'}}>{`${dataList.title}`}</Text>
          </Animated.View>
          {dataList.is_my_audition && dataList.is_closed && (
            <Animated.View style={{opacity: opacityValue}}>
              <Button
                title="?????? ??????"
                titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
                buttonStyle={{
                  backgroundColor: 'white',
                  paddingVertical: scale(5),
                  paddingHorizontal: scale(30),
                  borderRadius: scale(35),
                  borderColor: '#e5293e',
                  borderWidth: scale(1),
                }}
                onPress={() => _onSavePress(props.route.params.audition_no)}
                containerStyle={{alignItems: 'center'}}
              />
            </Animated.View>
          )}
          {dataList.is_my_audition && dataList.is_live && (
            <Animated.View style={{opacity: opacityValue}}>
              {/* <Button
                title="?????? ??????"
                titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
                buttonStyle={{
                  backgroundColor: 'white',
                  paddingVertical: scale(5),
                  paddingHorizontal: scale(30),
                  borderRadius: scale(35),
                  borderColor: '#e5293e',
                  borderWidth: scale(1),
                }}
                onPress={() => _onClosePress(props.route.params.audition_no)}
                containerStyle={{alignItems: 'center'}}
              /> */}
            </Animated.View>
          )}
          {dataList.is_my_audition && dataList.is_archive && (
            <Animated.View style={{opacity: opacityValue}}>
              <Button
                title="?????? ?????????"
                titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
                buttonStyle={{
                  backgroundColor: 'white',
                  paddingVertical: scale(5),
                  paddingHorizontal: scale(30),
                  borderRadius: scale(35),
                  borderColor: '#e5293e',
                  borderWidth: scale(1),
                }}
                onPress={() =>
                  props.navigation.navigate('AuditionAdd', {reAdd: true, audition_no: props.route.params.audition_no})
                }
                containerStyle={{alignItems: 'center'}}
              />
            </Animated.View>
          )}
        </Animated.View>
        <Animated.View
          style={{
            transform: [{translateX: textTranslateX}],
            marginLeft: scale(20) + IMAGE_MIN_HEIGHT,
            position: 'absolute',
            marginTop: scale(15),
            alignItems: 'center',
            flexDirection: 'row',
            paddingRight: scale(10),
            opacity: textOpacityValue,
          }}>
          <View style={{flex: 1, height: IMAGE_MIN_HEIGHT, justifyContent: 'space-evenly'}}>
            <Text style={{fontSize: scale(10), color: '#e5293e', fontWeight: 'bold'}}>{`[${dataList.company}]`}</Text>
            <Text numberOfLines={2}>{dataList.title}</Text>
          </View>
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            animatedHeight,
            // {...StyleSheet.absoluteFill, height: screenHeight - HEADER_MIN_HEIGHT - scale(50) - getBottomSpace()},
            {...StyleSheet.absoluteFill, height: '83%'},
          ]}>
          <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}} locked={true}>
            <Tab
              heading="???????????????"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                <View style={{...styles.viewTabInner}}>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>????????????</Text>
                    <Text style={{...styles.txtInfo}}>
                      {dataList.work_type_detail_text ? dataList.work_type_detail_text : dataList.work_type_text}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>??????</Text>
                    <Text style={{...styles.txtInfo}}>
                      {dataList.genre_text_list.map((item, index) =>
                        index === dataList.genre_text_list.length - 1 ? `${item}` : `${item}, `
                      )}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>?????????</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.company}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>??????</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.director_name}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>?????????</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.manager}</Text>
                  </View>
                  {!isEmpty(dataList.shoot_start) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>????????????</Text>
                      <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.shoot_start)}</Text>
                    </View>
                  )}
                  {!isEmpty(dataList.shoot_end) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>????????????</Text>
                      <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.shoot_end)}</Text>
                    </View>
                  )}
                  {!isEmpty(dataList.shoot_place) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>????????????</Text>
                      <Text style={{...styles.txtInfo}}>{dataList.shoot_place}</Text>
                    </View>
                  )}
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>?????????</Text>
                    <Text style={{...styles.txtInfo}}>
                      {isNaN(Number(dataList.fee)) ? dataList.fee : AddComma(Number(dataList.fee))}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>????????????</Text>
                    <Text
                      style={{
                        ...styles.txtInfo,
                      }}>{`?????? ${dataList.male_count} / ?????? ${dataList.female_count}`}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>???????????????</Text>
                    <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.deadline)}</Text>
                  </View>
                  <View style={{...styles.viewListItem, flexDirection: 'column'}}>
                    <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>???????????????</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.content}</Text>
                  </View>
                  {dataList.is_my_audition && (
                    <Button
                      title="?????????????????????"
                      titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                      buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                      containerStyle={{marginBottom: scale(15)}}
                      onPress={() => props.navigation.navigate('PassStack')}
                    />
                  )}
                </View>
              </ScrollView>
            </Tab>
            <Tab
              heading="????????????"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                <View
                  style={{
                    borderBottomWidth: scale(1),
                    borderColor: '#dddddd',
                    alignItems: 'center',
                    paddingVertical: scale(15),
                  }}>
                  <Text style={{fontSize: scale(13.5), fontWeight: 'bold'}}>
                    ??????????????? : <Text style={{color: '#e5293e'}}>{dataList.recruit_list_readable.length}</Text>
                  </Text>
                </View>
                <View style={{...styles.viewTabInner}}>
                  {dataList.recruit_list_readable.map((item, index) => (
                    <View key={`rolesList_${index}`}>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel, color: '#e5293e'}}>{`???????????? ${index + 1}`}</Text>
                        <Text style={{...styles.txtInfo}} />
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>??????</Text>
                        <Text style={{...styles.txtInfo}}>{item.role_name}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>?????? ??????</Text>
                        <Text style={{...styles.txtInfo}}>{item.role_weight}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>??????</Text>
                        <Text style={{...styles.txtInfo}}>{item.gender === 'M' ? '??????' : '??????'}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>??????</Text>
                        <Text style={{...styles.txtInfo}}>{item.age}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>???</Text>
                        <Text style={{...styles.txtInfo}}>{item.height}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>?????????</Text>
                        <Text style={{...styles.txtInfo}}>{item.weight}</Text>
                      </View>
                      {item.detail_info_list.map((d, i) => (
                        <View style={{...styles.viewListItem}} key={`tag_${i}`}>
                          <Text style={{...styles.txtLabel}}>{d.category}</Text>
                          <Text style={{...styles.txtInfo}}>
                            {d.content.map((dd, ii) => (ii === d.content.length - 1 ? `${dd}` : `${dd}, `))}
                          </Text>
                        </View>
                      ))}
                      <View style={{...styles.viewListItem, flexDirection: 'column'}}>
                        <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>???????????????</Text>
                        <Text style={{...styles.txtInfo}}>{item.introduce}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Tab>
            <Tab
              heading="????????????"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                {dataList.notice_list.map((item, index) => (
                  <ListItem
                    key={`notice_${index}`}
                    bottomDivider={true}
                    onPress={() => setOpendIndex(opendIndex === index ? null : index)}
                    delayPressIn={0}
                    underlayColor={'white'}
                    containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}>
                    <View style={{flexDirection: 'row'}}>
                      {!dataList.notice_public_yn ? (
                        <Icon
                          name="ios-lock-closed"
                          type="ionicon"
                          color="black"
                          size={scale(15)}
                          style={{marginRight: scale(5)}}
                        />
                      ) : (
                        <FastImage
                          source={require('../../../../assets/images/drawable-xxxhdpi/noun_megaphone_2409641.png')}
                          style={{width: scale(15), height: scale(15), marginRight: scale(5)}}
                        />
                      )}
                      <ListItem.Content>
                        <ListItem.Title
                          style={{
                            fontSize: scale(14),
                          }}>{`[${item.audition_notice_level_text}] ${item.title}`}</ListItem.Title>
                        <ListItem.Subtitle style={{fontSize: scale(10), color: '#999999'}}>
                          {YYYYMMDD(item.reg_dt)}
                        </ListItem.Subtitle>
                      </ListItem.Content>
                      <ListItem.Chevron
                        name={opendIndex === index ? 'ios-chevron-up' : 'ios-chevron-down'}
                        type="ionicon"
                        size={scale(25)}
                        color="#e5293e"
                      />
                    </View>
                    {opendIndex === index && (
                      <View
                        style={{
                          paddingTop: opendIndex === index ? scale(20) : null,
                          width: '100%',
                        }}>
                        <Text style={{fontSize: scale(12)}}>{item.content}</Text>
                        {!isEmpty(item.file_url) && (
                          <TouchableOpacity
                            style={{marginTop: scale(10), flexDirection: 'row', alignItems: 'center'}}
                            onPress={async () => {
                              await Linking.openURL(item.file_url);
                            }}>
                            <Text style={{fontSize: scale(12), flex: 1}} numberOfLines={1}>
                              ???????????? : {String(item.file_url).split('/')[String(item.file_url).split('/').length - 1]}
                            </Text>
                            <Icon name="ios-attach" type="ionicon" color="#dddddd" />
                          </TouchableOpacity>
                        )}
                        <Divider style={{marginVertical: scale(10)}} />
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                          }}>
                          <Button
                            title="??????"
                            titleStyle={{fontSize: scale(12), fontWeight: 'bold', color: 'white'}}
                            buttonStyle={{
                              backgroundColor: '#e5293e',
                              paddingVertical: scale(5),
                              borderRadius: scale(35),
                            }}
                            onPress={() =>
                              _onDeleteNoticePress(item.audition_notice_no, props.route.params.audition_no)
                            }
                            containerStyle={{marginRight: scale(15)}}
                          />
                          <Button
                            title="??????"
                            titleStyle={{fontSize: scale(12), fontWeight: 'bold', color: 'white'}}
                            buttonStyle={{
                              backgroundColor: '#e5293e',
                              paddingVertical: scale(5),
                              borderRadius: scale(35),
                            }}
                            onPress={() =>
                              props.navigation.navigate('NoticeWrite', {
                                isEdit: true,
                                audition_no: props.route.params.audition_no,
                                info: item,
                              })
                            }
                          />
                        </View>
                      </View>
                    )}
                  </ListItem>
                ))}
              </ScrollView>
              {dataList.is_my_audition && (
                <Button
                  title="????????????"
                  titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: 'white'}}
                  buttonStyle={{
                    backgroundColor: '#e5293e',
                    paddingVertical: scale(10),
                    borderRadius: scale(35),
                  }}
                  onPress={() =>
                    props.navigation.navigate('NoticeWrite', {audition_no: props.route.params.audition_no})
                  }
                  containerStyle={{
                    padding: scale(15),
                    paddingBottom: isIOS() ? 0 : scale(15),
                  }}
                />
              )}
            </Tab>
          </Tabs>
        </Animated.View>
      </SafeAreaView>
      {isLoading && <LoadingIndicator />}
    </View>
  );
};

export default TabAuditionDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewListItem: {
    flexDirection: 'row',
    paddingVertical: scale(15),
  },
  viewTabInner: {
    padding: scale(15),
  },
  txtLabel: {
    flex: 1,
    fontSize: scale(13.5),
    fontWeight: 'bold',
  },
  txtInfo: {
    flex: 1,
    fontSize: scale(13.5),
    color: '#707070',
  },
});
