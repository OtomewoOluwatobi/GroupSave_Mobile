import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
    TouchableOpacity,
    Dimensions,
    Animated,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { semanticColors } from '../../../../theme/semanticColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupUser {
    name?: string;
    mobile?: string;
    email?: string;
    pivot: {
        role: string;
        is_active: boolean;
        payout_position?: number;
    };
}

interface Group {
    id: number;
    title: string;
    target_amount: number;
    payable_amount?: number;
    total_users: number;
    active_users_count: number;
    current_month?: number;
    expected_start_date?: string;
    payment_out_day?: number;
    users: Array<GroupUser>;
}

type RootStackParamList = {
    GroupDetails: { group_id: number };
    Signin: undefined;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const capitalize = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

const getInitials = (name?: string) =>
    (name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

// ─── Shadow Styles ────────────────────────────────────────────────────────────

const shadowStyles = Platform.select({
    ios: {
        shadowColor: semanticColors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    android: { elevation: 4 },
});

// ─── Pure-RN Circular Progress ────────────────────────────────────────────────

const CircleProgress = ({
    percent,
    size = 130,
    strokeWidth = 12,
    color = semanticColors.buttonPrimary,
    trackColor = semanticColors.progressBackground,
    children,
}: {
    percent: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    children?: React.ReactNode;
}) => {
    const half = size / 2;
    const clamp = Math.min(100, Math.max(0, percent));
    const rightDeg = clamp > 50 ? 180 : clamp * 3.6;
    const leftDeg = clamp > 50 ? (clamp - 50) * 3.6 : 0;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Track */}
            <View style={{
                position: 'absolute', width: size, height: size,
                borderRadius: half, borderWidth: strokeWidth, borderColor: trackColor,
            }} />

            {/* Right slice (0–50%) */}
            <View style={{
                position: 'absolute', width: size, height: size,
                borderRadius: half, overflow: 'hidden',
            }}>
                <View style={{
                    position: 'absolute', left: half, top: 0,
                    width: half, height: size, overflow: 'hidden',
                }}>
                    <View style={{
                        position: 'absolute', left: -half, top: 0,
                        width: size, height: size, borderRadius: half,
                        borderWidth: strokeWidth, borderColor: color,
                        transform: [{ rotate: `${rightDeg}deg` }],
                    }} />
                </View>
            </View>

            {/* Left slice (50–100%) */}
            {clamp > 50 && (
                <View style={{
                    position: 'absolute', width: size, height: size,
                    borderRadius: half, overflow: 'hidden',
                }}>
                    <View style={{
                        position: 'absolute', left: 0, top: 0,
                        width: half, height: size, overflow: 'hidden',
                    }}>
                        <View style={{
                            position: 'absolute', left: 0, top: 0,
                            width: size, height: size, borderRadius: half,
                            borderWidth: strokeWidth, borderColor: color,
                            transform: [{ rotate: `${leftDeg}deg` }],
                        }} />
                    </View>
                </View>
            )}

            {/* Inner content */}
            <View style={{
                width: size - strokeWidth * 2 - 8,
                height: size - strokeWidth * 2 - 8,
                borderRadius: half,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {children}
            </View>
        </View>
    );
};

// ─── Contribution Timeline Chart ──────────────────────────────────────────────

const ContributionChart = ({
    currentMonth,
    totalMonths,
    targetAmount,
    payableAmount,
    activeUsers,
    totalUsers,
}: {
    currentMonth: number;
    totalMonths: number;
    targetAmount: number;
    payableAmount: number;
    activeUsers: number;
    totalUsers: number;
}) => {
    const timelinePct = totalMonths > 0 ? Math.round((currentMonth / totalMonths) * 100) : 0;
    const membersPct = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const collected = payableAmount * activeUsers * Math.max(currentMonth, 0);
    const overallPct = targetAmount > 0 ? Math.min(100, Math.round((collected / targetAmount) * 100)) : 0;

    return (
        <View style={[chartStyles.card, shadowStyles]}>
            <Text style={chartStyles.cardTitle}>Contribution Timeline</Text>

            {/* Two rings */}
            <View style={chartStyles.ringsRow}>
                <View style={chartStyles.ringBlock}>
                    <CircleProgress percent={timelinePct} color={semanticColors.buttonPrimary}>
                        <Text style={[chartStyles.pct, { color: semanticColors.buttonPrimary }]}>{timelinePct}%</Text>
                        <Text style={chartStyles.pctLabel}>Timeline</Text>
                    </CircleProgress>
                    <Text style={chartStyles.ringCaption}>Month {currentMonth} of {totalMonths}</Text>
                </View>

                <View style={chartStyles.ringBlock}>
                    <CircleProgress percent={membersPct} color={semanticColors.success}>
                        <Text style={[chartStyles.pct, { color: semanticColors.success }]}>{membersPct}%</Text>
                        <Text style={chartStyles.pctLabel}>Members</Text>
                    </CircleProgress>
                    <Text style={chartStyles.ringCaption}>{activeUsers} of {totalUsers} active</Text>
                </View>
            </View>

            {/* Amounts */}
            <View style={chartStyles.amountsRow}>
                <View>
                    <Text style={chartStyles.amtLabel}>Raised so far</Text>
                    <Text style={chartStyles.amtValue}>{formatCurrency(collected)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={chartStyles.amtLabel}>Target</Text>
                    <Text style={chartStyles.amtValue}>{formatCurrency(targetAmount)}</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={chartStyles.track}>
                <View style={[chartStyles.fill, { width: `${overallPct}%` as any }]} />
            </View>
            <Text style={chartStyles.barCaption}>{overallPct}% of target reached</Text>

            {/* Month dots */}
            {totalMonths > 0 && (
                <>
                    <View style={chartStyles.dotsRow}>
                        {Array.from({ length: totalMonths }).map((_, i) => {
                            const m = i + 1;
                            const done = m < currentMonth;
                            const current = m === currentMonth;
                            return (
                                <View key={i} style={[
                                    chartStyles.dot,
                                    done && chartStyles.dotDone,
                                    current && chartStyles.dotCurrent,
                                ]}>
                                    <Text style={[
                                        chartStyles.dotTxt,
                                        (done || current) && chartStyles.dotTxtActive,
                                    ]}>
                                        {m}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <Text style={chartStyles.scheduleLabel}>Monthly payment schedule</Text>
                </>
            )}
        </View>
    );
};

const chartStyles = StyleSheet.create({
    card: {
        backgroundColor: semanticColors.containerBackground,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: semanticColors.borderLight,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: semanticColors.textPrimary,
        marginBottom: 20,
    },
    ringsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 22,
    },
    ringBlock: {
        alignItems: 'center',
        gap: 8,
    },
    pct: {
        fontSize: 22,
        fontWeight: '800',
    },
    pctLabel: {
        fontSize: 10,
        color: semanticColors.textSecondary,
        marginTop: 2,
    },
    ringCaption: {
        fontSize: 12,
        color: semanticColors.textSecondary,
        textAlign: 'center',
    },
    amountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    amtLabel: {
        fontSize: 11,
        color: semanticColors.textSecondary,
        marginBottom: 2,
    },
    amtValue: {
        fontSize: 14,
        fontWeight: '700',
        color: semanticColors.textPrimary,
    },
    track: {
        height: 8,
        backgroundColor: semanticColors.progressBackground,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 5,
    },
    fill: {
        height: '100%',
        backgroundColor: semanticColors.buttonPrimary,
        borderRadius: 4,
    },
    barCaption: {
        fontSize: 11,
        color: semanticColors.textSecondary,
        textAlign: 'right',
        marginBottom: 16,
    },
    dotsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 2,
        justifyContent: 'center',
    },
    dot: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: semanticColors.progressBackground,
        alignItems: 'center', justifyContent: 'center',
    },
    dotDone: { backgroundColor: semanticColors.buttonPrimary },
    dotCurrent: { backgroundColor: semanticColors.accent, transform: [{ scale: 1.18 }] },
    dotTxt: { fontSize: 10, color: semanticColors.textSecondary, fontWeight: '600' },
    dotTxtActive: { color: semanticColors.textInverse },
    scheduleLabel: {
        fontSize: 11,
        color: semanticColors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    },
});

// ─── Member Card ──────────────────────────────────────────────────────────────

const MemberCard = ({ user, payoutPosition }: { user: GroupUser; payoutPosition?: number }) => {
    const isActive = user.pivot.is_active;
    const isAdmin = user.pivot.role?.toLowerCase() === 'admin';

    return (
        <View style={[memberStyles.card, shadowStyles]}>
            {/* Online dot */}
            <View style={[
                memberStyles.onlineDot,
                { backgroundColor: isActive ? semanticColors.success : semanticColors.danger },
            ]} />

            {/* Avatar */}
            <View style={[
                memberStyles.avatar,
                { backgroundColor: isAdmin ? 'rgba(167, 139, 250, 0.15)' : semanticColors.accentLight },
            ]}>
                <Text style={[
                    memberStyles.avatarTxt,
                    { color: isAdmin ? semanticColors.accent : semanticColors.buttonPrimary },
                ]}>
                    {getInitials(user.name)}
                </Text>
            </View>

            <Text style={memberStyles.name} numberOfLines={1}>{user.name || 'Unnamed'}</Text>
            <Text style={memberStyles.sub} numberOfLines={1}>{user.mobile || 'N/A'}</Text>
            <Text style={memberStyles.sub} numberOfLines={1}>{user.email || 'N/A'}</Text>

            <View style={[
                memberStyles.roleBadge,
                { backgroundColor: isAdmin ? 'rgba(167, 139, 250, 0.15)' : semanticColors.accentLight },
            ]}>
                <Text style={[
                    memberStyles.roleTxt,
                    { color: isAdmin ? semanticColors.accent : semanticColors.buttonPrimary },
                ]}>
                    {capitalize(user.pivot.role)}
                </Text>
            </View>

            <View style={[
                memberStyles.statusBadge,
                { backgroundColor: isActive ? semanticColors.successLight : semanticColors.dangerLight },
            ]}>
                <Ionicons
                    name={isActive ? 'checkmark-circle' : 'close-circle'}
                    size={11}
                    color={isActive ? semanticColors.success : semanticColors.danger}
                />
                <Text style={[
                    memberStyles.statusTxt,
                    { color: isActive ? semanticColors.success : semanticColors.danger },
                ]}>
                    {isActive ? 'Active' : 'Inactive'}
                </Text>
            </View>

            {payoutPosition && (
                <Text style={memberStyles.payoutLabel}>Payout #{payoutPosition}</Text>
            )}
        </View>
    );
};

const memberStyles = StyleSheet.create({
    card: {
        width: 155,
        backgroundColor: semanticColors.cardBackground,
        borderRadius: 16,
        padding: 14,
        marginRight: 12,
        borderWidth: 1,
        borderColor: semanticColors.border,
        alignItems: 'center',
        position: 'relative',
    },
    onlineDot: {
        position: 'absolute', top: 11, right: 11,
        width: 9, height: 9, borderRadius: 5,
        borderWidth: 1.5, borderColor: semanticColors.cardBackground,
    },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
    },
    avatarTxt: {
        fontSize: 19, fontWeight: '800',
    },
    name: {
        fontSize: 13, fontWeight: '700', color: semanticColors.textPrimary,
        textAlign: 'center', marginBottom: 3, width: '100%',
    },
    sub: {
        fontSize: 11, color: semanticColors.textSecondary, textAlign: 'center',
        marginBottom: 2, width: '100%',
    },
    roleBadge: {
        marginTop: 8, marginBottom: 6,
        paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20,
    },
    roleTxt: {
        fontSize: 11, fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    statusTxt: {
        fontSize: 11, fontWeight: '600',
    },
    payoutLabel: {
        fontSize: 10,
        color: semanticColors.textSecondary,
        marginTop: 6,
    },
});

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({
    icon,
    label,
    value,
    isLast = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    isLast?: boolean;
}) => (
    <View style={[detailStyles.row, isLast && detailStyles.rowLast]}>
        <View style={detailStyles.labelContainer}>
            <View style={detailStyles.iconContainer}>
                <Ionicons name={icon} size={16} color={semanticColors.buttonPrimary} />
            </View>
            <Text style={detailStyles.label}>{label}</Text>
        </View>
        <Text style={detailStyles.value}>{value}</Text>
    </View>
);

const detailStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: semanticColors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: semanticColors.accentLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: { fontSize: 15, color: semanticColors.textSecondary },
    value: { fontSize: 15, fontWeight: '700', color: semanticColors.textPrimary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const GroupDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'GroupDetails'>>();
    const { group_id } = route.params ?? { group_id: 0 };

    const [group, setGroup] = React.useState<Group | null>(null);
    const [role, setRole] = React.useState<string>('');
    const [is_active, setIsActive] = React.useState<boolean>(false);
    const [isInGroup, setIsInGroup] = React.useState<boolean>(false);
    const [joining, setJoining] = React.useState<boolean>(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (!group_id) { navigation.goBack(); return; }
        loadGroup();
    }, [group_id]);

    const loadGroup = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) { navigation.navigate('Signin'); return; }

            const res = await axios.get<{ data: Group }>(
                `${Constants.expoConfig?.extra?.apiUrl}/user/group/${group_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const g = res.data.data;
            console.log('Loaded group:', g);
            setGroup(g);

            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) throw new Error('User not found.');
            const me = JSON.parse(userStr);
            const pivot = g.users.find(u => u.email === me.email)?.pivot;
            
            // If user is not in group yet, let them see the group and request to join
            if (pivot) {
                setIsInGroup(true);
                setRole(pivot.role);
                setIsActive(pivot.is_active);
            } else {
                setIsInGroup(false);
                setRole('');
                setIsActive(false);
            }

            Animated.timing(fadeAnim, {
                toValue: 1, duration: 350, useNativeDriver: true,
            }).start();
        } catch (err: any) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to load group details.';
            Alert.alert('Error', message, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        }
    };

    const handleJoin = async () => {
        setJoining(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) { navigation.navigate('Signin'); return; }

            await axios.post(
                `${Constants.expoConfig?.extra?.apiUrl}/user/group/${group_id}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            Alert.alert(
                isInGroup ? '🎉 Joined!' : '📨 Request Sent!',
                isInGroup
                    ? `You have successfully joined "${group?.title}".`
                    : `Your request to join "${group?.title}" has been sent. You'll be notified when approved.`
            );
            if (isInGroup) {
                setIsActive(true);
            }
            loadGroup();
        } catch (err: any) {
            Alert.alert(
                'Error',
                err?.response?.data?.message ?? 'Failed to join. Please try again.'
            );
        } finally {
            setJoining(false);
        }
    };

    // ── Loading state ──
    if (!group) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <LinearGradient
                    colors={semanticColors.gradientHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientHeader}
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color={semanticColors.textInverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Group Details</Text>
                </LinearGradient>
                <View style={styles.loadingCenter}>
                    <ActivityIndicator size="large" color={semanticColors.buttonPrimary} />
                    <Text style={styles.loadingText}>Loading group info…</Text>
                </View>
            </SafeAreaView>
        );
    }

    const monthly = group.payable_amount
        ?? (group.total_users ? group.target_amount / group.total_users : 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Purple Gradient Header ── */}
                <LinearGradient
                    colors={semanticColors.gradientHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientHeader}
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color={semanticColors.textInverse} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{group.title}</Text>
                    <Text style={styles.headerSub}>Savings Group</Text>

                    <View style={styles.pillRow}>
                        <View style={styles.pill}>
                            <Ionicons name="wallet-outline" size={12} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.pillTxt}>{formatCurrency(group.target_amount)}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.pillTxt}>
                                {group.active_users_count}/{group.total_users} members
                            </Text>
                        </View>
                    </View>

                    <View style={styles.badgeRow}>
                        {isInGroup && (
                            <View style={styles.rolePill}>
                                <Text style={styles.rolePillTxt}>{capitalize(role)}</Text>
                            </View>
                        )}
                        <View style={[
                            styles.statusPill,
                            { backgroundColor: is_active ? 'rgba(16, 185, 129, 0.22)' : isInGroup ? 'rgba(239, 68, 68, 0.22)' : 'rgba(59, 130, 246, 0.22)' },
                        ]}>
                            <View style={[
                                styles.statusDotHdr,
                                { backgroundColor: is_active ? semanticColors.success : isInGroup ? semanticColors.danger : semanticColors.buttonPrimary },
                            ]} />
                            <Text style={[
                                styles.statusPillTxt,
                                { color: is_active ? semanticColors.success : isInGroup ? semanticColors.danger : semanticColors.buttonPrimary },
                            ]}>
                                {is_active ? 'Active' : isInGroup ? 'Pending' : 'Not a Member'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── Join/Request Banner ── */}
                    {!is_active && (
                        <View style={[styles.joinBanner, shadowStyles]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.joinTitle}>
                                    {isInGroup ? 'You have a pending invitation' : 'Interested in this group?'}
                                </Text>
                                <Text style={styles.joinSub}>
                                    {isInGroup ? 'Accept to start contributing to this group.' : 'Request to join and start saving together.'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.joinBtn, joining && { opacity: 0.65 }]}
                                onPress={handleJoin}
                                disabled={joining}
                                activeOpacity={0.85}
                            >
                                {joining
                                    ? <ActivityIndicator size="small" color={semanticColors.textInverse} />
                                    : (
                                        <>
                                            <Ionicons name={isInGroup ? "people-outline" : "add-circle-outline"} size={14} color={semanticColors.textInverse} />
                                            <Text style={styles.joinBtnTxt}>{isInGroup ? 'Join Group' : 'Request to Join'}</Text>
                                        </>
                                    )
                                }
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Overview Card ── */}
                    <View style={[styles.card, shadowStyles]}>
                        <Text style={styles.cardTitle}>Group Overview</Text>
                        {isInGroup && <DetailRow icon="shield-checkmark-outline" label="Role" value={capitalize(role)} />}
                        <DetailRow icon="cash-outline" label="Amount" value={formatCurrency(group.target_amount)} />
                        <DetailRow icon="wallet-outline" label="Payable" value={formatCurrency(monthly)} />
                        <DetailRow
                            icon="people-outline"
                            label="Members"
                            value={`${group.active_users_count ?? 0}/${group.total_users ?? 0}`}
                        />
                        <DetailRow
                            icon="calendar-outline"
                            label="Duration"
                            value={`${group.total_users} months`}
                            isLast={!group.expected_start_date && !group.payment_out_day}
                        />
                        {group.expected_start_date && (
                            <DetailRow
                                icon="today-outline"
                                label="Start Date"
                                value={group.expected_start_date}
                                isLast={!group.payment_out_day}
                            />
                        )}
                        {group.payment_out_day && (
                            <DetailRow
                                icon="time-outline"
                                label="Payment Day"
                                value={`${group.payment_out_day}${getOrdinalSuffix(group.payment_out_day)} of each month`}
                                isLast
                            />
                        )}
                    </View>

                    {/* ── Contribution Timeline ── */}
                    <ContributionChart
                        currentMonth={group.current_month ?? 0}
                        totalMonths={group.total_users}
                        targetAmount={group.target_amount}
                        payableAmount={monthly}
                        activeUsers={group.active_users_count ?? 0}
                        totalUsers={group.total_users}
                    />

                    {/* ── Group Members ── */}
                    <View style={[styles.card, shadowStyles]}>
                        <View style={styles.memberHeader}>
                            <Text style={styles.sectionTitle}>Group Members</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countTxt}>{group.users.length}</Text>
                            </View>
                        </View>
                        {group.users.length === 0 ? (
                            <Text style={styles.emptyTxt}>No members yet!</Text>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 4 }}
                            >
                                {group.users.map((user, i) => (
                                    <MemberCard
                                        key={i}
                                        user={user}
                                        payoutPosition={user.pivot.payout_position}
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={{ height: 32 }} />
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Helper for ordinal suffix ────────────────────────────────────────────────

const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: semanticColors.background,
    },
    gradientHeader: {
        paddingHorizontal: 20,
        paddingTop: (StatusBar.currentHeight ?? 20) + 10,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: semanticColors.textInverse,
        letterSpacing: 0.1,
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.72)',
        marginTop: 2,
        marginBottom: 14,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.16)',
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 20,
    },
    pillTxt: {
        color: semanticColors.textInverse,
        fontSize: 12,
        fontWeight: '600',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    rolePill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    rolePillTxt: {
        color: semanticColors.textInverse,
        fontSize: 12,
        fontWeight: '700',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusDotHdr: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusPillTxt: {
        fontSize: 12,
        fontWeight: '700',
    },

    loadingCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
        color: semanticColors.textSecondary,
    },

    joinBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: semanticColors.warningLight,
        borderLeftWidth: 4,
        borderLeftColor: semanticColors.warning,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 14,
        borderRadius: 12,
        gap: 12,
    },
    joinTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: semanticColors.warning,
        marginBottom: 2,
    },
    joinSub: {
        fontSize: 12,
        color: semanticColors.textSecondary,
    },
    joinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: semanticColors.buttonPrimary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    joinBtnTxt: {
        color: semanticColors.textInverse,
        fontSize: 13,
        fontWeight: '700',
    },

    card: {
        backgroundColor: semanticColors.containerBackground,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: semanticColors.borderLight,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: semanticColors.textPrimary,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: semanticColors.textPrimary,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    countBadge: {
        backgroundColor: semanticColors.buttonPrimary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countTxt: {
        color: semanticColors.textInverse,
        fontSize: 12,
        fontWeight: '700',
    },
    emptyTxt: {
        fontSize: 14,
        color: semanticColors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default GroupDetailsScreen;