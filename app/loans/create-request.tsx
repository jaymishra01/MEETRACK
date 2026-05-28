import { useState } from 'react';
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
import { ArrowLeft, HelpCircle, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateLoanRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requested_amount: '',
    purpose: '',
    preferred_interest_rate: '',
    preferred_duration: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requested_amount || parseInt(formData.requested_amount) <= 0) {
      newErrors.requested_amount = 'Please enter a valid amount';
    }

    if (parseInt(formData.requested_amount) > 100000) {
      newErrors.requested_amount = 'Maximum request amount is ₹1,00,000';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please provide a purpose for the loan';
    }

    if (
      formData.preferred_interest_rate &&
      (parseFloat(formData.preferred_interest_rate) < 0 ||
        parseFloat(formData.preferred_interest_rate) > 14)
    ) {
      newErrors.preferred_interest_rate = 'Interest rate must be between 0% and 14%';
    }

    if (
      formData.preferred_duration &&
      (parseInt(formData.preferred_duration) < 1 ||
        parseInt(formData.preferred_duration) > 12)
    ) {
      newErrors.preferred_duration = 'Duration must be between 1 and 12 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a loan request');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('loan_requests').insert({
        borrower_id: user.id,
        requested_amount: parseInt(formData.requested_amount),
        purpose: formData.purpose.trim(),
        preferred_interest_rate: formData.preferred_interest_rate
          ? parseFloat(formData.preferred_interest_rate)
          : null,
        preferred_duration: formData.preferred_duration
          ? parseInt(formData.preferred_duration)
          : null,
        urgency: formData.urgency,
        is_active: true,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your loan request has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating loan request:', error);
      Alert.alert('Error', 'Failed to create loan request. Please try again.');
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
        <Text style={styles.title}>Request a Loan</Text>
      </View>

      <View style={styles.infoCard}>
        <HelpCircle size={20} color="#0066cc" />
        <Text style={styles.infoText}>
          Request a loan from community lenders. Specify your terms and purpose.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount Required *</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={formData.requested_amount}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, requested_amount: text }))
              }
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {errors.requested_amount && (
            <Text style={styles.error}>{errors.requested_amount}</Text>
          )}
          <Text style={styles.hint}>Maximum: ₹1,00,000</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Purpose *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Explain why you need this loan (helps lenders decide)"
            value={formData.purpose}
            onChangeText={text => setFormData(prev => ({ ...prev, purpose: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.purpose && <Text style={styles.error}>{errors.purpose}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Interest Rate (Optional)</Text>
          <View style={styles.percentageInput}>
            <TextInput
              style={styles.input}
              placeholder="Max 14%"
              value={formData.preferred_interest_rate}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, preferred_interest_rate: text }))
              }
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.percentageSymbol}>% p.a.</Text>
          </View>
          {errors.preferred_interest_rate && (
            <Text style={styles.error}>{errors.preferred_interest_rate}</Text>
          )}
          <Text style={styles.hint}>Leave empty if flexible (0% to 14%)</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Duration (Optional)</Text>
          <View style={styles.monthsInput}>
            <TextInput
              style={styles.input}
              placeholder="1-12 months"
              value={formData.preferred_duration}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, preferred_duration: text }))
              }
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.monthsSymbol}>months</Text>
          </View>
          {errors.preferred_duration && (
            <Text style={styles.error}>{errors.preferred_duration}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyOptions}>
            {(['low', 'medium', 'high'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyOption,
                  formData.urgency === level && styles.urgentOptionActive,
                ]}
                onPress={() =>
                  setFormData(prev => ({ ...prev, urgency: level }))
                }
              >
                <Text
                  style={[
                    styles.urgencyText,
                    formData.urgency === level && styles.urgencyTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.noticeCard}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.noticeText}>
            Your request will be visible to all registered lenders. They can view your reputation score and loan history.
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
            <Text style={styles.submitButtonText}>Submit Loan Request</Text>
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
  urgencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  urgentOptionActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  urgencyTextActive: {
    color: '#ffffff',
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
