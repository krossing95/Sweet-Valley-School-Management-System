export const APP_OBJECT = {
    name: 'Sweet Valley Creche and Montessori School Management System'
}
export const MESSAGES = {
    MESSAGES: {
        WSWW: 'Whoops! Something went wrong',
        BRS: 'Bad request received',
        ACNBE: 'Action could not be executed',
        NCFY: 'No changes found yet'
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
        ADS: 'User deleted successfully',
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
        BRS: 'Bad request received',
        PNINS: 'Phone number must be a numeric string of 10 chars',
        UAPR: 'Username and password are required',
        IC: 'Credentials are incorrect',
        IOTP: 'Invalid OTP',
        CUWR: 'Chosen usertype got rejected',
        CGGR: 'Chosen gender got rejected',
        UECFIA: 'Unexpected chars found in address fields',
        UECFIOE: 'Unexpected chars found in occupation or employer fields',
        UECFIAL: 'Unexpected chars found in address or last school attended fields',
        IDR: 'Incorrect data representation'
    },
    MAILS: {
        VERIFICATION_SUBJECT: 'User Account Verification',
        PASSWORDRECOVERY_SUBJECT: 'Password Reset',
        TEMPLATE_SIGNATURE: 'Sweet Valley School Team',
        DEFAULT_USERNAME: 'Dear User',
        OTP_SUBJECT: 'OTP Verification'
    },
    STUDENTS: {
        AFAR: 'Most important fields are missing',
        DEFERR: 'Date entities must be in the format, MM/DD/YYYY',
        HLFE: 'Home language must contain only English alphabets and whitespaces',
        CCCGR: 'Chosen current class got rejected',
        PTII: 'Parent type is invalid',
        SRS: 'Student created successfully',
        CCDNDOB: 'Check date of birth and commencement date well',
        PDNF: 'Parent data not found',
        CNASTUU: 'Cannot assign student to unverified user',
        SNRF: 'Sorry, no student records found',
        NSRFFP: 'User does not have any ward in the school',
        SUS: 'Student updated successfully',
        PISS: 'Parent information saved successfully',
        PDDS: 'Parent information removed',
        TMCR: 'Too many contacts received',
        SAHC: 'Student already has registered contacts',
        CDSS: 'Contact saved for student successfully',
        SNCIF: 'Sorry, no contacts information found',
        CIRS: 'Contact information removed sucessfully',
        ONERR: 'Othernames must contain only English alphabets and whitespaces and at most 30 chars'
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
    SPECIALCHARS: /\W|_/g,
    CSVDOT_HYPHEN: /^[a-zA-Z0-9 .,-]{0,150}$/
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
    USERTYPE: [1, 2, 3],
    TWOINARRAY: [1, 2], // true or false datatype
    THREEINARRAY: [1, 2, 3], // gender, 
    CLASSES: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    // 1 => creche, 2 => nursery1, 3 => nursery2, 4 => kg1, 5 => kg2, 6 => basic1,
    // 7 => basic2, 8 => basic3, 9 => basic4, 10 => basic5, 11 => basic6, 12 => basic7, 13 => basic8, 14 => basic9
}
export const PARENT_INFO_DATAKEYS = [
    'f_firstname', 'f_lastname', 'f_othername', 'f_telephone', 'f_home_address', 'f_postal_address', 'f_occupation', 'f_employer', 'f_work_address',
    'm_firstname', 'm_lastname', 'm_othername', 'm_telephone', 'm_home_address', 'm_postal_address', 'm_occupation', 'm_employer', 'm_work_address'
]
export const EMERGENCY_CONTACT_DATAKEYS = [
    'firstname', 'lastname', 'telephone', 'home_address', 'postal_address', 'occupation',
    'employer', 'work_address', 'relationship'
]