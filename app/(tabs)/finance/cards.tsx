import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CreditCard, Lock, Eye, EyeOff, History, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Link } from 'expo-router';

interface CompanyCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  company: string;
  limit: number;
  available: number;
  status: 'active' | 'blocked' | 'expired';
}

export default function CardsScreen() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  
  // This would come from your backend in a real app
  const card: CompanyCard = {
    id: '1',
    cardNumber: '4532 •••• •••• 7895',
    cardHolder: 'JOHN DOE',
    expiryDate: '12/25',
    company: 'TechCorp Industries',
    limit: 100000,
    available: 85450,
    status: 'active'
  };

  const handleLockCard = () => {
    Alert.alert(
      'Lock Card',
      'Are you sure you want to temporarily lock this card?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Lock Card',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call your backend
            Alert.alert('Card Locked', 'Your card has been temporarily locked. Contact your company administrator to unlock it.');
          },
        },
      ]
    );
  };

  const handleReportLost = () => {
    Alert.alert(
      'Report Lost Card',
      'Are you sure you want to report this card as lost? This will permanently block the card.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report Lost',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call your backend
            Alert.alert('Card Reported', 'Your card has been reported as lost. A company administrator will contact you shortly.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Company Card</Text>
        <Text style={styles.subtitle}>Manage your corporate credit card</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={32} color="#ffffff" />
            <Text style={styles.cardType}>Corporate Platinum</Text>
          </View>
          
          <Text style={styles.cardNumber}>
            {showCardNumber ? card.cardNumber.replace('••••', '4567') : card.cardNumber}
          </Text>
          
          <View style={styles.cardDetails}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardValue}>{card.cardHolder}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>{card.expiryDate}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowCardNumber(!showCardNumber)}
              style={styles.showNumberButton}>
              {showCardNumber ? (
                <EyeOff size={20} color="#ffffff" />
              ) : (
                <Eye size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Credit Limit</Text>
          <Text style={styles.statusAmount}>₹{card.limit.toLocaleString()}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Available Credit</Text>
          <Text style={styles.statusAmount}>₹{card.available.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Link href="/finance/transactions" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <History size={24} color="#0066cc" />
            <Text style={styles.actionText}>View Transactions</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity 
          style={[styles.actionButton, styles.warningButton]}
          onPress={handleLockCard}>
          <Lock size={24} color="#ff6b6b" />
          <Text style={[styles.actionText, styles.warningText]}>Lock Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleReportLost}>
          <AlertCircle size={24} color="#dc3545" />
          <Text style={[styles.actionText, styles.dangerText]}>Report Lost</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Important Information</Text>
        <Text style={styles.infoText}>
          • This card is property of {card.company}{'\n'}
          • Contact your administrator for any issues{'\n'}
          • Report lost or stolen cards immediately{'\n'}
          • Keep your PIN confidential
        </Text>
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
  cardContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#0066cc',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  cardType: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  showNumberButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statusItem: {
    flex: 1,
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
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningButton: {
    backgroundColor: '#fff5f5',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
  },
  actionText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
  warningText: {
    color: '#ff6b6b',
  },
  dangerText: {
    color: '#dc3545',
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
});