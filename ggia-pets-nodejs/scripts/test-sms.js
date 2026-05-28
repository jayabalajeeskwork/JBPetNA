require('dotenv').config();
const helpers = require('../helpers/helpers');

async function testSMS() {
    const type = process.argv[2]; // 'otp' or 'ack'
    const phoneNumber = process.argv[3];

    if (!type || !phoneNumber || !['otp', 'ack'].includes(type)) {
        console.error("Invalid arguments.");
        console.error("Usage: node scripts/test-sms.js <type> <phone_number>");
        console.error("Types: otp, ack");
        console.error("Example: node scripts/test-sms.js otp +19876543210");
        console.error("Example: node scripts/test-sms.js ack +19876543210");
        process.exit(1);
    }

    console.log(`Starting ${type.toUpperCase()} SMS test for number: ${phoneNumber}...`);
    
    // Check if configuration exists
    if (!process.env.MSG91_AUTH_KEY) {
        console.warn("WARNING: MSG91_AUTH_KEY is not set in your .env file!");
    }

    try {
        let result;
        if (type === 'otp') {
            const flowId = process.env.MSG91_FLOW_ID;
            console.log(`Using OTP Flow ID: ${flowId}`);
            result = await helpers.sendSMSOTP(phoneNumber, "1234");
        } else {
            const flowId = process.env.MSG91_ACK_FLOW_ID;
            console.log(`Using Acknowledgment Flow ID: ${flowId}`);
            result = await helpers.sendAcknowledgmentSMS(phoneNumber, "https://example.com/test-link");
        }
        
        console.log("\n--- RESULT ---");
        if (result) {
            console.log("Success! Helper returned true.");
        } else {
            console.log("Failed to send SMS (Helper returned false).");
        }
    } catch (error) {
        console.error("\n--- ERROR ---");
        console.error("Failed to send test SMS:", error.message);
    }
    
    process.exit(0);
}


testSMS();
