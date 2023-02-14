export const STATICDATA = {
    APPLICATIONNAME: 'Sweet Valley Creche and Montessori School Management System'
}
export const MESSAGES = {
    MESSAGES: {
        WSWW: 'Whoops! Something went wrong',
        BRS: 'Bad request'
    },
    USERS: {
        EHBT: 'Email address has been taken',
        SNRF: 'Sorry, no records found',
        ARF: 'Account has already been verified',
        SFPLS: 'We sent a new link to your mail, please check to continue.',
        IVLF: 'Incorrect user verification link, please follow the exact link in your mail',
        AVS: 'User verified successfully',
        VLEAYRNVL: 'We have sent a new link to you. Kindly check your mail',
        IL: 'Invalid link',
        PUS: 'Password updated successfully',
        PRLSS: 'Follow the link in your mail to reset your password.',
        SUCCL: 'Enter the 5-digit code sent to your mail to login',
        SL: 'Successful login',
        UIUS: 'User information updated successfully',
        IEA: 'Unverified account. Please continue to verify or contact the administrator.',
        SRMESS: 'Successful registration, please check your mail to continue. Note: Check your spam if the message is not in your inbox',
    },
    VALIDATOR: {
        AFAR: 'All fields are required',
        NATL: 'Firstname and lastname must be in the range of 3 to 30 chars',
        ONNIR: 'Othernames must not be more than 30 chars',
        NMBEA: 'Names must contain only English alphabets and whitespaces',
        PSMESS: 'Make your password secured by including numbers and special chars.',
        IEAV: 'Incorrect email address',
        LOPV: 'Password must be at least 8 chars',
        PMD: 'Passwords do not match',
        BRS: 'Bad request',
        PNINS: 'Phone number must be a numeric string of 10 chars',
        UAPR: 'Username and password are required',
        IC: 'Credentials are incorrect',
        IOTP: 'Invalid OTP',
        CUWR: 'Chosen usertype was rejected'
    },
    MAILS: {
        VERIFICATION_SUBJECT: 'User Account Verification',
        PASSWORDRECOVERY_SUBJECT: 'Password Reset',
        TEMPLATE_SIGNATURE: 'Sweet Valley School Team',
        DEFAULT_USERNAME: 'Dear User',
        OTP_SUBJECT: 'OTP Verification'
    }
}
export const DATATYPES = {
    UNDEFINED: 'undefined',
    STRING: 'string',
    NUMBER: 'number'
}
export const REGEX = {
    PASSWORD: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,100}$/,
    EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    NUMERICAL: /^[0-9]+$/,
    ALPHA: /^[a-zA-Z ]*$/,
    ALPHANUMERIC: /^([a-zA-Z0-9 _-]+)$/,
    MONGOOBJECT: /^[0-9a-fA-F]{24}$/,
    SPECIALCHARS: /\W|_/g
}
export const SUCCESSFULREGISTRATIONCOOKIE = {
    origin: 'http://localhost:5173', maxAge: 1800000, secure: true, sameSite: 'none'
}
export const OTPCONFIRMATIONCOOKIE = {
    origin: 'http://localhost:5173', maxAge: 180000, secure: true, sameSite: 'none'
}
export const TOKENCOOKIECONFIG = {
    origin: 'http://localhost:5173', maxAge: 7200000, secure: true,
    httpOnly: true, sameSite: 'none'
}
export const TOKENTRACKERCOOKIECONFIG = {
    origin: 'http://localhost:5173', maxAge: 7200000, secure: true, sameSite: 'none'
}
export const NUMERICAL_ENTITY = {
    USERTYPE: [1, 2, 3]
}