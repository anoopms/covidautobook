const fetch = require('node-fetch');
const player = require('play-sound')(opts = {})
const _ = require('lodash');
const login = require('./login');
const CONSTANT = require('./constants');
const format = require('dateformat');
const watsapp = require('./watsapp');

const distId = CONSTANT.distId;
const preferredPin = CONSTANT.preferredPin;

let lastFound = [];

const doLoop = () => {
	console.log(new Date().toLocaleString());
	const time = setInterval(function myTimeCallback() {
		const date = format(new Date(), 'dd-mm-yyyy');
		console.log('Trying at...', new Date().toLocaleString());
		fetch(`https://api.cowin.gov.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${distId}&date=${date}`)
			.then(data => data.json())
			.then(data => {
				const found = data.centers.map(item => {
					const sessions = item.sessions || [];
					const isAvailable = sessions.some(item => item.available_capacity > 0);
					const isVaccine = sessions.some(item => item.vaccine  === CONSTANT.vaccine);
					const str = isAvailable && isVaccine ? '*' : '';
					return `${str}${item.name} ${item.pincode}${str}`;
				});
				console.log('Centers count ', data.centers.length, found)
		
				
				if (data.centers.length) {
					const center = getCenter(data.centers);
					if (center) {
						console.log('GOT', new Date().toLocaleString(), center);
						player.play('./success.mp3', () => { })
						clearInterval(time);
						login(center, doLoop);
					} else {
						console.log(`Got ${data.centers.length} centers but not for ` + preferredPin.join(', '));
					}

					if(!_.isEqual(lastFound, found)) {
						lastFound = found;
						const message = found.join('\n');
						const bottom = center ? '*GOT CENTER*' : `\n-Got ${data.centers.length} centers but not for ` + preferredPin.join(', ') + '-';
						watsapp(message + bottom);
					}
				}
			})
			.catch((err) => {
				console.log(err);
				console.log('FAILED', new Date().toLocaleString());
				// player.play('./failure.mp3', () => { })
				// clearInterval(time);
			});
		return myTimeCallback;
	}(), 1000 * 60 * 5);

};


const getCenter = (centers = []) => {
	return _.find(centers, (center) => {
		return preferredPin.indexOf(center.pincode) !== -1;
	});

}

doLoop();

