import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { FileText, Share2, DollarSign } from 'lucide-react-native';
import Modal from 'react-native-modal';
import { Link, useRouter } from 'expo-router';

interface StoredDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  url: string;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StoredDocument | null>(null);

  const documents: StoredDocument[] = [
    {
      id: '1',
      name: 'Business Plan 2025.pdf',
      size: '2.5 MB',
      date: 'Mar 15, 2025',
      url: 'https://example.com/documents/business-plan.pdf'
    },
    {
      id: '2',
      name: 'Financial Report Q1.xlsx',
      size: '1.8 MB',
      date: 'Mar 12, 2025',
      url: 'https://example.com/documents/financial-report.xlsx'
    },
    {
      id: '3',
      name: 'Product Roadmap.docx',
      size: '1.2 MB',
      date: 'Mar 10, 2025',
      url: 'https://example.com/documents/product-roadmap.docx'
    }
  ];

  const handleShare = (document: StoredDocument) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleFreeShare = async () => {
    if (!selectedDocument) return;

    try {
      if (Platform.OS === 'web') {
        // Web sharing
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: selectedDocument.name,
              text: `Check out this document: ${selectedDocument.name}`,
              url: selectedDocument.url,
            });
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              Alert.alert(
                'Sharing Failed',
                'Unable to share the document. You can try copying the link manually.'
              );
            }
          }
        } else {
          // Fallback for browsers that don't support sharing
          Alert.alert(
            'Sharing Not Available',
            'Your browser does not support direct sharing. You can copy the link manually.'
          );
        }
      } else {
        // Native sharing
        await Share.share({
          title: selectedDocument.name,
          message: `${selectedDocument.name}\n\n${selectedDocument.url}`,
        });
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert(
        'Sharing Failed',
        'There was an error sharing the document. Please try again.'
      );
    }
  };

  const handleMonetizedShare = () => {
    if (!selectedDocument) return;
    
    router.push({
      pathname: '/inco/documents',
      params: {
        documentId: selectedDocument.id,
        documentName: selectedDocument.name,
        documentUrl: selectedDocument.url
      }
    });
    setShowShareModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {documents.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentInfo}>
              <FileText size={24} color="#0066cc" />
              <View style={styles.documentDetails}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentMeta}>{doc.size} • {doc.date}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare(doc)}>
              <Share2 size={20} color="#0066cc" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={showShareModal}
        onBackdropPress={() => setShowShareModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Share Document</Text>
          <Text style={styles.modalSubtitle}>
            Choose how you want to share {selectedDocument?.name}
          </Text>

          <View style={styles.shareOptions}>
            <TouchableOpacity 
              style={styles.shareOption}
              onPress={handleFreeShare}>
              <Share2 size={24} color="#0066cc" />
              <Text style={styles.shareOptionTitle}>Share for Free</Text>
              <Text style={styles.shareOptionDescription}>
                Share directly using your device's share options
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shareOption, styles.monetizedOption]}
              onPress={handleMonetizedShare}>
              <DollarSign size={24} color="#00cc88" />
              <Text style={[styles.shareOptionTitle, styles.monetizedTitle]}>
                Share via Income Center
              </Text>
              <Text style={[styles.shareOptionDescription, styles.monetizedDescription]}>
                Set a price and earn from your document
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
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
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  monetizedOption: {
    backgroundColor: '#f0fff4',
  },
  shareOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
  monetizedTitle: {
    color: '#00cc88',
  },
  shareOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  monetizedDescription: {
    color: '#00cc88',
  },
});