import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { CreditCard, Receipt, TrendingUp, ChartPie } from 'lucide-react-native';

export default function FinanceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Overview</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.totalAmount}>₹12,450</Text>
          <Text style={styles.totalLabel}>Total Expenditure</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity style={[styles.periodButton, styles.activePeriod]}>
              <Text style={styles.activePeriodText}>This Year</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>Last Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Link href="/finance/transactions" asChild>
            <TouchableOpacity style={styles.statCard}>
              <CreditCard size={24} color="#0066cc" />
              <Text style={styles.statAmount}>₹8,250</Text>
              <Text style={styles.statLabel}>Card Expenses</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.statCard}>
            <Receipt size={24} color="#0066cc" />
            <Text style={styles.statAmount}>₹2,840</Text>
            <Text style={styles.statLabel}>GST Returns</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#0066cc" />
            <Text style={styles.statAmount}>18.5%</Text>
            <Text style={styles.statLabel}>Growth Rate</Text>
          </View>
        </View>

        {/* Rest of your existing code... */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
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
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activePeriod: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodText: {
    color: '#666',
  },
  activePeriodText: {
    color: '#0066cc',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});