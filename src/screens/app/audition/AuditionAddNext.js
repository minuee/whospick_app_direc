import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LayoutAnimation,
  UIManager,
} from 'react-native';

import scale from '../../../common/Scale';

import {Button, Header, Icon} from 'react-native-elements';
import Modal from 'react-native-modal';
import Toast from 'react-native-simple-toast';
import {isEmptyArr} from '../../../common/Utils';

const data = {
  actorTypeList: [
    {id: 1, name: '주연'},
    {id: 2, name: '조연'},
    {id: 3, name: '단역'},
  ],
  sexTag: [
    {id: 1, name: '남자'},
    {id: 2, name: '여자'},
  ],
  ageTag: [
    {id: 1, name: '10대'},
    {id: 2, name: '20대'},
    {id: 3, name: '30대'},
    {id: 4, name: '40대'},
    {id: 5, name: '50대'},
    {id: 6, name: '60대'},
    {id: 7, name: '70대'},
    {id: 8, name: '80대'},
  ],
  heightTag: [
    {id: 1, name: '120cm~'},
    {id: 2, name: '130cm~'},
    {id: 3, name: '140cm~'},
    {id: 4, name: '150cm~'},
    {id: 5, name: '160cm~'},
    {id: 6, name: '170cm~'},
    {id: 7, name: '180cm~'},
  ],
  weightTag: [
    {id: 1, name: '40kg~'},
    {id: 2, name: '50kg~'},
    {id: 3, name: '60kg~'},
    {id: 4, name: '70kg~'},
    {id: 5, name: '80kg~'},
    {id: 6, name: '90kg~'},
    {id: 7, name: '100kg~'},
  ],
  imageTag: [
    {id: 1, name: '학생'},
    {id: 2, name: '동안'},
    {id: 3, name: '노안'},
    {id: 4, name: '험상궃은'},
    {id: 5, name: '평범한'},
    {id: 6, name: '섹시함'},
  ],
  accentTag: [
    {id: 0, name: '없음'},
    {id: 1, name: '전라도'},
    {id: 2, name: '충청도'},
    {id: 3, name: '경상도'},
    {id: 4, name: '북한'},
    {id: 5, name: '제주도'},
    {id: 6, name: '강원도'},
    {id: 7, name: '연변'},
  ],
  languageTag: [
    {id: 0, name: '없음'},
    {id: 1, name: '영어'},
    {id: 2, name: '일본어'},
    {id: 3, name: '프랑스어'},
    {id: 4, name: '중국어'},
    {id: 5, name: '이탈리아어'},
    {id: 6, name: '러시아어'},
  ],
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AuditionAddNext = props => {
  const [dataList, setDataList] = useState(data);
  const [requestDataForm, setRequestDataForm] = useState([
    {
      positionName: '',
      positionType: {id: '', name: ''},
      sex: {id: '', name: ''},
      age: {id: '', name: ''},
      height: {id: '', name: ''},
      weight: {id: '', name: ''},
      accent: [],
      language: [],
      image: [],
      positionDesc: '',
      isOpend: true,
      customImage: '',
      customLanguage: '',
      isOpendActorTypeList: true,
      isOpendImageTag: true,
    },
  ]);
  const [isOpend, setIsOpend] = useState({
    sexTag: false,
    ageTag: false,
    heightTag: false,
    weightTag: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const _onTogglePress = index => {
    let tmpArr = [...requestDataForm];

    tmpArr[index].isOpend = !tmpArr[index].isOpend;

    setSelectedIndex(index);
    setRequestDataForm(tmpArr);
  };

  const _onLongPress = index => {
    if (requestDataForm.length === 1) {
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
          onPress: () => {
            setSelectedIndex(0);
            let tmpArr = [...requestDataForm];

            tmpArr.splice(index, 1);
            setRequestDataForm(tmpArr);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            Toast.show('삭제되었습니다.');
          },
        },
      ],
      {cancelable: false}
    );
  };

  const _onPostAudition = () => {
    props.navigation.navigate('TabAuditionDetail', {HEADER: props.route.params.sendRequestData.videoTypeDetail.name});
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
        centerComponent={{text: '오디션 공고 등록', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={{
          icon: 'ios-add',
          type: 'ionicon',
          size: scale(25),
          color: 'white',
          onPress: () => {
            let tmpArr = [...requestDataForm];

            tmpArr.push({
              positionName: '',
              positionType: {id: '', name: ''},
              sex: {id: '', name: ''},
              age: {id: '', name: ''},
              height: {id: '', name: ''},
              weight: {id: '', name: ''},
              accent: [],
              language: [],
              image: [],
              positionDesc: '',
              isOpend: true,
            });
            setSelectedIndex(tmpArr.length - 1);
            setRequestDataForm(tmpArr);

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            Toast.show('새로운 배역이 추가되었습니다.');
          },
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView>
          <View style={{...styles.viewScrollInner}}>
            {requestDataForm.map((item, index) => (
              <View key={`position_${index}`}>
                <View style={{...styles.viewToggleMainArea}}>
                  <TouchableOpacity
                    style={{...styles.viewToggleArea}}
                    onPress={() => _onTogglePress(index)}
                    onLongPress={() => _onLongPress(index)}>
                    <Text style={{fontSize: scale(14), color: 'white'}}>
                      {`모집배역 ${index + 1}`}
                      {/* <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text> */}
                    </Text>
                    <Icon
                      name={item.isOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={scale(25)}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <View style={{...styles.viewToggleInner}}>
                  {item.isOpend ? (
                    <View>
                      <TextInput
                        style={{...styles.inputEdit}}
                        placeholder="역할이름"
                        value={requestDataForm[index].positionName}
                        padding={0}
                        onChangeText={text => {
                          let tmpArr = [...requestDataForm];

                          tmpArr[index].positionName = text;

                          setRequestDataForm(tmpArr);
                        }}
                        onFocus={() => setSelectedIndex(index)}
                        returnKeyType="done"
                      />
                      <View style={{...styles.inputEdit, borderColor: '#dddddd'}}>
                        <TouchableOpacity
                          style={{...styles.viewToggleArea}}
                          onPress={() => {
                            setSelectedIndex(index);
                            let tmpArr = [...requestDataForm];
                            tmpArr[index].isOpendActorTypeList = !tmpArr[index].isOpendActorTypeList;
                            setRequestDataForm(tmpArr);
                          }}>
                          <Text style={{fontSize: scale(14)}}>
                            {requestDataForm[index].positionType.name === ''
                              ? '역할비중'
                              : requestDataForm[index].positionType.name}
                            <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                          </Text>
                          <Icon
                            name={
                              requestDataForm[index].isOpendActorTypeList ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                            }
                            size={scale(25)}
                            color="#e5293e"
                          />
                        </TouchableOpacity>
                        <View style={{...styles.viewVideoTypeArea}}>
                          {requestDataForm[index].isOpendActorTypeList &&
                            dataList.actorTypeList.map((d, i) => (
                              <TouchableOpacity
                                key={`actorTypeList_${i}`}
                                style={{
                                  paddingVertical: scale(10),
                                  width: '49%',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                onPress={() => {
                                  let tmpArr = [...requestDataForm];

                                  tmpArr[selectedIndex].positionType = d;
                                  tmpArr[index].isOpendActorTypeList = false;
                                  setRequestDataForm(tmpArr);
                                }}>
                                <Icon
                                  name={
                                    requestDataForm[selectedIndex].positionType.name === d.name
                                      ? 'check-circle'
                                      : 'radio-button-unchecked'
                                  }
                                  color={
                                    requestDataForm[selectedIndex].positionType.name === d.name ? '#e5293e' : '#dddddd'
                                  }
                                  style={{marginRight: scale(5)}}
                                />
                                <Text style={{fontSize: scale(14)}}>{d.name}</Text>
                              </TouchableOpacity>
                            ))}
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
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
                                color: requestDataForm[index].sex.name === '' ? '#dddddd' : 'black',
                              }}>
                              {requestDataForm[index].sex.name === '' ? '성별' : requestDataForm[index].sex.name}
                              <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                            </Text>
                            <Icon
                              name={isOpend.sexTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                              size={scale(25)}
                              color="#e5293e"
                            />
                          </TouchableOpacity>
                        </View>
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
                                color: requestDataForm[index].age.name === '' ? '#dddddd' : 'black',
                              }}>
                              {requestDataForm[index].age.name === '' ? '나이' : requestDataForm[index].age.name}
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
                                color: requestDataForm[index].height.name === '' ? '#dddddd' : 'black',
                              }}>
                              {requestDataForm[index].height.name === '' ? '키' : requestDataForm[index].height.name}
                              <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                            </Text>
                            <Icon
                              name={isOpend.heightTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                              size={scale(25)}
                              color="#e5293e"
                            />
                          </TouchableOpacity>
                        </View>
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
                                color: requestDataForm[index].weight.name === '' ? '#dddddd' : 'black',
                              }}>
                              {requestDataForm[index].weight.name === ''
                                ? '몸무게'
                                : requestDataForm[index].weight.name}
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
                      <View style={{...styles.inputEdit, borderColor: '#dddddd'}}>
                        <TouchableOpacity
                          style={{...styles.viewToggleArea}}
                          onPress={() => {
                            setSelectedIndex(index);
                            let tmpArr = [...requestDataForm];
                            tmpArr[index].isOpendImageTag = !tmpArr[index].isOpendImageTag;
                            setRequestDataForm(tmpArr);
                          }}>
                          <Text style={{fontSize: scale(14)}}>
                            {isEmptyArr(requestDataForm[index].image)
                              ? '이미지'
                              : requestDataForm[index].image.map((d, i) =>
                                  i === requestDataForm[index].image.length - 1
                                    ? d.name === undefined
                                      ? requestDataForm[index].customImage
                                      : `${d.name}`
                                    : d.name === undefined
                                    ? `${requestDataForm[index].customImage}, `
                                    : `${d.name}, `
                                )}
                            <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}>
                              {' * '}
                              {isEmptyArr(requestDataForm[index].image) ? (
                                <Text style={{fontSize: scale(12), color: '#dddddd', fontWeight: 'normal'}}>
                                  최대 5가지 선택
                                </Text>
                              ) : null}
                            </Text>
                          </Text>
                          <Icon
                            name={requestDataForm[index].isOpendImageTag ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={scale(25)}
                            color="#e5293e"
                          />
                        </TouchableOpacity>
                        <View style={{...styles.viewVideoTypeArea}}>
                          {requestDataForm[index].isOpendImageTag &&
                            dataList.imageTag.map((d, i) => (
                              <TouchableOpacity
                                key={`imageTag_${i}`}
                                style={{
                                  paddingVertical: scale(10),
                                  width: '49%',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                onPress={() => {
                                  let tmpArr = [...requestDataForm];

                                  if (tmpArr[index].image.includes(d)) {
                                    tmpArr[index].image.splice(tmpArr[index].image.indexOf(d), 1);
                                  } else {
                                    if (tmpArr[index].image.length === 5) {
                                      return null;
                                    }
                                    tmpArr[index].image.push(d);
                                  }

                                  setRequestDataForm(tmpArr);
                                }}>
                                <Icon
                                  name={
                                    requestDataForm[index].image.indexOf(d) > -1
                                      ? 'check-circle'
                                      : 'radio-button-unchecked'
                                  }
                                  color={requestDataForm[index].image.indexOf(d) > -1 ? '#e5293e' : '#dddddd'}
                                  style={{marginRight: scale(5)}}
                                />
                                <Text style={{fontSize: scale(14)}}>{d.name}</Text>
                              </TouchableOpacity>
                            ))}
                          {requestDataForm[index].isOpendImageTag && (
                            <TouchableOpacity
                              key={`imageTag_${999}`}
                              style={{
                                paddingVertical: scale(10),
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                let tmpArr = [...requestDataForm];

                                if (tmpArr[index].image.includes('customImage')) {
                                  tmpArr[index].image.splice(tmpArr[index].image.indexOf('customImage'), 1);
                                } else {
                                  if (tmpArr[index].image.length === 5) {
                                    return null;
                                  }
                                  tmpArr[index].image.push('customImage');
                                }

                                setRequestDataForm(tmpArr);
                              }}>
                              <Icon
                                name={
                                  requestDataForm[index].image.includes('customImage')
                                    ? 'check-circle'
                                    : 'radio-button-unchecked'
                                }
                                color={requestDataForm[index].image.includes('customImage') ? '#e5293e' : '#dddddd'}
                                style={{marginRight: scale(5)}}
                              />
                              <Text style={{fontSize: scale(14)}}>직접입력</Text>
                            </TouchableOpacity>
                          )}
                          {requestDataForm[index].isOpendImageTag &&
                          requestDataForm[index].image.includes('customImage') ? (
                            <TextInput
                              style={{...styles.inputEdit, flex: 1}}
                              placeholder="직접입력"
                              value={requestDataForm[index].customImage}
                              padding={0}
                              onChangeText={text => {
                                let tmpArr = [...requestDataForm];

                                tmpArr[index].customImage = text;
                                setRequestDataForm(tmpArr);
                              }}
                              returnKeyType="done"
                            />
                          ) : null}
                        </View>
                      </View>
                      <Text style={{marginBottom: scale(10)}}>캐릭터소개</Text>
                      <TextInput
                        style={{...styles.inputEdit, borderColor: '#dddddd', height: scale(200)}}
                        placeholder="캐릭터소개를 입력해주세요."
                        multiline={true}
                        textAlignVertical="top"
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
            <Button
              title="공고등록완료"
              titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
              buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
              containerStyle={{paddingHorizontal: scale(15)}}
              onPress={() => _onPostAudition()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
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
          {/* <TouchableOpacity onPress={() => setIsOpend({...isOpend, sexTag: !isOpend.sexTag})}>
            <Text
              style={{
                fontSize: scale(17),
                color: '#007AFF',
                textAlign: 'right',
                marginRight: scale(15),
                marginTop: scale(15),
              }}>
              완료
            </Text>
          </TouchableOpacity> */}
          <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'space-evenly'}}>
            {dataList.sexTag.map((item, index) => (
              <TouchableOpacity
                key={`sexTag_${index}`}
                style={{marginVertical: scale(5)}}
                onPress={() => {
                  let tmpArr = [...requestDataForm];

                  tmpArr[selectedIndex].sex = item;

                  setRequestDataForm(tmpArr);
                  setIsOpend({...isOpend, sexTag: false});
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: scale(20),
                    color: requestDataForm[selectedIndex].sex.name === item.name ? '#e5293e' : 'black',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
          {/* <TouchableOpacity onPress={() => setIsOpend({...isOpend, ageTag: !isOpend.ageTag})}>
            <Text
              style={{
                fontSize: scale(17),
                color: '#007AFF',
                textAlign: 'right',
                marginRight: scale(15),
                marginTop: scale(15),
              }}>
              완료
            </Text>
          </TouchableOpacity> */}
          <ScrollView>
            {dataList.ageTag.map((item, index) => (
              <TouchableOpacity
                key={`ageTag_${index}`}
                style={{marginVertical: scale(10)}}
                onPress={() => {
                  let tmpArr = [...requestDataForm];

                  tmpArr[selectedIndex].age = item;

                  setRequestDataForm(tmpArr);
                  setIsOpend({...isOpend, ageTag: false});
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: scale(20),
                    color: requestDataForm[selectedIndex].age.name === item.name ? '#e5293e' : 'black',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
          {/* <TouchableOpacity onPress={() => setIsOpend({...isOpend, heightTag: !isOpend.heightTag})}>
            <Text
              style={{
                fontSize: scale(17),
                color: '#007AFF',
                textAlign: 'right',
                marginRight: scale(15),
                marginTop: scale(15),
              }}>
              완료
            </Text>
          </TouchableOpacity> */}
          <ScrollView>
            {dataList.heightTag.map((item, index) => (
              <TouchableOpacity
                key={`heightTag_${index}`}
                style={{marginVertical: scale(10)}}
                onPress={() => {
                  let tmpArr = [...requestDataForm];

                  tmpArr[selectedIndex].height = item;

                  setRequestDataForm(tmpArr);
                  setIsOpend({...isOpend, heightTag: false});
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: scale(20),
                    color: requestDataForm[selectedIndex].height.name === item.name ? '#e5293e' : 'black',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
          {/* <TouchableOpacity onPress={() => setIsOpend({...isOpend, weightTag: !isOpend.weightTag})}>
            <Text
              style={{
                fontSize: scale(17),
                color: '#007AFF',
                textAlign: 'right',
                marginRight: scale(15),
                marginTop: scale(15),
              }}>
              완료
            </Text>
          </TouchableOpacity> */}
          <ScrollView>
            {dataList.weightTag.map((item, index) => (
              <TouchableOpacity
                key={`weightTag_${index}`}
                style={{marginVertical: scale(10)}}
                onPress={() => {
                  let tmpArr = [...requestDataForm];

                  tmpArr[selectedIndex].weight = item;

                  setRequestDataForm(tmpArr);
                  setIsOpend({...isOpend, weightTag: false});
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: scale(20),
                    color: requestDataForm[selectedIndex].weight.name === item.name ? '#e5293e' : 'black',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AuditionAddNext;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewScrollInner: {
    paddingVertical: scale(15),
  },
  viewToggleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewToggleMainArea: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    backgroundColor: '#e5293e',
  },
  viewToggleInner: {
    padding: scale(10),
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
});
