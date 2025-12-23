import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header';

export default function SafetyInspection() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Safety Inspection" />
      <View style={{ padding: 16 }}>
        <Text>Safety inspection workflow placeholder. Integrate camera + YOLO model here.</Text>
      </View>
    </View>
  );
}
