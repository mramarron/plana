import { StyleSheet, Text, View } from 'react-native';


const rows = [
  { label: 'Salary', amount: '+$2,100', tone: '#22C55E' },
  { label: 'Rent', amount: '-$1,450', tone: '#5B8DEF' },
  { label: 'Groceries', amount: '-$420', tone: '#F59E0B' },
  { label: 'Freelance', amount: '+$780', tone: '#22C55E' },
];

export default function TransactionsScreen() {
 return (
      <View style={[styles.container,]}>
        <Text style={styles.title}>Transactions</Text>
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