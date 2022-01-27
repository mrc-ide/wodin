# WODIN

[odin](https://github.com/mrc-ide/odin) on the web

## Introduction

WODIN is a web application with [Node.js](https://nodejs.org/en/) back end using [Express](http://expressjs.com/), 
and [Vue.js](https://vuejs.org/) front end. Both parts are written in [Typescript](https://www.typescriptlang.org/).  

The application is intended to be deployable with custom configuration allowing (typically) teaching courses to be delivered
where students can author and run model code using [odin](https://github.com/mrc-ide/odin). 
Odin will be invoked by WODIN to provide executable javascript
models given odin code written by the users or provided in config. 

WODIN configuration defines multiple 'apps', corresponding to teaching modules, which each provide functionality for 
one of three types of model usage:
- *basic* - to teach the basics of odin model definitions
- *fit* - to fit a model to data
- *stochastic* - to run a model stochastically

Each app with have one of these three app types, as well as any further configuration required e.g. default odin code. 

## Usage and configuration

You can install dependencies. build and run the app locally in one step using `./scripts/build-and-run.sh`. The app will be available at http://localhost:3000

WODIN will be deployable as a docker image which can be mounted with custom configuration as follows:

### *.config.json

Each config.json file defines config values for an app. The app will be available at `/apps/[appName]` for a config
file named `[appName].config.json`

### /files

Sample data can be provided in any folder structure under `/files` and will be available at urls under `/files`

### index.html 

An index page which will be available at the root url `/` and should provide a front page for all apps, including any description
and explanation along with links to apps and data files.

See the `/src/app/server/config` folder for example configuration, used in development. 

## Development

### Front end 

Front end source can be found under `src/app/static/src`. The front end can be built by running `npm run build` from
`src/app/static`. This builds output to be picked up by the back end at `arc/app/server/public`.

There are entry point scripts for each of the three app types (`basic.ts`, `fit.ts` and `stochastic.ts`), which are each
built separately. You can build an individual app type using e.g. `npm run build-basic`. Each entry script invokes a store
and top-level component for the given app type. 

### Back end

The back end handles requests for apps by reading the corresponding config files and rendering an html [Handlebars](https://handlebarsjs.com/) template
`views/app.hbs` to use the appropriate js file, and also to provide configuration values to the relevant store via
the `appConfig` object.

The backend server can be built using `npm run build` and  run using `npm run serve`, both from `/src/app/server`.



