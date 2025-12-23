import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header';

export default function BlueprintViewer() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Blueprint Viewer" />
      <View style={{ padding: 16 }}>
        <Text>Blueprint viewer placeholder. Integrate PDF/MinIO retrieval here.</Text>
      </View>
    </View>
  );
}
