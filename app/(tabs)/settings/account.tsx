import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, FileCheck, CircleAlert as AlertCircle, User, Mail, Phone, MapPin } from 'lucide-react-native';
import { verifyGST } from '@/lib/gst';
import { supabase } from '@/lib/supabase';
import { COUNTRIES } from '@/lib/countries';

interface UserProfile {
  full_name: string;
  email: string;
  company: string;
  position: string;
  gst_number: string;
  country: string;
  pincode: string;
  phone_number: string;
  country_code: string;
}

export default function AccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    full_name: '',
    email: '',
    company: '',
    position: '',
    gst_number: '',
    country: 'IN',
    pincode: '',
    phone_number: '',
    country_code: '+91',
  });

  const [gstValidation, setGstValidation] = useState({
    isValidating: false,
    isValid: false,
    error: null as string | null,
    businessName: null as string | null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;
      
      if (!session) {
        // If no session exists, redirect to login
        router.replace('/(auth)/login');
        return;
      }

      // If authenticated, fetch user profile
      await fetchUserProfile();
    } catch (error) {
      console.error('Auth error:', error);
      router.replace('/(auth)/login');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user');

      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // If no profile exists, create one
      if (!data) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: '',
            country: 'IN',
            country_code: '+91',
          });

        if (insertError) throw insertError;

        setFormData(prev => ({
          ...prev,
          email: user.email || '',
        }));
        return;
      }

      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        company: data.company || '',
        position: data.position || '',
        gst_number: data.gst_number || '',
        country: data.country || 'IN',
        pincode: data.pincode || '',
        phone_number: data.phone_number || '',
        country_code: data.country_code || '+91',
      });

      if (data.gst_number) {
        setGstValidation(prev => ({
          ...prev,
          isValid: true,
          businessName: data.company,
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile data');
    }
  };

  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const validateGST = async (number: string) => {
    if (!number) return;

    if (!GST_REGEX.test(number)) {
      setGstValidation({
        ...gstValidation,
        isValidating: false,
        isValid: false,
        error: 'Invalid GST format. Please check the number.',
      });
      return;
    }

    setGstValidation({ ...gstValidation, isValidating: true, error: null });

    try {
      const result = await verifyGST(number);

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
          ...gstValidation,
          isValidating: false,
          isValid: false,
          error: result.error || 'Could not verify GST number. Please try again.',
        });
      }
    } catch (error) {
      setGstValidation({
        ...gstValidation,
        isValidating: false,
        isValid: false,
        error: 'Could not verify GST number. Please try again later.',
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.full_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.gst_number && !gstValidation.isValid) {
      setError('Please verify your GST number first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          company: formData.company,
          position: formData.position,
          gst_number: formData.gst_number,
          country: formData.country,
          pincode: formData.pincode,
          phone_number: formData.phone_number,
          country_code: formData.country_code,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.back();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
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
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Building2 size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Position"
              value={formData.position}
              onChangeText={(text) => setFormData(prev => ({ ...prev, position: text }))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.phoneContainer}>
            <View style={styles.countryCodePicker}>
              <Phone size={20} color="#666" />
              <TextInput
                style={styles.countryCodeInput}
                value={formData.country_code}
                onChangeText={(text) => setFormData(prev => ({ ...prev, country_code: text }))}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.inputContainer, styles.phoneInput]}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone_number}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.gstContainer}>
            <View style={[styles.inputContainer, styles.gstInput]}>
              <FileCheck size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="GST Number"
                value={formData.gst_number}
                onChangeText={(text) => {
                  const formattedGST = text.toUpperCase();
                  setFormData(prev => ({ ...prev, gst_number: formattedGST }));
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
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (gstValidation.isValidating || !formData.gst_number) && styles.verifyButtonDisabled
              ]}
              onPress={() => validateGST(formData.gst_number)}
              disabled={gstValidation.isValidating || !formData.gst_number}>
              {gstValidation.isValidating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
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
              onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
              editable={!gstValidation.businessName}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
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
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
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
  updateButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});