import React, {useState} from 'react';
import UserTokenContext from '../Context/UserTokenContext';

// import * as Keychain from 'react-native-keychain';

const UserTokenProvider = ({children}) => {
  const setIsSessionAlive = bool => {
    setUser(prevState => {
      return {
        ...prevState,
        isSessionAlive: bool,
      };
    });
  };

  const setUserInfo = data => {
    setUser(prevState => {
      return {
        ...prevState,
        ...data,
      };
    });
  };

  const resetUserInfo = async () => {
    // await Keychain.resetInternetCredentials('auth').then(setUser(initialState));
    setUser(initialState);
  };

  const initialState = {
    isSessionAlive: false,
    userEmail: '',
    userImage: '',
    userImageNo: '',
    userName: '',
    userPhone: '',
    isActor: false,
    isDirector: false,
    userPoint: 0,
    userCode: '',
    haveProfile: false,
    isNewPush: false,
    passDirectorAuth: false,
    actorFilter: {
      videoType: {id: '', name: ''},
      actorType: {id: '', name: ''},
      sex: {id: '', name: ''},
      actorAge: {min: 1, max: 90},
      actorHeight: {min: 100, max: 200},
      imageTag: [],
      accentTag: [],
      languageTag: [],
      genreTag: [],
    },
    setIsSessionAlive,
    setUserInfo,
    resetUserInfo,
  };

  const [user, setUser] = useState(initialState);

  return <UserTokenContext.Provider value={user}>{children}</UserTokenContext.Provider>;
};

export default UserTokenProvider;
