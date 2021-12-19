import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, Text, View, SafeAreaView, Platform, TouchableOpacity, RefreshControl} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import scale from '../../../common/Scale';
import {screenWidth} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';

const data = {
  actorList: [
    {
      todayActor: true,
      actorImage: 'http://placeimg.com/512/512/people',
      actorName: '김배우',
      actorDesc: '남들과 다른 시선으로 연기하는 연기자가 되겠습니다.',
      actorAge: 24,
      actorHeight: 168,
      actorWeight: 48,
      actorTag: ['학생', '귀여움', '청순함', '섹시함'],
    },
    {
      todayActor: false,
      actorImage: 'http://placeimg.com/512/512/people',
      actorName: '남배우',
      actorDesc: '남들과 같은 시선으로 따라하는 연기자가 되겠습니다.',
      actorAge: 26,
      actorHeight: 173,
      actorWeight: 65,
      actorTag: ['학생', '귀여움', '청순함', '섹시함'],
    },
    {
      todayActor: false,
      actorImage: 'http://placeimg.com/512/512/people',
      actorName: '이배우',
      actorDesc: '연기? 껌이죠',
      actorAge: 27,
      actorHeight: 177,
      actorWeight: 73,
      actorTag: ['근육', '귀여움', '청순함', '섹시함'],
    },
    {
      todayActor: false,
      actorImage: 'http://placeimg.com/512/512/people',
      actorName: '요이땅',
      actorDesc: '달려간다 요이땅',
      actorAge: 34,
      actorHeight: 162,
      actorWeight: 45,
      actorTag: ['성숙', '귀여움', '청순함', '섹시함'],
    },
  ],
  popularAudition: [
    {
      dDay: 28,
      uploadReg: '2020-04-28 19:04',
      videoType: '독립영화',
      title: '장편 독립영화 <호이짜라이더>에서 배우를 모집합니다.',
      producer: 'STN',
      roles: '40-50대 대머리 노숙자, 신문사',
      sex: ['남자', '여자'],
      isLike: false,
    },
    {
      dDay: 7,
      uploadReg: '2020-04-28 19:04',
      videoType: '뮤직비디오',
      title: '보조출연 모집 (성별 상관없이 30명)',
      producer: 'Megneta',
      roles: '보조출연',
      sex: ['남자', '여자'],
      isLike: false,
    },
  ],
  deadlineAudition: [
    {
      dDay: 5,
      uploadReg: '2020-04-28 19:04',
      videoType: '독립영화',
      title: '장편 독립영화 <호이짜라이더>에서 배우를 모집합니다.',
      producer: 'STN',
      roles: '40-50대 대머리 노숙자, 신문사',
      sex: ['남자', '여자'],
      isLike: false,
    },
    {
      dDay: 7,
      uploadReg: '2020-04-28 19:04',
      videoType: '뮤직비디오',
      title: '보조출연 모집 (성별 상관없이 30명)',
      producer: 'Megneta',
      roles: '보조출연',
      sex: ['남자', '여자'],
      isLike: false,
    },
  ],
};

const SLIDER_WIDTH = screenWidth;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.85);
const HEADER_HEIGHT = scale(150);

