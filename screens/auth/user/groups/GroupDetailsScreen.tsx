import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { semanticColors } from '../../../../theme/semanticColors';

// Define the Group types
interface GroupUser {
    name?: string;
    mobile?: string;
    email?: string;
    pivot: {
        role: string;
        is_active: boolean;
    }
}

interface Group {
    id: number;
    title: string;
    target_amount: number;
    total_users: number;
    active_users_count: number;
    users: Array<GroupUser>;
}

// Define the route params type
type RootStackParamList = {
    GroupDetails: {
        group_id: number;
    };
    Signin: undefined;
};

const GroupDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'GroupDetails'>>();
    const { group_id } = route.params ?? { group_id: 0 }; // Add default value
    const [group, setGroup] = React.useState<Group | null>(null);
    const [role, setRole] = React.useState<string>('');
    const [is_active, setIsActive] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!group_id) {
            console.error('No group ID provided');
            navigation.goBack();
            return;
        }
        // Function to fetch group details
        const fetchGroupDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    console.error('No authentication token found');
                    navigation.navigate('Signin');
                    return;
                }

                const response = await axios.get<{ data: Group }>(
                    `${Constants.manifest?.extra?.API_URL}/user/group/${group_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        }
                    }
                );

                const fetchedGroup = response.data.data;
                setGroup(fetchedGroup);

                // Find the current user's role and status
                const userString = await AsyncStorage.getItem("user");
                if (!userString) {
                    throw new Error("User not found in local storage.");
                }
                const currentUser = JSON.parse(userString);
                const currentUserPivot = fetchedGroup.users.find(
                    user => user.email === currentUser.email
                )?.pivot;
                if (!currentUserPivot) {
                    throw new Error("Current user details not found in group users.");
                }
                setRole(currentUserPivot.role);
                setIsActive(currentUserPivot.is_active);
            } catch (error) {
                console.error('Error fetching group details:', error);
                Alert.alert(
                    'Error',
                    'Failed to load group details. Please try again.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        };

        fetchGroupDetails();
    }, [group_id, navigation]);

    if (!group) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <Text style={styles.loadingText}>Loading Group Info...</Text>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>{group.title}</Text>
                    {!is_active && (
                        <View style={[styles.statusBadge, { backgroundColor: '#f39c12' }]}>
                            <Text style={styles.statusText}>Join Group</Text>
                        </View>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    <Detail label="Role" value={capitalize(role)} />
                    <Detail label="Amount" value={formatCurrency(group.target_amount)} />
                    <Detail
                        label="Payable"
                        value={group.total_users ? formatCurrency(group.target_amount / group.total_users) : 'N/A'}
                    />
                    <Detail label="Members" value={`${group.active_users_count ?? 0}/${group.total_users ?? 0}`} />
                    <Detail label="Duration" value={`${group.total_users} months`} />
                </View>

                <View style={styles.userSection}>
                    <Text style={styles.sectionTitle}>Group Members</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {group.users.length === 0 ? (
                            <Text style={styles.noUsersText}>No members yet!</Text>
                        ) : (
                            group.users.map((user, index) => (
                                <View key={index} style={[styles.userCard, { margin: 8, padding: 12 }]}>
                                    <Text style={styles.userName}>{user.name || 'Unnamed User'}</Text>
                                    <Text style={styles.userDetail}>{user.mobile || 'N/A'}</Text>
                                    <Text style={styles.userDetail}>{user.email || 'N/A'}</Text>
                                    <Text style={styles.userDetail}>{capitalize(user.pivot.role)}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.userDetail, { color: user.pivot.is_active ? '#27ae60' : '#e74c3c' }]}>
                                            {user.pivot.is_active ? 'Active' : 'Inactive'}
                                        </Text>
                                        <MaterialIcons
                                            name={user.pivot.is_active ? "check-circle" : "cancel"}
                                            size={16}
                                            color={user.pivot.is_active ? "#27ae60" : "#e74c3c"}
                                        />
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.detailRow, label === 'Duration' ? styles.detailRowLast : {}]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const capitalize = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amount);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: semanticColors.pageBg,
    },
    header: {
        padding: 20,
        backgroundColor: semanticColors.containerBackground,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: semanticColors.textHeading,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        color: semanticColors.buttonPrimaryText,
        fontWeight: '600',
    },
    detailsContainer: {
        backgroundColor: semanticColors.containerBackground,
        marginVertical: 10,
        marginHorizontal: 20,
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: semanticColors.divider,
    },
    detailRowLast: {
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
    },
    label: {
        fontSize: 16,
        color: semanticColors.textDescription,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: semanticColors.textHeading,
    },
    userSection: {
        marginVertical: 5,
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: semanticColors.containerBackground,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: semanticColors.textHeading,
    },
    userContainer: {
        borderBottomWidth: 1,
        borderBottomColor: semanticColors.divider,
        paddingVertical: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: semanticColors.textHeading,
    },
    userText: {
        fontSize: 16,
        color: semanticColors.textHeading
    },
    userDetail: {
        fontSize: 16,
        color: semanticColors.textHeading,
    },
    userCard: {
        backgroundColor: semanticColors.sectionBg,
        borderWidth: 1,
        borderColor: semanticColors.divider,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 18,
        color: semanticColors.textBody,
    },
    noUsersText: {
        fontSize: 16,
        color: semanticColors.textPlaceholder,
        fontStyle: 'italic',
        marginTop: 10,
    },
});

export default GroupDetailsScreen;