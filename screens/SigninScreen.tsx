import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Constants from 'expo-constants';

import FormInput from '../components/FormInput';
import { semanticColors } from '../theme/semanticColors';


type RootStackParamList = {
    Signin: undefined;
    Signup: undefined;
    Dashboard: undefined;
};

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const SigninScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const initialValues = {
        email: 'otomewooluwatobi@gmail.com',
        password: 'password@123',
    };

    const handleFormSubmit = async (values: typeof initialValues) => {
        const userData = {
            email: values.email,
            password: values.password,
        };
        // Make API call to sign in
        try {
            const apiUrl =  Constants.expoConfig?.extra?.apiUrl;
            interface SigninResponse {
                token: string;
                user: any;
            }
            if (!apiUrl) {
                throw new Error('API URL not configured');
            }
            const response = await axios.post<SigninResponse>(`${apiUrl}/auth/login`, userData);

            if (response.data && response.data.token) {
                // Store the token and user data
                await AsyncStorage.setItem('token', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                // Navigate to dashboard
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                });
            } else {
                // Handle invalid response
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Singin Error',
                    textBody: 'Invalid response from server',
                    button: 'Close',
                });
            }
        } catch (error: any) {
            // Handle different error scenarios
            console.error('Login error:', error);
            if ((error as any).isAxiosError) {
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || 'Invalid credentials';

                // Show error message using Toast or Alert
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Sign In Error',
                    textBody: errorMessage || 'An unknown error occurred.',
                    button: 'Close',
                });
            } else {
                // Handle network error or other unexpected errors
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Sign In Error',
                    textBody: error.message || 'Network error. Please check your connection.',
                    button: 'Close',
                });
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ImageBackground source={require('../assets/bg_img.jpg')} style={styles.mainContainer}>
                    <View style={styles.container1}>
                        <Text style={styles.logo}>Group Save</Text>
                    </View>
                    <View style={styles.container2}>
                        <Text style={[styles.title, styles.titleAlign]}>Sign In</Text>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                                <View style={styles.formContainer}>
                                    <FormInput
                                        field="email"
                                        placeholder="Email"
                                        value={values.email}
                                        handleChange={handleChange('email')}
                                        touched={touched}
                                        errors={errors}
                                    />
                                    <FormInput
                                        field="password"
                                        placeholder="Password"
                                        value={values.password}
                                        handleChange={handleChange('password')}
                                        touched={touched}
                                        errors={errors}
                                        secureTextEntry
                                    />

                                    <Text style={styles.forgotPassword}>Forgot Password ?</Text>

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => handleSubmit()}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                                        </Text>
                                    </TouchableOpacity>

                                    <Text style={styles.gotAccount}>
                                        Already have an account{' '}
                                        <Text
                                            style={styles.gotAccount_sub}
                                            onPress={() => navigation.navigate('Signup')}
                                        >
                                            SignUp
                                        </Text>
                                    </Text>
                                </View>
                            )}
                        </Formik>
                    </View>
                </ImageBackground>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const shadowStyles = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    android: {
        elevation: 5,
    },
});

const inputShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    android: {
        elevation: 2,
    },
});

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: semanticColors.buttonPrimary,
    },
    formContainer: {
        width: '100%',
    },
    container1: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: semanticColors.buttonPrimaryText,
    },
    container2: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: semanticColors.containerBackground,
        padding: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderWidth: 1,
        borderColor: semanticColors.containerBorder,
    },
    title: {
        fontSize: 18,
        marginVertical: 10,
        fontWeight: 'bold',
        color: semanticColors.textHeading,
    },
    titleAlign: {
        alignSelf: 'flex-start',
    },
    forgotPassword: {
        color: semanticColors.linkColor,
        fontSize: 14,
        marginTop: 10,
        alignSelf: 'flex-end',
        marginBottom: 10,
        textDecorationLine: 'underline',
    },
    gotAccount: {
        color: semanticColors.textBody,
        fontSize: 14,
        marginTop: 20,
        alignSelf: 'center',
        marginBottom: 5,
    },
    gotAccount_sub: {
        color: semanticColors.warningBorder,
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: semanticColors.buttonPrimary,
        padding: 15,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        ...shadowStyles,
    },
    buttonText: {
        color: semanticColors.buttonPrimaryText,
        fontSize: 16,
    },
});

export default SigninScreen;
