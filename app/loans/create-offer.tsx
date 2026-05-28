import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, HelpCircle, Calculator, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateLoanOfferScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState({
    totalRepayment: 0,
    monthlyEmi: 0,
    totalInterest: 0,
  });
  const [formData, setFormData] = useState({
    principal_amount: '',
    interest_rate: '5',
    duration_months: '6',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    calculateLoan();
  }, [formData.principal_amount, formData.interest_rate, formData.duration_months]);

  const calculateLoan = () => {
    const principal = parseFloat(formData.principal_amount) || 0;
    const rate = parseFloat(formData.interest_rate) || 0;
    const months = parseInt(formData.duration_months) || 0;

    if (principal > 0 && rate >= 0 && months > 0) {
      const totalRepayment = Math.round(principal * (1 + rate / 100));
      const monthlyEmi = Math.round(totalRepayment / months);
      const totalInterest = totalRepayment - principal;

      setCalculations({
        totalRepayment,
        monthlyEmi,
        totalInterest,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.principal_amount || parseInt(formData.principal_amount) <= 0) {
      newErrors.principal_amount = 'Please enter a valid amount';
    }

    if (parseInt(formData.principal_amount) > 50000) {
      newErrors.principal_amount = 'Maximum offer amount is ₹50,000';
    }

    const interestRate = parseFloat(formData.interest_rate);
    if (interestRate < 0 || interestRate > 14) {
      newErrors.interest_rate = 'Interest rate must be between 0% and 14%';
    }

    const duration = parseInt(formData.duration_months);
    if (duration < 1 || duration > 12) {
      newErrors.duration_months = 'Duration must be between 1 and 12 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a loan offer');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('loan_offers').insert({
        lender_id: user.id,
        principal_amount: parseInt(formData.principal_amount),
        interest_rate: parseFloat(formData.interest_rate),
        duration_months: parseInt(formData.duration_months),
        total_repayment: calculations.totalRepayment,
        monthly_emi: calculations.monthlyEmi,
        description: formData.description.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your loan offer has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating loan offer:', error);
      Alert.alert('Error', 'Failed to create loan offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Offer a Loan</Text>
      </View>

      <View style={styles.infoCard}>
        <HelpCircle size={20} color="#0066cc" />
        <Text style={styles.infoText}>
          Offer a loan to community borrowers. Set your terms and interest rates.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loan Amount *</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount to lend"
              value={formData.principal_amount}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, principal_amount: text }))
              }
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {errors.principal_amount && (
            <Text style={styles.error}>{errors.principal_amount}</Text>
          )}
          <Text style={styles.hint}>Maximum: ₹50,000</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interest Rate *</Text>
          <View style={styles.percentageInput}>
            <TextInput
              style={styles.input}
              placeholder="0-14%"
              value={formData.interest_rate}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, interest_rate: text }))
              }
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.percentageSymbol}>% p.a.</Text>
          </View>
          {errors.interest_rate && (
            <Text style={styles.error}>{errors.interest_rate}</Text>
          )}
          <Text style={styles.hint}>
            Range: 0% (interest-free) to 14% per annum
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration *</Text>
          <View style={styles.monthsInput}>
            <TextInput
              style={styles.input}
              placeholder="1-12 months"
              value={formData.duration_months}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, duration_months: text }))
              }
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.monthsSymbol}>months</Text>
          </View>
          {errors.duration_months && (
            <Text style={styles.error}>{errors.duration_months}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any specific terms or conditions for borrowers"
            value={formData.description}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, description: text }))
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {formData.principal_amount && calculations.monthlyEmi > 0 && (
          <View style={styles.calculationsCard}>
            <View style={styles.calculationsHeader}>
              <Calculator size={20} color="#0066cc" />
              <Text style={styles.calculationsTitle}>Loan Summary</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Repayment</Text>
              <Text style={styles.calculationValue}>
                ₹{calculations.totalRepayment.toLocaleString()}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Monthly EMI</Text>
              <Text style={styles.calculationValue}>
                ₹{calculations.monthlyEmi.toLocaleString()}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Interest Earned</Text>
              <Text style={[styles.calculationValue, styles.interestValue]}>
                ₹{calculations.totalInterest.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.noticeCard}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.noticeText}>
            By posting this offer, you agree to lend to verified borrowers. You can review borrower profiles before accepting loan requests.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Loan Offer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 100,
    paddingTop: 12,
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  percentageSymbol: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  monthsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  monthsSymbol: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  hint: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  calculationsCard: {
    backgroundColor: '#f0f7ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  calculationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calculationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  interestValue: {
    color: '#059669',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
