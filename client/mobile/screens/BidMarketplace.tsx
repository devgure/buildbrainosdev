import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header';

export default function BidMarketplace() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Bid Marketplace" />
      <View style={{ padding: 16 }}>
        <Text>Bid marketplace placeholder. List projects and submit bids here.</Text>
      </View>
    </View>
  );
}
