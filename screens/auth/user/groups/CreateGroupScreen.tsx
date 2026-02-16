import React, { useState, useEffect, useCallback } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

import FormInput from "../../../../components/FormInput";
import { Config } from "react-native-config";

interface GroupFormValues {
    title: string;
    totalUsers: string;
    targetAmount: string;
    expectedStartDate: string;
    payment_out_day: string;
    membersEmails: string[];
}

const initialValues: GroupFormValues = {
    title: "",
    totalUsers: "",
    targetAmount: "",
    expectedStartDate: "",
    payment_out_day: "",
    membersEmails: [],
};

const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    totalUsers: Yup.number().required("Total users is required"),
    targetAmount: Yup.number().required("Target amount is required"),
    expectedStartDate: Yup.string().required("Start date is required"),
    payment_out_day: Yup.number()
        .min(1, "Day must be between 1 and 31")
        .max(31, "Day must be between 1 and 31")
        .required("Payment day is required"),
    membersEmails: Yup.array()
        .of(Yup.string().email("Invalid email"))
        .test("len", "Number of members must match total users", function (val) {
            return (
                val?.length === parseInt(this.parent.totalUsers) || val?.length === 0
            );
        }),
});

const CreateGroupScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [newEmail, setNewEmail] = useState("");
    const [memberError, setMemberError] = useState("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (!userData) {
                    navigation.navigate("Signin");
                } else {
                    const parsedData = JSON.parse(userData);
                    if (parsedData?.email) {
                        setUserEmail(parsedData.email);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [navigation]);

    const handleAddEmail = useCallback(
        (
            values: GroupFormValues,
            setFieldValue: (
                field: keyof GroupFormValues,
                value: any,
                shouldValidate?: boolean,
            ) => void,
        ) => {
            if (!newEmail.includes("@")) {
                return;
            }
            if (values.membersEmails.includes(newEmail)) {
                setMemberError("This email has already been added.");
            } else if (values.membersEmails.length >= parseInt(values.totalUsers)) {
                setMemberError("Cannot add more members. Maximum limit reached.");
            } else {
                setFieldValue("membersEmails", [...values.membersEmails, newEmail]);
                setNewEmail("");
                setMemberError("");
            }
        },
        [newEmail],
    );

    const handleFormSubmit = async (
        values: GroupFormValues,
        { setSubmitting, resetForm }: FormikHelpers<GroupFormValues>,
    ): Promise<void> => {
        const groupData = {
            title: values.title,
            totalUsers: parseInt(values.totalUsers),
            targetAmount: parseFloat(values.targetAmount),
            expectedStartDate: values.expectedStartDate,
            payment_out_day: parseInt(values.payment_out_day),
            membersEmails: values.membersEmails,
        };

        try {
            setSubmitting(true);
            const apiUrl = Config.API_URL;
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Authentication Error",
                    textBody: "Please login again to continue",
                    button: "Close",
                });
                navigation.navigate("Signin");
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const {
                title,
                totalUsers,
                targetAmount,
                expectedStartDate,
                payment_out_day,
                membersEmails,
            } = values;
            const payload = {
                title: title,
                total_users: parseInt(totalUsers),
                target_amount: parseFloat(targetAmount),
                expected_start_date: expectedStartDate,
                payment_out_day: parseInt(payment_out_day),
                members_emails: membersEmails,
            };

            const response = await fetch(`${apiUrl}/user/group/store`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Failed to create group",
                    textBody:
                        data.message || "An error occurred while creating the group.",
                    button: "Close",
                });
                return;
            }

            if (response.status === 201) {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Group Created",
                    textBody: data.message || "Your group has been created successfully.",
                    button: "Close",
                });
                resetForm();
                navigation.navigate("Dashboard");
            }
        } catch (error) {
            console.error("Error creating group:", error);
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: "Network Error",
                textBody:
                    error instanceof Error
                        ? error.message
                        : "Unable to connect to the server",
                button: "Close",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.title}>Create Group</Text>
                            <Text style={styles.subtitle}>Fill in the details below:</Text>
                        </View>
                        <Ionicons
                            name="close"
                            size={24}
                            color="#ff1400"
                            onPress={() => navigation.navigate("Dashboard")}
                        />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {({
                                handleChange,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                                isSubmitting,
                                setFieldValue,
                            }) => (
                                <>
                                    <Text style={styles.inputLabel}>Title</Text>
                                    <FormInput
                                        field="title"
                                        placeholder="Group Title"
                                        value={values.title}
                                        handleChange={handleChange("title")}
                                        touched={touched}
                                        errors={errors}
                                        inputmode="text"
                                    />

                                    <View style={styles.rowBetween}>
                                        <View style={styles.flexOneMarginRight}>
                                            <Text style={styles.inputLabel}>Total Users</Text>
                                            <FormInput
                                                field="totalUsers"
                                                placeholder="Total Users"
                                                keyboardType="numeric"
                                                value={values.totalUsers}
                                                handleChange={(value) => {
                                                    setFieldValue("totalUsers", value);
                                                    if (
                                                        userEmail &&
                                                        values.membersEmails[0] !== userEmail
                                                    ) {
                                                        setFieldValue("membersEmails", [
                                                            userEmail,
                                                            ...values.membersEmails.filter(
                                                                (e) => e !== userEmail,
                                                            ),
                                                        ]);
                                                    }
                                                }}
                                                touched={touched}
                                                errors={errors}
                                                inputmode="numeric"
                                            />
                                        </View>
                                        <View style={styles.flexTwo}>
                                            <Text style={styles.inputLabel}>Target Amount</Text>
                                            <FormInput
                                                field="targetAmount"
                                                placeholder="Target Amount"
                                                value={values.targetAmount}
                                                handleChange={handleChange("targetAmount")}
                                                touched={touched}
                                                errors={errors}
                                                inputmode="decimal"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.rowBetween}>
                                        <View style={{ flex: 1.2, marginRight: 8 }}>
                                            <Text style={styles.inputLabel}>Expected Start Date</Text>
                                            <TouchableOpacity
                                                onPress={() => setShowDatePicker(true)}
                                                style={styles.dateInputContainer}
                                            >
                                                <Text style={styles.dateInputText}>
                                                    {values.expectedStartDate || "Select Start Date"}
                                                </Text>
                                            </TouchableOpacity>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={
                                                        values.expectedStartDate
                                                            ? new Date(values.expectedStartDate)
                                                            : new Date()
                                                    }
                                                    mode="date"
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        setShowDatePicker(false);
                                                        if (selectedDate) {
                                                            setFieldValue(
                                                                "expectedStartDate",
                                                                selectedDate.toISOString().split("T")[0],
                                                            );
                                                        }
                                                    }}
                                                />
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Payment Day</Text>
                                            <FormInput
                                                field="payment_out_day"
                                                placeholder="Payment Day"
                                                value={values.payment_out_day}
                                                handleChange={(value) => {
                                                    const numericValue = value.replace(/[^0-9]/g, "");
                                                    let intVal = parseInt(numericValue, 10);
                                                    if (!isNaN(intVal)) {
                                                        if (intVal < 1) intVal = 1;
                                                        else if (intVal > 28) intVal = 28;
                                                        setFieldValue("payment_out_day", intVal.toString());
                                                    } else {
                                                        setFieldValue("payment_out_day", "");
                                                    }
                                                }}
                                                touched={touched}
                                                errors={errors}
                                                inputmode="numeric"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <Text style={styles.inputLabel}>Members Emails</Text>
                                    <Text style={styles.subNote}>
                                        Added {values.membersEmails.length} of {values.totalUsers}{" "}
                                        members
                                    </Text>

                                    <View style={styles.emailBox}>
                                        <Text style={styles.emailListText}>
                                            {values.membersEmails.length > 0
                                                ? values.membersEmails.map(
                                                    (email, index) => `${index + 1}. ${email}\n`,
                                                )
                                                : "No members added yet"}
                                        </Text>
                                    </View>

                                    {parseInt(values.totalUsers) >
                                        values.membersEmails.length && (
                                            <View style={styles.rowBetweenMarginBottom}>
                                                <View style={styles.flexThreeMarginRight}>
                                                    <FormInput
                                                        field="membersEmail"
                                                        placeholder="Enter member email"
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        value={newEmail}
                                                        handleChange={(value) => setNewEmail(value)}
                                                        touched={touched}
                                                        errors={errors}
                                                        inputmode="email"
                                                    />
                                                    {memberError ? (
                                                        <Text style={styles.errorText}>{memberError}</Text>
                                                    ) : null}
                                                </View>
                                                <View style={styles.flexOne}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.button,
                                                            isSubmitting && styles.disabledButton,
                                                            styles.blackButton,
                                                        ]}
                                                        onPress={() => handleAddEmail(values, setFieldValue)}
                                                    >
                                                        <Text style={styles.buttonText}>Add</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                    {parseInt(values.totalUsers) ===
                                        values.membersEmails.length && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.button,
                                                    isSubmitting && styles.disabledButton,
                                                ]}
                                                onPress={() => handleSubmit()}
                                                disabled={isSubmitting}
                                            >
                                                <Text style={styles.buttonText}>
                                                    {isSubmitting ? "Submitting..." : "Create Group"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                </>
                            )}
                        </Formik>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        padding: 16,
        backgroundColor: "#fff",
        flexGrow: 1,
        height: "100%",
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
    },
    inputLabel: {
        fontSize: 16,
        marginTop: 10,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    flexOneMarginRight: {
        flex: 1,
        marginRight: 8,
    },
    flexTwo: {
        flex: 2,
    },
    subNote: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    dateInputContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginTop: 10,
        justifyContent: "center",
    },
    emailBox: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
        minHeight: 150,
    },
    emailListText: {
        fontSize: 14,
        color: "#444",
        lineHeight: 22,
        flex: 1,
    },
    rowBetweenMarginBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    flexThreeMarginRight: {
        flex: 3,
        marginRight: 8,
    },
    flexOne: {
        flex: 1,
    },
    button: {
        backgroundColor: "#146459",
        padding: 15,
        height: 50,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    blackButton: {
        backgroundColor: "#111",
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
    dateInputText: {
        fontSize: 16,
        color: "#444",
    },
});

export default CreateGroupScreen;
