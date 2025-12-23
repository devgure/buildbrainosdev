import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header({ title = 'BuildBrain' }: { title?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#0b5cff' },
  title: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
