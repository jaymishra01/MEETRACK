import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { CirclePlus as PlusCircle, Clock, Bell, Users, Check, Square, SquareCheck as CheckSquare, Share2, CircleAlert as AlertCircle, Building2, Briefcase, CreditCard } from 'lucide-react-native';
import Modal from 'react-native-modal';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface Contact {
  id: string;
  full_name: string;
  company: string;
  position: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface BusinessCard {
  id: string;
  user_id: string;
  name: string;
  company: string;
  position: string;
  image_url?: string;
}

interface Reminder {
  id: string;
  title: string;
  checklist: ChecklistItem[];
  due_date: string;
  status: 'pending' | 'completed' | 'expired';
  assignee: Contact;
  business_card?: BusinessCard;
  created_at: string;
}

export default function RemindersScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [title, setTitle] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        router.replace('/(auth)/login');
        return;
      }

      if (!session?.user) {
        console.log('No authenticated user, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      setIsAuthenticated(true);

      // Load all data concurrently once authentication is confirmed
      await Promise.all([
        fetchReminders(),
        fetchContacts(),
        fetchBusinessCards()
      ]);
    } catch (error) {
      console.error('Error during authentication check:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          assignee:assignee_id(
            id,
            full_name,
            company,
            position
          ),
          business_card:business_card_id(
            id,
            user_id,
            name,
            company,
            position,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, company, position');

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    }
  };

  const fetchBusinessCards = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setBusinessCards(data || []);
    } catch (error) {
      console.error('Error fetching business cards:', error);
      Alert.alert('Error', 'Failed to load business cards');
    }
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;

    setChecklist([
      ...checklist,
      {
        id: Math.random().toString(),
        text: newItem.trim(),
        completed: false,
      },
    ]);
    setNewItem('');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleCreateReminder = async () => {
    if (!title || checklist.length === 0 || !selectedContact) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data: reminder, error } = await supabase
        .from('reminders')
        .insert({
          title,
          checklist,
          assignee_id: selectedContact.id,
          business_card_id: selectedCard?.id,
          due_date: dueDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Task assigned successfully!');
      setShowAddModal(false);
      resetForm();
      fetchReminders();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactModal(false);
  };

  const handleSelectCard = (card: BusinessCard) => {
    setSelectedCard(card);
    setShowCardModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setChecklist([]);
    setNewItem('');
    setSelectedContact(null);
    setSelectedCard(null);
  };

  // Show loading spinner while checking authentication and loading data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show message (though user should be redirected)
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please log in to access tasks</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks & Checklists</Text>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}>
        <PlusCircle size={24} color="#ffffff" />
        <Text style={styles.addButtonText}>Create New Task</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Tasks</Text>
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active tasks</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <Bell size={20} color="#0066cc" />
                <Text style={styles.reminderTime}>Due: {new Date(reminder.due_date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              
              <View style={styles.checklist}>
                {reminder.checklist.map((item) => (
                  <View key={item.id} style={styles.checklistItem}>
                    {item.completed ? (
                      <CheckSquare size={20} color="#00cc88" />
                    ) : (
                      <Square size={20} color="#666" />
                    )}
                    <Text style={[
                      styles.checklistText,
                      item.completed && styles.completedText
                    ]}>{item.text}</Text>
                  </View>
                ))}
              </View>

              {reminder.assignee && (
                <View style={styles.assigneeCard}>
                  <View style={styles.assigneeHeader}>
                    <Users size={32} color="#0066cc" />
                    <View style={styles.assigneeInfo}>
                      <Text style={styles.assigneeName}>{reminder.assignee.full_name}</Text>
                      <View style={styles.assigneeDetails}>
                        <Building2 size={12} color="#666" />
                        <Text style={styles.assigneeCompany}>{reminder.assignee.company}</Text>
                      </View>
                      <View style={styles.assigneeDetails}>
                        <Briefcase size={12} color="#666" />
                        <Text style={styles.assigneePosition}>{reminder.assignee.position}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {reminder.status === 'pending' && (
                <View style={styles.statusBadge}>
                  <Clock size={16} color="#0066cc" />
                  <Text style={styles.statusText}>Waiting for meeting</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <Modal
        isVisible={showAddModal}
        onBackdropPress={() => setShowAddModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Task</Text>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>Checklist</Text>
            {checklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem(item.id)}>
                {item.completed ? (
                  <CheckSquare size={20} color="#00cc88" />
                ) : (
                  <Square size={20} color="#666" />
                )}
                <Text style={[
                  styles.checklistText,
                  item.completed && styles.completedText
                ]}>{item.text}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add checklist item"
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addChecklistItem}
              />
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={addChecklistItem}>
                <PlusCircle size={20} color="#0066cc" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.contactSelector}
            onPress={() => setShowContactModal(true)}>
            <Users size={20} color="#0066cc" />
            <Text style={styles.contactSelectorText}>
              {selectedContact ? selectedContact.full_name : 'Select Contact'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cardSelector}
            onPress={() => setShowCardModal(true)}>
            <CreditCard size={20} color="#0066cc" />
            <Text style={styles.cardSelectorText}>
              {selectedCard ? selectedCard.name : 'Select Business Card to Share'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, (!title || checklist.length === 0 || !selectedContact) && styles.submitButtonDisabled]}
            disabled={!title || checklist.length === 0 || !selectedContact}
            onPress={handleCreateReminder}>
            <Text style={styles.submitButtonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={showContactModal}
        onBackdropPress={() => setShowContactModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Contact</Text>
          
          {contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              onPress={() => handleSelectContact(contact)}>
              <Users size={40} color="#0066cc" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.full_name}</Text>
                <Text style={styles.contactCompany}>{contact.company}</Text>
                <Text style={styles.contactPosition}>{contact.position}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        isVisible={showCardModal}
        onBackdropPress={() => setShowCardModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Business Card</Text>
          
          {businessCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.cardItem}
              onPress={() => handleSelectCard(card)}>
              <CreditCard size={40} color="#0066cc" />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.cardCompany}>{card.company}</Text>
                <Text style={styles.cardPosition}>{card.position}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  reminderTime: {
    fontSize: 14,
    color: '#0066cc',
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  checklist: {
    gap: 8,
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontSize: 16,
    color: '#444',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  assigneeCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  assigneeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assigneeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  assigneeCompany: {
    fontSize: 12,
    color: '#666',
  },
  assigneePosition: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#0066cc',
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  checklistSection: {
    marginBottom: 20,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addItemButton: {
    padding: 8,
  },
  contactSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  contactSelectorText: {
    fontSize: 16,
    color: '#0066cc',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: '#666',
  },
  contactPosition: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  cardSelectorText: {
    fontSize: 16,
    color: '#0066cc',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 14,
    color: '#666',
  },
  cardPosition: {
    fontSize: 12,
    color: '#666',
  },
});