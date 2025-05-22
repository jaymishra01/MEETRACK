import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ArrowLeft, CreditCard, Receipt, TrendingUp, ChartPie } from 'lucide-react-native';

export default function FinanceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href=".." asChild>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        </Link>
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
          <View style={styles.statCard}>
            <CreditCard size={24} color="#0066cc" />
            <Text style={styles.statAmount}>₹8,250</Text>
            <Text style={styles.statLabel}>Card Expenses</Text>
          </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {[
            {
              title: 'Tech Conference 2025',
              amount: '₹2,500',
              date: 'Mar 15, 2025',
              type: 'Conference'
            },
            {
              title: 'Business Dinner',
              amount: '₹180',
              date: 'Mar 12, 2025',
              type: 'Entertainment'
            },
            {
              title: 'Office Supplies',
              amount: '₹350',
              date: 'Mar 10, 2025',
              type: 'Equipment'
            }
          ].map((transaction, index) => (
            <View key={index} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionMeta}>{transaction.type} • {transaction.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>{transaction.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Analysis</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <ChartPie size={20} color="#0066cc" />
              <Text style={styles.budgetTitle}>Expense Distribution</Text>
            </View>
            <View style={styles.budgetItems}>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetCategory}>Conferences</Text>
                <Text style={styles.budgetAmount}>₹5,500 (44%)</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '44%', backgroundColor: '#0066cc' }]} />
                </View>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetCategory}>Travel</Text>
                <Text style={styles.budgetAmount}>₹3,200 (26%)</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '26%', backgroundColor: '#00cc88' }]} />
                </View>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetCategory}>Entertainment</Text>
                <Text style={styles.budgetAmount}>₹2,150 (17%)</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '17%', backgroundColor: '#ff6b6b' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetItems: {
    gap: 16,
  },
  budgetItem: {
    marginBottom: 12,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});