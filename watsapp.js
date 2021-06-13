
const messageWatsapp = (msg = '') => {
    const accountSid = 'AC8d798cf31de582459f2a150049c77964'; 
    const authToken = '0540a05b6cefa6bf8bb87d4d573e6435'; 
    const client = require('twilio')(accountSid, authToken); 
 
client.messages 
      .create({ 
         body: msg, 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+919562119597' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
}

// messageWatsapp();

module.exports = messageWatsapp;
