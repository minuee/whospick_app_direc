import React, {useContext} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native';

import scale from '../../../common/Scale';

import {Icon, ListItem, Avatar, Accessory} from 'react-native-elements';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';

import UserTokenContext from '../../../Context/UserTokenContext';
import {isEmpty, replaceEmail} from '../../../common/Utils';

import {Auth, AuthType} from '@psyrenpark/auth';

const CustomDrawer = props => {
  const {resetUserInfo, userEmail, userImage, userName} = useContext(UserTokenContext);

  const _signOutPress = async () => {
    Auth.signOutProcess(
      {
        authType: AuthType.EMAIL,
      },
      async success => {
        resetUserInfo();
      },
      error => {
        console.log('_signOutPress -> error', error);
      },
      loading => {}
    );
  };

  return (
    <View style={{...styles.drawerView}}>
      <View style={{...styles.drawerView__CloseView}}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.toggleDrawer();
            _signOutPress();
          }}>
          <Text style={{...styles.closeView__SignOut}}>๋ก๊ทธ์์</Text>
        </TouchableOpacity>
        <Icon
          name="close"
          style={{...styles.closeView__Close}}
          size={scale(25)}
          color="white"
          onPress={() => props.navigation.toggleDrawer()}
        />
      </View>
      <ListItem bottomDivider={true} containerStyle={{backgroundColor: '#e5293e'}}>
        <Avatar
          source={
            isEmpty(userImage) ? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: userImage}
          }
          size={scale(50)}
          rounded={true}>
          <Accessory
            size={scale(21)}
            onPress={() => props.navigation.navigate('EditUserInfo')}
            underlayColor={'rgba(0, 0, 0, .3)'}
          />
        </Avatar>
        <ListItem.Content>
          <ListItem.Title style={{fontSize: scale(14), color: 'white'}}>{`${userName}๋`}</ListItem.Title>
          <ListItem.Subtitle style={{fontSize: scale(11), color: 'white'}}>{`${replaceEmail(
            userEmail
          )}`}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ScrollView style={{...styles.drawerView__MenuView}}>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('ActorFavorite')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-heart-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>์ฐํ๋ฐฐ์ฐ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('ActorReview')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-star-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>ํ๊ฐ์์ฒญํ์ธ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('Notification')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-notifications-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>์๋ฆผํ์ธ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('QnA')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-headset-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>1:1 ๊ณ?๊ฐ๋ฌธ์</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('FAQ')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-help-circle-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>FAQ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('Notice')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-volume-low-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>๊ณต์ง์ฌํญ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('TOS')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-document-text-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>์ด์ฉ์ฝ๊ด</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          bottomDivider={true}
          containerStyle={{paddingVertical: scale(20)}}
          onPress={() => props.navigation.navigate('PP')}
          delayPressIn={0}>
          <ListItem.Chevron name="ios-document-text-outline" type="ionicon" size={scale(20)} color="#888888" />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>๊ฐ์ธ์?๋ณด์ฒ๋ฆฌ๋ฐฉ์นจ</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </ScrollView>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  drawerView: {
    backgroundColor: '#e5293e',
    flex: 1,
    paddingTop: getStatusBarHeight(),
  },
  containerDrawer: {margin: 0, marginRight: '30%'},
  drawerView__CloseView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(15),
  },
  drawerView__MenuView: {flex: 1, backgroundColor: 'white'},
  closeView__SignOut: {
    fontSize: scale(12),
    color: 'white',
  },
  avatarView: {
    padding: scale(15),
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
