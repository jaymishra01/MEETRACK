import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Link } from 'expo-router';
import { CreditCard, HardDrive, User, Wallet, ArrowUpRight, ArrowDownLeft, QrCode, IndianRupee, X, Smartphone, ChevronRight } from 'lucide-react-native';
import Modal from 'react-native-modal';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export default function StatusScreen() {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'id'>('qr');

  const cardsUsed = 75;
  const storageUsed = 4.2;
  const totalStorage = 10;
  const walletBalance = 2500;

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      amount: 1000,
      description: 'Added money via UPI',
      date: 'Mar 15, 2025'
    },
    {
      id: '2',
      type: 'debit',
      amount: 500,
      description: 'Document purchase',
      date: 'Mar 14, 2025'
    },
    {
      id: '3',
      type: 'credit',
      amount: 2000,
      description: 'Document earnings',
      date: 'Mar 12, 2025'
    }
  ];

  const handleAddMoney = () => {
    setShowAddMoneyModal(false);
    setAmount('');
    setUpiId('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Status</Text>
      </View>

      <Link href="/settings/account" asChild>
        <TouchableOpacity style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <User size={24} color="#0066cc" />
            <Text style={styles.accountTitle}>Account Information</Text>
          </View>
          <Text style={styles.accountDescription}>
            View and update your profile details, company information, and preferences
          </Text>
          <View style={styles.accountAction}>
            <Text style={styles.accountLink}>Manage Account</Text>
            <ChevronRight size={20} color="#0066cc" />
          </View>
        </TouchableOpacity>
      </Link>

      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Wallet size={24} color="#0066cc" />
          <Text style={styles.walletTitle}>Wallet Balance</Text>
        </View>
        <Text style={styles.walletBalance}>₹{walletBalance.toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.addMoneyButton}
          onPress={() => setShowAddMoneyModal(true)}>
          <Text style={styles.addMoneyText}>Add Money</Text>
        </TouchableOpacity>

        <View style={styles.transactionsList}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                {transaction.type === 'credit' ? (
                  <ArrowDownLeft size={20} color="#00cc88" />
                ) : (
                  <ArrowUpRight size={20} color="#ff6b6b" />
                )}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.resourcesContainer}>
        <Link href="/recharge" asChild>
          <TouchableOpacity style={styles.resourceCard}>
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
          </TouchableOpacity>
        </Link>

        <Link href="/storage" asChild>
          <TouchableOpacity style={styles.resourceCard}>
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
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Next Recharge Benefits</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitText}>• 200 New Business Cards</Text>
          <Text style={styles.benefitText}>• 2GB Additional Storage</Text>
        </View>
      </View>

      <Modal
        isVisible={showAddMoneyModal}
        onBackdropPress={() => setShowAddMoneyModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Money</Text>
            <TouchableOpacity 
              onPress={() => setShowAddMoneyModal(false)}
              style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.amountInput}>
            <Text style={styles.amountLabel}>Enter Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountTextInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.paymentMethods}>
            <TouchableOpacity 
              style={[styles.methodButton, paymentMethod === 'qr' && styles.activeMethod]}
              onPress={() => setPaymentMethod('qr')}>
              <QrCode size={20} color={paymentMethod === 'qr' ? '#ffffff' : '#666'} />
              <Text style={[styles.methodText, paymentMethod === 'qr' && styles.activeMethodText]}>
                Scan QR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.methodButton, paymentMethod === 'id' && styles.activeMethod]}
              onPress={() => setPaymentMethod('id')}>
              <Smartphone size={20} color={paymentMethod === 'id' ? '#ffffff' : '#666'} />
              <Text style={[styles.methodText, paymentMethod === 'id' && styles.activeMethodText]}>
                Enter UPI ID
              </Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'qr' ? (
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' }}
                style={styles.qrCode}
              />
              <Text style={styles.qrInstructions}>Scan this QR code with any UPI app</Text>
            </View>
          ) : (
            <View style={styles.upiContainer}>
              <View style={styles.upiInputContainer}>
                <TextInput
                  style={styles.upiInput}
                  placeholder="Enter UPI ID (e.g., name@upi)"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                />
                <IndianRupee size={20} color="#666" />
              </View>
              <TouchableOpacity 
                style={[styles.payButton, (!amount || !upiId) && styles.payButtonDisabled]}
                disabled={!amount || !upiId}
                onPress={handleAddMoney}>
                <Text style={styles.payButtonText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.securePayment}>
            <Text style={styles.secureText}>🔒 Secure UPI Payment</Text>
          </View>
        </View>
      </Modal>
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
  accountCard: {
    backgroundColor: '#ffffff',
    margin: 20,
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
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountLink: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  walletCard: {
    backgroundColor: '#ffffff',
    margin: 20,
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
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 16,
  },
  addMoneyButton: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addMoneyText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 12,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  creditAmount: {
    color: '#00cc88',
  },
  debitAmount: {
    color: '#ff6b6b',
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
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  amountInput: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  activeMethod: {
    backgroundColor: '#0066cc',
  },
  methodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeMethodText: {
    color: '#ffffff',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  upiContainer: {
    gap: 16,
    marginBottom: 20,
  },
  upiInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  upiInput: {
    flex: 1,
    fontSize: 16,
  },
  payButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  securePayment: {
    alignItems: 'center',
  },
  secureText: {
    fontSize: 14,
    color: '#00cc88',
  },
});