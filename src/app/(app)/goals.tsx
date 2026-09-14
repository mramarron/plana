import { StyleSheet, Text, View } from 'react-native';


const goals = [
  { label: 'Emergency fund', progress: 74, amount: '$7,400 / $10k', tone: '#5B8DEF' },
  { label: 'Travel fund', progress: 46, amount: '$2,300 / $5k', tone: '#22C55E' },
];

export default function GoalsScreen() {
 
   return (
     <View style={[styles.container,]}>
       <Text style={styles.title}>Goals</Text>
     </View>
   );
 }
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
   },
   title: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#ccc',
     textAlign: 'center',
   }});