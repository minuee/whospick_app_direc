import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';

import {Header} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import {Tab, Tabs} from 'native-base';

import LoadingContext from '../../../Context/LoadingContext';
import {isEmptyArr} from '../../../common/Utils';

const ActorReview = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const [dataList, setDataList] = useState({list: []});

  const _getReviewActorList = async bool => {
    if (dataList.has_next === false && !bool) {
      return null;
    }
    try {
      const apiResult = await apiObject.getReviewActorList(
        {
          next_token: bool ? null : dataList.next_token,
        },
        loading => setIsLoading(loading)
      );

      if (bool) {
        setDataList(apiResult);
      } else {
        setDataList({
          list: [...dataList.list, ...apiResult.list],
          has_next: apiResult.has_next,
          next_token: apiResult.next_token,
        });
      }
    } catch (error) {
      console.log('_getReviewActorList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getReviewActorList(true);
  }, []);

  const _renderActorList = ({item, index}) =>
    !item.eval_yn && (
      <TouchableOpacity
        style={{...styles.viewUpActorArea}}
        activeOpacity={1}
        onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}>
        <FastImage
          source={{uri: item.image_url}}
          style={{...styles.imgUpActor}}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={{...styles.viewUpActorInfo}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
            <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#e5293e',
                paddingVertical: scale(2),
                paddingHorizontal: scale(5),
              }}
              onPress={() => props.navigation.navigate('ActorReviewDetail', {actorInfo: item})}>
              <Text style={{color: 'white'}}>평가남기기</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              ...styles.txtActorPrivate,
              fontSize: scale(12),
              flex: 1,
            }}>{`${item.age}세     ${item.height}cm/${item.weight}kg`}</Text>
          <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
            {item.keyword.map((d, i) => (
              <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );

  const _renderActorListEnd = ({item, index}) =>
    item.eval_yn && (
      <TouchableOpacity
        style={{...styles.viewUpActorArea}}
        activeOpacity={1}
        onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}>
        <FastImage
          source={{uri: item.image_url}}
          style={{...styles.imgUpActor}}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={{...styles.viewUpActorInfo}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
            <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: 'black',
                paddingVertical: scale(2),
                paddingHorizontal: scale(5),
              }}
              onPress={() => props.navigation.navigate('ProfileReviewDetail', {eval_apply_no: item.eval_apply_no})}>
              <Text style={{color: 'white'}}>평가보기</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              ...styles.txtActorPrivate,
              fontSize: scale(12),
              flex: 1,
            }}>{`${item.age}세     ${item.height}cm/${item.weight}kg`}</Text>
          <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
            {item.keyword.map((d, i) => (
              <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );

  return (
    <View style={{...styles.container}}>
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
        centerComponent={{text: '평가요청', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}}>
          <Tab
            heading="평가요청"
            tabStyle={{backgroundColor: 'white'}}
            activeTabStyle={{backgroundColor: 'white'}}
            activeTextStyle={{color: '#e5293e'}}>
            {/* <View style={{...styles.viewScrollInner}}>
              <View style={{...styles.viewAuditionArea, marginBottom: 0}}>
                <Text style={{...styles.txtLabel}}>평가요청한 배우</Text>
              </View>
            </View> */}
            {isEmptyArr(dataList.list) && (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>
                  배우 평가요청이 없어요 :(
                </Text>
              </View>
            )}
            <FlatList
              data={dataList.list}
              renderItem={_renderActorList}
              keyExtractor={(item, index) => `actor_${index}`}
              refreshing={isLoading}
              onRefresh={() => _getReviewActorList(true)}
              onEndReached={() => _getReviewActorList()}
              onEndReachedThreshold={0.1}
              contentContainerStyle={{...styles.viewScrollInner}}
            />
          </Tab>
          <Tab
            heading="평가완료"
            tabStyle={{backgroundColor: 'white'}}
            activeTabStyle={{backgroundColor: 'white'}}
            activeTextStyle={{color: '#e5293e'}}>
            {/* <View style={{...styles.viewScrollInner}}>
              <View style={{...styles.viewAuditionArea, marginBottom: 0}}>
                <Text style={{...styles.txtLabel}}>평가완료한 배우</Text>
              </View>
            </View> */}
            {isEmptyArr(dataList.list) && (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>
                  배우 평가요청이 없어요 :(
                </Text>
              </View>
            )}
            <FlatList
              data={dataList.list}
              renderItem={_renderActorListEnd}
              keyExtractor={(item, index) => `actor_${index}`}
              refreshing={isLoading}
              onRefresh={() => _getReviewActorList(true)}
              onEndReached={() => _getReviewActorList()}
              onEndReachedThreshold={0.1}
              contentContainerStyle={{...styles.viewScrollInner}}
            />
          </Tab>
        </Tabs>
      </SafeAreaView>
    </View>
  );
};

export default ActorReview;

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
  viewAuditionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  txtLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#e5293e',
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
  },
  txtActorPrivate: {
    fontSize: scale(10),
    color: '#e5293e',
  },
});
