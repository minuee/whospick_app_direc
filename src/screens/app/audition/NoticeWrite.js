import React, {useContext, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject, IMAGE_URL} from '../../../common/API';

import {Button, Divider, Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import Modal from 'react-native-modal';
import DocumentPicker from 'react-native-document-picker';
import {Storage} from '@psyrenpark/storage';

import LoadingContext from '../../../Context/LoadingContext';
import {isEmpty} from '../../../common/Utils';
import LoadingIndicator from '../../../Component/LoadingIndicator';

const NoticeWrite = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const [requestData, setRequestData] = useState({
    title: '',
    body: '',
    file: '',
  });

  const [inputFileName, setInputFileName] = useState('');

  const [noticeType, setNoticeType] = useState({
    audition_notice_level: '',
    content: '',
  });

  const [dataList, setDataList] = useState({list: []});

  const [isModalOpend, setIsModalOpend] = useState(false);

  const _applyAuditionNotice = async () => {
    try {
      if (!isEmpty(inputFileName)) {
        const fileUploadResult = await apiObject.fileUpload(
          {
            url: requestData.file,
          },
          loading => setIsLoading(loading)
        );
        console.log('_applyAuditionNotice -> fileUploadResult: ', fileUploadResult.file_no);

        await apiObject.applyAuditionNotice({
          audition_no: props.route.params.audition_no,
          title: requestData.title,
          content: requestData.body,
          audition_notice_level: noticeType.audition_notice_level,
          file_no: fileUploadResult.file_no,
        });
      } else {
        await apiObject.applyAuditionNotice({
          audition_no: props.route.params.audition_no,
          title: requestData.title,
          content: requestData.body,
          audition_notice_level: noticeType.audition_notice_level,
          file_no: null,
        });
      }

      Toast.showWithGravity('오디션 공지사항을 등록했습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack();
    } catch (error) {
      console.log('_applyAuditionNotice -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _editAuditionNotice = async () => {
    try {
      if (!isEmpty(inputFileName)) {
        const fileUploadResult = await apiObject.fileUpload(
          {
            url: requestData.file,
          },
          loading => setIsLoading(loading)
        );
        console.log('_applyAuditionNotice -> fileUploadResult: ', fileUploadResult.file_no);
        await apiObject.editAuditionNotice({
          audition_notice_no: props.route.params.info.audition_notice_no,
          title: requestData.title,
          content: requestData.body,
          audition_notice_level: noticeType.audition_notice_level,
          file_no: fileUploadResult.file_no,
        });
      } else {
        await apiObject.editAuditionNotice({
          audition_notice_no: props.route.params.info.audition_notice_no,
          title: requestData.title,
          content: requestData.body,
          audition_notice_level: noticeType.audition_notice_level,
          file_no: null,
        });
      }
      Toast.showWithGravity('오디션 공지사항을 수정했습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack();
    } catch (error) {
      console.log('_editAuditionNotice -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onWritePress = () => {
    if (props.route.params.isEdit) {
      _editAuditionNotice();
    } else {
      _applyAuditionNotice();
    }
  };

  const _getAuditionNoticeCate = async () => {
    try {
      const apiResult = await apiObject.getAuditionNoticeCate(loading => setIsLoading(loading));

      setDataList(apiResult);

      if (props.route.params.isEdit) {
        setRequestData({
          title: props.route.params.info.title,
          body: props.route.params.info.content,
          file: isEmpty(props.route.params.info.file_url) ? '' : props.route.params.info.file_url,
        });
        !isEmpty(props.route.params.info.file_url) &&
          setInputFileName(
            String(props.route.params.info.file_url).split('/')[
              String(props.route.params.info.file_url).split('/').length - 1
            ]
          );
        for (let i = 0; i < apiResult.list.length; i++) {
          if (apiResult.list[i].audition_notice_level === props.route.params.info.audition_notice_level) {
            setNoticeType(apiResult.list[i]);
            break;
          }
        }
      }
    } catch (error) {
      console.log('_getAuditionNoticeCate -> error', error);
    }
  };
  console.log(inputFileName);

  const _onDocumentPicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const result = await fetch(res.uri);
      const blob = await result.blob();
      let fileName = blob._data.name;
      let now_timestamp = Math.floor(new Date().getTime() / 1000);

      const storageUrl = await Storage.put(
        {
          key: `notice/${props.route.params.audition_no}/${now_timestamp}/${fileName}`,
          object: blob,
          // config: {
          //   contentType: 'image',
          // },
        },
        loading => setIsLoading(loading)
      );
      console.log(storageUrl);

      setRequestData({...requestData, file: `${IMAGE_URL}${storageUrl.key}`});
      setInputFileName(fileName);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        Alert.alert(
          '[안내]',
          '파일을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
          [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
          {cancelable: false}
        );
        console.log(err);
      }
    }
  };

  useEffect(() => {
    _getAuditionNoticeCate();
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
        centerComponent={{
          text: props.route.params.isEdit ? '공지사항수정' : '공지사항등록',
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView>
          <View style={{...styles.viewInner}}>
            <Text>공개범위</Text>
            <TouchableOpacity
              style={{
                ...styles.viewInputArea,
                marginTop: scale(10),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onPress={() => setIsModalOpend(true)}>
              <Text>{isEmpty(noticeType.content) ? '범위를 선택하세요.' : noticeType.content}</Text>
              <Icon name={'keyboard-arrow-down'} size={scale(25)} color="#e5293e" />
            </TouchableOpacity>
            <Text>제목</Text>
            <View style={{...styles.viewInputArea, marginTop: scale(10)}}>
              <TextInput
                placeholder="공지사항 제목"
                padding={0}
                style={{fontSize: scale(14)}}
                value={requestData.title}
                onChangeText={text => setRequestData({...requestData, title: text})}
                maxLength={30}
              />
            </View>
            <Text>내용</Text>
            <View style={{...styles.viewInputArea, height: scale(300), marginTop: scale(10)}}>
              <TextInput
                multiline={true}
                placeholder="내용을 입력하세요."
                style={{fontSize: scale(14), flex: 1}}
                textAlignVertical="top"
                padding={0}
                value={requestData.body}
                onChangeText={text => setRequestData({...requestData, body: text})}
              />
            </View>
            <Text>첨부파일</Text>
            <TouchableOpacity
              delayPressIn={0}
              style={{
                ...styles.viewInputArea,
                marginTop: scale(10),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={_onDocumentPicker}>
              {isEmpty(inputFileName) ? (
                <Text style={{color: '#dddddd'}}>파일을 첨부해주세요.</Text>
              ) : (
                <Text style={{color: '#222222'}}>{inputFileName}</Text>
              )}
              <Icon name="ios-attach" type="ionicon" color="#dddddd" />
            </TouchableOpacity>
            <Button
              disabled={!(!isEmpty(requestData.title) && !isEmpty(requestData.body) && !isEmpty(noticeType.content))}
              title={props.route.params.isEdit ? '수정완료' : '등록완료'}
              titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
              buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
              onPress={() => _onWritePress()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        isVisible={isModalOpend}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsModalOpend(false)}
        onBackButtonPress={() => setIsModalOpend(false)}
        style={{justifyContent: 'flex-end', margin: 0}}
        statusBarTranslucent={true}>
        <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
          <ScrollView>
            {dataList.list.map((item, index) => (
              <View key={`noticeCate_${index}`}>
                <TouchableOpacity
                  style={{paddingVertical: scale(10)}}
                  onPress={() => {
                    setNoticeType(item);
                    setIsModalOpend(false);
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: scale(20),
                      color: noticeType.content === item.content ? '#e5293e' : 'black',
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

export default NoticeWrite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(25),
  },
  viewInputArea: {
    borderRadius: scale(3),
    borderWidth: scale(1),
    borderColor: '#dddddd',
    marginBottom: scale(20),
    padding: scale(10),
  },
});
