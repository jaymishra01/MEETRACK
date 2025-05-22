import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Receipt, Calendar, Tag, Search, Filter } from 'lucide-react-native';

interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ExpensesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const expenses: Expense[] = [
    {
      id: '1',
      date: 'Mar 15, 2025',
      merchant: 'Office Supplies Co.',
      category: 'Supplies',
      amount: 2500,
      status: 'approved'
    },
    {
      id: '2',
      date: 'Mar 14, 2025',
      merchant: 'City Cafe',
      category: 'Meals',
      amount: 850,
      status: 'pending'
    },
    {
      id: '3',
      date: 'Mar 12, 2025',
      merchant: 'Metro Transit',
      category: 'Travel',
      amount: 200,
      status: 'approved'
    }
  ];

  const categories = ['All', 'Travel', 'Meals', 'Supplies', 'Equipment'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#00cc88';
      case 'rejected':
        return '#ff6b6b';
      default:
        return '#ffd43b';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>Track and manage your expenses</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
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
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
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
        ))}
      </ScrollView>

      <View style={styles.expensesList}>
        {filteredExpenses.map((expense) => (
          <TouchableOpacity key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View style={styles.expenseInfo}>
                <Text style={styles.merchantName}>{expense.merchant}</Text>
                <View style={styles.expenseMeta}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                  <Tag size={14} color="#666" />
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
              </View>
              <Text style={styles.expenseAmount}>₹{expense.amount}</Text>
            </View>
            
            <View style={styles.expenseFooter}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </Text>
              </View>
              <Receipt size={20} color="#666" />
            </View>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
  expensesList: {
    padding: 20,
    gap: 12,
  },
  expenseCard: {
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});