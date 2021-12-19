import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  RefreshControl,
  Platform,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

import scale from '../../../common/Scale';
import {isCloseToBottom, isEmpty, screenWidth} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';
import {apiObject} from '../../../common/API';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';

const SLIDER_WIDTH = screenWidth;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.85);
const HEADER_HEIGHT = scale(200);

const ActorMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {passDirectorAuth} = useContext(UserTokenContext);

  const [actorOfMonth, setActorOfMonth] = useState({list: []});
  const [actorList, setActorList] = useState({list: []});
  const [searchList, setSearchList] = useState({list: []});

  const [isViewTypeFilter, setIsViewTypeFilter] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);

  const _addFavorite = async (actor_no, bool, index) => {
    try {
      await apiObject.addFavorite({
        actor_no: actor_no,
      });

      if (bool) {
        let tmpArr = [...actorOfMonth.list];

        tmpArr[index].dibs_yn = true;

        setActorOfMonth({...actorOfMonth, list: tmpArr});
      } else {
        let tmpArr = [...actorList.list];

        tmpArr[index].dibs_yn = true;

        setActorList({...actorList, list: tmpArr});
      }
    } catch (error) {
      console.log('_addFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteFavorite = async (actor_no, bool, index) => {
    try {
      await apiObject.deleteFavorite({
        actor_no: actor_no,
      });

      if (bool) {
        let tmpArr = [...actorOfMonth.list];

        tmpArr[index].dibs_yn = false;

        setActorOfMonth({...actorOfMonth, list: tmpArr});
      } else {
        let tmpArr = [...actorList.list];

        tmpArr[index].dibs_yn = false;

        setActorList({...actorList, list: tmpArr});
      }
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
          <Icon
            name={item.dibs_yn ? 'favorite' : 'favorite-border'}
            color={item.dibs_yn ? '#e5293e' : '#999999'}
            size={scale(15)}
            containerStyle={{
              backgroundColor: 'white',
              borderRadius: scale(50),
              borderWidth: scale(1),
              borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',
              padding: scale(3),
            }}
            onPress={() => {
              if (item.dibs_yn) {
                _deleteFavorite(item.actor_no, true, index);
              } else {
                _addFavorite(item.actor_no, true, index);
              }
            }}
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
      </View>
    </TouchableOpacity>
  );

  const _renderSearchActorList = ({item, index}) => (
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
          <Icon
            name={item.dibs_yn ? 'favorite' : 'favorite-border'}
            color={item.dibs_yn ? '#e5293e' : '#999999'}
            size={scale(15)}
            containerStyle={{
              backgroundColor: 'white',
              borderRadius: scale(50),
              borderWidth: scale(1),
              borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',
              padding: scale(3),
            }}
            onPress={() => {
              if (item.dibs_yn) {
                _deleteFavorite(item.actor_no, false, index);
              } else {
                _addFavorite(item.actor_no, false, index);
              }
            }}
          />
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

  const _getActorOfMonthList = async () => {
    try {
      const apiResult = await apiObject.getActorOfMonthList(loading => setIsLoading(loading));

      setActorOfMonth(apiResult);
    } catch (error) {
      console.log('_getActorOfMonthList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _getRealTimeActorList = async bool => {
    if (actorList.has_next === false && !bool) {
      return null;
    }
    try {
      const apiResult = await apiObject.getRealTimeActorList(
        {
          next_token: bool ? null : actorList.next_token,
        },
        loading => setIsLoading(loading)
      );

      if (bool) {
        setActorList(apiResult);
      } else {
        setActorList({
          list: [...actorList.list, ...apiResult.list],
          has_next: apiResult.has_next,
          next_token: apiResult.next_token,
        });
      }
    } catch (error) {
      console.log('_getRealTimeActorList -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _searchActor = async bool => {
    if (searchList.has_next === false && !bool) {
      return null;
    }
    try {
      const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Director');
      const isSettingFilterParse = JSON.parse(isSettingFilter);

      const apiResult = await apiObject.searchActor(
        {
          next_token: bool ? null : searchList.next_token,
          gender: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.sex : null,
          age_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.min : null,
          age_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.max : null,
          height_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.min : null,
          height_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.max : null,
          detail_info_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.detail_info_list : null,
        },
        loading => setIsLoading(loading)
      );

      if (bool) {
        setSearchList(apiResult);
      } else {
        setSearchList({
          list: [...searchList.list, ...apiResult.list],
          has_next: apiResult.has_next,
          next_token: apiResult.next_token,
        });
      }

      setIsViewTypeFilter(true);
    } catch (error) {
      console.log('_searchActor -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getActorOfMonthList();
    _getRealTimeActorList(true);
  }, []);

  const _isSettingFilter = async () => {
    const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Director');
    const isSettingFilterParse = JSON.parse(isSettingFilter);

    if (isSettingFilterParse) {
      _searchActor(true);
      // setIsViewTypeFilter(true);
    } else {
      setIsViewTypeFilter(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      _isSettingFilter();
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
        centerComponent={{text: '배우검색', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={
          passDirectorAuth && (
            <>
              <Icon name="search" size={scale(25)} color="white" onPress={() => props.navigation.navigate('Search')} />
              <Icon
                name="sliders"
                type="font-awesome"
                size={scale(25)}
                color="white"
                onPress={() => props.navigation.navigate('ActorFilter')}
              />
            </>
          )
        }
        rightContainerStyle={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: scale(5),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {!isViewTypeFilter ? (
          <>
            <View
              style={{backgroundColor: '#e5293e', position: 'absolute', height: HEADER_HEIGHT, width: screenWidth}}
            />
            <ScrollView
              bounces={true}
              showsVerticalScrollIndicator={false}
              onScroll={({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent)) {
                  _getRealTimeActorList();
                }
              }}
              scrollEventThrottle={400}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => {
                    _getActorOfMonthList();
                    _getRealTimeActorList(true);
                  }}
                  tintColor="white"
                />
              }>
              <View>
                <Carousel
                  layout={'default'}
                  data={actorOfMonth.list}
                  renderItem={_renderActorList}
                  sliderWidth={SLIDER_WIDTH}
                  itemWidth={ITEM_WIDTH}
                  hasParallaxImages={true}
                  onSnapToItem={index => setActiveSlide(index)}
                  inactiveSlideOpacity={1}
                />
                <Pagination
                  dotsLength={actorOfMonth.list.length}
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
                />
              </View>
              <View style={{...styles.viewScrollInner}}>
                <View style={{...styles.viewAuditionArea, marginTop: actorOfMonth.list.length <= 1 ? scale(15) : 0}}>
                  <Text style={{...styles.txtLabel}}>전체 배우</Text>
                </View>
                {actorList.list.map((item, index) => (
                  <TouchableOpacity
                    key={`upActor_${index}`}
                    style={{...styles.viewUpActorArea}}
                    activeOpacity={1}
                    onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}>
                    <FastImage
                      source={{uri: item.image_url}}
                      style={{...styles.imgUpActor}}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={{...styles.viewUpActorInfo}}>
                      <View
                        style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}>
                        <Text style={{...styles.txtActorName, fontSize: scale(15)}}>{item.name}</Text>
                        <Icon
                          name={item.dibs_yn ? 'favorite' : 'favorite-border'}
                          color={item.dibs_yn ? '#e5293e' : '#999999'}
                          size={scale(15)}
                          containerStyle={{
                            backgroundColor: 'white',
                            borderRadius: scale(50),
                            borderWidth: scale(1),
                            borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',
                            padding: scale(3),
                          }}
                          onPress={() => {
                            if (item.dibs_yn) {
                              _deleteFavorite(item.actor_no, false, index);
                            } else {
                              _addFavorite(item.actor_no, false, index);
                            }
                          }}
                        />
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
                ))}
              </View>
            </ScrollView>
          </>
        ) : (
          <>
            <View style={{backgroundColor: '#e5293e', position: 'absolute', height: scale(100), width: screenWidth}} />
            <View style={{...styles.viewScrollInner, paddingVertical: scale(20), backgroundColor: 'transparent'}}>
              <Text
                style={{
                  fontSize: scale(16),
                  color: 'white',
                  fontWeight: 'bold',
                }}>{`${searchList.list.length}명 검색`}</Text>
            </View>
            <FlatList
              data={searchList.list}
              renderItem={_renderSearchActorList}
              keyExtractor={(item, index) => `actor_${index}`}
              refreshing={isLoading}
              onRefresh={() => _searchActor(true)}
              onEndReached={() => _searchActor()}
              onEndReachedThreshold={0.1}
              contentContainerStyle={{...styles.viewScrollInner, backgroundColor: 'transparent'}}
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

export default ActorMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
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
    height: '25%',
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
  txtActorPrivate: {
    fontSize: scale(10),
    color: '#e5293e',
  },
  viewScrollInner: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
    backgroundColor: 'white',
  },
  viewAuditionArea: {
    marginBottom: scale(20),
  },
  txtLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#e5293e',
  },
  txtViewMore: {
    fontSize: scale(10),
    color: '#ababab',
  },
  viewPopActorArea: {
    marginRight: scale(12),
    alignItems: 'center',
  },
  imgPopActor: {
    backgroundColor: 'white',
    width: scale(140),
    height: scale(140),
    borderRadius: scale(12),
    marginBottom: scale(10),
  },
  txtPopActorLabel: {
    fontSize: scale(15),
    marginBottom: scale(5),
  },
  txtPopActorType: {
    fontSize: scale(10),
    color: '#707070',
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
});
