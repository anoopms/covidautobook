const fetch = require('node-fetch');
const player = require('play-sound')(opts = {})
const _ = require('lodash');
const login = require('./login');

const a = [
{ "district_id": 301, "district_name": "Alappuzha" },
{ "district_id": 307, "district_name": "Ernakulam" },
{ "district_id": 306, "district_name": "Idukki" },
{ "district_id": 297, "district_name": "Kannur" },
{ "district_id": 295, "district_name": "Kasaragod" },
{ "district_id": 298, "district_name": "Kollam" },
{ "district_id": 304, "district_name": "Kottayam" },
{ "district_id": 305, "district_name": "Kozhikode" },
{ "district_id": 302, "district_name": "Malappuram" },
{ "district_id": 308, "district_name": "Palakkad" },
{ "district_id": 300, "district_name": "Pathanamthitta" },
{ "district_id": 296, "district_name": "Thiruvananthapuram" },
{ "district_id": 303, "district_name": "Thrissur" },
{ "district_id": 299, "district_name": "Wayanad" }
];

const distId = 308;
const preferredPin = [679101, 679104];

const doLoop = () => {
	console.log(new Date().toLocaleString());
	const time = setInterval(function () {
		console.log('Trying at...', new Date().toLocaleString());
		fetch(`https://api.cowin.gov.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${distId}&date=30-04-2021&vaccine=COVISHIELD`)
			.then(data => data.json())
			.then(data => {
				console.log('Centers count ', data, data.centers.length)
				if (data.centers.length) {
					const center = getCenter(data.centers);
					if (center) {
						console.log('GOT', new Date().toLocaleString(), center);
						player.play('./success.mp3', () => { })
						clearInterval(time);
						login(center, doLoop);
					} else {
						console.log('Got centers but not for ' + preferredPin.join(', '));
					}

				}
			})
			.catch((err) => {
				console.log(err);
				console.log('FAILED', new Date().toLocaleString());
				player.play('./failure.mp3', () => { })
				clearInterval(time);
			});
	}, 1000 * 60 * 5);

};


const getCenter = (centers = []) => {
	return _.find(centers, (center) => {
		return preferredPin.indexOf(center.pincode) !== -1;
	});

}

doLoop();

