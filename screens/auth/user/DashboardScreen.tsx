import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Animated,
    StatusBar,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient as LG } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import MenuActionSheet from "../../../components/MenuActionSheet";
import Constants from "expo-constants";
import { semanticColors } from "../../../theme/semanticColors";

const LinearGradient = LG as any;

type RootStackParamList = {
    Home: undefined;
    Signin: undefined;
    Signup: undefined;
    Dashboard: undefined;
    CreateGroup: undefined;
    GroupDetails: {
        group_id: number;
    };
};

const DashboardScreen: React.FC = () => {
    // Navigation and local state hooks
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState("topGroups");
    const [user, setUser] = useState<any>(null);
    const [topGroups, setTopGroups] = useState<any[]>([]);
    const [myGroup, setMyGroup] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [totalPayable, setTotalPayable] = useState(0);
    const [totalContributed, setTotalContributed] = useState(0);
    const [loading, setLoading] = useState(true);
    const actionSheetRef = useRef<ActionSheetRef | null>(null);

    // Fetch user info and dashboard data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                console.log("User data from storage:", userData ? "Found" : "Not found");
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        const fetchDashboardData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                
                // Validate token exists
                if (!token) {
                    console.error("❌ No authentication token found.");
                    setLoading(false);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Signin" }],
                    });
                    return;
                }
                
                console.log("✅ Token found:", token.substring(0, 30) + "...");
                
                const apiUrl = Constants.expoConfig?.extra?.apiUrl;
                if (!apiUrl) {
                    console.error("❌ API URL not configured in app.json");
                    setLoading(false);
                    return;
                }
                
                console.log("🔗 API URL:", apiUrl);
                
                const config = {
                    method: "get" as const,
                    url: `${apiUrl}/user/dashboard`,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                
                console.log("📡 Requesting:", config.url);
                const response = await axios.request<{
                    suggested_groups?: any[];
                    user_groups?: any[];
                    stats?: any;
                    user?: any;
                }>(config);
                
                console.log("✅ Response received:", response.status);
                
                // Destructure API response data
                const {
                    suggested_groups = [],
                    user_groups = [],
                    stats: dashboardStats = {},
                    user: apiUser = null,
                } = response.data;
                
                console.log("📊 Data loaded - Groups:", suggested_groups.length, "My Groups:", user_groups.length);
                
                setTopGroups(suggested_groups);
                setMyGroup(user_groups);
                setStats(dashboardStats);
                if (apiUser) setUser(apiUser);
                
                // Calculate total payable amounts
                const payable = [...user_groups, ...suggested_groups].reduce(
                    (sum, group) => sum + parseFloat(group.payable_amount || 0),
                    0
                );
                setTotalPayable(payable);
                
                console.log("✅ Dashboard data loaded successfully");
            } catch (error: any) {
                console.error("❌ Error fetching dashboard data:", error.message);
                if (error.response?.status === 401) {
                    console.error("🔐 Unauthorized (401) - Token invalid or expired");
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("user");
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Signin" }],
                    });
                } else if (error.response) {
                    console.error("❌ Server error:", error.response.status, error.response.data);
                } else if (error.request) {
                    console.error("❌ No response from server:", error.message);
                } else {
                    console.error("❌ Request setup error:", error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchDashboardData();
    }, [navigation]);

    // Handle sign-out process by clearing token and user, then navigating to Signin
    const handleSignOut = async () => {
        actionSheetRef.current?.hide();
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            navigation.reset({
                index: 0,
                routes: [{ name: "Signin" }],
            });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Render a card for each group from topGroups list (suggested_groups)
    const renderGroupCard = useCallback((group: any) => {
        const memberProgress =
            (group.active_members / group.total_members) * 100;
        return (
            <TouchableOpacity key={group.id} style={[styles.groupCard, shadowStyles]}>
                <View style={styles.groupCardHeader}>
                    <View style={styles.groupBadge}>
                        <Text style={styles.groupBadgeText}>
                            {Math.round(memberProgress)}%
                        </Text>
                    </View>
                </View>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupAmount}>
                    {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: "GBP",
                    }).format(parseFloat(group.target_amount))}
                </Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${memberProgress}%` }]} />
                </View>
                <View style={styles.groupDetails}>
                    <View>
                        <Text style={styles.groupDetailLabel}>Owner</Text>
                        <Text style={styles.groupDetailValue}>
                            {group.owner}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.groupDetailLabel}>Members</Text>
                        <Text style={styles.groupDetailValue}>
                            {group.active_members}/{group.total_members}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, []);

    // Render a card for each group in which the user is a member (user_groups)
    const renderMyGroupCard = useCallback(
        (group: any) => {
            const memberProgress =
                (group.active_members / group.total_members) * 100;
            return (
                <TouchableOpacity
                    key={group.id}
                    style={[styles.groupCard, shadowStyles]}
                    onPress={() =>
                        navigation.navigate("GroupDetails", {
                            group_id: group.id,
                        })
                    }
                >
                    <View style={styles.groupCardHeader}>
                        <View style={styles.groupBadge}>
                            <Text style={styles.groupBadgeText}>
                                {Math.round(memberProgress)}%
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {!group.is_active && (
                                <View
                                    style={[styles.statusIcon, { backgroundColor: "#ff9800" }]}
                                >
                                    <Ionicons name="warning" size={12} color="#fff" />
                                </View>
                            )}
                            {group.user_role === "admin" && (
                                <View
                                    style={[
                                        styles.statusIcon,
                                        {
                                            backgroundColor: semanticColors.buttonPrimary,
                                            marginLeft: 6,
                                        },
                                    ]}
                                >
                                    <Ionicons name="shield" size={12} color="#fff" />
                                </View>
                            )}
                        </View>
                    </View>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupSubtitle}>
                        {group.user_role === "admin" ? "Admin" : "Member"}
                    </Text>
                    <Text style={styles.groupAmount}>
                        {new Intl.NumberFormat("en-GB", {
                            style: "currency",
                            currency: "GBP",
                        }).format(parseFloat(group.target_amount))}
                    </Text>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[styles.progressBar, { width: `${memberProgress}%` }]}
                        />
                    </View>
                    <View style={styles.groupDetails}>
                        <View>
                            <Text style={styles.groupDetailLabel}>Duration</Text>
                            <Text style={styles.groupDetailValue}>
                                {group.total_members} months
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.groupDetailLabel}>Members</Text>
                            <Text style={styles.groupDetailValue}>
                                {group.active_members}/{group.total_members}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [navigation],
    );

    return (
        <SafeAreaProvider>
            {/* ✅ Use barStyle="light-content" for dark backgrounds */}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={semanticColors.buttonPrimary}
                        />
                        <Text style={styles.loadingText}>Loading dashboard...</Text>
                    </View>
                ) : (
                    <>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTextContainer}>
                            {/* Greeting the user */}
                            <Text style={styles.title}>
                                Hi{" "}
                                {user?.name
                                    ? user.name.split(" ")[0].charAt(0).toUpperCase() +
                                    user.name.split(" ")[0].slice(1)
                                    : ""}
                                , 👋
                            </Text>
                            <Text style={styles.subtitle}>
                                {new Date().toLocaleDateString("en-GB", { 
                                    weekday: "long", 
                                    month: "short", 
                                    day: "numeric", 
                                    year: "numeric" 
                                })}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => actionSheetRef.current?.show()}
                        >
                            <View style={styles.hamburgerButton}>
                                <View style={styles.hamburgerLine} />
                                <View style={styles.hamburgerLine} />
                                <View style={styles.hamburgerLine} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <MenuActionSheet
                    actionSheetRef={actionSheetRef as React.RefObject<ActionSheetRef>}
                    onSignOut={handleSignOut}
                />
                {/* Display user's balance information - Stats Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.balanceScrollContent}
                    style={styles.balanceInfo}
                >
                    {/* Total Groups */}
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={["#7b6ef6", "#5b4de0"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCardInner}
                        >
                            <Text style={styles.statLabel}>Total Groups</Text>
                            <Text style={styles.statValue}>{stats?.total_groups || 0}</Text>
                        </LinearGradient>
                    </View>

                    {/* Owned Groups */}
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={["#6366f1", "#4338ca"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCardInner}
                        >
                            <Text style={styles.statLabel}>Owned Groups</Text>
                            <Text style={styles.statValue}>{stats?.owned_groups || 0}</Text>
                        </LinearGradient>
                    </View>

                    {/* Member Groups */}
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={["#8b5cf6", "#6d28d9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCardInner}
                        >
                            <Text style={styles.statLabel}>Member Groups</Text>
                            <Text style={styles.statValue}>{stats?.member_groups || 0}</Text>
                        </LinearGradient>
                    </View>

                    {/* Active Groups */}
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={["#10b981", "#059669"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCardInner}
                        >
                            <Text style={styles.statLabel}>Active Groups</Text>
                            <Text style={styles.statValue}>{stats?.active_groups || 0}</Text>
                        </LinearGradient>
                    </View>

                    {/* Pending Invites */}
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={["#f59e0b", "#d97706"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCardInner}
                        >
                            <Text style={styles.statLabel}>Pending Invites</Text>
                            <Text style={styles.statValue}>{stats?.pending_invitations || 0}</Text>
                        </LinearGradient>
                    </View>
                </ScrollView>
                <Text style={[styles.sectionTitle, styles.boldText]}>Groups</Text>
                <View style={styles.groupsContainer}>
                    <View>
                        {/* Tab Headers for switching views */}
                        <View style={styles.tabHeadersContainer}>
                            <TouchableOpacity
                                style={styles.tabButton}
                                onPress={() => setActiveTab("topGroups")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === "topGroups" && styles.activeTabText,
                                    ]}
                                >
                                    Explore
                                </Text>
                                {activeTab === "topGroups" && <View style={styles.tabUnderline} />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.tabButton}
                                onPress={() => setActiveTab("myGroup")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === "myGroup" && styles.activeTabText,
                                    ]}
                                >
                                    A Member
                                </Text>
                                {activeTab === "myGroup" && <View style={styles.tabUnderline} />}
                            </TouchableOpacity>
                        </View>
                        {/* Display groups list based on active tab */}
                        {activeTab === "topGroups" && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                            >
                                {topGroups.length > 0 ? (
                                    topGroups.map(renderGroupCard)
                                ) : (
                                    <View style={styles.noRecordContainer}>
                                        <Text style={styles.noRecordText}>No groups found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                        {activeTab === "myGroup" && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                            >
                                {myGroup.length > 0 ? (
                                    <>
                                        {myGroup.map(renderMyGroupCard)}
                                        {/* Button to create a new group */}
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("CreateGroup")}
                                            style={[styles.addGroupButton, shadowStyles]}
                                        >
                                            <MaterialIcons
                                                name="format-list-bulleted-add"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        {/* Button to create a new group */}
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("CreateGroup")}
                                            style={[styles.addGroupButton, shadowStyles]}
                                        >
                                            <MaterialIcons
                                                name="format-list-bulleted-add"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
                {/* Recent Transactions Section */}
                <View>
                    <Text style={[styles.sectionTitle, styles.boldText]}>
                        Recent Transactions
                    </Text>
                    <ScrollView
                        style={styles.transactionsList}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Transaction: Group Contribution (Credit) */}
                        <View style={styles.transactionItem}>
                            <View style={styles.transactionDetails}>
                                <LinearGradient
                                    colors={["#7b6ef6", "#a78bfa"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.transactionIcon}
                                >
                                    <Ionicons name="arrow-down" size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>
                                        Group Contribution
                                    </Text>
                                    <Text style={styles.transactionDate}>Oct 12, 2023</Text>
                                </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: "#10b981" }]}>
                                +£15,000.00
                            </Text>
                        </View>

                        {/* Transaction: Monthly Payment (Debit) */}
                        <View style={styles.transactionItem}>
                            <View style={styles.transactionDetails}>
                                <LinearGradient
                                    colors={["#10b981", "#059669"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.transactionIcon}
                                >
                                    <Ionicons name="arrow-up" size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>
                                        Monthly Payment
                                    </Text>
                                    <Text style={styles.transactionDate}>Oct 10, 2023</Text>
                                </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: "#f87171" }]}>
                                -£500.00
                            </Text>
                        </View>

                        {/* Transaction: Payout Received (Payout) */}
                        <View style={styles.transactionItem}>
                            <View style={styles.transactionDetails}>
                                <LinearGradient
                                    colors={["#f59e0b", "#d97706"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.transactionIcon}
                                >
                                    <Ionicons name="arrow-down" size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>
                                        Payout Received
                                    </Text>
                                    <Text style={styles.transactionDate}>Sep 28, 2023</Text>
                                </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: "#10b981" }]}>
                                +£6,000.00
                            </Text>
                        </View>

                        {/* Transaction: Group Contribution (Credit) */}
                        <View style={styles.transactionItem}>
                            <View style={styles.transactionDetails}>
                                <LinearGradient
                                    colors={["#7b6ef6", "#a78bfa"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.transactionIcon}
                                >
                                    <Ionicons name="arrow-down" size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>
                                        Group Contribution
                                    </Text>
                                    <Text style={styles.transactionDate}>Sep 12, 2023</Text>
                                </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: "#10b981" }]}>
                                +£15,000.00
                            </Text>
                        </View>

                        {/* Transaction: Monthly Payment (Debit) */}
                        <View style={styles.transactionItem}>
                            <View style={styles.transactionDetails}>
                                <LinearGradient
                                    colors={["#10b981", "#059669"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.transactionIcon}
                                >
                                    <Ionicons name="arrow-up" size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>
                                        Monthly Payment
                                    </Text>
                                    <Text style={styles.transactionDate}>Sep 10, 2023</Text>
                                </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: "#f87171" }]}>
                                -£500.00
                            </Text>
                        </View>
                    </ScrollView>
                </View>
                    </>
                )}
            </View>
        </SafeAreaProvider>
    );
};

// Cross-platform shadow styles
const shadowStyles = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    android: { elevation: 5 },
});

// Component styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#050508" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#050508",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#f1f0ff",
        fontWeight: "500",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: StatusBar.currentHeight || 40,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        marginTop: 10,
        paddingVertical: 20,
    },
    title: { fontSize: 24, fontWeight: "700", color: "#f1f0ff" },
    subtitle: { color: "#8b89a8" },
    menuButton: { marginLeft: "auto" },
    hamburgerButton: {
        width: 42,
        height: 42,
        backgroundColor: "#131318",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    hamburgerLine: {
        width: 18,
        height: 2,
        backgroundColor: "#f1f0ff",
        borderRadius: 1,
    },
    balanceInfo: {
        paddingHorizontal: 20,
        paddingVertical: 50,
        marginHorizontal: 0,
        marginVertical: 20,
    },
    balanceScrollContent: {
        paddingRight: 20,
        paddingLeft: 0,
        alignItems: "center",
        gap: 14,
    },
    statCard: {
        width: 120,
        height: 120,
        padding: 0,
        overflow: "hidden",
        borderRadius: 15,
    },
    statCardInner: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 15,
        ...shadowStyles,
    },
    statCardGradient: {
        borderRadius: 15,
    },
    statLabel: {
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 6,
        textAlign: "center",
        letterSpacing: 0.4,
        lineHeight: 15,
    },
    statValue: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        lineHeight: 34,
    },
    balanceCard: {
        flex: 1,
        backgroundColor: "#131318",
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#7b6ef6",
    },
    balanceCardSecondary: {
        borderLeftColor: "#f59e0b",
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginTop: 0,
    },
    balanceLabel: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 6,
    },
    contributedAmount: { color: "#ffffff" },
    textRight: { textAlign: "right" },
    tabHeaders: { flexDirection: "row", marginHorizontal: 20 },
    tabHeadersContainer: {
        flexDirection: "row",
        marginHorizontal: 20,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(123, 110, 246, 0.12)",
    },
    tabButton: { 
        paddingVertical: 12, 
        marginHorizontal: 5,
        paddingBottom: 16,
        position: "relative",
    },
    tabText: { color: "#8b89a8", fontWeight: "600", fontSize: 13 },
    activeTabText: { color: "#7b6ef6" },
    tabUnderline: {
        position: "absolute",
        bottom: -1,
        left: 5,
        right: 5,
        height: 2,
        backgroundColor: "#7b6ef6",
        borderRadius: 1,
    },
    horizontalScroll: { paddingVertical: 10, marginHorizontal: 20 },
    groupCard: {
        backgroundColor: "#1e1c35",
        padding: 18,
        marginRight: 15,
        width: 195,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.15)",
    },
    groupCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    groupBadge: { 
        backgroundColor: "rgba(123, 110, 246, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.2)",
    },
    groupBadgeText: {
        color: "#a78bfa",
        fontSize: 11,
        fontWeight: "700",
    },
    statusIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    groupSubtitle: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.5)",
        marginBottom: 10,
        fontWeight: "500",
    },
    progressBarContainer: {
        height: 5,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 3,
        marginVertical: 14,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#7b6ef6",
        borderRadius: 3,
    },
    groupAmount: {
        fontSize: 20,
        fontWeight: "800",
        color: "#ffffff",
        marginTop: 10,
        marginBottom: 10,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#f1f0ff",
        lineHeight: 20,
        marginBottom: 3,
    },
    groupDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    groupDetailLabel: {
        color: "rgba(255, 255, 255, 0.4)",
        fontSize: 10,
        marginBottom: 3,
    },
    groupDetailValue: {
        color: "rgba(255, 255, 255, 0.85)",
        fontSize: 12,
        fontWeight: "600",
    },
    addGroupButton: {
        backgroundColor: "#7b6ef6",
        padding: 15,
        marginRight: 15,
        height: 70,
        width: 70,
        alignSelf: "center",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        ...shadowStyles,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 5,
        color: "#f1f0ff",
        paddingHorizontal: 20,
    },
    boldText: { fontWeight: "bold" },
    activityContainer: {
        marginHorizontal: 20,
        marginVertical: 20,
        marginBottom: 30,
        backgroundColor: "#131318",
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 20,
        ...shadowStyles,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    activityTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#f1f0ff",
    },
    activityList: {
        maxHeight: 350,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    activityItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(155, 155, 155, 0.2)",
    },
    activityIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    activityInfo: {
        flex: 1,
    },
    activityItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#f1f0ff",
        marginBottom: 4,
    },
    activityStatus: {
        fontSize: 14,
        color: "#f87171",
        fontWeight: "500",
    },
    activityAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f1f0ff",
    },
    seeAllButton: {
        marginTop: 15,
        paddingVertical: 12,
    },
    seeAllText: {
        color: "#7b6ef6",
        fontSize: 14,
        fontWeight: "600",
    },
    transactionsList: {
        marginHorizontal: 5,
        marginVertical: 10,
        padding: 10,
        maxHeight: 300,
    },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 18,
        ...shadowStyles,
        marginBottom: 12,
        backgroundColor: "#131318",
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.1)",
        borderRadius: 16,
    },
    transactionItemBorder: {
        borderBottomWidth: 0,
        borderBottomColor: "#8b89a8",
        borderRadius: 5,
    },
    transactionDetails: { flexDirection: "row", alignItems: "center", gap: 14 },
    transactionIcon: {
        borderRadius: 14,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    transactionText: { marginLeft: 15 },
    transactionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#f1f0ff",
    },
    transactionDate: { color: "#8b89a8", marginTop: 3, fontSize: 11 },
    transactionAmount: {
        fontSize: 15,
        fontWeight: "700",
        color: "#10b981",
    },
    noRecordContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 22,
        width: "100%",
    },
    noRecordText: {
        fontSize: 16,
        color: "#8b89a8",
        textAlign: "center",
        marginBottom: 10,
        fontWeight: "500",
    },
    groupsContainer: {
        backgroundColor: "#131318",
        paddingVertical: 6,
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(123, 110, 246, 0.12)",
        ...shadowStyles,
    },
});

export default DashboardScreen;
