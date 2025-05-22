import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, TrendingDown, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function GSTOverviewScreen() {
  const [gstData] = useState({
    totalTaxPaid: 125000,
    lastMonthTax: 15000,
    currentMonthEstimate: 18000,
    pendingReturns: 2,
    lastFiled: '15 Mar 2025',
    nextDue: '15 Apr 2025',
    complianceScore: 95,
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryContainer}>
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Tax Paid (FY 2024-25)</Text>
          <Text style={styles.summaryAmount}>₹{gstData.totalTaxPaid.toLocaleString()}</Text>
        </Animated.View>

        <View style={styles.comparisonContainer}>
          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={[styles.comparisonCard, styles.lastMonth]}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonTitle}>Last Month</Text>
              <TrendingDown size={20} color="#ff6b6b" />
            </View>
            <Text style={[styles.comparisonAmount, styles.lastMonthAmount]}>
              ₹{gstData.lastMonthTax.toLocaleString()}
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600)}
            style={[styles.comparisonCard, styles.currentMonth]}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonTitle}>Current Month (Est.)</Text>
              <TrendingUp size={20} color="#00cc88" />
            </View>
            <Text style={[styles.comparisonAmount, styles.currentMonthAmount]}>
              ₹{gstData.currentMonthEstimate.toLocaleString()}
            </Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <AlertCircle size={24} color="#0066cc" />
            <Text style={styles.statusTitle}>Filing Status</Text>
          </View>
          <View style={styles.statusContent}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pending Returns</Text>
              <Text style={styles.statusValue}>{gstData.pendingReturns}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Filed</Text>
              <Text style={styles.statusValue}>{gstData.lastFiled}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Next Due Date</Text>
              <Text style={styles.statusValue}>{gstData.nextDue}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1000)}
          style={styles.complianceCard}>
          <Text style={styles.complianceTitle}>Compliance Score</Text>
          <View style={styles.complianceScoreContainer}>
            <Text style={styles.complianceScore}>{gstData.complianceScore}</Text>
            <Text style={styles.complianceMax}>/100</Text>
          </View>
          <View style={styles.complianceBar}>
            <View 
              style={[
                styles.complianceProgress, 
                { width: `${gstData.complianceScore}%` }
              ]} 
            />
          </View>
          <Text style={styles.complianceStatus}>Excellent</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
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
  lastMonth: {
    backgroundColor: '#fff5f5',
  },
  currentMonth: {
    backgroundColor: '#f0fff4',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonTitle: {
    fontSize: 14,
    color: '#666',
  },
  comparisonAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lastMonthAmount: {
    color: '#ff6b6b',
  },
  currentMonthAmount: {
    color: '#00cc88',
  },
  statusContainer: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusContent: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  complianceCard: {
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
  complianceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  complianceScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  complianceScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  complianceMax: {
    fontSize: 24,
    color: '#666',
    marginLeft: 4,
  },
  complianceBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  complianceProgress: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 4,
  },
  complianceStatus: {
    fontSize: 16,
    color: '#00cc88',
    fontWeight: '600',
  },
});