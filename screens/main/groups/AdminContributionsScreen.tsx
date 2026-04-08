import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { D } from '../../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  AdminContributions: {
    group_id: number;
    group_title: string;
  };
  Signin: undefined;
};

interface Contribution {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  payout_position?: number;
  amount: number;
  note?: string;
  proof_url?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const getInitials = (name?: string) =>
  (name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:      { label: 'Pending',       color: D.accent,   bg: D.accentSoft,             icon: 'time-outline' as const },
  under_review: { label: 'Under review',  color: D.warn,     bg: D.warnSoft,               icon: 'alert-circle-outline' as const },
  verified:     { label: 'Verified',      color: D.primary,  bg: 'rgba(0,214,143,0.12)',   icon: 'checkmark-circle' as const },
  rejected:     { label: 'Rejected',      color: D.danger,   bg: D.dangerSoft,             icon: 'close-circle' as const },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'pending' | 'under_review' | 'verified' | 'rejected';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'pending',      label: 'Pending' },
  { key: 'under_review', label: 'Review' },
  { key: 'verified',     label: 'Verified' },
  { key: 'rejected',     label: 'Rejected' },
];

// ─── Contribution Card ────────────────────────────────────────────────────────

interface ContributionCardProps {
  item: Contribution;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processing: 'approve' | 'reject' | null;
}

