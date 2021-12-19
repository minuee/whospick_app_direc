import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

const EditProfile = ({parentsProps}) => {
  return (
    <View style={{...styles.container}}>
      <SafeAreaView style={{...styles.contents}}>
        <Text>Asdfasdf</Text>
      </SafeAreaView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
});
