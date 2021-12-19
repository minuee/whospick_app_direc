import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmpty, isEmptyArr, screenWidth, YYYYMMDD} from '../../../common/Utils';
import {apiObject, IMAGE_URL} from '../../../common/API';

import {Button, CheckBox, Divider, Header, Icon, ListItem} from 'react-native-elements';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-simple-toast';
import {Tab, Tabs} from 'native-base';

import LoadingIndicator from '../../../Component/LoadingIndicator';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

import {Storage} from '@psyrenpark/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AuditionAdd = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {userEmail} = useContext(UserTokenContext);

  const [dataList, setDataList] = useState({list: [], genre: [], age: [], height: [], weight: [], role_weight: []});
  const [requestDataForm, setRequestDataForm] = useState({
    videoType: {work_type_no: '', content: ''},
    videoTypeDetail: {work_type_detail_no: '', content: ''},
    videoGenre: [],
    videoTitle: '',
    videoProducer: '',
    videoDirector: '',
    videoManager: '',
    recordStartDate: parseInt(+new Date() / 1000),
    recordEndDate: parseInt(+new Date() / 1000),
    recordPlace: '',
    recordPrice: '',
    auditionMember: {male: '', female: ''},
    postEndDate: parseInt(+new Date() / 1000),
    postTitle: '',
    postDesc: '',
    posterImage: [],
  });

  const [isInputRecordStartDate, setInputRecordStartDate] = useState(false);
  const [isInputRecordEndDate, setInputRecordEndDate] = useState(false);

  const [rolesList, setRolesList] = useState([
    {
      positionName: '',
      positionType: {role_weight_no: '', content: ''},
      sex: '',
      age: {age_no: '', content: ''},
      height: {height_no: '', content: ''},
      weight: {weight_no: '', content: ''},
      tagList: [],
      positionDesc: '',
      isOpend: true,
      isOpendActorTypeList: true,
      isOpendImageTag: true,
    },
  ]);

  const [isOpend, setIsOpend] = useState({
    videoType: true,
    videoTypeDetail: false,
    videoGenre: false,
    recordStart: false,
    recordEnd: false,
    postEndDate: false,
    sexTag: false,
    ageTag: false,
    heightTag: false,
    weightTag: false,
  });
  const [isTagOpend, setIsTagOpend] = useState([]);

  const [tabIndex, setTabIndex] = useState(0);

  const [videoTypeIndex, setVideoTypeIndex] = useState(null);
  const [workTypeNum, setWorkTypeNum] = useState(null);

  const [directExit, setDirectExit] = useState(false);

  const [rolesLength, setRolesLength] = useState(0);

  const options = {
    title: '사진 촬영 & 선택',
    cancelButtonTitle: '취소',
    takePhotoButtonTitle: '사진 촬영',
    chooseFromLibraryButtonTitle: '사진 선택',
    mediaType: 'photo',
    maxWidth: 1024,
    maxHeight: 1024,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const _getAuditionTypeConfig = async () => {
    try {
      const typeConfig = await apiObject.getAuditionTypeConfig(loading => setIsLoading(loading));
      setDataList(typeConfig);

      if (props.route.params.isEdit || props.route.params.reAdd) {
        const auditionInfo = await apiObject.getAuditionInfo(
          {
            audition_no: props.route.params.audition_no,
          },
          loading => setIsLoading(loading)
        );

        for (let i = 0; i < typeConfig.list.length; i++) {
          if (typeConfig.list[i].work_type_no === auditionInfo.work_type_no) {
            setVideoTypeIndex(i);
            break;
          }
        }
        setWorkTypeNum(auditionInfo.work_type_no);
        let posterListArr = [];
        let rolesListArr = [];

        for (let i = 0; i < auditionInfo.poster_list.length; i++) {
          posterListArr.push(auditionInfo.poster_list[i].url);
        }

        for (let i = 0; i < auditionInfo.recruit_list.length; i++) {
          rolesListArr.push({
            positionName: auditionInfo.recruit_list[i].role_name,
            positionType: auditionInfo.recruit_list[i].role_weight_object,
            sex: auditionInfo.recruit_list[i].gender,
            age: auditionInfo.recruit_list[i].age_object,
            height: auditionInfo.recruit_list[i].height_object,
            weight: auditionInfo.recruit_list[i].weight_object,
            tagList: auditionInfo.recruit_list[i].recruit_detail_list,
            positionDesc: auditionInfo.recruit_list[i].introduce,
            isOpend: false,
            isOpendActorTypeList: false,
            isOpendImageTag: false,
          });
        }

        setRolesLength(auditionInfo.recruit_list.length);

        setRequestDataForm({
          videoType: {work_type_no: auditionInfo.work_type_no, content: auditionInfo.work_type_text},
          videoTypeDetail: isEmpty(auditionInfo.work_type_detail_object)
            ? {work_type_detail_no: '', content: ''}
            : {work_type_detail_no: auditionInfo.work_type_detail_no, content: auditionInfo.work_type_detail_text},
          videoGenre: auditionInfo.genre_no_list,
          videoTitle: auditionInfo.work_title,
          videoProducer: auditionInfo.company,
          videoDirector: auditionInfo.director_name,
          videoManager: auditionInfo.manager,
          recordStartDate: isEmpty(auditionInfo.shoot_start) ? parseInt(+new Date() / 1000) : auditionInfo.shoot_start,
          recordEndDate: isEmpty(auditionInfo.shoot_end) ? parseInt(+new Date() / 1000) : auditionInfo.shoot_end,
          recordPlace: auditionInfo.shoot_place,
          recordPrice: auditionInfo.fee,
          auditionMember: {male: String(auditionInfo.male_count), female: String(auditionInfo.female_count)},
          postEndDate: auditionInfo.deadline,
          postTitle: auditionInfo.title,
          postDesc: auditionInfo.content,
          posterImage: posterListArr,
        });

        setInputRecordStartDate(isEmpty(auditionInfo.shoot_start));
        setInputRecordEndDate(isEmpty(auditionInfo.shoot_end));

        setRolesList(rolesListArr);

        setIsOpend({...isOpend, videoType: false});
      }
    } catch (error) {
      console.log('_getAuditionTypeConfig -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getAuditionTypeConfig();
  }, []);

  useEffect(() => {
    if (tabIndex === 1) {
      Alert.alert(
        '[안내]',
        '한 번 등록한 배역은 수정할 수 없습니다.\n\n해당 배역 지원자의 불이익을 막기 위함으로\n배역 등록시 신중한 등록을 부탁드립니다.',
        [{text: '확인', style: 'cancel'}]
      );
    }
  }, [tabIndex]);

  // 뒤로가기 방지
  useEffect(
    () =>
      props.navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        if (directExit) {
          props.navigation.dispatch(e.data.action);
          return null;
        }
        if (tabIndex === 0) {
          Alert.alert('[안내]', '뒤로가시겠습니까?\n변경사항이 저장되지 않을 수 있습니다.', [
            {text: '취소', style: 'cancel'},
            {
              text: '나가기',
              style: 'destructive',
              onPress: () => props.navigation.dispatch(e.data.action),
            },
          ]);
        } else {
          setTabIndex(0);
        }
      }),
    [props.navigation, tabIndex, directExit]
  );

  // 첫번째 탭

  const _onImagePicker = () => {
    if (requestDataForm.posterImage.length === 2) {
      Alert.alert(
        '[안내]',
        '최대 이미지 갯수를 초과했습니다.\n사진 제거 후 다시 시도해주세요.',
        [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
        {cancelable: false}
      );
      return null;
    }

    ImagePicker.showImagePicker(options, async image => {
      const userId = userEmail.split('@')[0];
      if (image.didCancel) {
      } else if (image.error) {
        console.log('ImagePicker Error: ', image.error);
        Alert.alert(
          '[안내]',
          '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
          [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
          {cancelable: false}
        );
      } else {
        const result = await fetch(image.uri);
        const blob = await result.blob();
        let fileName = blob._data.name;
        let extensionName = fileName.split('.')[1];
        let now_timestamp = Math.floor(new Date().getTime() / 1000);
        fileName = `${userId}_${now_timestamp}.${extensionName}`;

        try {
          const storageUrl = await Storage.put(
            {
              key: `audition/poster/${fileName}`,
              object: blob,
              config: {
                contentType: 'image',
              },
            },
            loading => setIsLoading(loading)
          );

          let tmpArr = [...requestDataForm.posterImage];

          tmpArr.push(`${IMAGE_URL}${storageUrl.key}`);
          setRequestDataForm({...requestDataForm, posterImage: tmpArr});
        } catch (error) {
          console.log('_onImagePicker -> error', error);
          Alert.alert(
            '[안내]',
            '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
            [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
            {cancelable: false}
          );
        }
      }
    });
  };

  const _onDeleteImagePress = index => {
    Alert.alert(
      '[안내]',
      `${index + 1}번째 사진을 삭제하겠습니까?`,
      [
        {text: '취소', onPress: () => console.log('OK Pressed'), style: 'cancel'},
        {
          text: '삭제',
          onPress: () => {
            let tmpArr = [...requestDataForm.posterImage];

            tmpArr.splice(index, 1);
            setRequestDataForm({...requestDataForm, posterImage: tmpArr});
          },
        },
      ],
      {cancelable: false}
    );
  };

  // 두번째 탭
  const [selectedIndex, setSelectedIndex] = useState(0);

  const _onTogglePress = index => {
    let tmpArr = [...rolesList];

    tmpArr[index].isOpend = !tmpArr[index].isOpend;

    setSelectedIndex(index);
    setRolesList(tmpArr);
  };

  const _onLongPress = index => {
    if (rolesList.length === 1 || (props.route.params.isEdit && index < Number(rolesLength))) {
      return null;
    }
    Alert.alert(
      '[안내]',
      `'모집배역 ${index + 1}' 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setSelectedIndex(0);
            let tmpArr = [...rolesList];

            tmpArr.splice(index, 1);
            setRolesList(tmpArr);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            Toast.show('삭제되었습니다.');
          },
        },
      ],
      {cancelable: false}
    );
  };

  const _onPostAudition = async () => {
    try {
      let posterImageArr = [];
      let recruitListArr = [];
      let apiResult;

      if (!isEmptyArr(requestDataForm.posterImage)) {
        const imageUploadResult = await apiObject.imageUpload(
          {
            url: requestDataForm.posterImage,
          },
          loading => setIsLoading(loading)
        );
        console.log('imageUploadResult: ', imageUploadResult.image_no);
        posterImageArr = imageUploadResult.image_no;
      }

      for (let i = props.route.params.isEdit ? rolesLength : 0; i < rolesList.length; i++) {
        recruitListArr.push({
          role_name: rolesList[i].positionName,
          role_weight_no: rolesList[i].positionType.role_weight_no,
          gender: rolesList[i].sex,
          age_no: rolesList[i].age.age_no,
          height_no: rolesList[i].height.height_no,
          weight_no: rolesList[i].weight.weight_no,
          introduce: rolesList[i].positionDesc,
          detail_info_list: rolesList[i].tagList,
        });
      }

      if (props.route.params.isEdit) {
        await apiObject.editAuditionInfo({
          work_type_no: requestDataForm.videoType.work_type_no,
          work_type_detail_no: requestDataForm.videoTypeDetail.work_type_detail_no,
          work_title: requestDataForm.videoTitle,
          company: requestDataForm.videoProducer,
          director_name: requestDataForm.videoDirector,
          manager: requestDataForm.videoManager,
          shoot_start: isInputRecordStartDate ? null : requestDataForm.recordStartDate,
          shoot_end: isInputRecordEndDate ? null : requestDataForm.recordEndDate,
          shoot_place: requestDataForm.recordPlace,
          fee: requestDataForm.recordPrice,
          male_count: requestDataForm.auditionMember.male,
          female_count: requestDataForm.auditionMember.female,
          deadline: requestDataForm.postEndDate,
          title: requestDataForm.postTitle,
          content: requestDataForm.postDesc,
          genre_no_list: requestDataForm.videoGenre,
          image_no_list: posterImageArr,
          recruit_list: recruitListArr,
          audition_no: props.route.params.audition_no,
        });
      } else {
        apiResult = await apiObject.applyAuditionInfo({
          work_type_no: requestDataForm.videoType.work_type_no,
          work_type_detail_no: requestDataForm.videoTypeDetail.work_type_detail_no,
          work_title: requestDataForm.videoTitle,
          company: requestDataForm.videoProducer,
          director_name: requestDataForm.videoDirector,
          manager: requestDataForm.videoManager,
          shoot_start: isInputRecordStartDate ? null : requestDataForm.recordStartDate,
          shoot_end: isInputRecordEndDate ? null : requestDataForm.recordEndDate,
          shoot_place: requestDataForm.recordPlace,
          fee: requestDataForm.recordPrice,
          male_count: requestDataForm.auditionMember.male,
          female_count: requestDataForm.auditionMember.female,
          deadline: requestDataForm.postEndDate,
          title: requestDataForm.postTitle,
          content: requestDataForm.postDesc,
          genre_no_list: requestDataForm.videoGenre,
          image_no_list: posterImageArr,
          recruit_list: recruitListArr,
        });
      }
      setDirectExit(true);

      if (!props.route.params.isEdit && apiResult.audition_limit_exceed) {
        Alert.alert('[안내]', '오디션은 최대 5개까지 등록 가능합니다.', [
          {
            text: '확인',
            style: 'cancel',
            onPress: () => props.navigation.goBack(null),
          },
        ]);
        return null;
      }

      setTimeout(() => {
        if (props.route.params.isEdit) {
          Toast.showWithGravity('오디션 공고가 수정되었습니다.', Toast.SHORT, Toast.CENTER);
        } else {
          Toast.showWithGravity('새로운 오디션 공고가 등록되었습니다.', Toast.SHORT, Toast.CENTER);
        }
        props.navigation.goBack(null);
      }, 500);
    } catch (error) {
      console.log('_onPostAudition -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onToggleTag = (item, cateNum, maxNum, index) => {
    let tmpArr = [...rolesList];

    if (tmpArr[index].tagList.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no) > -1) {
      tmpArr[index].tagList.splice(
        tmpArr[index].tagList.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no),
        1
      );
    } else {
      let cnt = 0;
      for (let i = 0; i < tmpArr[index].tagList.length; i++) {
        if (tmpArr[index].tagList[i].detail_category_no === cateNum) {
          cnt += 1;
        }
      }
      if (cnt === maxNum) {
        return null;
      }
      tmpArr[index].tagList.push({...item, direct_input: null});
    }
    setRolesList(tmpArr);
  };

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
        centerComponent={{
          text: props.route.params.isEdit ? '오디션 공고 수정' : '오디션 공고 등록',
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        rightComponent={
          tabIndex === 1 && {
            icon: 'ios-add',
            type: 'ionicon',
            size: scale(25),
            color: 'white',
            onPress: () => {
              let tmpArr = [...rolesList];

              tmpArr.push({
                positionName: '',
                positionType: {role_weight_no: '', content: ''},
                sex: '',
                age: {age_no: '', content: ''},
                height: {height_no: '', content: ''},
                weight: {weight_no: '', content: ''},
                tagList: [],
                positionDesc: '',
                isOpend: true,
                isOpendActorTypeList: true,
                isOpendImageTag: true,
              });
              setSelectedIndex(tmpArr.length - 1);
              setRolesList(tmpArr);

              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              Toast.showWithGravity('새로운 배역이 추가되었습니다.', Toast.SHORT, Toast.CENTER);
            },
          }
        }
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <Tabs
          page={tabIndex}
          onChangeTab={index => setTabIndex(index.i)}
          tabContainerStyle={{height: 0, borderBottomWidth: 0}}
          tabBarUnderlineStyle={{height: 0}}
          tabBarActiveTextColor="transparent"
          tabBarInactiveTextColor="transparent"
          locked={true}>
          <Tab heading="오디션정보">
            <ScrollView bounces={false}>
              <View style={{...styles.viewScrollInner}}>
                <Text
                  style={{
                    fontSize: scale(10),
                    fontWeight: 'bold',
                    color: '#e5293e',
                    textAlign: 'right',
                    marginBottom: scale(15),
                  }}>
                  * 필수입력
                </Text>
                <View style={{...styles.viewToggleMainArea}}>
                  <TouchableOpacity
                    style={{...styles.viewToggleArea}}
                    onPress={() => setIsOpend({...isOpend, videoType: !isOpend.videoType})}>
                    <Text
                      style={{
                        fontSize: scale(14),
                        color: isEmpty(requestDataForm.videoType.content) ? '#dddddd' : 'black',
                      }}>
                      {isEmpty(requestDataForm.videoType.content) ? '제작유형선택' : requestDataForm.videoType.content}
                      <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                    </Text>
                    <Icon
                      name={isOpend.videoType ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={scale(25)}
                      color="#e5293e"
                    />
                  </TouchableOpacity>
                  <View>
                    {isOpend.videoType &&
                      dataList.list.map((item, index) => (
                        <TouchableOpacity
                          key={`videoType_${index}`}
                          onPress={() => {
                            setIsOpend({...isOpend, videoType: false});
                            setRequestDataForm({
                              ...requestDataForm,
                              videoType: item,
                              videoTypeDetail: {work_type_detail_no: '', content: ''},
                            });
                            setVideoTypeIndex(index);
                            setWorkTypeNum(item.work_type_no);
                          }}>
                          <Text style={{fontSize: scale(14), paddingVertical: scale(10)}}>{item.content}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
                {videoTypeIndex !== null && workTypeNum !== null && (
                  <>
                    {!isEmptyArr(dataList.list[videoTypeIndex].list) && (
                      <View style={{...styles.viewToggleMainArea}}>
                        <TouchableOpacity
                          style={{...styles.viewToggleArea}}
                          onPress={() => setIsOpend({...isOpend, videoTypeDetail: !isOpend.videoTypeDetail})}>
                          <Text
                            style={{
                              fontSize: scale(14),
                              color: isEmpty(requestDataForm.videoTypeDetail.content) ? '#dddddd' : 'black',
                            }}>
                            {isEmpty(requestDataForm.videoTypeDetail.content)
                              ? '영상구분'
                              : requestDataForm.videoTypeDetail.content}
                            {/* <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text> */}
                          </Text>
                          <Icon
                            name={isOpend.videoTypeDetail ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={scale(25)}
                            color="#e5293e"
                          />
                        </TouchableOpacity>
                        <View>
                          {isOpend.videoTypeDetail &&
                            dataList.list[videoTypeIndex].list.map((item, index) => (
                              <TouchableOpacity
                                key={`videoTypeDetail_${index}`}
                                onPress={() => {
                                  setIsOpend({...isOpend, videoTypeDetail: false});
                                  setRequestDataForm({...requestDataForm, videoTypeDetail: item});
                                }}>
                                <Text style={{fontSize: scale(14), paddingVertical: scale(10)}}>{item.content}</Text>
                              </TouchableOpacity>
                            ))}
                        </View>
                      </View>
                    )}

                    {/* 장르 */}
                    <View style={{...styles.viewToggleMainArea}}>
                      <TouchableOpacity
                        style={{...styles.viewToggleArea}}
                        onPress={() => setIsOpend({...isOpend, videoGenre: !isOpend.videoGenre})}>
                        <Text
                          style={{
                            fontSize: scale(14),
                            flex: 1,
                            color: isEmptyArr(requestDataForm.videoGenre) ? '#dddddd' : 'black',
                          }}>
                          {isEmptyArr(requestDataForm.videoGenre)
                            ? '장르'
                            : requestDataForm.videoGenre.map((item, index) => `#${item.content} `)}
                          <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}>
                            {' * '}
                            {isEmptyArr(requestDataForm.videoGenre) ? (
                              <Text style={{fontSize: scale(12), color: '#dddddd', fontWeight: 'normal'}}>
                                최대 5가지 선택
                              </Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Icon
                          name={isOpend.videoGenre ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={scale(25)}
                          color="#e5293e"
                        />
                      </TouchableOpacity>
                      <View style={{...styles.viewVideoTypeArea}}>
                        {isOpend.videoGenre &&
                          dataList.genre.map((item, index) => (
                            <TouchableOpacity
                              key={`videoGenre_${index}`}
                              style={{
                                paddingVertical: scale(10),
                                width: '49%',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                let tmpArr = [...requestDataForm.videoGenre];

                                if (tmpArr.findIndex(e => e.detail_checkbox_no === item.genre_no) > -1) {
                                  tmpArr.splice(
                                    tmpArr.findIndex(e => e.detail_checkbox_no === item.genre_no),
                                    1
                                  );
                                } else {
                                  if (tmpArr.length === 5) {
                                    return null;
                                  }
                                  tmpArr.push({
                                    detail_checkbox_no: item.genre_no,
                                    direct_input: null,
                                    content: item.content,
                                    direct_yn: item.direct_yn,
                                  });
                                }

                                setRequestDataForm({...requestDataForm, videoGenre: tmpArr});
                              }}>
                              <Icon
                                name={
                                  requestDataForm.videoGenre.some(e => e.detail_checkbox_no === item.genre_no)
                                    ? 'check-circle'
                                    : 'radio-button-unchecked'
                                }
                                color={
                                  requestDataForm.videoGenre.some(e => e.detail_checkbox_no === item.genre_no)
                                    ? '#e5293e'
                                    : '#dddddd'
                                }
                                style={{marginRight: scale(5)}}
                              />
                              <Text style={{fontSize: scale(14)}}>{item.content}</Text>
                            </TouchableOpacity>
                          ))}
                        {requestDataForm.videoGenre.some(e => e.direct_yn === true) ? (
                          <TextInput
                            style={{...styles.inputEdit, width: '100%'}}
                            placeholder="직접입력"
                            value={
                              requestDataForm.videoGenre[
                                requestDataForm.videoGenre.findIndex(e => e.direct_yn === true)
                              ].direct_input
                            }
                            padding={0}
                            onChangeText={text => {
                              let tmpArr = [...requestDataForm.videoGenre];
                              tmpArr[
                                requestDataForm.videoGenre.findIndex(e => e.direct_yn === true)
                              ].direct_input = text;

                              setRequestDataForm({...requestDataForm, videoGenre: tmpArr});
                            }}
                            returnKeyType="done"
                          />
                        ) : null}
                      </View>
                    </View>

                    <TextInput
                      style={{...styles.inputEdit}}
                      placeholder="작품제목입력"
                      value={requestDataForm.videoTitle}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, videoTitle: text})}
                      returnKeyType="done"
                    />
                    <TextInput
                      style={{...styles.inputEdit}}
                      placeholder="제작사입력"
                      value={requestDataForm.videoProducer}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, videoProducer: text})}
                      returnKeyType="done"
                    />
                    <TextInput
                      style={{...styles.inputEdit}}
                      placeholder="감독입력"
                      value={requestDataForm.videoDirector}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, videoDirector: text})}
                      returnKeyType="done"
                    />
                    <TextInput
                      style={{...styles.inputEdit}}
                      placeholder="담당자입력"
                      value={requestDataForm.videoManager}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, videoManager: text})}
                      returnKeyType="done"
                    />
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                        촬영 시작
                        {/* <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text> */}
                      </Text>
                      <CheckBox
                        checked={isInputRecordStartDate}
                        title="나중에 입력"
                        textStyle={{fontSize: scale(12), fontWeight: 'normal'}}
                        containerStyle={{
                          backgroundColor: 'white',
                          borderWidth: 0,
                          margin: 0,
                          padding: 0,
                          marginBottom: scale(10),
                        }}
                        checkedColor="#e5293e"
                        onPress={() => setInputRecordStartDate(!isInputRecordStartDate)}
                      />
                    </View>
                    <View style={{...styles.viewToggleMainArea}}>
                      <TouchableOpacity
                        style={{...styles.viewToggleArea}}
                        onPress={() => setIsOpend({...isOpend, recordStart: !isOpend.recordStart})}>
                        <Text style={{fontSize: scale(14)}}>{YYYYMMDD(requestDataForm.recordStartDate)}</Text>
                        <Icon
                          name={isOpend.recordStart ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={scale(25)}
                          color="#e5293e"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                        촬영 종료
                        {/* <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text> */}
                      </Text>
                      <CheckBox
                        checked={isInputRecordEndDate}
                        title="나중에 입력"
                        textStyle={{fontSize: scale(12), fontWeight: 'normal'}}
                        containerStyle={{
                          backgroundColor: 'white',
                          borderWidth: 0,
                          margin: 0,
                          padding: 0,
                          marginBottom: scale(10),
                        }}
                        checkedColor="#e5293e"
                        onPress={() => setInputRecordEndDate(!isInputRecordEndDate)}
                      />
                    </View>
                    <View style={{...styles.viewToggleMainArea}}>
                      <TouchableOpacity
                        style={{...styles.viewToggleArea}}
                        onPress={() => setIsOpend({...isOpend, recordEnd: !isOpend.recordEnd})}>
                        <Text style={{fontSize: scale(14)}}>{YYYYMMDD(requestDataForm.recordEndDate)}</Text>
                        <Icon
                          name={isOpend.recordEnd ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={scale(25)}
                          color="#e5293e"
                        />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={{...styles.inputEdit, borderColor: '#dddddd'}}
                      placeholder="촬영장소입력"
                      value={requestDataForm.recordPlace}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, recordPlace: text})}
                      returnKeyType="done"
                    />
                    <TextInput
                      style={{...styles.inputEdit}}
                      placeholder="출연료입력"
                      value={
                        !isNaN(requestDataForm.recordPrice)
                          ? AddComma(requestDataForm.recordPrice)
                          : requestDataForm.recordPrice
                      }
                      padding={0}
                      onChangeText={text =>
                        setRequestDataForm({...requestDataForm, recordPrice: text.replace(/,/gi, '')})
                      }
                      // keyboardType="number-pad"
                    />
                    <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                      모집 성별<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <View style={{flexDirection: 'row', width: '49%', alignItems: 'flex-end'}}>
                        <TextInput
                          style={{...styles.inputEdit, flex: 1, textAlign: 'right', borderColor: '#dddddd'}}
                          placeholder="남자인원"
                          value={requestDataForm.auditionMember.male}
                          padding={0}
                          onChangeText={text =>
                            setRequestDataForm({
                              ...requestDataForm,
                              auditionMember: {...requestDataForm.auditionMember, male: text},
                            })
                          }
                          keyboardType="number-pad"
                        />
                        <Text style={{marginBottom: scale(15), marginLeft: scale(5), fontSize: scale(14)}}>명</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '49%', alignItems: 'flex-end'}}>
                        <TextInput
                          style={{...styles.inputEdit, flex: 1, textAlign: 'right', borderColor: '#dddddd'}}
                          placeholder="여자인원"
                          value={requestDataForm.auditionMember.female}
                          padding={0}
                          onChangeText={text =>
                            setRequestDataForm({
                              ...requestDataForm,
                              auditionMember: {...requestDataForm.auditionMember, female: text},
                            })
                          }
                          keyboardType="number-pad"
                        />
                        <Text style={{marginBottom: scale(15), marginLeft: scale(5), fontSize: scale(14)}}>명</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                      모집 마감일<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                    </Text>
                    <View style={{...styles.viewToggleMainArea}}>
                      <TouchableOpacity
                        style={{...styles.viewToggleArea}}
                        onPress={() => setIsOpend({...isOpend, postEndDate: !isOpend.postEndDate})}>
                        <Text style={{fontSize: scale(14)}}>{YYYYMMDD(requestDataForm.postEndDate)}</Text>
                        <Icon
                          name={isOpend.postEndDate ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={scale(25)}
                          color="#e5293e"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={{fontSize: scale(10), color: '#e5293e', marginBottom: scale(15)}}>
                      ! 마감일 당일 저녁 12시에 해당 공고가 오디션보관함으로 이동되며, 오디션 공고목록에서는
                      자동삭제됩니다.
                    </Text>
                    <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                      공고제목<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                    </Text>
                    <TextInput
                      style={{...styles.inputEdit, borderColor: '#dddddd'}}
                      placeholder="공고제목을 입력해주세요."
                      value={requestDataForm.postTitle}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, postTitle: text})}
                      returnKeyType="done"
                    />
                    <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>
                      공고내용<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                    </Text>
                    <TextInput
                      style={{
                        ...styles.inputEdit,
                        height: scale(200),
                        textAlignVertical: 'top',
                        borderColor: '#dddddd',
                      }}
                      placeholder="공고내용을 입력해주세요."
                      value={requestDataForm.postDesc}
                      padding={0}
                      onChangeText={text => setRequestDataForm({...requestDataForm, postDesc: text})}
                      multiline={true}
                      scrollEnabled={true}
                    />
                    <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(15)}}>공고포스터등록</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#e5e5e5',
                          height: scale(75),
                          width: scale(75),
                          justifyContent: 'center',
                          marginRight: scale(5),
                        }}
                        onPress={() => _onImagePicker()}>
                        <Icon name="add-a-photo" size={scale(25)} color="white" />
                        <Text
                          style={{
                            fontSize: scale(12),
                            color: '#979797',
                            position: 'absolute',
                            left: scale(3),
                            bottom: scale(3),
                          }}>{`${requestDataForm.posterImage.length}/2`}</Text>
                      </TouchableOpacity>
                      {requestDataForm.posterImage.map((item, index) => (
                        <TouchableOpacity key={`posterImage_${index}`} onPress={() => _onDeleteImagePress(index)}>
                          <FastImage
                            source={{uri: item}}
                            style={{height: scale(75), width: scale(75), marginRight: scale(5)}}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{fontSize: scale(10), color: '#e5293e', marginBottom: scale(15), marginTop: scale(5)}}>
                      * 이미지를 삭제하려면 길게 눌러주세요.
                    </Text>
                    <Button
                      disabled={
                        !(
                          !isEmpty(requestDataForm.videoType.content) &&
                          !isEmptyArr(requestDataForm.videoGenre) &&
                          !isEmpty(requestDataForm.videoTitle) &&
                          !isEmpty(requestDataForm.videoProducer) &&
                          !isEmpty(requestDataForm.videoDirector) &&
                          !isEmpty(requestDataForm.videoManager) &&
                          !isEmpty(requestDataForm.recordPrice) &&
                          !isEmpty(requestDataForm.postTitle) &&
                          !isEmpty(requestDataForm.postDesc) &&
                          ((!isEmpty(requestDataForm.auditionMember.male) &&
                            !isNaN(requestDataForm.auditionMember.male)) ||
                            (!isEmpty(requestDataForm.auditionMember.female) &&
                              !isNaN(requestDataForm.auditionMember.female)))
                        )
                      }
                      title="다음단계로"
                      titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                      buttonStyle={{
                        backgroundColor: '#e5293e',
                        paddingVertical: scale(12),
                        borderRadius: scale(35),
                      }}
                      onPress={() => setTabIndex(1)}
                    />
                  </>
                )}

                {/* View End */}
              </View>
            </ScrollView>
          </Tab>
          <Tab heading="오디션배역">
            <ScrollView bounces={false}>
              <Text style={{marginTop: scale(15), textAlign: 'right', marginRight: scale(10)}}>
                배역을 삭제하려면 길게 눌러주세요.
              </Text>
              <View style={{...styles.viewScrollInner, paddingHorizontal: 0}}>
                {rolesList.map((item, index) => (
                  <View key={`position_${index}`}>
                    <View style={{...styles.viewToggleRolesArea}}>
                      <TouchableOpacity
                        style={{...styles.viewToggleArea}}
                        onPress={() => _onTogglePress(index)}
                        onLongPress={() => _onLongPress(index)}>
                        <Text style={{fontSize: scale(14), color: 'white'}}>{`모집배역 ${index + 1}`}</Text>
                        <Icon
                          name={item.isOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={scale(25)}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{...styles.viewToggleInner}}
                      pointerEvents={props.route.params.isEdit && index < Number(rolesLength) ? 'none' : 'auto'}>
                      {item.isOpend ? (
                        <View>
                          <TextInput
                            style={{...styles.inputEdit}}
                            placeholder="역할이름"
                            value={rolesList[index].positionName}
                            padding={0}
                            onChangeText={text => {
                              let tmpArr = [...rolesList];

                              tmpArr[index].positionName = text;

                              setRolesList(tmpArr);
                            }}
                            onFocus={() => setSelectedIndex(index)}
                            returnKeyType="done"
                          />

                          {/* 역할비중 */}
                          <View style={{...styles.inputEdit, borderColor: '#dddddd'}}>
                            <TouchableOpacity
                              style={{...styles.viewToggleArea}}
                              onPress={() => {
                                setSelectedIndex(index);
                                let tmpArr = [...rolesList];
                                tmpArr[index].isOpendActorTypeList = !tmpArr[index].isOpendActorTypeList;
                                setRolesList(tmpArr);
                              }}>
                              <Text
                                style={{
                                  fontSize: scale(14),
                                  color: rolesList[index].positionType.content === '' ? '#dddddd' : 'black',
                                }}>
                                {rolesList[index].positionType.content === ''
                                  ? '역할비중'
                                  : rolesList[index].positionType.content}
                                <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                              </Text>
                              <Icon
                                name={
                                  rolesList[index].isOpendActorTypeList ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                                }
                                size={scale(25)}
                                color="#e5293e"
                              />
                            </TouchableOpacity>
                            <View style={{...styles.viewVideoTypeArea}}>
                              {rolesList[index].isOpendActorTypeList &&
                                dataList.role_weight.map((d, i) => (
                                  <TouchableOpacity
                                    key={`actorTypeList_${i}`}
                                    style={{
                                      paddingVertical: scale(10),
                                      width: '49%',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}
                                    onPress={() => {
                                      let tmpArr = [...rolesList];

                                      // tmpArr[selectedIndex].positionType = d;
                                      tmpArr[index].positionType = d;
                                      tmpArr[index].isOpendActorTypeList = false;
                                      setRolesList(tmpArr);
                                    }}>
                                    <Icon
                                      name={
                                        // requestDataForm.rolesList[selectedIndex].positionType.content === d.content
                                        rolesList[index].positionType.content === d.content
                                          ? 'check-circle'
                                          : 'radio-button-unchecked'
                                      }
                                      color={
                                        // requestDataForm.rolesList[selectedIndex].positionType.content === d.content
                                        rolesList[index].positionType.content === d.content ? '#e5293e' : '#dddddd'
                                      }
                                      style={{marginRight: scale(5)}}
                                    />
                                    <Text style={{fontSize: scale(14)}}>{d.content}</Text>
                                  </TouchableOpacity>
                                ))}
                            </View>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            {/* 성별 */}
                            <View style={{...styles.inputEdit, borderColor: '#dddddd', width: '49%'}}>
                              <TouchableOpacity
                                style={{...styles.viewToggleArea}}
                                onPress={() => {
                                  setSelectedIndex(index);
                                  setIsOpend({...isOpend, sexTag: !isOpend.sexTag});
                                }}>
                                <Text
                                  style={{
                                    fontSize: scale(14),
                                    color: rolesList[index].sex === '' ? '#dddddd' : 'black',
                                  }}>
                                  {rolesList[index].sex === ''
                                    ? '성별'
                                    : rolesList[index].sex === 'M'
                                    ? '남자'
                                    : '여자'}
                                  <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                </Text>
                                <Icon
                                  name={isOpend.sexTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                  size={scale(25)}
                                  color="#e5293e"
                                />
                              </TouchableOpacity>
                            </View>

                            {/* 나이 */}
                            <View style={{...styles.inputEdit, borderColor: '#dddddd', width: '49%'}}>
                              <TouchableOpacity
                                style={{...styles.viewToggleArea}}
                                onPress={() => {
                                  setSelectedIndex(index);
                                  setIsOpend({...isOpend, ageTag: !isOpend.ageTag});
                                }}>
                                <Text
                                  style={{
                                    fontSize: scale(14),
                                    color: rolesList[index].age.content === '' ? '#dddddd' : 'black',
                                  }}>
                                  {rolesList[index].age.content === '' ? '나이' : rolesList[index].age.content}
                                  <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                </Text>
                                <Icon
                                  name={isOpend.ageTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                  size={scale(25)}
                                  color="#e5293e"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            {/* 키 */}
                            <View style={{...styles.inputEdit, borderColor: '#dddddd', width: '49%'}}>
                              <TouchableOpacity
                                style={{...styles.viewToggleArea}}
                                onPress={() => {
                                  setSelectedIndex(index);
                                  setIsOpend({...isOpend, heightTag: !isOpend.heightTag});
                                }}>
                                <Text
                                  style={{
                                    fontSize: scale(14),
                                    color: rolesList[index].height.content === '' ? '#dddddd' : 'black',
                                  }}>
                                  {rolesList[index].height.content === '' ? '키' : rolesList[index].height.content}
                                  <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                </Text>
                                <Icon
                                  name={isOpend.heightTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                  size={scale(25)}
                                  color="#e5293e"
                                />
                              </TouchableOpacity>
                            </View>

                            {/* 몸무게 */}
                            <View style={{...styles.inputEdit, borderColor: '#dddddd', width: '49%'}}>
                              <TouchableOpacity
                                style={{...styles.viewToggleArea}}
                                onPress={() => {
                                  setSelectedIndex(index);
                                  setIsOpend({...isOpend, weightTag: !isOpend.weightTag});
                                }}>
                                <Text
                                  style={{
                                    fontSize: scale(14),
                                    color: rolesList[index].weight.content === '' ? '#dddddd' : 'black',
                                  }}>
                                  {rolesList[index].weight.content === '' ? '몸무게' : rolesList[index].weight.content}
                                  <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                </Text>
                                <Icon
                                  name={isOpend.weightTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                  size={scale(25)}
                                  color="#e5293e"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {videoTypeIndex !== null &&
                            dataList.list[videoTypeIndex].detail_info_list.map(
                              (d, i) =>
                                (d.gender === 'N' || rolesList[index].sex === d.gender) && (
                                  <View key={`tagBox_${i}`}>
                                    <Text
                                      style={{
                                        fontSize: scale(12),
                                        color: '#707070',
                                        marginBottom: scale(10),
                                        fontWeight: 'bold',
                                      }}>
                                      {d.content}
                                      {d.max_choice === -1 ? '' : ` (최대 ${d.max_choice}가지)`}
                                      <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                    </Text>
                                    <ListItem
                                      bottomDivider={true}
                                      onPress={() => {
                                        let tmpArr = [...isTagOpend];
                                        if (tmpArr.includes(`${index}_${i}`)) {
                                          tmpArr.splice(tmpArr.indexOf(`${index}_${i}`), 1);
                                        } else {
                                          tmpArr.push(`${index}_${i}`);
                                        }

                                        setIsTagOpend(tmpArr);
                                      }}
                                      delayPressIn={0}
                                      underlayColor={'white'}
                                      containerStyle={{
                                        ...styles.viewListBoxContainer,
                                        flexDirection: 'column',
                                        borderColor: '#dddddd',
                                      }}>
                                      <View style={{flexDirection: 'row'}}>
                                        <ListItem.Content>
                                          <ListItem.Title
                                            style={{
                                              fontSize: scale(14),
                                              color: rolesList[index].tagList.some(
                                                e => e.detail_category_no === d.detail_category_no
                                              )
                                                ? 'black'
                                                : '#dddddd',
                                            }}>
                                            {rolesList[index].tagList.some(
                                              e => e.detail_category_no === d.detail_category_no
                                            )
                                              ? rolesList[index].tagList.map((arrData, arrIndex) =>
                                                  arrData.detail_category_no === d.detail_category_no
                                                    ? `#${arrData.content} `
                                                    : null
                                                )
                                              : d.content}
                                          </ListItem.Title>
                                        </ListItem.Content>
                                        <ListItem.Chevron
                                          name={isTagOpend.includes(i) ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                          type="material"
                                          size={scale(25)}
                                          color="#e5293e"
                                        />
                                      </View>
                                      <View
                                        style={{
                                          ...styles.viewCheckArea,
                                          paddingTop: isTagOpend.includes(i) ? scale(20) : null,
                                        }}>
                                        {isTagOpend.includes(`${index}_${i}`) &&
                                          d.detail_checkbox.map((dd, ii) => (
                                            <TouchableOpacity
                                              key={`tag_${index}${ii}`}
                                              style={{...styles.viewTagButton}}
                                              onPress={() => {
                                                setSelectedIndex(index);
                                                _onToggleTag(dd, dd.detail_category_no, d.max_choice, index);
                                              }}
                                              activeOpacity={0.9}>
                                              <Icon
                                                name={
                                                  rolesList[index].tagList.some(
                                                    e => e.detail_checkbox_no === dd.detail_checkbox_no
                                                  )
                                                    ? 'check-circle'
                                                    : 'radio-button-unchecked'
                                                }
                                                size={scale(25)}
                                                color={
                                                  rolesList[index].tagList.some(
                                                    e => e.detail_checkbox_no === dd.detail_checkbox_no
                                                  )
                                                    ? '#e5293e'
                                                    : '#dddddd'
                                                }
                                                style={{marginRight: scale(5)}}
                                              />
                                              <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                                                {dd.content}
                                              </Text>
                                            </TouchableOpacity>
                                          ))}
                                        {rolesList[index].tagList.some(
                                          e => e.detail_category_no === d.detail_category_no && e.direct_yn === true
                                        ) ? (
                                          <TextInput
                                            style={{...styles.inputEdit, width: '100%'}}
                                            placeholder="직접입력"
                                            value={
                                              rolesList[index].tagList[
                                                rolesList[index].tagList.findIndex(
                                                  e =>
                                                    e.detail_category_no === d.detail_category_no &&
                                                    e.direct_yn === true
                                                )
                                              ].direct_input
                                            }
                                            padding={0}
                                            onChangeText={text => {
                                              let tmpArr = [...rolesList];
                                              tmpArr[index].tagList[
                                                rolesList[index].tagList.findIndex(
                                                  e =>
                                                    e.detail_category_no === d.detail_category_no &&
                                                    e.direct_yn === true
                                                )
                                              ].direct_input = text;

                                              setRolesList(tmpArr);
                                            }}
                                            returnKeyType="done"
                                          />
                                        ) : null}
                                      </View>
                                    </ListItem>
                                  </View>
                                )
                            )}

                          <Text style={{marginBottom: scale(10)}}>캐릭터소개</Text>
                          <TextInput
                            style={{...styles.inputEdit, borderColor: '#dddddd', height: scale(200)}}
                            placeholder="캐릭터소개를 입력해주세요."
                            multiline={true}
                            textAlignVertical="top"
                            value={rolesList[index].positionDesc}
                            padding={0}
                            onChangeText={text => {
                              let tmpArr = [...rolesList];

                              tmpArr[index].positionDesc = text;

                              setRolesList(tmpArr);
                            }}
                            onFocus={() => setSelectedIndex(index)}
                            returnKeyType="done"
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
                <Button
                  disabled={
                    !rolesList.every(
                      e =>
                        !isEmpty(e.positionName) &&
                        !isEmpty(e.positionType.content) &&
                        !isEmpty(e.sex) &&
                        !isEmpty(e.age.content) &&
                        !isEmpty(e.height.content) &&
                        !isEmpty(e.weight.content) &&
                        dataList.list[videoTypeIndex].detail_info_list.every(item =>
                          item.gender === 'N' || item.gender === e.sex
                            ? e.tagList.some(d => d.detail_category_no === item.detail_category_no)
                            : true
                        )
                    )
                  }
                  title={props.route.params.isEdit ? '공고수정완료' : '공고등록완료'}
                  titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                  buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                  containerStyle={{paddingHorizontal: scale(15)}}
                  onPress={() => _onPostAudition()}
                />
              </View>
            </ScrollView>
          </Tab>
        </Tabs>
      </SafeAreaView>

      {/* 촬영시작 */}
      <Modal
        isVisible={isOpend.recordStart}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, recordStart: !isOpend.recordStart})}
        onBackButtonPress={() => setIsOpend({...isOpend, recordStart: !isOpend.recordStart})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
          <Text style={{textAlign: 'center', fontSize: scale(18), marginTop: scale(5)}}>촬영 시작</Text>
          <DatePicker
            date={new Date(requestDataForm.recordStartDate * 1000)}
            mode="date"
            style={{width: screenWidth}}
            onDateChange={date => {
              setRequestDataForm({...requestDataForm, recordStartDate: +new Date(date) / 1000});
            }}
            minimumDate={new Date()}
          />
        </SafeAreaView>
      </Modal>

      {/* 촬영종료 */}
      <Modal
        isVisible={isOpend.recordEnd}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, recordEnd: !isOpend.recordEnd})}
        onBackButtonPress={() => setIsOpend({...isOpend, recordEnd: !isOpend.recordEnd})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
          <Text style={{textAlign: 'center', fontSize: scale(18), marginTop: scale(5)}}>촬영 종료</Text>
          <DatePicker
            date={new Date(requestDataForm.recordEndDate * 1000)}
            mode="date"
            style={{width: screenWidth}}
            onDateChange={date => {
              setRequestDataForm({...requestDataForm, recordEndDate: +new Date(date) / 1000});
            }}
            minimumDate={new Date(requestDataForm.recordStartDate * 1000)}
          />
        </SafeAreaView>
      </Modal>

      {/* 공고마감 */}
      <Modal
        isVisible={isOpend.postEndDate}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, postEndDate: !isOpend.postEndDate})}
        onBackButtonPress={() => setIsOpend({...isOpend, postEndDate: !isOpend.postEndDate})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
          <Text style={{textAlign: 'center', fontSize: scale(18), marginTop: scale(5)}}>모집마감일</Text>
          <DatePicker
            date={new Date(requestDataForm.postEndDate * 1000)}
            mode="date"
            style={{width: screenWidth}}
            onDateChange={date => {
              setRequestDataForm({...requestDataForm, postEndDate: +new Date(date) / 1000});
            }}
            minimumDate={new Date()}
          />
        </SafeAreaView>
      </Modal>

      {/* 성별 */}
      <Modal
        isVisible={isOpend.sexTag}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, sexTag: !isOpend.sexTag})}
        onBackButtonPress={() => setIsOpend({...isOpend, sexTag: !isOpend.sexTag})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'space-evenly'}}>
            <TouchableOpacity
              style={{paddingVertical: scale(5)}}
              onPress={() => {
                let tmpArr = [...rolesList];

                tmpArr[selectedIndex].sex = 'M';

                setRolesList(tmpArr);
                setIsOpend({...isOpend, sexTag: false});
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: scale(20),
                  color: rolesList[selectedIndex].sex === 'M' ? '#e5293e' : 'black',
                }}>
                남자
              </Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={{paddingVertical: scale(5)}}
              onPress={() => {
                let tmpArr = [...rolesList];

                tmpArr[selectedIndex].sex = 'F';

                setRolesList(tmpArr);
                setIsOpend({...isOpend, sexTag: false});
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: scale(20),
                  color: rolesList[selectedIndex].sex === 'F' ? '#e5293e' : 'black',
                }}>
                여자
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 나이 */}
      <Modal
        isVisible={isOpend.ageTag}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, ageTag: !isOpend.ageTag})}
        onBackButtonPress={() => setIsOpend({...isOpend, ageTag: !isOpend.ageTag})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView>
            {dataList.age.map((item, index) => (
              <View key={`ageTag_${index}`}>
                <TouchableOpacity
                  style={{paddingVertical: scale(10)}}
                  onPress={() => {
                    let tmpArr = [...rolesList];

                    tmpArr[selectedIndex].age = item;

                    setRolesList(tmpArr);
                    setIsOpend({...isOpend, ageTag: false});
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: scale(20),
                      color: rolesList[selectedIndex].age.content === item.content ? '#e5293e' : 'black',
                    }}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
                <Divider style={{width: '80%', alignSelf: 'center'}} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 키 */}
      <Modal
        isVisible={isOpend.heightTag}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, heightTag: !isOpend.heightTag})}
        onBackButtonPress={() => setIsOpend({...isOpend, heightTag: !isOpend.heightTag})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView>
            {dataList.height.map((item, index) => (
              <View key={`heightTag_${index}`}>
                <TouchableOpacity
                  style={{paddingVertical: scale(10)}}
                  onPress={() => {
                    let tmpArr = [...rolesList];

                    tmpArr[selectedIndex].height = item;

                    setRolesList(tmpArr);
                    setIsOpend({...isOpend, heightTag: false});
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: scale(20),
                      color: rolesList[selectedIndex].height.content === item.content ? '#e5293e' : 'black',
                    }}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
                <Divider style={{width: '80%', alignSelf: 'center'}} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 몸무게 */}
      <Modal
        isVisible={isOpend.weightTag}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsOpend({...isOpend, weightTag: !isOpend.weightTag})}
        onBackButtonPress={() => setIsOpend({...isOpend, weightTag: !isOpend.weightTag})}
        coverScreen={false}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView>
            {dataList.weight.map((item, index) => (
              <View key={`weightTag_${index}`}>
                <TouchableOpacity
                  style={{paddingVertical: scale(10)}}
                  onPress={() => {
                    let tmpArr = [...rolesList];

                    tmpArr[selectedIndex].weight = item;

                    setRolesList(tmpArr);
                    setIsOpend({...isOpend, weightTag: false});
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: scale(20),
                      color: rolesList[selectedIndex].weight.content === item.content ? '#e5293e' : 'black',
                    }}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
                <Divider style={{width: '80%', alignSelf: 'center'}} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {isLoading && <LoadingIndicator />}
    </KeyboardAvoidingView>
  );
};

export default AuditionAdd;

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
  viewToggleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewToggleMainArea: {
    borderRadius: scale(5),
    borderWidth: scale(1),
    borderColor: '#dddddd',
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    marginBottom: scale(15),
  },
  viewVideoTypeArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inputEdit: {
    borderRadius: scale(5),
    borderWidth: scale(1),
    borderColor: '#e5293e',
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    marginBottom: scale(15),
    fontSize: scale(14),
  },
  viewToggleRolesArea: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    backgroundColor: '#e5293e',
  },
  viewToggleInner: {
    padding: scale(10),
    marginBottom: scale(15),
  },
  viewListBoxContainer: {
    borderRadius: scale(5),
    borderWidth: scale(1),
    borderBottomWidth: scale(1),
    borderColor: '#e5293e',
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    marginBottom: scale(15),
  },
  viewCheckArea: {
    // paddingTop: scale(20),
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewTagButton: {
    width: '49%',
    paddingBottom: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtTagLabel: {
    fontSize: scale(14),
    flex: 1,
  },
});
