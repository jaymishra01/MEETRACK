import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Calendar, Building2, FileText, Download } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Invoice {
  id: string;
  number: string;
  date: string;
  company: string;
  amount: number;
  gst: number;
  type: 'inward' | 'outward';
}

export default function InvoicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'inward' | 'outward'>('all');

  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2025-001',
      date: 'Mar 15, 2025',
      company: 'TechCorp Solutions',
      amount: 50000,
      gst: 9000,
      type: 'outward'
    },
    {
      id: '2',
      number: 'INV-2025-002',
      date: 'Mar 14, 2025',
      company: 'Digital Systems Inc',
      amount: 35000,
      gst: 6300,
      type: 'inward'
    },
    {
      id: '3',
      number: 'INV-2025-003',
      date: 'Mar 12, 2025',
      company: 'Global Services Ltd',
      amount: 75000,
      gst: 13500,
      type: 'outward'
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || invoice.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'all' && styles.selectedType]}
          onPress={() => setSelectedType('all')}>
          <Text style={[styles.typeText, selectedType === 'all' && styles.selectedTypeText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'inward' && styles.selectedType]}
          onPress={() => setSelectedType('inward')}>
          <Text style={[styles.typeText, selectedType === 'inward' && styles.selectedTypeText]}>
            Inward
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'outward' && styles.selectedType]}
          onPress={() => setSelectedType('outward')}>
          <Text style={[styles.typeText, selectedType === 'outward' && styles.selectedTypeText]}>
            Outward
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.invoicesList}>
        {filteredInvoices.map((invoice, index) => (
          <Animated.View 
            key={invoice.id}
            entering={FadeInDown.delay(200 * index)}>
            <TouchableOpacity style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                  <View style={styles.companyInfo}>
                    <Building2 size={14} color="#666" />
                    <Text style={styles.companyName}>{invoice.company}</Text>
                  </View>
                  <View style={styles.invoiceMeta}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.invoiceDate}>{invoice.date}</Text>
                  </View>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.invoiceAmount}>₹{invoice.amount.toLocaleString()}</Text>
                  <Text style={styles.gstAmount}>GST: ₹{invoice.gst.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.invoiceFooter}>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: invoice.type === 'inward' ? '#f0fff4' : '#fff5f5' }
                ]}>
                  <Text style={[
                    styles.typeLabel,
                    { color: invoice.type === 'inward' ? '#00cc88' : '#ff6b6b' }
                  ]}>
                    {invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <FileText size={16} color="#0066cc" />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Download size={16} color="#0066cc" />
                    <Text style={styles.actionText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
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
  typeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
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
  selectedType: {
    backgroundColor: '#0066cc',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedTypeText: {
    color: '#ffffff',
  },
  invoicesList: {
    padding: 20,
    gap: 16,
  },
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
  },
  invoiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 4,
  },
  gstAmount: {
    fontSize: 14,
    color: '#666',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#0066cc',
  },
});