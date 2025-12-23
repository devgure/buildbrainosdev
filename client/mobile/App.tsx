import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './screens/Dashboard';
import BlueprintViewer from './screens/BlueprintViewer';
import SafetyInspection from './screens/SafetyInspection';
import BidMarketplace from './screens/BidMarketplace';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="BlueprintViewer" component={BlueprintViewer} />
        <Stack.Screen name="SafetyInspection" component={SafetyInspection} />
        <Stack.Screen name="BidMarketplace" component={BidMarketplace} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BuildBrain Mobile (MVP Stub)</Text>
      <Text>Superintendent co-pilot, offline-first, geofencing coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 }
});
