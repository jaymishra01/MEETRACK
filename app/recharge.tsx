import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Package, Gift, QrCode, IndianRupee, X, Smartphone, Wallet } from 'lucide-react-native';
import Modal from 'react-native-modal';

interface Plan {
  id: string;
  name: string;
  cards: number;
  storage: number;
  price: number;
  features: string[];
}

export default function RechargeScreen() {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'id'>('qr');
  const walletBalance = 2500; // This should come from a global state management system

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      cards: 100,
      storage: 3,
      price: 300,
      features: [
        '100 Business Cards',
        '3GB Cloud Storage',
        'Basic Analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      cards: 250,
      storage: 10,
      price: 600,
      features: [
        '250 Business Cards',
        '10GB Cloud Storage',
        'Advanced Analytics',
        'Priority Support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      cards: 500,
      storage: 20,
      price: 900,
      features: [
        '500 Business Cards',
        '20GB Cloud Storage',
        'Premium Analytics',
        '24/7 Support',
        'Custom Branding'
      ]
    }
  ];

  const handlePurchase = (plan: Plan) => {
    if (walletBalance < plan.price) {
      Alert.alert(
        'Insufficient Balance',
        'Please add money to your wallet to continue',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Money',
            onPress: () => {
              // Navigate to wallet section
              router.push('/settings');
            }
          }
        ]
      );
      return;
    }

    // Process the plan purchase
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${plan.name} plan for ₹${plan.price} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm',
          onPress: () => {
            // Process the purchase
            // Update wallet balance
            // Update user's plan
            Alert.alert('Success', 'Plan purchased successfully!');
          }
        }
      ]
    );
  };

  const handlePayment = () => {
    // Handle payment processing here
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setUpiId('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Recharge Plans</Text>
      </View>

      <View style={styles.walletInfo}>
        <Wallet size={24} color="#0066cc" />
        <Text style={styles.walletBalance}>Wallet Balance: ₹{walletBalance}</Text>
      </View>

      <View style={styles.content}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>₹{plan.price}</Text>
            </View>

            <View style={styles.planFeatures}>
              <View style={styles.featureItem}>
                <CreditCard size={20} color="#0066cc" />
                <Text style={styles.featureText}>{plan.cards} Business Cards</Text>
              </View>
              <View style={styles.featureItem}>
                <Package size={20} color="#0066cc" />
                <Text style={styles.featureText}>{plan.storage}GB Cloud Storage</Text>
              </View>
              {plan.features.slice(2).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Gift size={20} color="#0066cc" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.purchaseButton}
              onPress={() => handlePurchase(plan)}>
              <Text style={styles.purchaseButtonText}>
                Pay ₹{plan.price} from Wallet
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        isVisible={showPaymentModal}
        onBackdropPress={() => setShowPaymentModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>UPI Payment</Text>
            <TouchableOpacity 
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedPlan && (
            <View style={styles.paymentDetails}>
              <Text style={styles.planTitle}>{selectedPlan.name} Plan</Text>
              <Text style={styles.paymentAmount}>₹{selectedPlan.price}</Text>
            </View>
          )}

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
                style={[styles.payButton, !upiId && styles.payButtonDisabled]}
                disabled={!upiId}
                onPress={handlePayment}>
                <Text style={styles.payButtonText}>Pay Now</Text>
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
  content: {
    padding: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  planFeatures: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#444',
  },
  purchaseButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  paymentDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
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
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
});