import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';

import {AirbnbRating, Button, Header, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

const ActorReviewDetail = props => {
  const actorInfo = props.route.params.actorInfo;

  const [dataList, setDataList] = useState({list: []});
  const [isOpendFeedBack, setIsOpendFeedBack] = useState(false);

  const [requestData, setRequestData] = useState({
    ratingValue: 0,
    feedBackkCate: {eval_feedback_type_no: '', content: ''},
    feedBackkDesc: '',
  });

  const _getFeedBackCate = async () => {
    try {
      const apiResult = await apiObject.getFeedBackCate();

      setDataList(apiResult);
    } catch (error) {
      console.log('_getFeedBackCate -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _reviewActorProfile = async () => {
    const {
      ratingValue,
      feedBackkCate: {eval_feedback_type_no},
      feedBackkDesc,
    } = requestData;
    try {
      await apiObject.reviewActorProfile({
        eval_apply_no: actorInfo.eval_apply_no,
        star: ratingValue,
        eval_feedback_type_no,
        direct_input: feedBackkDesc,
      });

      Toast.showWithGravity('배우 평가를 남겼습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack(null);
    } catch (error) {
      console.log('_reviewActorProfile -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getFeedBackCate();
  }, []);

  return (
    <KeyboardAvoidingView style={{...styles.container}} behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
        centerComponent={{text: actorInfo.name, style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView>
          <View style={{...styles.viewUpActorArea}}>
            <FastImage
              source={{uri: actorInfo.image_url}}
              style={{...styles.imgUpActor}}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={{...styles.viewUpActorInfo}}>
              <Text style={{...styles.txtActorName, fontSize: scale(15), flex: 1}}>{actorInfo.name}</Text>
              <Text
                style={{
                  ...styles.txtActorPrivate,
                  fontSize: scale(12),
                  flex: 1,
                }}>{`${actorInfo.age}세     ${actorInfo.height}cm/${actorInfo.weight}kg`}</Text>
              <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
                {actorInfo.keyword.map((d, i) => (
                  <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                    {i === actorInfo.keyword.length - 1 ? `${d}` : `${d}, `}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
          <View style={{...styles.viewActorStarArea}}>
            <Text style={{...styles.txtStarTitle}}>배우 프로필에 별점을 매겨주세요.</Text>
            <AirbnbRating
              showRating={false}
              defaultRating={requestData.ratingValue}
              size={scale(40)}
              starStyle={{marginVertical: scale(10)}}
              onFinishRating={value => setRequestData({...requestData, ratingValue: value})}
            />
            <Text style={{...styles.txtStarSubTitle}}>선택하세요</Text>
          </View>
          <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
          <View style={{...styles.viewActorStarArea}}>
            <Text style={{...styles.txtStarTitle}}>피드백 내용</Text>
            <ListItem
              bottomDivider={true}
              onPress={() => setIsOpendFeedBack(!isOpendFeedBack)}
              delayPressIn={0}
              underlayColor={'white'}
              containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row'}}>
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      fontSize: scale(14),
                      color: requestData.feedBackkCate.content !== '' ? 'black' : '#dddddd',
                    }}>
                    {requestData.feedBackkCate.content !== '' ? requestData.feedBackkCate.content : '피드백내용선택'}
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron
                  name={isOpendFeedBack ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  type="material"
                  size={scale(25)}
                  color="#e5293e"
                />
              </View>
              <View style={{paddingTop: isOpendFeedBack ? scale(20) : null}}>
                {isOpendFeedBack &&
                  dataList.list.map(item => (
                    <TouchableOpacity
                      key={`feedBackkCate_${item.eval_feedback_type_no}`}
                      style={{...styles.viewTagButton}}
                      onPress={() => {
                        setRequestData({...requestData, feedBackkCate: item});
                        setIsOpendFeedBack(false);
                      }}
                      activeOpacity={0.9}>
                      <Text style={{...styles.txtTagLabel}}>{item.content}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ListItem>
          </View>
          <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
          <View style={{...styles.viewActorStarArea}}>
            <Text style={{...styles.txtStarTitle}}>내용 직접 입력</Text>
            <TextInput
              style={{
                fontSize: scale(14),
                borderRadius: scale(3.5),
                backgroundColor: '#f5f5f5',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: '#707070',
                paddingHorizontal: scale(15),
                paddingVertical: scale(10),
                marginVertical: scale(10),
                height: scale(100),
              }}
              multiline={true}
              placeholder="최소 10자 이상 입력해주세요."
              value={requestData.feedBackkDesc}
              padding={0}
              onChangeText={text => setRequestData({...requestData, feedBackkDesc: text})}
              maxLength={5000}
              scrollEnabled={false}
              textAlignVertical="top"
            />
            <Text style={{textAlign: 'right', color: '#999999'}}>{`${requestData.feedBackkDesc.length}/5,000`}</Text>
          </View>
          <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
          {/* <View style={{...styles.viewFeedBackPointArea}}>
            <FastImage
              source={require('../../../../assets/images/drawable-xxxhdpi/point.png')}
              style={{width: scale(25), height: scale(25)}}
            />
            <Text style={{...styles.txtFeedBackPoint}}>
              <Text>배우피드백에 응할 시</Text>
              <Text style={{color: '#ff5e00'}}>최대 50원 적립!</Text>
            </Text>
          </View> */}
          <View style={{...styles.viewActorStarArea}}>
            <Button
              title="평가남기기"
              titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
              disabled={
                !(
                  requestData.feedBackkCate.content !== '' &&
                  requestData.ratingValue !== 0 &&
                  requestData.feedBackkDesc !== '' &&
                  requestData.feedBackkDesc.length >= 10
                )
              }
              buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
              onPress={() => _reviewActorProfile()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ActorReviewDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewUpActorArea: {
    flexDirection: 'row',
    flex: 1,
    borderRadius: scale(5),
    backgroundColor: 'white',
    padding: scale(15),
  },
  imgUpActor: {
    flex: 1,
    height: scale(100),
    borderRadius: scale(5),
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
  viewActorStarArea: {
    padding: scale(25),
  },
  txtStarTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  txtStarSubTitle: {
    fontSize: scale(12),
    color: '#888888',
    textAlign: 'center',
  },
  viewListBoxContainer: {
    borderWidth: scale(1),
    borderBottomWidth: scale(1),
    borderRadius: scale(4),
    borderColor: '#e5293e',
    marginBottom: scale(15),
    backgroundColor: 'white',
    marginTop: scale(10),
  },
  viewTagButton: {
    paddingBottom: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtTagLabel: {
    fontSize: scale(14),
  },
  viewFeedBackPointArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
  },
  txtFeedBackPoint: {
    fontSize: scale(15),
    marginLeft: scale(10),
  },
});
