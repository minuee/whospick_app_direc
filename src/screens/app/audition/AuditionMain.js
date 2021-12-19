import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';

import {Header, Icon} from 'react-native-elements';
import {Tab, Tabs} from 'native-base';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';
import {isEmptyArr, YYYYMMDD} from '../../../common/Utils';
import {useFocusEffect} from '@react-navigation/native';

const AuditionMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {passDirectorAuth} = useContext(UserTokenContext);

  const [dataList, setDataList] = useState({live: [], closed: [], archive: []});

  const _closeAudition = async audition_no => {
    try {
      await apiObject.closeAudition({audition_no: audition_no});

      Toast.showWithGravity(
        "오디션을 마감했습니다.\n마감된 공고는 '마감공고'에서 확인할 수 있습니다.",
        Toast.SHORT,
        Toast.CENTER
      );
    } catch (error) {
      console.log('_closeAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _saveAudition = async audition_no => {
    try {
      await apiObject.saveAudition({audition_no: audition_no});

      Toast.showWithGravity("오디션을 보관했습니다.\n'보관함'에서 확인하세요.", Toast.SHORT, Toast.CENTER);
    } catch (error) {
      console.log('_saveAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteAudition = async audition_no => {
    try {
      await apiObject.deleteAudition({audition_no: audition_no});
    } catch (error) {
      console.log('_saveAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onClosePress = audition_no => {
    Alert.alert('[안내]', '해당 오디션 공고를 마감하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '마감',
        onPress: () => {
          // 마감 API
          _closeAudition(audition_no);
          setTimeout(() => {
            _getMyAuditionList();
          }, 500);
        },
      },
    ]);
  };

  const _onDeletePress = audition_no => {
    Alert.alert('[안내]', '해당 오디션 공고를 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          // 삭제 API
          _deleteAudition(audition_no);
          setTimeout(() => {
            _getMyAuditionList();
          }, 500);
        },
      },
    ]);
  };

  const _onSavePress = audition_no => {
    Alert.alert('[안내]', '해당 오디션 공고를 보관하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '보관',
        onPress: () => {
          _saveAudition(audition_no);
          setTimeout(() => {
            _getMyAuditionList();
          }, 500);
        },
      },
    ]);
  };

  const _renderAuditionList = ({item, index}) => (
    <TouchableOpacity
      style={{...styles.viewAuditionCard}}
      onPress={() =>
        props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})
      }>
      <View style={{paddingHorizontal: scale(10)}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
          <Text style={{fontSize: scale(10), color: '#bababa'}}>{YYYYMMDD(item.reg_dt)}</Text>
        </View>
        <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          {/* {item.audition_status === 0 && (
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#999999',
                paddingVertical: scale(2),
                paddingHorizontal: scale(8),
                marginRight: scale(5),
              }}
              onPress={() => _onClosePress(item.audition_no)}>
              <Text style={{color: 'white'}}>마감</Text>
            </TouchableOpacity>
          )} */}
          {(item.audition_status === 1 || item.audition_status === 2) && (
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#999999',
                paddingVertical: scale(2),
                paddingHorizontal: scale(8),
                marginRight: scale(5),
              }}
              onPress={() => _onDeletePress(item.audition_no)}>
              <Text style={{color: 'white'}}>삭제</Text>
            </TouchableOpacity>
          )}
          {(item.audition_status === 0 || item.audition_status === 1) && (
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#ff5e00',
                paddingVertical: scale(2),
                paddingHorizontal: scale(8),
                marginRight: scale(5),
              }}
              onPress={() => _onSavePress(item.audition_no)}>
              <Text style={{color: 'white'}}>보관</Text>
            </TouchableOpacity>
          )}
          {item.audition_status === 0 && (
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#e5293e',
                paddingVertical: scale(2),
                paddingHorizontal: scale(8),
              }}
              onPress={() => props.navigation.navigate('AuditionAdd', {isEdit: true, audition_no: item.audition_no})}>
              <Text style={{color: 'white'}}>수정</Text>
            </TouchableOpacity>
          )}
          {item.audition_status === 2 && (
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#e5293e',
                paddingVertical: scale(2),
                paddingHorizontal: scale(8),
              }}
              onPress={() => {
                if (dataList.audition_count >= 5) {
                  Alert.alert('[안내]', '오디션은 최대 5개까지 등록 가능합니다.', [
                    {
                      text: '확인',
                      style: 'cancel',
                    },
                  ]);
                } else {
                  props.navigation.navigate('AuditionAdd', {reAdd: true, audition_no: item.audition_no});
                }
              }}>
              <Text style={{color: 'white'}}>재등록</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const _getMyAuditionList = async () => {
    try {
      const apiResult = await apiObject.getMyAuditionList(loading => setIsLoading(loading));

      setDataList(apiResult);
    } catch (error) {
      console.log('_getMyAuditionList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useFocusEffect(
    useCallback(() => {
      passDirectorAuth && _getMyAuditionList();
    }, [])
  );

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
        centerComponent={{text: '오디션공고', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={
          passDirectorAuth && {
            icon: 'ios-add',
            type: 'ionicon',
            size: scale(25),
            color: 'white',
            onPress: () => {
              if (dataList.audition_count >= 5) {
                Alert.alert('[안내]', '오디션은 최대 5개까지 등록 가능합니다.', [
                  {
                    text: '확인',
                    style: 'cancel',
                  },
                ]);
              } else {
                props.navigation.navigate('AuditionAdd', {isEdit: false});
              }
            },
          }
        }
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {passDirectorAuth ? (
          <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}}>
            <Tab
              heading="진행공고"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <View style={{...styles.viewAuditionArea, flexDirection: 'column', alignItems: 'baseline'}}>
                <Text style={{...styles.txtLabel}}>진행중인 오디션공고</Text>
                <Text style={{fontSize: scale(10)}}>
                  <Text style={{color: '#e5293e', fontSize: scale(12)}}>! </Text>공고는 최대 5개까지 등록가능합니다.
                </Text>
              </View>
              {isEmptyArr(dataList.live) && (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>
                    진행중인 오디션 공고가 없어요 :(
                  </Text>
                  <Text style={{fontSize: scale(16), marginBottom: scale(20)}}>오디션 공고를 등록해볼까요?</Text>
                  <TouchableOpacity
                    style={{
                      borderRadius: scale(5),
                      backgroundColor: '#e5293e',
                      paddingVertical: scale(5),
                      paddingHorizontal: scale(12),
                    }}
                    onPress={() => props.navigation.navigate('AuditionAdd', {isEdit: false})}>
                    <Text style={{color: 'white', fontSize: scale(16)}}>다재다능 배우를 찾기위한 공고 등록하기!</Text>
                  </TouchableOpacity>
                </View>
              )}
              <FlatList
                keyExtractor={item => `auditionCard_${item.audition_no}`}
                data={dataList.live}
                renderItem={_renderAuditionList}
                refreshing={isLoading}
                onRefresh={() => _getMyAuditionList()}
                style={{marginTop: scale(5)}}
                contentContainerStyle={{padding: scale(15)}}
              />
            </Tab>
            <Tab
              heading="마감공고"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <View style={{...styles.viewAuditionArea, flexDirection: 'column', alignItems: 'baseline'}}>
                <Text style={{...styles.txtLabel}}>마감된 오디션공고</Text>
                <Text style={{fontSize: scale(10)}}>
                  <Text style={{color: '#e5293e', fontSize: scale(12)}}>! </Text>마감된 공고는 30일 후 자동삭제됩니다.
                </Text>
              </View>
              <FlatList
                keyExtractor={item => `auditionCard_${item.audition_no}`}
                data={dataList.closed}
                renderItem={_renderAuditionList}
                refreshing={isLoading}
                onRefresh={() => _getMyAuditionList()}
                style={{marginTop: scale(5)}}
                contentContainerStyle={{padding: scale(15)}}
              />
            </Tab>
            <Tab
              heading="보관함"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <View style={{...styles.viewAuditionArea}}>
                <Text style={{...styles.txtLabel}}>보관된 오디션공고</Text>
              </View>
              <FlatList
                keyExtractor={item => `auditionCard_${item.audition_no}`}
                data={dataList.archive}
                renderItem={_renderAuditionList}
                refreshing={isLoading}
                onRefresh={() => _getMyAuditionList()}
                style={{marginTop: scale(5)}}
                contentContainerStyle={{padding: scale(15)}}
              />
            </Tab>
          </Tabs>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{textAlign: 'center', fontSize: scale(16)}}>
              {'감독 심사가 진행중이네요!\n심사가 통과할 때 까지 조금만 기다려주세요!'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default AuditionMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewAuditionCard: {
    paddingVertical: scale(10),
    backgroundColor: 'white',
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
    marginBottom: scale(15),
    borderRadius: scale(5),
  },
  txtAuditionTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  txtAuditionSub: {
    fontSize: scale(11),
    color: '#666666',
  },
  viewAuditionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(15),
    paddingBottom: 0,
  },
  txtLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#e5293e',
  },
});
