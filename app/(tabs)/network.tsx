import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Users, Search, Share2, Building2, MapPin, Calendar } from 'lucide-react-native';
import Modal from 'react-native-modal';

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  meetingDate: string;
  image: string;
  eventType: 'conference' | 'expo' | 'office' | 'other';
  location: string;
}

export default function NetworkScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'conference' | 'expo' | 'office'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Parker',
      title: 'UX Designer',
      company: 'Google',
      meetingDate: 'March 15, 2025',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      eventType: 'conference',
      location: 'TechCon 2025, San Francisco'
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'Apple',
      meetingDate: 'March 12, 2025',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      eventType: 'expo',
      location: 'Digital Expo 2025, New York'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      title: 'Sales Director',
      company: 'Microsoft',
      meetingDate: 'March 10, 2025',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      eventType: 'office',
      location: 'Microsoft HQ, Seattle'
    },
    {
      id: '4',
      name: 'James Lee',
      title: 'CTO',
      company: 'Tesla',
      meetingDate: 'March 8, 2025',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      eventType: 'conference',
      location: 'AI Summit 2025, Las Vegas'
    }
  ];

  const handleShare = (contact: Contact) => {
    setSelectedContact(contact);
    setShowShareModal(true);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'conference':
        return <Users size={16} color="#0066cc" />;
      case 'expo':
        return <Building2 size={16} color="#00cc88" />;
      case 'office':
        return <Building2 size={16} color="#ff6b6b" />;
      default:
        return <Calendar size={16} color="#666" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'conference':
        return '#e6f0ff';
      case 'expo':
        return '#e6f9f3';
      case 'office':
        return '#ffe6e6';
      default:
        return '#f8f9fa';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (activeTab !== 'all' && contact.eventType !== activeTab) return false;
    return (
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    conference: contacts.filter(c => c.eventType === 'conference').length,
    expo: contacts.filter(c => c.eventType === 'expo').length,
    office: contacts.filter(c => c.eventType === 'office').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Network</Text>
        <Text style={styles.subtitle}>{contacts.length} Total Connections</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statCard, activeTab === 'conference' && styles.activeStatCard]}
          onPress={() => setActiveTab(activeTab === 'conference' ? 'all' : 'conference')}>
          <Users size={24} color="#0066cc" />
          <Text style={styles.statNumber}>{stats.conference}</Text>
          <Text style={styles.statLabel}>Conferences</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, activeTab === 'expo' && styles.activeStatCard]}
          onPress={() => setActiveTab(activeTab === 'expo' ? 'all' : 'expo')}>
          <Building2 size={24} color="#00cc88" />
          <Text style={styles.statNumber}>{stats.expo}</Text>
          <Text style={styles.statLabel}>Expos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, activeTab === 'office' && styles.activeStatCard]}
          onPress={() => setActiveTab(activeTab === 'office' ? 'all' : 'office')}>
          <Building2 size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>{stats.office}</Text>
          <Text style={styles.statLabel}>Office Meets</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredContacts.map((contact) => (
          <View 
            key={contact.id} 
            style={[
              styles.contactCard,
              { backgroundColor: getEventColor(contact.eventType) }
            ]}>
            <View style={styles.contactHeader}>
              <Image source={{ uri: contact.image }} style={styles.contactImage} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactTitle}>{contact.title} at {contact.company}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(contact)}>
                <Share2 size={20} color="#0066cc" />
              </TouchableOpacity>
            </View>
            <View style={styles.contactMeta}>
              <View style={styles.metaItem}>
                {getEventIcon(contact.eventType)}
                <Text style={styles.metaText}>
                  {contact.eventType.charAt(0).toUpperCase() + contact.eventType.slice(1)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={16} color="#666" />
                <Text style={styles.metaText}>{contact.meetingDate}</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={16} color="#666" />
                <Text style={styles.metaText}>{contact.location}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Share Modal */}
      <Modal
        isVisible={showShareModal}
        onBackdropPress={() => setShowShareModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Share Contact</Text>
          <Text style={styles.modalSubtitle}>
            Share {selectedContact?.name}'s business card
          </Text>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowShareModal(false)}>
            <Share2 size={24} color="#ffffff" />
            <Text style={styles.modalButtonText}>Share Business Card</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
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
  activeStatCard: {
    backgroundColor: '#f0f7ff',
    borderColor: '#0066cc',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contactCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  contactMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});