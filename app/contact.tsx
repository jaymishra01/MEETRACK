import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, MapPin, Globe, Building } from 'lucide-react-native';

export default function ContactScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Contact Details</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.contactItem}>
          <Building size={20} color="#666" />
          <View style={styles.contactInfo}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>TechCorp Industries</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Mail size={20} color="#666" />
          <View style={styles.contactInfo}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>john.doe@techcorp.com</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Phone size={20} color="#666" />
          <View style={styles.contactInfo}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>+1 (555) 123-4567</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <MapPin size={20} color="#666" />
          <View style={styles.contactInfo}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>123 Tech Street, San Francisco, CA 94105</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Globe size={20} color="#666" />
          <View style={styles.contactInfo}>
            <Text style={styles.label}>Website</Text>
            <Text style={styles.value}>www.techcorp.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meeting History</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.meetingCard}>
            <Text style={styles.meetingTitle}>TechCon 2025</Text>
            <Text style={styles.meetingDate}>March 15, 2025</Text>
            <Text style={styles.meetingLocation}>San Francisco Convention Center</Text>
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
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  meetingCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#666',
  },
});