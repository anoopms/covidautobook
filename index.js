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
		// const date = format(new Date(new Date().getTime() + 1000 * 60 * 60 * 24), 'dd-mm-yyyy');
		console.log('Trying at...', new Date().toLocaleString());
		fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${distId}&date=${date}`)
			.then(data => data.json())
			.then(data => {
				const filCenters = data.centers.filter((cItem) => {
					const sessions = cItem.sessions || [];
					const ret = sessions.some(item => (
						item.available_capacity_dose2 && item.vaccine === "COVISHIELD" && (cItem.address || '').toLowerCase().indexOf('angamaly') !== -1
					));
					return ret;
				})
				const found = filCenters.map(item => {
					const sessions = item.sessions || [];
					const capacity = sessions.reduce((sum, item) => sum + item.available_capacity, 0);
					return `${item.name} ${item.pincode} (${capacity})`;
				});
				console.log('Centers count ', found)
				if (found.length) {
					if(!_.isEqual(lastFound, found)) {
						// console.log(JSON.stringify(filCenters));
						lastFound = found;
						const message = found.join('\n');
						watsapp(message);
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
	}(), 1000 * 60);

};


const getCenter = (centers = []) => {
	return _.find(centers, (center) => {
		const sessions = center.sessions;
		return preferredPin.indexOf(center.pincode) !== -1 && sessions.some(item => item.available_capacity > 0);
	});

}

doLoop();

