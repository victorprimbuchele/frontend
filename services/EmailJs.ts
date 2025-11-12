import emailjs from '@emailjs/browser';

const options = {
    publicKey: 'YxP-LtR9zOrzX2l3n',
    // Do not allow headless browsers
    blockHeadless: true,
    blockList: {
        // Block the suspended emails
        list: [],
        // The variable contains the email address
        watchVariable: 'userEmail',
    },
    limitRate: {
        // Set the limit rate for the application
        id: 'app',
        // Allow 1 request per 10s
        throttle: 10000,
    },
}

emailjs.init(options);

export const sendTokenEmail = async (to: string, token: string) => {
    const result = await emailjs.send(
        'service_qyegp3h',
        'template_xqw0yfj',
        { to, token }
    );
    return result;
}

export const sendRegisteredEmail = async (to: string, name: string, memberId: string) => {
    const result = await emailjs.send(
        'service_qyegp3h', 
        'template_0qkhnhs',
        { to, name, memberId }
    );
    return result;
}