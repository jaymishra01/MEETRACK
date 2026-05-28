import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface UserReputationBadgeProps {
  userId: string;
  showDetails?: boolean;
}

export function UserReputationBadge({ userId, showDetails = false }: UserReputationBadgeProps) {
  const [reputation, setReputation] = useState({
    reputation_score: 50,
    defaulter_flags_count: 0,
    total_loans_borrowed: 0,
    total_loans_lent: 0,
    successful_repayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReputation();
  }, [userId]);

  const fetchReputation = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'reputation_score, defaulter_flags_count, total_loans_borrowed, total_loans_lent, successful_repayments'
        )
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setReputation(data);
      }
    } catch (error) {
      console.error('Error fetching reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#0891b2';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#ea580c';
    return '#dc2626';
  };

  const getReputationLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  };

  if (loading) {
    return null;
  }

  const hasDefaulterFlags = reputation.defaulter_flags_count > 0;
  const reputationColor = getReputationColor(reputation.reputation_score || 50);

  return (
    <View style={styles.container}>
      {hasDefaulterFlags && (
        <View style={styles.warningBadge}>
          <AlertTriangle size={20} color="#dc2626" />
          <View>
            <Text style={styles.warningTitle}>Defaulter Alert!</Text>
            <Text style={styles.warningText}>
              {reputation.defaulter_flags_count} active defaulter flag(s)
            </Text>
          </View>
        </View>
      )}

      <View style={styles.reputationCard}>
        <View style={styles.reputationHeader}>
          <Shield size={24} color={reputationColor} />
          <Text style={styles.reputationTitle}>Reputation Score</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: reputationColor }]}>
            {reputation.reputation_score || 50}%
          </Text>
          <Text style={[styles.scoreLabel, { color: reputationColor }]}>
            {getReputationLabel(reputation.reputation_score || 50)}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${reputation.reputation_score || 50}%`, backgroundColor: reputationColor },
            ]}
          />
        </View>

        {showDetails && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <TrendingUp size={16} color="#0066cc" />
              <Text style={styles.detailText}>
                {reputation.total_loans_lent} loans given
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailBullet}>-</Text>
              <Text style={styles.detailText}>
                {reputation.total_loans_borrowed} loans taken
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailBullet}>-</Text>
              <Text style={styles.detailText}>
                {reputation.successful_repayments} successful repayments
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    marginTop: 2,
  },
  reputationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reputationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reputationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  detailBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    width: 20,
  },
});