const ContributionCard: React.FC<ContributionCardProps> = ({ item, onApprove, onReject, processing }) => {
  const s = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const isActionable = item.status === 'pending' || item.status === 'under_review';
  const isProcessing = processing !== null;

  const openProof = async () => {
    if (!item.proof_url) {
      Alert.alert('No proof', 'This submission did not include a proof URL.');
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(item.proof_url);
      if (canOpen) {
        await Linking.openURL(item.proof_url);
      } else {
        Alert.alert('Cannot open link', 'Unable to open the proof URL on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to open proof URL.');
    }
  };

  return (
    <View style={cardStyles.card}>
      {/* ── Header ── */}
      <View style={cardStyles.header}>
        <View style={cardStyles.avatarWrap}>
          <LinearGradient
            colors={['rgba(110,181,255,0.25)', 'rgba(110,181,255,0.10)']}
            style={cardStyles.avatar}
          >
            <Text style={cardStyles.avatarTxt}>{getInitials(item.user_name)}</Text>
          </LinearGradient>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.userName} numberOfLines={1}>{item.user_name}</Text>
          <Text style={cardStyles.userEmail} numberOfLines={1}>{item.user_email}</Text>
          {item.payout_position ? (
            <Text style={cardStyles.slotLabel}>Slot #{item.payout_position}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={cardStyles.amount}>{formatCurrency(item.amount)}</Text>
          <Text style={cardStyles.date}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      {/* ── Status + proof row ── */}
      <View style={cardStyles.metaRow}>
        <View style={[cardStyles.statusPill, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon} size={12} color={s.color} />
          <Text style={[cardStyles.statusLabel, { color: s.color }]}>{s.label}</Text>
        </View>
        {item.proof_url ? (
          <TouchableOpacity style={cardStyles.proofBtn} onPress={openProof} activeOpacity={0.8}>
            <Ionicons name="document-attach-outline" size={13} color={D.accent} />
            <Text style={cardStyles.proofBtnText}>View proof</Text>
          </TouchableOpacity>
        ) : (
          <View style={cardStyles.noProofPill}>
            <Ionicons name="attach-outline" size={12} color={D.textMuted} />
            <Text style={cardStyles.noProofText}>No proof attached</Text>
          </View>
        )}
      </View>

      {/* ── Note ── */}
      {item.note ? (
        <View style={cardStyles.noteWrap}>
          <Ionicons name="chatbubble-outline" size={12} color={D.textMuted} />
          <Text style={cardStyles.noteText} numberOfLines={2}>{item.note}</Text>
        </View>
      ) : null}

      {/* ── Actions (only for pending/under_review) ── */}
      {isActionable && (
        <View style={cardStyles.actions}>
          <TouchableOpacity
            style={[cardStyles.rejectBtn, isProcessing && cardStyles.btnDisabled]}
            onPress={() => onReject(item.id)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {processing === 'reject' ? (
              <ActivityIndicator size="small" color={D.danger} />
            ) : (
              <>
                <Ionicons name="close" size={15} color={D.danger} />
                <Text style={cardStyles.rejectBtnText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[cardStyles.approveBtn, isProcessing && cardStyles.btnDisabled]}
            onPress={() => onApprove(item.id)}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {processing === 'approve' ? (
              <ActivityIndicator size="small" color="#0a1a0f" />
            ) : (
              <>
                <Ionicons name="checkmark" size={15} color="#0a1a0f" />
                <Text style={cardStyles.approveBtnText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: D.surfaceCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: D.border,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarWrap: { flexShrink: 0 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: D.accent,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: D.text,
  },
  userEmail: {
    fontSize: 12,
    color: D.textMuted,
    marginTop: 1,
  },
  slotLabel: {
    fontSize: 11,
    color: D.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: D.primary,
  },
  date: {
    fontSize: 11,
    color: D.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  proofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: D.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(110,181,255,0.25)',
  },
  proofBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: D.accent,
  },
  noProofPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: D.surface,
  },
  noProofText: {
    fontSize: 12,
    color: D.textMuted,
  },
  noteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: D.surface,
    borderRadius: 10,
    padding: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: D.textSub,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: D.dangerSoft,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: D.danger,
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: D.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a1a0f',
  },
  btnDisabled: { opacity: 0.55 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminContributionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AdminContributions'>>();
  const { group_id, group_title } = route.params;

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [processing, setProcessing] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);

  // ── Load contributions ──
  const loadContributions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { navigation.navigate('Signin'); return; }

      const res = await axios.get(
        `${Constants.expoConfig?.extra?.apiUrl}/user/group/${group_id}/contributions`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
      );
      setContributions(res.data?.data ?? []);
    } catch (err: any) {
      if (err?.response?.status === 401) { navigation.navigate('Signin'); return; }
      if (!silent) Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load contributions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [group_id]);

  useFocusEffect(useCallback(() => { loadContributions(); }, [loadContributions]));

  // ── Approve ──
  const handleApprove = (contributionId: number) => {
    const item = contributions.find(c => c.id === contributionId);
    Alert.alert(
      'Approve contribution',
      `Confirm ${item?.user_name ?? 'member'}'s payment of ${formatCurrency(item?.amount ?? 0)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessing({ id: contributionId, action: 'approve' });
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) { navigation.navigate('Signin'); return; }

              await axios.put(
                `${Constants.expoConfig?.extra?.apiUrl}/user/group/${group_id}/contributions/${contributionId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
              );

              setContributions(prev =>
                prev.map(c => c.id === contributionId ? { ...c, status: 'verified' } : c),
              );
            } catch (err: any) {
              if (err?.response?.status === 401) { navigation.navigate('Signin'); return; }
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to approve. Please try again.');
            } finally {
              setProcessing(null);
            }
          },
        },
      ],
    );
  };

  // ── Reject ──
  const handleReject = (contributionId: number) => {
    const item = contributions.find(c => c.id === contributionId);
    Alert.alert(
      'Reject contribution',
      `Reject ${item?.user_name ?? 'member'}'s payment? They will be notified to resubmit.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessing({ id: contributionId, action: 'reject' });
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) { navigation.navigate('Signin'); return; }

              await axios.put(
                `${Constants.expoConfig?.extra?.apiUrl}/user/group/${group_id}/contributions/${contributionId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
              );

              setContributions(prev =>
                prev.map(c => c.id === contributionId ? { ...c, status: 'rejected' } : c),
              );
            } catch (err: any) {
              if (err?.response?.status === 401) { navigation.navigate('Signin'); return; }
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to reject. Please try again.');
            } finally {
              setProcessing(null);
            }
          },
        },
      ],
    );
  };

  // ── Filtered list ──
  const displayed = filter === 'all'
    ? contributions
    : contributions.filter(c => c.status === filter);

  const pendingCount = contributions.filter(c => c.status === 'pending' || c.status === 'under_review').length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={18} color={D.textSub} />
        </TouchableOpacity>
        <View style={styles.navMid}>
          <Text style={styles.navTitle}>Contributions</Text>
          <Text style={styles.navSub} numberOfLines={1}>{group_title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: 'rgba(0,214,143,0.10)', borderColor: 'rgba(0,214,143,0.25)' }]}
          onPress={() => loadContributions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={17} color={D.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Stats banner ── */}
      {!loading && contributions.length > 0 && (
        <View style={styles.statsBanner}>
          {[
            { label: 'Total',    value: String(contributions.length),                                  color: D.textSub },
            { label: 'Pending',  value: String(pendingCount),                                          color: pendingCount > 0 ? D.warn : D.textSub },
            { label: 'Verified', value: String(contributions.filter(c => c.status === 'verified').length), color: D.primary },
            { label: 'Rejected', value: String(contributions.filter(c => c.status === 'rejected').length), color: D.danger },
          ].map(stat => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Filter tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScrollView}
      >
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          const count = f.key === 'all'
            ? contributions.length
            : contributions.filter(c => c.status === f.key).length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={D.primary} />
          <Text style={styles.loadingText}>Loading contributions…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadContributions(true); }}
              tintColor={D.primary}
            />
          }
        >
          {displayed.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={32} color={D.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'No contributions yet' : `No ${filter.replace('_', ' ')} contributions`}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? 'Member contributions will appear here once submitted'
                  : 'Try a different filter to see other submissions'}
              </Text>
            </View>
          ) : (
            <>
              {pendingCount > 0 && filter === 'all' && (
                <View style={styles.actionRequiredBanner}>
                  <LinearGradient
                    colors={['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.06)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <Ionicons name="alert-circle-outline" size={16} color={D.warn} />
                  <Text style={styles.actionRequiredText}>
                    {pendingCount} contribution{pendingCount !== 1 ? 's' : ''} need{pendingCount === 1 ? 's' : ''} your review
                  </Text>
                </View>
              )}
              {displayed.map(item => (
                <ContributionCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processing?.id === item.id ? processing.action : null}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },

  // ── Navbar ──
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: D.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: D.border,
    flexShrink: 0,
  },
  navMid: { flex: 1, alignItems: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700', color: D.text },
  navSub: { fontSize: 11, color: D.textMuted, marginTop: 1 },

  // ── Stats banner ──
  statsBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: D.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: D.border,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    borderRightWidth: 1,
    borderRightColor: D.border,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: D.textMuted, fontWeight: '500' },

  // ── Filter tabs ──
  filterScrollView: { maxHeight: 48, marginBottom: 4 },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: D.surfaceCard,
    borderWidth: 1,
    borderColor: D.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,214,143,0.12)',
    borderColor: 'rgba(0,214,143,0.35)',
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: D.textSub },
  filterChipTextActive: { color: D.primary },
  filterCount: {
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: D.surface,
    alignItems: 'center',
  },
  filterCountActive: { backgroundColor: 'rgba(0,214,143,0.20)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: D.textMuted },
  filterCountTextActive: { color: D.primary },

  // ── List ──
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 12,
  },

  // ── Action required banner ──
  actionRequiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.30)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  actionRequiredText: {
    fontSize: 13,
    fontWeight: '600',
    color: D.warn,
    flex: 1,
  },

  // ── Loading / empty ──
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: D.textMuted },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: D.surface,
    borderWidth: 1,
    borderColor: D.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: D.textSub },
  emptyText: { fontSize: 13, color: D.textMuted, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
});
