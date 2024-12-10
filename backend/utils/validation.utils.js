import { HttpStatus, HttpMessage } from '../constants/http.constants.js';

// Validation patterns
export const patterns = {
    username: /^[a-zA-Z0-9_]{4,20}$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^[6-9]\d{9}$/,
    fullName: /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/
};

export const validateSignupData = (data) => {
    const { fullName, username, email, phone, password } = data;

    const trimmedData = {
        fullName: fullName?.trim(),
        username: username?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        password: password?.trim()
    };

    // Check for empty values
    if (Object.values(trimmedData).some(value => !value)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: HttpMessage.BAD_REQUEST
        };
    }

    // Validate fullName
    if (!patterns.fullName.test(trimmedData.fullName)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Full name must contain only letters with single spaces between words (e.g., "John Smith")'
        };
    }

    // Validate username
    if (!patterns.username.test(trimmedData.username)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Username must be 4-20 characters long and can only contain letters, numbers, and underscores'
        };
    }

    // Validate email
    if (!patterns.email.test(trimmedData.email)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid email format'
        };
    }

    // Validate phone
    if (!patterns.phone.test(trimmedData.phone)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid phone number format (10 digits starting with 6-9)'
        };
    }

    // Validate password
    if (!patterns.password.test(trimmedData.password)) {
        return {
            isValid: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        };
    }

    return {
        isValid: true,
        trimmedData
    };
};