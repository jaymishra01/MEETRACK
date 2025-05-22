import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CreditCard, HardDrive } from 'lucide-react-native';

export default function ProfileScreen() {
  const cardsUsed = 75; // Example value
  const storageUsed = 4.2; // Example value in GB
  const totalStorage = 10; // Total storage in GB

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Resources</Text>
      </View>

      <View style={styles.resourcesContainer}>
        <View style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <CreditCard size={24} color="#0066cc" />
            <Text style={styles.resourceTitle}>Business Cards</Text>
          </View>
          <Text style={styles.resourceCount}>{200 - cardsUsed} cards remaining</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progress, 
                { width: `${(cardsUsed / 200) * 100}%`, backgroundColor: '#0066cc' }
              ]} 
            />
          </View>
          <Text style={styles.resourceMeta}>{cardsUsed} of 200 cards used</Text>
        </View>

        <View style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <HardDrive size={24} color="#00cc88" />
            <Text style={styles.resourceTitle}>Cloud Storage</Text>
          </View>
          <Text style={styles.resourceCount}>{(totalStorage - storageUsed).toFixed(1)}GB remaining</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progress, 
                { width: `${(storageUsed / totalStorage) * 100}%`, backgroundColor: '#00cc88' }
              ]} 
            />
          </View>
          <Text style={styles.resourceMeta}>{storageUsed}GB of {totalStorage}GB used</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Next Recharge Benefits</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitText}>• 200 New Business Cards</Text>
          <Text style={styles.benefitText}>• 2GB Additional Storage</Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resourcesContainer: {
    padding: 20,
    gap: 16,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resourceCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  resourceMeta: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 12,
  },
  benefitItem: {
    gap: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#444',
  },
});