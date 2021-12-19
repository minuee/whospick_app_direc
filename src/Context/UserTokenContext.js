import {createContext} from 'react';

const UserTokenContext = createContext({
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
  setIsSessionAlive: () => {},
  setUserInfo: () => {},
  resetUserInfo: () => {},
});

export default UserTokenContext;
