import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CarCard from './components/CarCard';
import BookingForm from './components/BookingForm';
import cars from './data/cars';

const initialBooking = {
  name: '',
  email: '',
  pickUp: '',
  dropOff: '',
  days: '1',
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  const [booking, setBooking] = useState(initialBooking);
  const [message, setMessage] = useState('');
  const [activeType, setActiveType] = useState('All');

  const carTypes = useMemo(() => ['All', ...new Set(cars.map((car) => car.type))], []);
  const filteredCars = activeType === 'All' ? cars : cars.filter((car) => car.type === activeType);

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setScreen('details');
    setMessage('');
  };

  const handleChangeBooking = (field, value) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmBooking = () => {
    if (!booking.name || !booking.email || !booking.pickUp || !booking.dropOff || !booking.days) {
      setMessage('Por favor completa todos los campos de reserva.');
      return;
    }

    setMessage(`Reserva confirmada: ${booking.name} ha reservado ${selectedCar.name} por ${booking.days} día(s).`);
    setBooking(initialBooking);
    setSelectedCar(null);
    setScreen('home');
  };

  const renderHome = () => (
    <>
      <Text style={styles.title}>Rent a Car AB</Text>
      <Text style={styles.subtitle}>Selecciona tu vehículo ideal y reserva en minutos.</Text>

      <View style={styles.filterRow}>
        {carTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, activeType === type && styles.filterButtonActive]}
            onPress={() => setActiveType(type)}
          >
            <Text style={[styles.filterText, activeType === type && styles.filterTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredCars.map((car) => (
        <CarCard key={car.id} car={car} onPress={() => handleSelectCar(car)} />
      ))}
    </>
  );

  const renderDetails = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setScreen('home')}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{selectedCar.name}</Text>
      <Text style={styles.subtitle}>{selectedCar.brand}</Text>

      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>Tipo: {selectedCar.type}</Text>
        <Text style={styles.detailText}>Precio: ${selectedCar.pricePerDay}/día</Text>
        <Text style={styles.detailText}>Asientos: {selectedCar.seats}</Text>
        <Text style={styles.detailText}>Maletero: {selectedCar.luggage}</Text>
        <Text style={styles.detailText}>Combustible: {selectedCar.fuel}</Text>
        <Text style={styles.detailDescription}>{selectedCar.description}</Text>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={() => setScreen('booking')}>
        <Text style={styles.buttonText}>Reservar ahora</Text>
      </TouchableOpacity>
    </>
  );

  const renderBooking = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setScreen('details')}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Formulario de reserva</Text>
      <BookingForm
        car={selectedCar}
        booking={booking}
        onChange={handleChangeBooking}
        onSubmit={handleConfirmBooking}
        onCancel={() => setScreen('details')}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {screen === 'home' && renderHome()}
        {screen === 'details' && selectedCar && renderDetails()}
        {screen === 'booking' && selectedCar && renderBooking()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Proyecto de Rent a Car con React Native / Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#14213D',
    marginBottom: 6,
  },
  subtitle: {
    color: '#444',
    marginBottom: 18,
    lineHeight: 22,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#B0C4DE',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  filterButtonActive: {
    backgroundColor: '#1F4B8B',
    borderColor: '#1F4B8B',
  },
  filterText: {
    color: '#1F4B8B',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#1F4B8B',
    fontWeight: '600',
  },
  cardDetails: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  detailText: {
    color: '#333',
    marginBottom: 8,
    fontSize: 16,
  },
  detailDescription: {
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#1F4B8B',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    backgroundColor: '#E7F5FF',
    color: '#003366',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
  },
});
