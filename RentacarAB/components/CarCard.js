import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CarCard({ car, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{car.name}</Text>
          <Text style={styles.subtitle}>{car.brand} • {car.type}</Text>
        </View>
        <Text style={styles.price}>${car.pricePerDay}/día</Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featureText}>{car.seats} asientos</Text>
        <Text style={styles.featureText}>{car.luggage} maletas</Text>
        <Text style={styles.featureText}>{car.fuel}</Text>
      </View>
      <Text style={styles.description}>{car.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  price: {
    fontWeight: '700',
    color: '#1F4B8B',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featureText: {
    color: '#555',
    fontSize: 13,
  },
  description: {
    color: '#444',
    lineHeight: 20,
  },
});
