import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Share2, Phone, FileText, QrCode, Smartphone, X, LogOut } from 'lucide-react-native';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  position: string;
  phone_number: string;
  country_code: string;
  gst_number: string;
  wallet_balance: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkCount, setNetworkCount] = useState(0);
  
  const profileImage = "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchNetworkCount();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkCount = async () => {
    try {
      // This would be the count of contacts/connections
      // For now, we'll use a placeholder
      setNetworkCount(127);
    } catch (error) {
      console.error('Error fetching network count:', error);
    }
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const shareData = {
    name: profile?.full_name || 'User',
    title: profile?.position || 'Professional',
    company: profile?.company || 'Company',
    email: profile?.email || '',
    phone: profile?.phone_number ? `${profile.country_code} ${profile.phone_number}` : '',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.title}>{profile.position}</Text>
            <Text style={styles.company}>{profile.company}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <LogOut size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Link href="/contact" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={24} color="#0066cc" />
            <Text style={styles.actionText}>Contact</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/notes" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <FileText size={24} color="#0066cc" />
            <Text style={styles.actionText}>Notes</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={24} color="#0066cc" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Link href="/network" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statNumber}>{networkCount}</Text>
            <Text style={styles.statLabel}>NETWORK</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/finance" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statNumber}>₹{(profile.wallet_balance || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>WALLET</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.profileDetails}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{profile.email}</Text>
        </View>

        {profile.phone_number && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{profile.country_code} {profile.phone_number}</Text>
          </View>
        )}

        {profile.gst_number && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>GST Number</Text>
            <Text style={styles.detailValue}>{profile.gst_number}</Text>
          </View>
        )}
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.activityItem}>
            <Text style={styles.activityTitle}>Tech Conference 2025</Text>
            <Text style={styles.activityMeta}>Met 15 people • March 15, 2025</Text>
          </View>
        ))}
      </View>

      <Modal
        isVisible={isShareModalVisible}
        onBackdropPress={() => setShareModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Contact</Text>
            <TouchableOpacity 
              onPress={() => setShareModalVisible(false)}
              style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.shareOptions}>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={JSON.stringify(shareData)}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <Text style={styles.qrCodeText}>Scan QR Code</Text>
            </View>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.nameDropButton}>
                <Smartphone size={24} color="#ffffff" />
                <Text style={styles.nameDropButtonText}>Share with NameDrop</Text>
              </TouchableOpacity>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    flex: 1,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    color: '#0066cc',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileDetails: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  recentActivity: {
    padding: 20,
  },
  activityItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: '#666',
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
    minHeight: 400,
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
    padding: 8,
  },
  shareOptions: {
    alignItems: 'center',
    gap: 24,
  },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCodeText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  nameDropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  nameDropButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});