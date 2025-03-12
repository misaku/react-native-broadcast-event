import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createServiceBroadcast } from 'react-native-broadcast-event';

const [BroadcastProvider, useBroadcast] = createServiceBroadcast(
  'com.BROADCAST.action',
  ['EXTRA_BARCODE_DECODED_DATA'],
  'BROADCAST',
  'com.BROADCAST.category'
);

function Home() {
  const { data, timestamp, clear, sendBroadcast } = useBroadcast();
  const handleSimulation = async () => {
    await sendBroadcast('SUCCESS EVENT', 'EXTRA_BARCODE_DECODED_DATA');
  };

  const clearData = () => {
    clear();
  };

  return (
    <View style={styles.container}>
      <Text>{data?.EXTRA_BARCODE_DECODED_DATA || 'Aguardando Leitura'}</Text>
      <Text>{timestamp}</Text>
      <TouchableOpacity onPress={clearData}>
        <Text>CLear Data</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSimulation}>
        <Text>Simulator</Text>
      </TouchableOpacity>
    </View>
  );
}

function Three() {
  return (
    <View style={styles.container}>
      <Text>Three---[{Date.now()}]</Text>
      <Home />
    </View>
  );
}

function Two() {
  return (
    <View style={styles.container}>
      <Text>Two---[{Date.now()}]</Text>
      <Three />
    </View>
  );
}

function One() {
  return (
    <View style={styles.container}>
      <Text>One---[{Date.now()}]</Text>
      <Two />
    </View>
  );
}

export default function App() {
  return (
    <BroadcastProvider>
      <One />
    </BroadcastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
