import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Text, View, Alert, Linking} from 'react-native';

import scale from './src/common/Scale';

import {Button, Divider, Header, Icon, ListItem} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

import {apiObject} from './src/common/API';
import LoadingContext from './src/Context/LoadingContext';
import {AddComma, isEmpty, isEmptyArr, isIOS, screenHeight, YYYYMMDD} from './src/common/Utils';
import FastImage from 'react-native-fast-image';

const TEST = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const scrollViewRef = useRef(null);

  const [tabIndex, setTabIndex] = useState(0);
  const [opendIndex, setOpendIndex] = useState(null);
  const [fixedScrollOffsetY, setFixedScrollOffsetY] = useState(0);
  const [visibleFixedHeader, setVisibleFixedHeader] = useState(false);

  const [dataList, setDataList] = useState({
    poster_list: [],
    genre_text_list: [],
    title: '',
    company: '',
    recruit_list_readable: [],
    notice_list: [],
  });

  const _getAuditionInfo = async () => {
    try {
      const apiResult = await apiObject.getAuditionInfo(
        {
          // audition_no: props.route.params.audition_no,
          audition_no: 325,
        },
        setIsLoading
      );

      setDataList(apiResult);
    } catch (error) {
      console.log('_getAuditionInfo -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
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
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onDeleteNoticePress = (audition_notice_no, audition_no) => {
    Alert.alert('[안내]', '해당 오디션 공지사항을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          _deleteAuditionNotice(audition_notice_no, audition_no).then(_getAuditionInfo());
        },
      },
    ]);
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
          _getAuditionInfo();
        },
      },
    ]);
  };

  const TabA = () => (
    <View style={{...styles.viewTabInner}}>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>작품종류</Text>
        <Text style={{...styles.txtInfo}}>
          {dataList.work_type_detail_text ? dataList.work_type_detail_text : dataList.work_type_text}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>장르</Text>
        <Text style={{...styles.txtInfo}}>
          {dataList.genre_text_list.map((item, index) =>
            index === dataList.genre_text_list.length - 1 ? `${item}` : `${item}, `
          )}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>제작사</Text>
        <Text style={{...styles.txtInfo}}>{dataList.company}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>감독</Text>
        <Text style={{...styles.txtInfo}}>{dataList.director_name}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>담당자</Text>
        <Text style={{...styles.txtInfo}}>{dataList.manager}</Text>
      </View>
      {!isEmpty(dataList.shoot_start) && (
        <View style={{...styles.viewListItem}}>
          <Text style={{...styles.txtLabel}}>촬영시작</Text>
          <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.shoot_start)}</Text>
        </View>
      )}
      {!isEmpty(dataList.shoot_end) && (
        <View style={{...styles.viewListItem}}>
          <Text style={{...styles.txtLabel}}>촬영종료</Text>
          <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.shoot_end)}</Text>
        </View>
      )}
      {!isEmpty(dataList.shoot_place) && (
        <View style={{...styles.viewListItem}}>
          <Text style={{...styles.txtLabel}}>촬영장소</Text>
          <Text style={{...styles.txtInfo}}>{dataList.shoot_place}</Text>
        </View>
      )}
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>출연료</Text>
        <Text style={{...styles.txtInfo}}>
          {isNaN(Number(dataList.fee)) ? dataList.fee : AddComma(Number(dataList.fee))}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>모집성별</Text>
        <Text
          style={{
            ...styles.txtInfo,
          }}>{`남자 ${dataList.male_count} / 여자 ${dataList.female_count}`}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>모집마감일</Text>
        <Text style={{...styles.txtInfo}}>{YYYYMMDD(dataList.deadline)}</Text>
      </View>
      <View style={{...styles.viewListItem, flexDirection: 'column'}}>
        <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>오디션내용</Text>
        <Text style={{...styles.txtInfo}}>{dataList.content}</Text>
      </View>
      {dataList.is_my_audition && (
        <Button
          title="지원자현황보기"
          titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
          buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
          containerStyle={{marginBottom: scale(15)}}
          onPress={() => props.navigation.navigate('PassStack')}
        />
      )}
    </View>
  );

  const TabB = () => (
    <>
      <View
        style={{
          borderBottomWidth: scale(1),
          borderColor: '#dddddd',
          alignItems: 'center',
          paddingVertical: scale(15),
        }}>
        <Text style={{fontSize: scale(13.5), fontWeight: 'bold'}}>
          모집배역수 : <Text style={{color: '#e5293e'}}>{dataList.recruit_list_readable.length}</Text>
        </Text>
      </View>
      <View style={{...styles.viewTabInner}}>
        {dataList.recruit_list_readable.map((item, index) => (
          <View key={`rolesList_${index}`}>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel, color: '#e5293e'}}>{`모집배역 ${index + 1}`}</Text>
              <Text style={{...styles.txtInfo}} />
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>역할</Text>
              <Text style={{...styles.txtInfo}}>{item.role_name}</Text>
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>역할 비중</Text>
              <Text style={{...styles.txtInfo}}>{item.role_weight}</Text>
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>성별</Text>
              <Text style={{...styles.txtInfo}}>{item.gender === 'M' ? '남자' : '여자'}</Text>
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>나이</Text>
              <Text style={{...styles.txtInfo}}>{item.age}</Text>
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>키</Text>
              <Text style={{...styles.txtInfo}}>{item.height}</Text>
            </View>
            <View style={{...styles.viewListItem}}>
              <Text style={{...styles.txtLabel}}>몸무게</Text>
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
              <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>캐릭터소개</Text>
              <Text style={{...styles.txtInfo}}>{item.introduce}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const TabC = () => {
    return (
      <View style={{minHeight: screenHeight}}>
        {isEmptyArr(dataList.notice_list) ? (
          <View style={{flex: 1, alignItems: 'center', paddingTop: scale(50)}}>
            <Text style={{fontSize: scale(20)}}>등록된 공지사항이 없습니다!</Text>
          </View>
        ) : (
          dataList.notice_list.map((item, index) => (
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
                    source={require('./assets/images/drawable-xxxhdpi/noun_megaphone_2409641.png')}
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
                        첨부파일 : {String(item.file_url).split('/')[String(item.file_url).split('/').length - 1]}
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
                      title="삭제"
                      titleStyle={{fontSize: scale(12), fontWeight: 'bold', color: 'white'}}
                      buttonStyle={{
                        backgroundColor: '#e5293e',
                        paddingVertical: scale(5),
                        borderRadius: scale(35),
                      }}
                      onPress={() => _onDeleteNoticePress(item.audition_notice_no, props.route.params.audition_no)}
                      containerStyle={{marginRight: scale(15)}}
                    />
                    <Button
                      title="수정"
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
          ))
        )}
      </View>
    );
  };

  const _renderTab = () => {
    switch (tabIndex) {
      case 0:
        return <TabA />;

      case 1:
        return <TabB />;

      case 2:
        return <TabC />;

      default:
        return <TabA />;
    }
  };

  useEffect(() => {
    fixedScrollOffsetY !== 0 && scrollViewRef.current.scrollTo({x: 0, y: fixedScrollOffsetY, animated: true});
  }, [tabIndex]);

  // useFocusEffect(
  //   useCallback(() => {
  //     _getAuditionInfo();
  //   }, [])
  // );

  useEffect(() => {
    _getAuditionInfo();
  }, []);

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
          onPress: () => {},
        }}
        centerComponent={{
          text: 'TEST',
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {visibleFixedHeader && (
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              alignItems: 'center',
              padding: scale(10),
              height: scale(100),
              position: 'absolute',
              width: '100%',
              zIndex: 999999,
            }}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{
                width: scale(75),
                height: scale(75),
                marginRight: scale(10),
                borderRadius: scale(10),
              }}
            />
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: scale(10),
                  color: '#e5293e',
                  fontWeight: 'bold',
                  marginBottom: scale(10),
                }}>{`[${dataList.company}]`}</Text>
              <Text numberOfLines={2}>{dataList.title}</Text>
            </View>
          </View>
        )}
        <ScrollView
          ref={scrollViewRef}
          stickyHeaderIndices={[1]}
          onScroll={e => {
            if (e.nativeEvent.contentOffset.y >= fixedScrollOffsetY - 10) {
              setVisibleFixedHeader(true);
            } else {
              setVisibleFixedHeader(false);
            }
          }}
          scrollEventThrottle={16}>
          <View style={{alignItems: 'center', paddingTop: scale(20)}}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{
                width: scale(200),
                height: scale(200),
                borderRadius: scale(15),
                marginBottom: scale(30),
              }}
            />
            <Text
              style={{
                fontSize: scale(20),
                color: '#e5293e',
                fontWeight: 'bold',
                marginBottom: scale(30),
              }}>{`[${dataList.company}]`}</Text>
            <Text
              style={{
                fontSize: scale(20),
                fontWeight: 'bold',
                textAlign: 'center',
              }}>{`${dataList.title}`}</Text>
            {dataList.is_my_audition && dataList.is_closed && (
              <Button
                title="공고 보관"
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
                containerStyle={{alignItems: 'center', marginTop: scale(20)}}
              />
            )}
            {dataList.is_my_audition && dataList.is_archive && (
              <Button
                title="공고 재등록"
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
                containerStyle={{alignItems: 'center', marginTop: scale(20)}}
              />
            )}
          </View>
          <View onLayout={e => setFixedScrollOffsetY(e.nativeEvent.layout.y)}>
            <View style={{backgroundColor: 'white', height: scale(100)}} />
            <View style={{backgroundColor: 'white', flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth}}>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(0)}>
                  <Text style={{textAlign: 'center'}}>오디션 정보</Text>
                </TouchableOpacity>
                {tabIndex === 0 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(1)}>
                  <Text style={{textAlign: 'center'}}>모집배역</Text>
                </TouchableOpacity>
                {tabIndex === 1 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(2)}>
                  <Text style={{textAlign: 'center'}}>공지사항</Text>
                </TouchableOpacity>
                {tabIndex === 2 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
            </View>
          </View>
          {_renderTab()}
        </ScrollView>
        {dataList.is_my_audition && tabIndex === 2 && (
          <Button
            title="등록하기"
            titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: 'white'}}
            buttonStyle={{
              backgroundColor: '#e5293e',
              paddingVertical: scale(10),
            }}
            onPress={() => props.navigation.navigate('NoticeWrite', {audition_no: props.route.params.audition_no})}
            containerStyle={{
              padding: scale(15),
              paddingBottom: isIOS() ? 0 : scale(15),
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default TEST;

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
