import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import scale from '../../../common/Scale';
import {isEmpty, isEmptyArr, screenWidth} from '../../../common/Utils';

import {Button, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {Tab, Tabs} from 'native-base';
import Carousel, {Pagination, ParallaxImage} from 'react-native-snap-carousel';
import Toast from 'react-native-simple-toast';
import {apiObject} from '../../../common/API';
import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

const SLIDER_WIDTH = screenWidth;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.85);

const ActorFavorite = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {passDirectorAuth} = useContext(UserTokenContext);

  const refCarousel = useRef(null);
  const [dataList, setDataList] = useState({list: [], total_count: 0});

  const [tabsIndex, setTabsIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [sexIndex, setSexIndex] = useState(0);

  const _onChangeSexIndex = index => {
    _getLikeActorList(true, index);
    setActiveSlide(0);
    refCarousel.current.snapToItem(0);
    setSexIndex(index);
  };

  const _renderActorList = ({item, index}, parallaxProps) => (
    <TouchableOpacity
      style={{width: ITEM_WIDTH, height: scale(450), marginTop: scale(20)}}
      onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}
      activeOpacity={1}>
      <ParallaxImage
        source={{uri: item.image_url}}
        containerStyle={styles.imageContainer}
        style={styles.image}
        spinnerColor="#e5293e"
        parallaxFactor={0}
        {...parallaxProps}
      />
      <View style={{...styles.viewActorInfo}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
          <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
          <Icon
            name={'favorite'}
            color={'#e5293e'}
            size={scale(15)}
            containerStyle={{
              backgroundColor: 'white',
              borderRadius: scale(50),
              borderWidth: scale(1),
              borderColor: '#e5293e',
              padding: scale(3),
            }}
            onPress={() => _onDeleteFavoritePress(item.actor_no, sexIndex)}
          />
        </View>
        <Text style={{...styles.txtActorDesc, flex: 1}}>{item.introduce}</Text>
        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
        <View style={{...styles.viewActorPrivate}}>
          <View style={{flexDirection: 'row', flex: 0.7, justifyContent: 'space-between'}}>
            <Text style={{...styles.txtActorPrivate}}>{item.age}세</Text>
            <Text style={{...styles.txtActorPrivate}}>{`${item.height}cm/${item.weight}kg`}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
            {item.keyword.map((d, i) => (
              <Text key={i} style={{...styles.txtActorPrivate, color: '#999999'}}>
                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
              </Text>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={{
            borderRadius: scale(5),
            backgroundColor: item.askable ? '#e5293e' : '#dddddd',
            paddingVertical: scale(2),
            paddingHorizontal: scale(5),
            marginTop: scale(10),
          }}
          onPress={() => item.askable && passDirectorAuth && _onAskFavoritePress(item.actor_no, sexIndex)}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            {item.askable
              ? '지원요청'
              : `${item.askable_dt.days}일 ${item.askable_dt.hours}시간 ${item.askable_dt.minutes}분`}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const _renderActorListList = ({item, index}) => (
    <TouchableOpacity
      style={{...styles.viewUpActorArea}}
      activeOpacity={1}
      onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}
      onLongPress={() => _onDeleteFavoritePress(item.actor_no, sexIndex)}>
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
              backgroundColor: item.askable ? '#e5293e' : '#dddddd',
              paddingVertical: scale(2),
              paddingHorizontal: scale(5),
            }}
            onPress={() => item.askable && passDirectorAuth && _onAskFavoritePress(item.actor_no)}>
            <Text style={{color: 'white'}}>
              {item.askable
                ? '지원요청'
                : `${item.askable_dt.days}일 ${item.askable_dt.hours}시간 ${item.askable_dt.minutes}분`}
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            ...styles.txtActorPrivate,
            fontSize: scale(12),
            flex: 1,
          }}>{`${item.age}세     ${item.height}cm/${item.weight}kg`}</Text>
        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
        <View style={{...styles.viewActorTagArea, alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
            {item.keyword.map((d, i) => (
              <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
              </Text>
            ))}
          </View>
          <Icon
            name={'favorite'}
            color={'#e5293e'}
            size={scale(15)}
            containerStyle={{
              backgroundColor: 'white',
              borderRadius: scale(50),
              borderWidth: scale(1),
              borderColor: '#e5293e',
              padding: scale(3),
            }}
            onPress={() => _onDeleteFavoritePress(item.actor_no, sexIndex)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const _deleteFavorite = async (actor_no, gender) => {
    try {
      await apiObject.deleteFavorite({actor_no: actor_no});

      Toast.showWithGravity('삭제되었습니다.', Toast.SHORT, Toast.CENTER);
      _getLikeActorList(true, gender);
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onDeleteFavoritePress = (actor_no, gender) => {
    Alert.alert('[안내]', '찜한배우 목록에서 삭제할까요?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => _deleteFavorite(actor_no, gender),
      },
    ]);
  };

  const _getLikeActorList = async (bool, gender) => {
    if (dataList.has_next === false && !bool) {
      return null;
    }

    try {
      const apiResult = await apiObject.getLikeActorList(
        {
          next_token: bool ? null : dataList.next_token,
          gender: tabsIndex === 0 || isEmpty(gender) || gender === 0 ? null : gender === 1 ? 'M' : 'F',
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
          total_count: apiResult.total_count,
        });
      }
    } catch (error) {
      console.log('_getLikeActorList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _askAudition = async (actor_no, gender) => {
    try {
      const apiResult = await apiObject.askAudition({actor_no: actor_no});

      if (apiResult.have_not_audition) {
        Alert.alert('[안내]', apiResult.error, [
          {
            text: '확인',
            style: 'cancel',
          },
        ]);
      }

      if (gender) {
        _getLikeActorList(true, gender);
      } else {
        _getLikeActorList(true);
      }
    } catch (error) {
      console.log('_askAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _askAuditionAll = async gender => {
    try {
      const apiResult = await apiObject.askAuditionAll();

      if (apiResult.have_not_audition) {
        Alert.alert('[안내]', apiResult.error, [
          {
            text: '확인',
            style: 'cancel',
          },
        ]);
      }

      if (gender) {
        _getLikeActorList(true, gender);
      } else {
        _getLikeActorList(true);
      }
    } catch (error) {
      console.log('_askAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onAskFavoritePress = (actor_no, gender) => {
    Alert.alert('[안내]', '해당 배우에게 오디션 요청을 보낼까요?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '보내기',
        style: 'destructive',
        onPress: () => _askAudition(actor_no, gender),
      },
    ]);
  };

  const _onAskFavoriteAllPress = gender => {
    Alert.alert('[안내]', '찜한배우 모두에게 오디션 요청을 보낼까요?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '보내기',
        style: 'destructive',
        onPress: () => _askAuditionAll(gender),
      },
    ]);
  };

  useEffect(() => {
    if (tabsIndex === 0) {
      _getLikeActorList(true);
    } else {
      _getLikeActorList(true, sexIndex);
      setActiveSlide(0);
      refCarousel.current.snapToItem(0);
    }
  }, [tabsIndex]);

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
        centerComponent={{text: '찜한배우', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {!isEmptyArr(dataList.list) ? (
          <>
            <View style={{...styles.viewScrollInner}}>
              <View style={{...styles.viewAuditionArea, marginBottom: 0}}>
                <Text style={{...styles.txtLabel}}>{`내가 추가한 배우 ${dataList.total_count}명`}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity style={{marginRight: scale(3)}} onPress={() => setTabsIndex(0)}>
                    <Text style={{fontSize: scale(12), color: tabsIndex === 0 ? '#ff5e00' : '#999999'}}>리스트</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{marginLeft: scale(3)}} onPress={() => setTabsIndex(1)}>
                    <Text style={{fontSize: scale(12), color: tabsIndex === 1 ? '#ff5e00' : '#999999'}}>앨범</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Tabs
              page={tabsIndex}
              onChangeTab={index => setTabsIndex(index.i)}
              tabContainerStyle={{height: 0, borderBottomWidth: 0}}
              tabBarUnderlineStyle={{height: 0}}
              tabBarActiveTextColor="transparent"
              tabBarInactiveTextColor="transparent"
              locked={true}>
              <Tab heading="리스트">
                <FlatList
                  data={dataList.list}
                  renderItem={_renderActorListList}
                  keyExtractor={(item, index) => `actor_${index}`}
                  refreshing={isLoading}
                  onRefresh={() => _getLikeActorList(true)}
                  onEndReached={() => _getLikeActorList()}
                  onEndReachedThreshold={0.1}
                  contentContainerStyle={{...styles.viewScrollInner}}
                />
              </Tab>
              <Tab heading="앨범">
                <View
                  style={{
                    ...styles.viewScrollInner,
                    paddingVertical: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                  }}>
                  <Button
                    title="전체보기"
                    titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: sexIndex === 0 ? 'white' : '#e5293e'}}
                    buttonStyle={{
                      width: scale(75),
                      height: scale(40),
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: sexIndex === 0 ? '#e5293e' : 'white',
                      borderRadius: scale(25),
                      borderWidth: sexIndex === 0 ? 0 : scale(1),
                      borderColor: sexIndex === 0 ? null : '#e5293e',
                    }}
                    onPress={() => _onChangeSexIndex(0)}
                  />
                  <Button
                    title="남자"
                    titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: sexIndex === 1 ? 'white' : '#e5293e'}}
                    buttonStyle={{
                      width: scale(75),
                      height: scale(40),
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: sexIndex === 1 ? '#e5293e' : 'white',
                      borderRadius: scale(25),
                      borderWidth: sexIndex === 1 ? 0 : scale(1),
                      borderColor: sexIndex === 1 ? null : '#e5293e',
                    }}
                    onPress={() => _onChangeSexIndex(1)}
                  />
                  <Button
                    title="여자"
                    titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: sexIndex === 2 ? 'white' : '#e5293e'}}
                    buttonStyle={{
                      width: scale(75),
                      height: scale(40),
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: sexIndex === 2 ? '#e5293e' : 'white',
                      borderRadius: scale(25),
                      borderWidth: sexIndex === 2 ? 0 : scale(1),
                      borderColor: sexIndex === 2 ? null : '#e5293e',
                    }}
                    onPress={() => _onChangeSexIndex(2)}
                  />
                </View>
                <ScrollView>
                  <View>
                    <Carousel
                      ref={refCarousel}
                      layout={'default'}
                      data={dataList.list}
                      renderItem={_renderActorList}
                      sliderWidth={SLIDER_WIDTH}
                      itemWidth={ITEM_WIDTH}
                      hasParallaxImages={true}
                      onSnapToItem={index => setActiveSlide(index)}
                      inactiveSlideOpacity={1}
                      onEndReached={() => _getLikeActorList(false, sexIndex)}
                      onEndReachedThreshold={0.1}
                      onRefresh={() => _getLikeActorList(true, sexIndex)}
                      refreshing={isLoading}
                    />
                    {/* <Pagination
                  dotsLength={dataList.list.length}
                  activeDotIndex={activeSlide}
                  dotStyle={{
                    width: scale(15),
                    height: scale(15),
                    borderRadius: scale(10),
                    backgroundColor: 'white',
                    borderWidth: scale(3),
                    borderColor: '#e5293e',
                  }}
                  inactiveDotStyle={{
                    width: scale(10),
                    height: scale(10),
                    borderRadius: scale(10),
                    backgroundColor: '#cccccc',
                    borderWidth: 0,
                  }}
                  inactiveDotScale={1}
                /> */}
                  </View>
                </ScrollView>
              </Tab>
            </Tabs>
            <TouchableOpacity
              style={{position: 'absolute', right: scale(25), bottom: scale(50)}}
              onPress={() => passDirectorAuth && _onAskFavoriteAllPress(tabsIndex === 0 ? null : sexIndex)}>
              <FastImage
                source={require('../../../../assets/images/drawable-xxxhdpi/apply.png')}
                style={{width: scale(50), height: scale(50)}}
              />
            </TouchableOpacity>
          </>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>찜한 배우가 없어요 :(</Text>
            <Text style={{fontSize: scale(16), marginBottom: scale(20), textAlign: 'center'}}>
              {'다재다능한 배우들을 보고\n마음에 드는 배우를 찜해주세요!'}
            </Text>
            <TouchableOpacity
              style={{
                borderRadius: scale(5),
                backgroundColor: '#e5293e',
                paddingVertical: scale(5),
                paddingHorizontal: scale(12),
              }}
              onPress={() => props.navigation.navigate('ActorMain')}>
              <Text style={{color: 'white', fontSize: scale(16)}}>다재다능한 배우 찾으러 가기!</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default ActorFavorite;

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
    justifyContent: 'space-between',
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
  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    borderRadius: scale(15),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  viewActorInfo: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: scale(5),
    paddingHorizontal: scale(15),
    paddingVertical: scale(15),
    bottom: scale(15),
    width: '90%',
    minHeight: '25%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  txtActorName: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#222222',
  },
  txtActorDesc: {
    fontSize: scale(10),
    color: '#222222',
  },
  viewActorPrivate: {
    flexDirection: 'row',
  },
});
