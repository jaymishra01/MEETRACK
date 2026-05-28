import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  HandCoins,
  AlertTriangle,
  FileText,
  Users,
  Plus,
  Filter,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface LoanOffer {
  id: string;
  lender_id: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  total_repayment: number;
  monthly_emi: number;
  description: string;
  created_at: string;
  lender?: {
    full_name: string;
    reputation_score: number;
  };
}

interface LoanRequest {
  id: string;
  borrower_id: string;
  requested_amount: number;
  purpose: string;
  preferred_interest_rate: number | null;
  preferred_duration: number | null;
  urgency: string;
  created_at: string;
  borrower?: {
    full_name: string;
    reputation_score: number;
    defaulter_flags_count: number;
  };
}

type TabType = 'marketplace' | 'my_loans' | 'requests' | 'offers';

export default function LoansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'marketplace') {
        await fetchLoanOffers();
        await fetchLoanRequests();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchLoanOffers = async () => {
    const { data, error } = await supabase
      .from('loan_offers')
      .select(
        `
        *,
        lender:users!loan_offers_lender_id_fkey (
          full_name,
          reputation_score
        )
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loan offers:', error);
      return;
    }

    // Calculate repayment amounts
    const offersWithCalculations = data?.map(offer => ({
      ...offer,
      total_repayment: Math.round(
        offer.principal_amount * (1 + offer.interest_rate / 100)
      ),
      monthly_emi: Math.round(
        (offer.principal_amount * (1 + offer.interest_rate / 100)) /
          offer.duration_months
      ),
    }));

    setLoanOffers(offersWithCalculations || []);
  };

  const fetchLoanRequests = async () => {
    const { data, error } = await supabase
      .from('loan_requests')
      .select(
        `
        *,
        borrower:users!loan_requests_borrower_id_fkey (
          full_name,
          reputation_score,
          defaulter_flags_count
        )
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loan requests:', error);
      return;
    }

    setLoanRequests(data || []);
  };

  const renderLoanOffer = (offer: LoanOffer) => (
    <TouchableOpacity
      key={offer.id}
      style={styles.card}
      onPress={() => router.push(`/loans/offer/${offer.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.lenderInfo}>
          <Users size={20} color="#0066cc" />
          <View>
            <Text style={styles.lenderName}>
              {offer.lender?.full_name || 'Anonymous Lender'}
            </Text>
            <View style={styles.reputationBadge}>
              <Text style={styles.reputationText}>
                Reputation: {offer.lender?.reputation_score || 50}%
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.principalAmount}>
            ₹{offer.principal_amount.toLocaleString()}
          </Text>
          <Text style={styles.interestRate}>
            {offer.interest_rate}% p.a.
          </Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{offer.duration_months} months</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>EMI</Text>
          <Text style={styles.detailValue}>
            ₹{offer.monthly_emi?.toLocaleString()}/mo
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total Repayment</Text>
          <Text style={styles.detailValue}>
            ₹{offer.total_repayment?.toLocaleString()}
          </Text>
        </View>
      </View>

      {offer.description && (
        <Text style={styles.description} numberOfLines={2}>
          {offer.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderLoanRequest = (request: LoanRequest) => (
    <TouchableOpacity
      key={request.id}
      style={styles.card}
      onPress={() => router.push(`/loans/request/${request.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.lenderInfo}>
          <Users size={20} color="#0066cc" />
          <View>
            <Text style={styles.lenderName}>
              {request.borrower?.full_name || 'Anonymous Borrower'}
            </Text>
            <View style={styles.reputationRow}>
              <View style={styles.reputationBadge}>
                <Text style={styles.reputationText}>
                  {request.borrower?.reputation_score || 50}%
                </Text>
              </View>
              {request.borrower?.defaulter_flags_count > 0 && (
                <View style={styles.warningBadge}>
                  <AlertTriangle size={14} color="#dc2626" />
                  <Text style={styles.warningText}>
                    {request.borrower.defaulter_flags_count} flags
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.principalAmount}>
            ₹{request.requested_amount.toLocaleString()}
          </Text>
          <View
            style={[
              styles.urgencyBadge,
              request.urgency === 'high' && styles.urgencyHigh,
              request.urgency === 'medium' && styles.urgencyMedium,
            ]}
          >
            <Text style={styles.urgencyText}>{request.urgency}</Text>
          </View>
        </View>
      </View>

      {request.purpose && (
        <Text style={styles.description} numberOfLines={2}>
          {request.purpose}
        </Text>
      )}

      <View style={styles.loanDetails}>
        {request.preferred_interest_rate && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Max Interest</Text>
            <Text style={styles.detailValue}>
              {request.preferred_interest_rate}% p.a.
            </Text>
          </View>
        )}
        {request.preferred_duration && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {request.preferred_duration} months
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading loan marketplace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Peer-to-Peer Loans</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
          onPress={() => setActiveTab('marketplace')}
        >
          <TrendingUp size={18} color={activeTab === 'marketplace' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>
            Marketplace
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my_loans' && styles.activeTab]}
          onPress={() => setActiveTab('my_loans')}
        >
          <HandCoins size={18} color={activeTab === 'my_loans' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'my_loans' && styles.activeTabText]}>
            My Loans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <FileText size={18} color={activeTab === 'requests' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'marketplace' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Loan Offers</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/loans/create-offer')}
                >
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              {loanOffers.length > 0 ? (
                loanOffers.map(renderLoanOffer)
              ) : (
                <Text style={styles.emptyText}>
                  No loan offers available currently
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Loan Requests</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/loans/create-request')}
                >
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              {loanRequests.length > 0 ? (
                loanRequests.map(renderLoanRequest)
              ) : (
                <Text style={styles.emptyText}>
                  No loan requests available currently
                </Text>
              )}
            </View>
          </>
        )}

        {activeTab === 'my_loans' && (
          <View style={styles.emptyState}>
            <HandCoins size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Active Loans</Text>
            <Text style={styles.emptyDescription}>
              Start by creating a loan offer or accepting a loan request
            </Text>
          </View>
        )}

        {activeTab === 'requests' && (
          <View style={styles.emptyState}>
            <FileText size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Loan Requests</Text>
            <Text style={styles.emptyDescription}>
              Create a loan request to borrow from the community
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e0f2fe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0066cc',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lenderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lenderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reputationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reputationBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reputationText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  principalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  interestRate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: '#f0f0f0',
  },
  urgencyHigh: {
    backgroundColor: '#fef2f2',
  },
  urgencyMedium: {
    backgroundColor: '#fffbeb',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: '#666',
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
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
});
