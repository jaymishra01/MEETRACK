import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { FileText, Upload, DollarSign, Lock, Trash2 } from 'lucide-react-native';
import Modal from 'react-native-modal';

interface SharedDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  price: number;
  sharedWith: number;
  earnings: number;
}

export default function DocumentsScreen() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [price, setPrice] = useState('');

  const documents: SharedDocument[] = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'PDF',
      size: '2.5 MB',
      price: 500,
      sharedWith: 3,
      earnings: 1500
    },
    {
      id: '2',
      name: 'Market Research.docx',
      type: 'Document',
      size: '1.8 MB',
      price: 750,
      sharedWith: 2,
      earnings: 1500
    },
    {
      id: '3',
      name: 'Product Demo.mp4',
      type: 'Video',
      size: '25.6 MB',
      price: 1000,
      sharedWith: 5,
      earnings: 5000
    }
  ];

  const totalEarnings = documents.reduce((sum, doc) => sum + doc.earnings, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalEarnings}>₹{totalEarnings.toLocaleString()}</Text>
        <Text style={styles.earningsLabel}>Total Document Earnings</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}>
          <Upload size={24} color="#ffffff" />
          <Text style={styles.uploadButtonText}>Share New Document</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Shared Documents</Text>
        {documents.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <FileText size={24} color="#0066cc" />
              <TouchableOpacity style={styles.deleteButton}>
                <Trash2 size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
            <Text style={styles.documentName}>{doc.name}</Text>
            <View style={styles.documentMeta}>
              <Text style={styles.metaText}>{doc.type} • {doc.size}</Text>
            </View>
            <View style={styles.documentStats}>
              <View style={styles.statItem}>
                <DollarSign size={16} color="#666" />
                <Text style={styles.statText}>₹{doc.price} per access</Text>
              </View>
              <View style={styles.statItem}>
                <Lock size={16} color="#666" />
                <Text style={styles.statText}>{doc.sharedWith} purchases</Text>
              </View>
            </View>
            <View style={styles.earningsBar}>
              <Text style={styles.earningsText}>Earned: ₹{doc.earnings}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={showUploadModal}
        onBackdropPress={() => setShowUploadModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Share Document</Text>
          <Text style={styles.modalSubtitle}>Upload a document to share with your network</Text>

          <TouchableOpacity style={styles.fileSelector}>
            <Upload size={24} color="#0066cc" />
            <Text style={styles.fileSelectorText}>Select File</Text>
          </TouchableOpacity>

          <View style={styles.priceInput}>
            <Text style={styles.inputLabel}>Set Price (₹)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => setShowUploadModal(false)}>
            <Text style={styles.shareButtonText}>Share Document</Text>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  totalEarnings: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    padding: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  documentStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  earningsBar: {
    backgroundColor: '#e6f0ff',
    padding: 8,
    borderRadius: 8,
  },
  earningsText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
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
  fileSelector: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileSelectorText: {
    fontSize: 16,
    color: '#0066cc',
    marginTop: 8,
  },
  priceInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});