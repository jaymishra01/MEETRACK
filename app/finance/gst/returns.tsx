import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, Calendar, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface GSTReturn {
  id: string;
  period: string;
  dueDate: string;
  status: 'filed' | 'pending' | 'overdue';
  amount: number;
}

export default function GSTReturnsScreen() {
  const returns: GSTReturn[] = [
    {
      id: '1',
      period: 'March 2025',
      dueDate: 'Apr 15, 2025',
      status: 'pending',
      amount: 18000
    },
    {
      id: '2',
      period: 'February 2025',
      dueDate: 'Mar 15, 2025',
      status: 'filed',
      amount: 15000
    },
    {
      id: '3',
      period: 'January 2025',
      dueDate: 'Feb 15, 2025',
      status: 'filed',
      amount: 12000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
        return '#00cc88';
      case 'pending':
        return '#ffd43b';
      case 'overdue':
        return '#ff6b6b';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed':
        return <CheckCircle size={20} color="#00cc88" />;
      case 'pending':
        return <Clock size={20} color="#ffd43b" />;
      case 'overdue':
        return <AlertCircle size={20} color="#ff6b6b" />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {returns.map((gstReturn, index) => (
          <Animated.View 
            key={gstReturn.id}
            entering={FadeInDown.delay(200 * index)}>
            <TouchableOpacity style={styles.returnCard}>
              <View style={styles.returnHeader}>
                <View style={styles.returnInfo}>
                  <Text style={styles.returnPeriod}>{gstReturn.period}</Text>
                  <View style={styles.returnMeta}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.returnDate}>Due: {gstReturn.dueDate}</Text>
                  </View>
                </View>
                <Text style={styles.returnAmount}>₹{gstReturn.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.returnFooter}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(gstReturn.status) + '20' }
                ]}>
                  {getStatusIcon(gstReturn.status)}
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(gstReturn.status) }
                  ]}>
                    {gstReturn.status.charAt(0).toUpperCase() + gstReturn.status.slice(1)}
                  </Text>
                </View>

                <TouchableOpacity style={styles.viewButton}>
                  <FileText size={16} color="#0066cc" />
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
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
  content: {
    padding: 20,
    gap: 16,
  },
  returnCard: {
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
  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  returnInfo: {
    flex: 1,
  },
  returnPeriod: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  returnMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  returnDate: {
    fontSize: 14,
    color: '#666',
  },
  returnAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
  },
  returnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
});