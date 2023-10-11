import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
  },
});

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [toxicityModel, setToxicityModel] = useState(null);

  useEffect(() => {
    // Load the toxicity model when the component mounts
    async function loadToxicityModel() {
      try {
        await tf.ready();
        const threshold = 0.9;
        const model = await toxicity.load(threshold);
        setToxicityModel(model);
      } catch (error) {
        console.error('Error loading toxicity model:', error);
      }
    }

    loadToxicityModel();
  }, []);

  const generateText = async () => {
    if (toxicityModel) {
      const sentences = [inputText];

      try {
        const predictions = await toxicityModel.classify(sentences);

        const outputText = predictions.filter(d => d.results[0].match);
        setOutputText(JSON.stringify(outputText?.length ? outputText[0].label : 'Neutral', null, 2));
      } catch (error) {
        console.error('Error generating text:', error);
        setOutputText('Error generating text');
      }
    } else {
      setOutputText('Toxicity model is not loaded yet.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter text..."
        onChangeText={text => setInputText(text)}
        value={inputText}
      />
      <Button title="Generate Text" onPress={generateText} />
      <Text>{outputText}</Text>
    </View>
  );
}

export default function AppWrapper() {
  return <App />;
}
