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
import { ArrowLeft, AlertTriangle, FileText, Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DefaulterFlagScreenProps {
  loanId: string;
}

export default function FlagDefaulterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    evidence_urls: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get loan ID from route params
  const loanId = router.query?.loanId as string;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for flagging this defaulter';
    } else if (formData.reason.length < 50) {
      newErrors.reason =
        'Please provide a detailed explanation (at least 50 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to flag a defaulter');
      return;
    }

    if (!loanId) {
      Alert.alert('Error', 'Invalid loan ID');
      return;
    }

    setLoading(true);

    try {
      // Get loan details
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('borrower_id, lender_id, amount_repaid, total_repayment')
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      if (loanData.lender_id !== user.id) {
        Alert.alert(
          'Error',
          'Only the lender can flag a defaulter on this loan'
        );
        return;
      }

      const amountDefaulted =
        (loanData.total_repayment || 0) - (loanData.amount_repaid || 0);

      // Create defaulter flag
      const { error: flagError } = await supabase.from('defaulter_flags').insert({
        loan_id: loanId,
        borrower_id: loanData.borrower_id,
        lender_id: user.id,
        reason: formData.reason.trim(),
        amount_defaulted: amountDefaulted,
        evidence_urls: formData.evidence_urls,
        is_public: true,
      });

      if (flagError) throw flagError;

      // Update loan status to flagged
      const { error: updateError } = await supabase
        .from('loans')
        .update({ status: 'flagged' })
        .eq('id', loanId);

      if (updateError) throw updateError;

      Alert.alert(
        'Success',
        'Defaulter flag has been raised successfully. This will be visible to all users to protect the community.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error flagging defaulter:', error);
      Alert.alert('Error', 'Failed to raise defaulter flag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addEvidenceUrl = () => {
    Alert.prompt(
      'Add Evidence URL',
      'Enter the URL of supporting evidence (e.g., screenshot, document)',
      (url) => {
        if (url && url.trim()) {
          setFormData(prev => ({
            ...prev,
            evidence_urls: [...prev.evidence_urls, url.trim()],
          }));
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Flag Defaulter</Text>
      </View>

      <View style={styles.warningCard}>
        <AlertTriangle size={24} color="#dc2626" />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Important Warning</Text>
          <Text style={styles.warningText}>
            Flagging a defaulter is a serious action that will permanently affect their reputation. Only flag users who have genuinely defaulted on their loan payments.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reason for Flagging *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide a detailed explanation of why you're flagging this borrower as a defaulter (e.g., missed payments, communication attempts, timeline of events)"
            value={formData.reason}
            onChangeText={text => setFormData(prev => ({ ...prev, reason: text }))}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {errors.reason && <Text style={styles.error}>{errors.reason}</Text>}
          <Text style={styles.hint}>
            {formData.reason.length}/300 characters (minimum 50)
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Supporting Evidence (Optional)</Text>
          <Text style={styles.hint}>
            Add URLs to screenshots, documents, or communication logs
          </Text>

          {formData.evidence_urls.map((url, index) => (
            <View key={index} style={styles.evidenceItem}>
              <FileText size={16} color="#0066cc" />
              <Text style={styles.evidenceUrl} numberOfLines={1}>
                {url}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setFormData(prev => ({
                    ...prev,
                    evidence_urls: prev.evidence_urls.filter((_, i) => i !== index),
                  }))
                }
              >
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addEvidenceUrl}
          >
            <Upload size={16} color="#0066cc" />
            <Text style={styles.addButtonText}>Add Evidence URL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>
              The defaulter flag will be publicly visible on the borrower's profile
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>
              Other users will be alerted when checking the borrower's profile
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>
              The borrower's reputation score will be affected
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>
              This action cannot be easily undone - please use responsibly
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <AlertTriangle size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Raise Defaulter Flag</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting this flag, you confirm that the information provided is accurate and truthful. False or malicious flagging may result in action against your account.
        </Text>
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 150,
    paddingTop: 12,
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
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  evidenceUrl: {
    flex: 1,
    fontSize: 14,
    color: '#0066cc',
  },
  removeButton: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  infoBullet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
