- The code will poll for available centers according to the settings at constants.js
- Once the center is obtain, it will try to book a slot.
## Constants
Fill the following constants
- **distId** - Select the district from the list given in constants.js,
- **preferredPin** - Pin of preffered hospital,
- **beneficiaries** - User who needs the vaccine. This you need to get it from cowin app. Login. Take developer tools network. Check the response of beneficiaries url 

## How to run

Get this code.  Do the above modification in constants.js and then

`npm install`

`npm run try`


