# WODIN

[odin](https://github.com/mrc-ide/odin) on the web.

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

WODIN fetches compiled odin code from [odin.api](https://github.com/mrc-ide/odin.api), which should be run locally using 
`./scripts/run-dev-dependencies.sh`.

For development, you can install all dependencies and serve the app, with hot reloading, using two terminals. In one terminal, use `./scripts/serve-backend.sh` to run the server. In another terminal use `./scripts/serve-frontend.sh`.
The app will be available at http://localhost:3000.

You can also install dependencies, build and run the app locally in one step using `./scripts/build-and-run.sh`. The app will be available at http://localhost:3000 

To build front end changes only run `./scripts/build-frontend.sh`.

WODIN is deployable via an npm package: https://www.npmjs.com/package/wodin

To run an instance of WODIN with custom configuration, install the package and use `npx wodin /path/to/config`

The path provided in the `config` argument should be an absolute path to a root config folder containing the following: 

### wodin.config.json

Contains the following settings for the WODIN instance:
- `port`: the port number at which WODIN should be served
- `appsPath`: the url path under root at which each app should be available e.g `/apps/day1` for appPath of "apps" and app 
name "day1"
- `odinApi`: base url for the running instance of [odin.api](https://github.com/mrc-ide/odin.api) to use

### index.html 

A root index page `index.html` should be provided which will be available at the root url `/` and should provide a front 
page for all apps, including any description and explanation along with links to apps and data files.

`index.html` may also use files included in the `/files` folder e.g. images or css.

### /[appsPath]/*.config.json

Each config.json file defines config values for an app. The app will be available at `/[appsPath]/[appName]` for a config
file named `[appName].config.json`. [appsPath] is defined in `wodin.config.json`. Note that the local config folder should
match `appsPath` too. 

Each app config file should contain the following settings:
- `appType`: "basic", "fit" or "stochastic"
- `title`: the app title which will be visible to the user
- `readOnlyCode`: boolean indicating whether default code should not be editable by the user
- `stateUploadIntervalMillis` (optional): number of milliseconds to wait after front end state changes before state will be 
saved to the server. Increase this value if too frequent requests are causing issues. Default is 2000.

### /defaultCode/*.R

Default odin code for an application (if any) should be provided in the `/defaultCode` folder, in a file named `[appName].R`.

### /files

Sample data and other supporting files can be provided in any folder structure under `/files` and will be available at urls under `/files`

See the `/config` folder for example configuration, used in development. 

## Development

This codebase has been tested with Node version 20.9.0.

## Frontend 

Front-end source can be found under `app/static/src`. The front end can be built by running `npm run build` from
`app/static`. This builds output to be picked up by the back end at `app/server/public`.

The entry point script is `app/static/src/wodin.ts`.

### Unit Tests
Run unit tests from `app/static` using `npm run test:unit`. Run [eslint](https://eslint.org/) with `npm run lint` or `npm run lint:fix`.

### Fontawesome
We use fontawesome for some icons (e.g. glyph in Monaco editor when there's an error or a warning). We have only the icons we need from fontawesome in `app/static/src/assets/fontawesome.css` so if you would like to add a new one, you can define a custom class:
```
.<class-name> {
    content: "\<unicode>"
}
```
where you can define the `<class-name>` and the `<unicode>` for the icon can be found at [Fontawesome](https://fontawesome.com/search?o=r&s=solid&f=classic) (it is in the top right hand corner when you select an icon). Note: we only have the "solid" icons currently.

## Backend

The back end handles requests for apps by reading the corresponding config files and rendering an html [Handlebars](https://handlebarsjs.com/) template
`views/app.hbs` which uses the built front end js file, and also provides configuration from the `appConfig` object via the
top-level `WodinSession` component. It also sets an `appType` variable which is used by `wodin.ts` to select which type
of store to initialise. 

The back-end server can be built using `npm run build` and run using `npm run serve`, both from `app/server`.

### Unit Tests
Run tests from `app/server` using `npm test`. Run [eslint](https://eslint.org/) with `npm run lint` or `npm run lint:fix`.


### Integration Tests

From `app/server` using `npm run integration-test`

### Browser tests

Browser tests use [Playwright](https://playwright.dev/). Run browser tests, while the app is running, using `npm run e2e-test` from `app/static`.

### Publishing

To publish to npm:
- build both front end and and back end
- increment the version in `/app/server/package.json`
- run `npm run genversion` from `/app/server` to update the version number in `src/versions.ts`
- then `npm publish --access public`, from `/app/server` folder (may need to `npm login` first)

### Usage via docker

The build includes a docker image build which may be easier to deploy. See [wodin-demo](https://github.com/mrc-ide/wodin-demo) for an example.

### Quickly test drive a feature branch

Use the `./scripts/run-version.sh` script setting the branch references for the app and api (defaults to main for both):

```
./scripts/run-version.sh --app mrc-1234 --api mrc-2345
```

## Hot Reloading

This repo has two main parts: `app/server` (Express server) and `app/static` (Vue frontend). The normal way to spin up the app without hot reloading is build frontend, copy build files into public folder in the server (`npm run build --prefix=app/static` builds the frontend and copies the files to the server) and run the server (`npm run serve --prefix=app/server`). The html file will then look for its javascript src `wodin.js` and css src `wodin.css` in the `app/server/public` directory and load the app from these.

The hot reloading setup is different. The `server.js` file (from building the server) takes in a `--hot-reload` boolean option which tells it to instead look for the javascript src at `http://localhost:5173/src/wodin.ts` since `wodin.ts` is our entrypoint (`http://localhost:5173` is the default url for `vite` dev mode and it serves the files, after transpiling to javascript, based on your folder structure) and css src at `http://localhost:5173/src/scss/style.scss`. To run it this way we run `npm run dev --prefix=app/static` to start the vite dev server and then we run `npm run serve-hot --prefix=app/server`.
