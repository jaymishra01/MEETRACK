import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, Building2, Briefcase, User, FileCheck, ArrowLeft, CircleAlert as AlertCircle, Phone, MapPin, Globe } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { verifyGST } from '@/lib/gst';
import { COUNTRIES } from '@/lib/countries';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  position: string;
  gstNumber: string;
  phoneNumber: string;
  countryCode: string;
  country: string;
  pincode: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: '',
    gstNumber: '',
    phoneNumber: '',
    countryCode: '+91',
    country: 'IN',
    pincode: '',
  });

  const [gstValidation, setGstValidation] = useState({
    isValidating: false,
    isValid: false,
    error: null as string | null,
    businessName: null as string | null,
  });

  // GST number format: 22AAAAA0000A1Z5
  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const validateGST = async (gstNumber: string) => {
    if (!gstNumber) return;

    if (!GST_REGEX.test(gstNumber)) {
      setGstValidation({
        isValidating: false,
        isValid: false,
        error: 'Invalid GST format. Please check the number.',
        businessName: null,
      });
      return;
    }

    setGstValidation({ ...gstValidation, isValidating: true, error: null });

    try {
      const result = await verifyGST(gstNumber);

      if (result.valid) {
        setGstValidation({
          isValidating: false,
          isValid: true,
          error: null,
          businessName: result.business_name || null,
        });

        if (result.business_name) {
          setFormData(prev => ({
            ...prev,
            company: result.business_name || prev.company,
          }));
        }
      } else {
        setGstValidation({
          isValidating: false,
          isValid: false,
          error: result.error || 'Could not verify GST number. Please try again.',
          businessName: null,
        });
      }
    } catch (error) {
      setGstValidation({
        isValidating: false,
        isValid: false,
        error: 'Could not verify GST number. Please try again.',
        businessName: null,
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.gstNumber && !gstValidation.isValid) {
      setError('Please verify your GST number first');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          company: formData.company,
          position: formData.position,
          gst_number: formData.gstNumber,
          phone_number: formData.phoneNumber,
          country_code: formData.countryCode,
          country: formData.country,
          pincode: formData.pincode,
        });

      if (profileError) throw profileError;

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join MEETRACK to manage your business network</Text>
      </View>

      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.phoneContainer}>
            <View style={styles.countryCodePicker}>
              <Phone size={20} color="#666" />
              <TextInput
                style={styles.countryCodeInput}
                value={formData.countryCode}
                onChangeText={(text) => setFormData({ ...formData, countryCode: text })}
                keyboardType="phone-pad"
                placeholder="+91"
              />
            </View>
            <View style={[styles.inputContainer, styles.phoneInput]}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Globe size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Country"
              value={COUNTRIES.find(c => c.code === formData.country)?.name || 'India'}
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.gstContainer}>
            <View style={[styles.inputContainer, styles.gstInput]}>
              <FileCheck size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="GST Number (Optional)"
                value={formData.gstNumber}
                onChangeText={(text) => {
                  const formattedGST = text.toUpperCase();
                  setFormData({ ...formData, gstNumber: formattedGST });
                  setGstValidation({
                    isValidating: false,
                    isValid: false,
                    error: null,
                    businessName: null,
                  });
                }}
                autoCapitalize="characters"
                maxLength={15}
              />
            </View>
            {formData.gstNumber && (
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (gstValidation.isValidating || !formData.gstNumber) && styles.verifyButtonDisabled
                ]}
                onPress={() => validateGST(formData.gstNumber)}
                disabled={gstValidation.isValidating || !formData.gstNumber}>
                {gstValidation.isValidating ? (
                  <ActivityIndicator color="#ffffff\" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {gstValidation.error && (
            <Text style={styles.gstError}>{gstValidation.error}</Text>
          )}

          {gstValidation.isValid && (
            <View style={styles.verificationSuccess}>
              <Text style={styles.successText}>GST number verified successfully!</Text>
              {gstValidation.businessName && (
                <View style={styles.businessInfo}>
                  <Building2 size={20} color="#059669" />
                  <Text style={styles.businessName}>{gstValidation.businessName}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Building2 size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              editable={!gstValidation.businessName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Briefcase size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Position"
              value={formData.position}
              onChangeText={(text) => setFormData({ ...formData, position: text })}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Link>
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
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
    gap: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#0066cc',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  countryCodePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    width: 120,
  },
  countryCodeInput: {
    flex: 1,
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  gstContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  gstInput: {
    flex: 1,
    marginBottom: 0,
  },
  verifyButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  gstError: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  verificationSuccess: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  businessName: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginHighlight: {
    color: '#0066cc',
    fontWeight: '600',
  },
});