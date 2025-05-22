import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Bell } from 'lucide-react-native';

export default function NotesScreen() {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Note</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.noteInput}
          placeholder="Write your note here..."
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.reminderSection}>
          <Text style={styles.sectionTitle}>Set Reminder</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Clock size={20} color="#0066cc" />
            <Text style={styles.dateButtonText}>Select Date & Time</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Note</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previousNotes}>
        <Text style={styles.sectionTitle}>Previous Notes</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteDate}>March 15, 2025</Text>
              {item === 1 && (
                <View style={styles.reminderBadge}>
                  <Bell size={16} color="#0066cc" />
                  <Text style={styles.reminderText}>Tomorrow at 2:00 PM</Text>
                </View>
              )}
            </View>
            <Text style={styles.noteText}>
              Met at TechCon 2025. Interested in collaboration on AI projects. Follow up needed on project proposal.
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  reminderSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#0066cc',
  },
  saveButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previousNotes: {
    padding: 20,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 14,
    color: '#666',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  reminderText: {
    fontSize: 12,
    color: '#0066cc',
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
  },
});