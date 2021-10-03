const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sendSMS = (body, to) => {
  client.messages
    .create({
      body,
      from: '+16507537470',
      to,
    })
    .then((message) => console.log(`Message Sent: ${message}`))
    .catch((err) => console.log(err.message));
};

module.exports = sendSMS;
