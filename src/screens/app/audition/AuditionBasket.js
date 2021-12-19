import React, {useState} from 'react';
import {Alert, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';

import {Header, Icon} from 'react-native-elements';

const data = {
  videoTypeList: [
    {id: 0, name: '전체'},
    {id: 1, name: '영화'},
    {id: 2, name: '드라마'},
    {id: 3, name: '연극'},
    {id: 4, name: '뮤지컬'},
    {id: 5, name: 'CF/광고/행사'},
    {id: 6, name: '뮤직비디오'},
    {id: 7, name: '기획사'},
  ],

  auditionList: [
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

const AuditionBasket = props => {
  const [dataList, setDataList] = useState(data);

  const _onDeletePress = index => {
    Alert.alert('[안내]', '해당 오디션 공고를 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          let tmpArr = [...dataList.auditionList];

          tmpArr.splice(index, 1);
          setDataList({...dataList, auditionList: tmpArr});
        },
      },
    ]);
  };

  const _renderAuditionList = ({item, index}) => (
    <View style={{...styles.viewAuditionCard}}>
      <View style={{paddingHorizontal: scale(10)}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.videoType}] `}</Text>
          <Text style={{fontSize: scale(10), color: '#bababa'}}>{item.uploadReg}</Text>
        </View>
        <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.producer}`}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.roles} / ${item.sex.map(d => `${d}`)}`}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity
            style={{
              borderRadius: scale(5),
              backgroundColor: '#999999',
              paddingVertical: scale(2),
              paddingHorizontal: scale(8),
              marginRight: scale(5),
            }}
            onPress={() => _onDeletePress()}>
            <Text style={{color: 'white'}}>삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderRadius: scale(5),
              backgroundColor: '#e5293e',
              paddingVertical: scale(2),
              paddingHorizontal: scale(8),
            }}
            onPress={() => {}}>
            <Text style={{color: 'white'}}>재등록</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
        centerComponent={{text: '공고보관함', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewAuditionArea}}>
          <Text style={{...styles.txtLabel}}>보관된 오디션공고</Text>
        </View>
        <FlatList
          keyExtractor={(item, index) => `auditionCard_${index}`}
          data={dataList.auditionList}
          renderItem={_renderAuditionList}
          refreshing={false}
          onRefresh={() => {}}
          // onEndReached={() => _getChatListMore(dataList.next_token)}
          // onEndReachedThreshold={0.1}
          style={{marginTop: scale(5)}}
          contentContainerStyle={{padding: scale(15)}}
        />
      </SafeAreaView>
    </View>
  );
};

export default AuditionBasket;

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
    padding: scale(15),
    paddingBottom: 0,
  },
  txtLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#e5293e',
  },
});
