import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Share2, Phone, FileText, QrCode, Smartphone, X } from 'lucide-react-native';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import { useState } from 'react';

export default function ProfileScreen() {
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const profileImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  
  const handleShare = () => {
    setShareModalVisible(true);
  };

  const shareData = {
    name: "John Doe",
    title: "Senior Product Manager",
    company: "TechCorp Industries",
    email: "john.doe@techcorp.com",
    phone: "+1 (555) 123-4567"
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.title}>Senior Product Manager</Text>
        <Text style={styles.company}>TechCorp Industries</Text>
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
            <Text style={styles.statNumber}>127</Text>
            <Text style={styles.statLabel}>NETWORK</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/finance" asChild>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statNumber}>₹12,450</Text>
            <Text style={styles.statLabel}>NETWORTH</Text>
          </TouchableOpacity>
        </Link>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
  recentActivity: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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