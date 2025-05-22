import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Calendar, Tag, Building2, ArrowUpRight, ArrowDownLeft, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const transactions: Transaction[] = [
    {
      id: '1',
      date: 'Mar 15, 2025',
      description: 'Office Equipment Purchase',
      merchant: 'TechStore Pro',
      category: 'Equipment',
      amount: 25000,
      type: 'debit'
    },
    {
      id: '2',
      date: 'Mar 14, 2025',
      description: 'Client Meeting Lunch',
      merchant: 'Luxury Bistro',
      category: 'Meals',
      amount: 3500,
      type: 'debit'
    },
    {
      id: '3',
      date: 'Mar 14, 2025',
      description: 'Travel Reimbursement',
      merchant: 'Company Reimbursement',
      category: 'Reimbursement',
      amount: 15000,
      type: 'credit'
    },
    {
      id: '4',
      date: 'Mar 13, 2025',
      description: 'Office Supplies',
      merchant: 'Stationery World',
      category: 'Supplies',
      amount: 1200,
      type: 'debit'
    }
  ];

  const categories = ['All', 'Equipment', 'Travel', 'Meals', 'Supplies', 'Reimbursement'];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReimbursed = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Card Transactions</Text>
      </View>

      <ScrollView>
        <View style={styles.summaryContainer}>
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={[styles.summaryCard, styles.spentCard]}>
            <ArrowUpRight size={24} color="#ff6b6b" />
            <Text style={styles.summaryAmount}>₹{totalSpent.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={[styles.summaryCard, styles.reimbursedCard]}>
            <ArrowDownLeft size={24} color="#00cc88" />
            <Text style={[styles.summaryAmount, styles.reimbursedAmount]}>₹{totalReimbursed.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Reimbursed</Text>
          </Animated.View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#0066cc" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <Animated.View 
              entering={FadeInDown.delay(200 + index * 100)}
              key={category}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}>
                <Tag size={16} color={selectedCategory === category ? '#ffffff' : '#0066cc'} />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction, index) => (
            <Animated.View 
              entering={FadeInDown.delay(400 + index * 100)}
              key={transaction.id}>
              <TouchableOpacity style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <View style={styles.merchantInfo}>
                      <Building2 size={14} color="#666" />
                      <Text style={styles.merchantName}>{transaction.merchant}</Text>
                    </View>
                    <View style={styles.transactionMeta}>
                      <Calendar size={14} color="#666" />
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                      <Tag size={14} color="#666" />
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  summaryCard: {
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
  spentCard: {
    backgroundColor: '#fff5f5',
  },
  reimbursedCard: {
    backgroundColor: '#f0fff4',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginVertical: 8,
  },
  reimbursedAmount: {
    color: '#00cc88',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryChip: {
    backgroundColor: '#0066cc',
  },
  categoryText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  transactionsList: {
    padding: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 14,
    color: '#666',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  creditAmount: {
    color: '#00cc88',
  },
  debitAmount: {
    color: '#ff6b6b',
  },
});