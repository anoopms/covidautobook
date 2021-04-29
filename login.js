const fetch = require('node-fetch');
const CryptoJS = require("crypto-js");
const sha256 = require("crypto-js/sha256");
const _ = require('lodash');
const CONSTANT = require('./constants');

let info = {};

const beneficiaries = CONSTANT.beneficiaries;
const DOSE = 2;

const getBody = (data) => {
	const body = JSON.stringify(data);
	const authObj = {};
	if(info.token) {
		authObj.Authorization = "Bearer " + info.token;
	}
	return {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
		'Content-Type': 'application/json',
		...authObj
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body, // body data type must match "Content-Type" header,
		
	};
}

const schedule = () => {
	const data = {
		beneficiaries,
		center_id: _.get(info, 'center.center_id'),
		dose: DOSE,
		session_id: _.get(info, 'center.sessions[0].session_id'),
		slot: _.get(info, 'center.sessions[0].slots[0]')
	};

	const body = getBody(data);
	console.log('SCHEDULED BODY ', body);

	fetch('https://api.cowin.gov.in/api/v2/appointment/schedule', body)
	.then((data) => {
		console.log('SCHEDULE SUCCESS', data);
	})
	.catch((err) => {
		console.log('SCHEDULE ERROR', err);
		info.goBack();
	});
}


const sendOtp  = (txnId, inOtp) => {
	const otp = sha256(inOtp).toString();
	fetch('https://api.cowin.gov.in/api/v2/auth/validateMobileOtp', getBody({txnId, otp}))
		.then(data => {
			console.log('****', data);
			return data.json();
		})
		.then((data = {}) => {
			console.log('LOGGED IN **** ', data);
			info.token = data.token;
			schedule();
			
		})
		.catch((err) => {
			console.log(err);
			console.log('Send OTP Failed. Try again  in 1 minute');
			setTimeout(doLogin, 1000 * 60);
		});


}

const getInput = (txnId) => {
	const readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	  });
	   
	  readline.question('Enter OTP: ', otp => {
		console.log(`-${otp}-`);
		sendOtp(txnId, otp)
		readline.close();
	  });
}


const doLogin = (center, goBack = () => {}) => {
	const secret = CryptoJS.AES.encrypt('b5cab167-7977-4df1-8027-a63aa144f04e', 'CoWIN@$#&*(!@%^&').toString();
	const mobile = 9562119597;
	info = {center, goBack};
	console.log(secret);

	console.log('Login...');
	fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP', getBody({secret, mobile}))
		.then(data => data.json())
		.then(data => {
			console.log('Got Transaction Id', data);
			getInput(data.txnId);
		})
		.catch((err) => {
			console.log(err);
			console.log('Try again  in 1 minute');
			setTimeout(doLogin, 1000 * 60);
		});
}


// getInput();
// doLogin();
// test();
module.exports = doLogin;
