const fetch = require('node-fetch');
const player = require('play-sound')(opts = {})
const _ = require('lodash');
const login = require('./login');
const CONSTANT = require('./constants');

const distId = CONSTANT.distId;
const preferredPin = CONSTANT.preferredPin;


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
				// clearInterval(time);
			});
	}, 1000 * 60 * 5);

};


const getCenter = (centers = []) => {
	return _.find(centers, (center) => {
		return preferredPin.indexOf(center.pincode) !== -1;
	});

}

doLoop();

