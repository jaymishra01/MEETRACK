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
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Loan {
  id: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  total_repayment: number;
  monthly_emi: number;
  amount_repaid: number;
  months_paid: number;
  start_date: string;
  end_date: string;
  next_payment_date: string;
  status: string;
  purpose: string;
  borrower_id: string;
  lender_id: string;
  borrower?: {
    full_name: string;
    reputation_score: number;
    defaulter_flags_count: number;
  };
  lender?: {
    full_name: string;
    reputation_score: number;
  };
  created_at: string;
}

export default function MyLoansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent'>('all');

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('loans')
        .select(
          `
          *,
          borrower:users!loans_borrower_id_fkey (
            full_name,
            reputation_score,
            defaulter_flags_count
          ),
          lender:users!loans_lender_id_fkey (
            full_name,
            reputation_score
          )
        `
        )
        .order('created_at', { ascending: false });

      if (filter === 'borrowed') {
        query = query.eq('borrower_id', user.id);
      } else if (filter === 'lent') {
        query = query.eq('lender_id', user.id);
      } else {
        query = query.or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate missing fields
      const loansWithCalcs = data?.map(loan => ({
        ...loan,
        total_repayment:
          loan.total_repayment ||
          Math.round(loan.principal_amount * (1 + loan.interest_rate / 100)),
        monthly_emi:
          loan.monthly_emi ||
          Math.round(
            (loan.principal_amount * (1 + loan.interest_rate / 100)) /
              loan.duration_months
          ),
      }));

      setLoans(loansWithCalcs || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#0066cc';
      case 'completed':
        return '#059669';
      case 'defaulted':
      case 'flagged':
        return '#dc2626';
      case 'pending':
        return '#f59e0b';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp size={16} color={getStatusColor(status)} />;
      case 'completed':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'defaulted':
      case 'flagged':
        return <AlertTriangle size={16} color={getStatusColor(status)} />;
      case 'pending':
        return <Clock size={16} color={getStatusColor(status)} />;
      default:
        return null;
    }
  };

  const renderLoan = (loan: Loan) => {
    const isBorrower = loan.borrower_id === user?.id;
    const progressPercentage = (loan.amount_repaid / loan.total_repayment) * 100;
    const otherParty = isBorrower ? loan.lender : loan.borrower;

    return (
      <TouchableOpacity
        key={loan.id}
        style={styles.loanCard}
        onPress={() => router.push(`/loans/${loan.id}`)}
      >
        <View style={styles.loanHeader}>
          <View style={styles.loanTitleContainer}>
            <View style={styles.loanDirection}>
              {isBorrower ? (
                <ArrowDownLeft size={20} color="#dc2626" />
              ) : (
                <ArrowUpRight size={20} color="#059669" />
              )}
              <Text style={styles.loanDirectionText}>
                {isBorrower ? 'Borrowed' : 'Lent'}
              </Text>
            </View>
            <Text style={styles.loanAmount}>
              ₹{loan.principal_amount.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(loan.status) + '20' },
            ]}
          >
            {getStatusIcon(loan.status)}
            <Text
              style={[styles.statusText, { color: getStatusColor(loan.status) }]}
            >
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.loanInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {isBorrower ? 'Lender' : 'Borrower'}
            </Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {otherParty?.full_name || 'Unknown'}
              </Text>
              {!isBorrower && loan.borrower?.defaulter_flags_count > 0 && (
                <View style={styles.warningIcon}>
                  <AlertTriangle size={14} color="#dc2626" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Rate</Text>
            <Text style={styles.infoValue}>{loan.interest_rate}% p.a.</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{loan.duration_months} months</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly EMI</Text>
            <Text style={styles.infoValue}>
              ₹{loan.monthly_emi?.toLocaleString()}
            </Text>
          </View>
        </View>

        {loan.status === 'active' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Repayment Progress</Text>
              <Text style={styles.progressValue}>
                {loan.amount_repaid.toLocaleString()} /{' '}
                {loan.total_repayment?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {loan.months_paid} of {loan.duration_months} months paid
            </Text>
          </View>
        )}

        {loan.purpose && (
          <Text style={styles.purpose} numberOfLines={2}>
            {loan.purpose}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading your loans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Loans</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'borrowed' && styles.filterActive,
          ]}
          onPress={() => setFilter('borrowed')}
        >
          <ArrowDownLeft
            size={16}
            color={filter === 'borrowed' ? '#0066cc' : '#666'}
          />
          <Text
            style={[
              styles.filterText,
              filter === 'borrowed' && styles.filterTextActive,
            ]}
          >
            Borrowed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'lent' && styles.filterActive,
          ]}
          onPress={() => setFilter('lent')}
        >
          <ArrowUpRight
            size={16}
            color={filter === 'lent' ? '#0066cc' : '#666'}
          />
          <Text
            style={[
              styles.filterText,
              filter === 'lent' && styles.filterTextActive,
            ]}
          >
            Lent
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loans.length > 0 ? (
          loans.map(renderLoan)
        ) : (
          <View style={styles.emptyState}>
            <HandCoins size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Loans Found</Text>
            <Text style={styles.emptyDescription}>
              {filter === 'all'
                ? "You don't have any active loans"
                : filter === 'borrowed'
                ? "You haven't borrowed any loans yet"
                : "You haven't lent any loans yet"}
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
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
  filterActive: {
    backgroundColor: '#e0f2fe',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#0066cc',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loanCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loanTitleContainer: {
    flex: 1,
  },
  loanDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  loanDirectionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loanInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  warningIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  purpose: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
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
