# WWU Campus Map using ESRI's JS SDK #

## Building a production version of the website ##

For this project, I am using [Vite](https://vitejs.dev/) as a development environment. Vite is a combonation tool that includes a develepment server and a build profile. 

For package management I am using [NPM (Node Package Manager)](https://www.npmjs.com/). This provides an easy way to install the neccessary packages and keep everything up to date. It will look at the `package.json` file for dependencies and then install those into a node_modules directory within the project.

Both of these tools are required.

### Steps ###

1. Install NPM using [these instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. In the source directory, run the command `npm install`
    - This will install the dependencies in the `package.json` file (ArcGIS SDK, Vite)
3. Run the command `npm run build`
    - This runs the `vite build` script which will create a `dist` folder in the source directory with a production build of the website.