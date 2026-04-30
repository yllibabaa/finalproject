import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookingForm({ car, booking, onChange, onSubmit, onCancel }) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Reserva {car.name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={booking.name}
        onChangeText={(text) => onChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={booking.email}
        onChangeText={(text) => onChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Lugar de recogida"
        value={booking.pickUp}
        onChangeText={(text) => onChange('pickUp', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Lugar de entrega"
        value={booking.dropOff}
        onChangeText={(text) => onChange('dropOff', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Días de alquiler"
        keyboardType="numeric"
        value={booking.days}
        onChangeText={(text) => onChange('days', text)}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={onSubmit}>
        <Text style={styles.buttonText}>Confirmar reserva</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 16,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    color: '#111',
  },
  confirmButton: {
    backgroundColor: '#1F4B8B',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#1F4B8B',
    fontWeight: '700',
  },
});
