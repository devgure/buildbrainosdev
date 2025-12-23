import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';

export default function Dashboard({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ marginBottom: 12 }}>Welcome to BuildBrain mobile dashboard.</Text>
        <PrimaryButton label="Open Blueprint" onPress={() => navigation.navigate('BlueprintViewer')} />
        <View style={{ height: 12 }} />
        <PrimaryButton label="Start Safety Inspection" onPress={() => navigation.navigate('SafetyInspection')} />
        <View style={{ height: 12 }} />
        <PrimaryButton label="Open Marketplace" onPress={() => navigation.navigate('BidMarketplace')} />
      </ScrollView>
    </View>
  );
}