const AppMain = props => {
  const [dataList, setDataList] = useState(data);
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalInvite, setModalInvite] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  // const diffClampScrollY = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerY = Animated.interpolate(scrollY, {
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    // extrapolate: 'clamp',
  });

  useEffect(() => {
    const _isFirstTimeOpen = async () => {
      const isFirstTimeOpen = await AsyncStorage.getItem('@whosPick_WelcomeInvite');
      if (!isFirstTimeOpen) {
        setModalInvite(true);
      }
    };
    _isFirstTimeOpen();
  }, []);

  const _isFirstTimeOpenDone = async () => {
    await AsyncStorage.setItem('@whosPick_WelcomeInvite', 'DONE');
    setModalInvite(false);
  };

  const _onToggleLike = (index, bool) => {
    if (bool) {
      let tmpArr = [...dataList.deadlineAudition];

      tmpArr[index].isLike = !tmpArr[index].isLike;

      setDataList({...dataList, deadlineAudition: tmpArr});
    } else {
      let tmpArr = [...dataList.popularAudition];

      tmpArr[index].isLike = !tmpArr[index].isLike;

      setDataList({...dataList, popularAudition: tmpArr});
    }
  };

  const _renderActorList = ({item, index}, parallaxProps) => (
    <TouchableOpacity
      style={{width: ITEM_WIDTH, height: scale(300), marginTop: scale(20)}}
      onPress={() => props.navigation.navigate('ActorDetail')}
      activeOpacity={1}>
      <ParallaxImage
        source={{uri: item.actorImage}}
        containerStyle={styles.imageContainer}
        style={styles.image}
        spinnerColor="#e5293e"
        parallaxFactor={0}
        {...parallaxProps}
      />
      <View style={{...styles.viewActorInfo}}>
        <Text style={{...styles.txtActorName}}>{item.actorName}</Text>
        <Text style={{...styles.txtActorDesc}}>{item.actorDesc}</Text>
        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
        <View style={{...styles.viewActorPrivate}}>
          <View style={{flexDirection: 'row', flex: 0.7, justifyContent: 'space-between'}}>
            <Text style={{...styles.txtActorPrivate}}>{item.actorAge}세</Text>
            <Text style={{...styles.txtActorPrivate}}>{`${item.actorHeight}cm/${item.actorWeight}kg`}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
            {item.actorTag.map((d, i) => (
              <Text key={i} style={{...styles.txtActorPrivate, color: '#999999'}}>
                {i === item.actorTag.length - 1 ? `${d}` : `${d}, `}
              </Text>
            ))}
          </View>
        </View>
      </View>
      {item.todayActor ? (
        <FastImage
          source={require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')}
          style={{
            width: scale(88),
            height: scale(40),
            position: 'absolute',
            justifyContent: 'center',
            paddingLeft: '10%',
            top: scale(15),
            left: scale(-5),
          }}>
          <Text style={{fontSize: scale(12), color: 'white', fontWeight: 'bold'}}>오늘의 배우</Text>
        </FastImage>
      ) : null}
    </TouchableOpacity>
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
        centerComponent={{text: "Who's Pick?", style: {fontSize: scale(18), color: 'white'}}}
        rightComponent={
          <>
            <Icon name="search" size={scale(25)} color="white" onPress={() => {}} />
            <Icon
              name="sliders"
              type="font-awesome"
              size={scale(25)}
              color="white"
              onPress={() => props.navigation.navigate('ActorFilter')}
            />
          </>
        }
        rightContainerStyle={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: scale(5),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <Animated.View
          style={{backgroundColor: '#e5293e', position: 'absolute', height: headerY, width: screenWidth}}
        />
        <Animated.ScrollView
          bounces={true}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
            useNativeDriver: true,
          })}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor="white" />}
          scrollEventThrottle={16}>
          <View>
            <Carousel
              layout={'default'}
              data={dataList.actorList}
              renderItem={_renderActorList}
              sliderWidth={SLIDER_WIDTH}
              itemWidth={ITEM_WIDTH}
              hasParallaxImages={true}
              onSnapToItem={index => setActiveSlide(index)}
              inactiveSlideOpacity={1}
            />
            <Pagination
              dotsLength={dataList.actorList.length}
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
          <View style={{...styles.viewInner}}>
            <TouchableOpacity style={{...styles.viewInviteArea}} onPress={() => setModalInvite(true)}>
              <Text style={{...styles.txtInviteLabel}}>
                친구초대하고 <Text style={{color: '#e5293e', fontWeight: 'bold'}}>50원</Text>
                <Text style={{fontWeight: 'bold'}}>받기!</Text>
              </Text>
              <FastImage
                source={require('../../../../assets/images/drawable-xxxhdpi/coin.png')}
                style={{width: scale(25), height: scale(25)}}
              />
            </TouchableOpacity>
            <View style={{...styles.viewAuditionArea}}>
              <Text style={{...styles.txtLabel}}>인기 오디션</Text>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('TEST');
                }}>
                <Text style={{...styles.txtViewMore}}>{'View More >'}</Text>
              </TouchableOpacity>
            </View>
            {dataList.popularAudition.map((item, index) => (
              <View style={{...styles.viewAuditionCard}} key={`popAuditionCard_${index}`}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: scale(5),
                    paddingRight: scale(10),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                    <FastImage
                      source={
                        item.dDay <= 7
                          ? require('../../../../assets/images/drawable-xxxhdpi/flag.png')
                          : require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')
                      }
                      style={{
                        width: scale(41),
                        marginRight: scale(5),
                        paddingLeft: scale(4),
                      }}>
                      <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.dDay}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.videoType}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{item.uploadReg}</Text>
                  </View>
                  <Icon
                    name={item.isLike ? 'favorite' : 'favorite-border'}
                    color={item.isLike ? '#e5293e' : '#999999'}
                    size={scale(15)}
                    containerStyle={{
                      backgroundColor: 'white',
                      borderRadius: scale(50),
                      borderWidth: scale(1),
                      borderColor: item.isLike ? '#e5293e' : '#eeeeee',
                      padding: scale(3),
                    }}
                    onPress={() => _onToggleLike(index)}
                  />
                </View>
                <View style={{paddingHorizontal: scale(10)}}>
                  <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                  <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.producer}`}</Text>
                  <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.roles} / ${item.sex.map(
                    d => `${d}`
                  )}`}</Text>
                  <TouchableOpacity
                    style={{
                      borderRadius: scale(5),
                      backgroundColor: '#e5293e',
                      paddingVertical: scale(2),
                      paddingHorizontal: scale(12),
                      alignSelf: 'flex-end',
                    }}
                    onPress={() => {}}>
                    <Text style={{color: 'white'}}>지원하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <View
            style={{
              backgroundColor: 'pink',
              marginBottom: scale(30),
              height: scale(100),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: scale(20), fontWeight: 'bold'}}>여기는 광고입니다.</Text>
          </View>
          <View style={{...styles.viewInner}}>
            <View style={{...styles.viewAuditionArea}}>
              <Text style={{...styles.txtLabel}}>마감임박 오디션</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={{...styles.txtViewMore}}>{'View More >'}</Text>
              </TouchableOpacity>
            </View>
            {dataList.deadlineAudition.map((item, index) => (
              <View style={{...styles.viewAuditionCard}} key={`deadLineAuditionCard_${index}`}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: scale(5),
                    paddingRight: scale(10),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                    <FastImage
                      source={require('../../../../assets/images/drawable-xxxhdpi/flag.png')}
                      style={{
                        width: scale(41),
                        marginRight: scale(5),
                        paddingLeft: scale(4),
                      }}>
                      <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.dDay}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.videoType}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{item.uploadReg}</Text>
                  </View>
                  <Icon
                    name={item.isLike ? 'favorite' : 'favorite-border'}
                    color={item.isLike ? '#e5293e' : '#999999'}
                    size={scale(15)}
                    containerStyle={{
                      backgroundColor: 'white',
                      borderRadius: scale(50),
                      borderWidth: scale(1),
                      borderColor: item.isLike ? '#e5293e' : '#eeeeee',
                      padding: scale(3),
                    }}
                    onPress={() => _onToggleLike(index, true)}
                  />
                </View>
                <View style={{paddingHorizontal: scale(10)}}>
                  <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                  <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.producer}`}</Text>
                  <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.roles} / ${item.sex.map(
                    d => `${d}`
                  )}`}</Text>
                  <TouchableOpacity
                    style={{
                      borderRadius: scale(5),
                      backgroundColor: '#e5293e',
                      paddingVertical: scale(2),
                      paddingHorizontal: scale(12),
                      alignSelf: 'flex-end',
                    }}
                    onPress={() => {}}>
                    <Text style={{color: 'white'}}>지원하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
      <Modal
        isVisible={modalInvite}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        statusBarTranslucent={true}
        avoidKeyboard={true}>
        <View style={{...styles.viewModalContainer}}>
          <Icon
            name={'close'}
            size={scale(25)}
            color="#707070"
            containerStyle={{alignItems: 'flex-end'}}
            onPress={() => _isFirstTimeOpenDone()}
          />
          <FastImage
            source={require('../../../../assets/images/drawable-xxxhdpi/coin.png')}
            style={{height: 40, marginVertical: scale(15)}}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={{...styles.txtModalLabel}}>친구초대하고 50원 받기!</Text>
          <Text style={{...styles.txtModalSubLabel, marginTop: scale(10)}}>친구가 내 추천인코드로 가입하면</Text>
          <Text style={{...styles.txtModalSubLabel, marginBottom: scale(10)}}>50원을 받을 수 있습니다!</Text>
          <View style={{...styles.viewModalCodeArea}}>
            <Text style={{...styles.txtModalCodeLabel}}>내 추천인 코드</Text>
            <Text style={{...styles.txtModalCode}}>{'{userCode}'}</Text>
          </View>
          <View style={{...styles.viewInviteBtnArea}}>
            <TouchableOpacity style={{...styles.viewInviteBtn}} onPress={() => {}}>
              <FastImage
                source={require('../../../../assets/images/drawable-xxxhdpi/kaka_logo.png')}
                style={{width: scale(20), height: scale(20)}}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.viewInviteBtn}} onPress={() => {}}>
              <Icon name="link" type="entypo" size={scale(25)} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{marginBottom: scale(20)}} onPress={() => _isFirstTimeOpenDone()}>
            <Text
              style={{
                fontSize: scale(12),
                color: '#7d7d7d',
                fontWeight: '500',
                textDecorationLine: 'underline',
                textAlign: 'center',
              }}>
              다음에할게요
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AppMain;

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
    height: '30%',
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
  viewInner: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
    backgroundColor: 'white',
  },
  viewInviteArea: {
    borderRadius: scale(25),
    borderColor: '#dddddd',
    borderWidth: scale(1.5),
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(30),
  },
  txtInviteLabel: {
    fontSize: scale(14),
  },
  txtLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#e5293e',
  },
  viewAuditionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(20),
  },
  txtViewMore: {
    fontSize: scale(10),
    color: '#ababab',
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
  viewModalContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: scale(5),
    padding: scale(15),
  },
  txtModalLabel: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#e5293e',
    textAlign: 'center',
  },
  txtModalSubLabel: {
    fontSize: scale(10),
    color: '#7d7d7d',
    textAlign: 'center',
  },
  viewModalCodeArea: {
    borderRadius: scale(5),
    backgroundColor: 'white',
    borderColor: '#707070',
    paddingVertical: scale(25),
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: scale(20),
  },
  txtModalCodeLabel: {
    fontSize: scale(14),
    fontWeight: '500',
  },
  txtModalCode: {
    fontSize: scale(25),
    fontWeight: 'bold',
  },
  viewInviteBtnArea: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: scale(30),
  },
  viewInviteBtn: {
    width: scale(45),
    height: scale(45),
    backgroundColor: 'white',
    borderColor: '#dddddd',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
