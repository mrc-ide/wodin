# WODIN

[odin](https://github.com/mrc-ide/odin) on the web

## Introduction

WODIN is a web application with a [Node.js](https://nodejs.org/en/) back end using [Express](http://expressjs.com/), 
and a [Vue.js](https://vuejs.org/) front end. Both parts are written in [Typescript](https://www.typescriptlang.org/).  

The WODIN application can be deployed with custom configuration to create teaching courses that allow students to author 
and run model code using [odin](https://github.com/mrc-ide/odin).

When the user runs a model in WODIN, odin will be invoked to provide executable JavaScript for odin model code. This 
odin code may be written by the user or provided in config.

WODIN configuration defines multiple 'apps', corresponding to teaching modules, which each provide functionality for 
one of three types of model usage:
- *basic* - to teach the basics of odin model definitions
- *fit* - to fit a model to data
- *stochastic* - to run a model stochastically

Each app will have one of these three app types, as well as any further configuration required e.g. default odin code. 

## Usage and configuration

You can install dependencies, build and run the app locally in one step using `./scripts/build-and-run.sh`. The app will be available at http://localhost:3000 
You may need to install TypeScript: `npm install -g typescript`

WODIN will be deployable as a docker image which can be mounted with custom configuration as follows:

### *.config.json

Each config.json file defines config values for an app. The app will be available at `/apps/[appName]` for a config
file named `[appName].config.json`

### /files

Sample data and other supporting files can be provided in any folder structure under `/files` and will be available at urls under `/files`

### index.html 

A root index page `index.html` should be provided which will be available at the root url `/` and should provide a front 
page for all apps, including any description and explanation along with links to apps and data files.

`index.html` may also use files included in the `/files` folder e.g. images or css.

See the `/config` folder for example configuration, used in development. 

## Development

### Front end 

Front-end source can be found under `app/static/src`. The front end can be built by running `npm run build` from
`app/static`. This builds output to be picked up by the back end at `app/server/public`.

There are entry point scripts for each of the three app types (`basic.ts`, `fit.ts` and `stochastic.ts`), which are each
built separately. You can build an individual app type using e.g. `npm run build-basic`. Each entry script invokes a store
and top-level component for the given app type. 

Run unit tests from `app/static` using `npm run test:unit`. Run [eslint](https://eslint.org/) with `npm run lint` or `npm run lint:fix`.

### Back end

The back end handles requests for apps by reading the corresponding config files and rendering an html [Handlebars](https://handlebarsjs.com/) template
`views/app.hbs` to use the appropriate js file, and also to provide configuration values to the relevant store via
the `appConfig` object.

The back-end server can be built using `npm run build` and run using `npm run serve:dev`, both from `app/server`.

Run tests from `app/server` using `npm test`. Run [eslint](https://eslint.org/) with `npm run lint` or `npm run lint:fix`.

### Browser tests

Browser tests use [Playwright](https://playwright.dev/). Run browser tests, while the app is running, using `npm run e2e-test` from `app/static`.

### Publishing

To publish to npm:
- build both front end and and back end
- increment the version in `/app/server/package.json`
- then `npm publish --access public`, from `/app/server` folder (may need to `npm login` first)
