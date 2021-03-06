This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This "Transverse Chat Injector" reads an excel file of messages / windows to inject messages 
to any XMPP-based chat server. Designed for simulation of group messaging.

For development and prodution, you will need .env files in src with the following: 

REACT_APP_XMPP_SERVICE=(your service) ex: ws://localhost:7070/ws \
REACT_APP_XMPP_DOMAIN=(your server IP) ex: localhost \
REACT_APP_XMPP_USERNAME=(xmpp username) ex: chatbot \
REACT_APP_XMPP_PASSWORD=(xmpp password) ex: admin \
REACT_APP_XMPP_CONFERENCE=(groupchat service) ex: conference.computer-name \
REACT_APP_XMPP_SIMTIME=(current hh:mm:ss of sim) ex: 16:30:05

Options for .env include: \
.env (default load) \
.env.local (trumps .env) \
.env.development (loaded in development mode) \
.env.production (loaded in production) \
.env.(mode).local (trumps the two above) 

React can only access env variables with REACT_APP_ prefix.

After cloning the project, use any of the following.

## Recommended

Using the Dockerfile:

[Development] docker build -t tci:dev .
[Development] docker run \
    -it \
    --rm \
    -v ${PWD}:/app \
    -v /app/node_modules \
    -p 3001:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    tci:dev
[Production] docker build -f Dockerfile.prod -t tci:prod .
[Production] docker run -it --rm -p 1337:80 tci:prod




## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
