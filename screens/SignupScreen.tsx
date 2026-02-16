import React, { memo } from 'react';
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
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import Constants from 'expo-constants';

type RootStackParamList = {
    Signin: undefined;
    Signup: undefined;
};
import * as Yup from 'yup';
import FormInput from '../components/FormInput';

const validationSchema = Yup.object({
    name: Yup.string().required('Full name is required'),
    mobile: Yup.string()
        .matches(/^[0-9]+$/, 'Mobile number must be digits')
        .min(10, 'Mobile number must be at least 10 digits')
        .max(15, 'Mobile number must be at most 15 digits')
        .required('Mobile number is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Password confirmation is required'),
});
function SignupScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const initialValues = {
        name: "oluwatobi otomewo",
        email: "otomewooluwatobi@gmail.com",
        mobile: "07490257169",
        password: "password@123",
        password_confirmation: "password@123"
    };
    const handleFormSubmit = (values: typeof initialValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const userData = {
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            password: values.password,
            password_confirmation: values.password_confirmation
        }; 
        // Make API call to sign up
        const apiUrl = Constants.expoConfig?.extra?.apiUrl || "";

        axios.post<{ message: string }>(`${apiUrl}/auth/register`, userData)
            .then(response => {

                if (response.status === 201) {
                    Dialog.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Registration Successful',
                        textBody: response.data.message || 'Your account has been created.',
                        button: 'Close',
                    });
                } else if (response.status === 400) {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Registration Failed',
                        textBody: response.data.message || 'Bad request.',
                        button: 'Close',
                    });
                }
                setSubmitting(false);
            })
            .catch(error => {
                console.error('Registration error:', error.response?.data);
                if (error.response && error.response.data && error.response.data.error) {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Registration Failed',
                        textBody: error.response.data.message || 'An error occurred during registration.',
                        button: 'Close',
                    });
                } else {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Registration Error',
                        textBody: error.message || 'An unknown error occurred.',
                        button: 'Close',
                    });
                }
                setSubmitting(false);
            });
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
                        <Text style={[styles.title, styles.titleAlign]}>Sign Up</Text>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {(formikProps) => {
                                const { handleChange, handleSubmit, values, errors, touched, isSubmitting } = formikProps;
                                return (
                                <View style={styles.formContainer}>
                                    <FormInput
                                        field="name"
                                        placeholder="Full Name"
                                        value={values.name}
                                        handleChange={handleChange('name')}
                                        touched={touched}
                                        errors={errors}
                                    />
                                    <FormInput
                                        field="email"
                                        placeholder="Email"
                                        value={values.email}
                                        handleChange={handleChange('email')}
                                        touched={touched}
                                        errors={errors}
                                    />
                                    <FormInput
                                        field="mobile"
                                        placeholder="Mobilre Number"
                                        keyboardType="phone-pad"
                                        autoCapitalize="none"
                                        secureTextEntry={false}
                                        value={values.mobile}
                                        handleChange={handleChange('mobile')}
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
                                    <FormInput
                                        field="password_confirmation"
                                        placeholder="Password Confirmation"
                                        autoCapitalize="none"
                                        value={values.password_confirmation}
                                        handleChange={handleChange('password_confirmation')}
                                        touched={touched}
                                        errors={errors}
                                        secureTextEntry
                                    />

                                    <Text style={styles.termsLink}>I've agreed to terms and conditions</Text>

                                    <TouchableOpacity
                                        style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                                        onPress={() => handleSubmit()}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>{isSubmitting ? 'Signing Up...' : 'Sign Up'}</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.gotAccount}>
                                        Already have an accout{' '}
                                        <Text
                                            style={styles.gotAccount_sub}
                                            onPress={() => navigation.navigate('Signin')}
                                        >
                                            SignIn
                                        </Text>
                                    </Text>
                                </View>
                                );
                            }}
                        </Formik>
                    </View>
                </ImageBackground>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

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
        backgroundColor: '#014131',
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
        color: '#ffffff',
    },
    container2: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontSize: 18,
        marginVertical: 10,
        fontWeight: 'bold',
        color: '#25292e',
    },
    titleAlign: {
        alignSelf: 'flex-start',
    },
    termsLink: {
        color: '#25292e',
        fontSize: 14,
        marginTop: 10,
        alignSelf: 'flex-end',
        marginBottom: 10,
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        textDecorationColor: '#25292e',
    },
    gotAccount: {
        color: '#25292e',
        fontSize: 14,
        marginTop: 20,
        alignSelf: 'center',
        marginBottom: 5,
    },
    gotAccount_sub: {
        color: '#FFB850',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        alignSelf: 'center',
        marginBottom: 5,
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        textDecorationColor: '#FFB850',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        marginVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        ...inputShadow,
    },
    button: {
        backgroundColor: '#25292e',
        padding: 15,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        ...shadowStyles,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    error: {
        color: 'red',
        fontSize: 12,
    },
});

export default SignupScreen
