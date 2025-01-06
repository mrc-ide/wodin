# Wodin Static

## Background

We would like researchers to be able to build a site without a server and publish a static site somewhere like github pages. This will be to build interactive research papers/articles that allow policy makers to better understand the researchers' models. Since the models will be static we can remove both the `express` backend, `redis` and `odin.api`.

Static wodin sites will allow the user to update parameters and re-run the model, fit data, run sensitivity and download data. They do not support updating model code or saving sessions. 

## Example static site

An example of the config a user needs to design is in this folder. To convert this example into a site run:
1. `./scripts/run-dev-dependencies.sh`
1. `./scripts/build-and-serve-static-site.sh`
The site should be available at `localhost:3000` (the containers which are run by the dependencies script are only involved in generating the model javascript for this site. Once the site is built, you can stop the containers and still change the HTML document, e.g. adding a new graph, and it'll update everything accordingly when you refresh the page - you don't need to re-run the `build-and-serve` script either).

## How it works

There are two stages to this process, build time (model code and static asset generation we do in a github action once the user has created a config) and run time (querying the HTML page and mounting the correct components with the correct stores).

### Build time

After the user writes the config, a github action will checkout this repo, run the `odin.api` docker container and run the `wodinBuilder.ts` script which takes in the path of the config and path of the output folder as args. This script expects a `stores` folder which contains folders that label your stores, `<store-name>`. In each `<store-name>` folder it expects a `config.json` and `model.R` file. This script does a couple of things:
1. Copies the `index.html` file the user has written to the output folder
1. Gets the Javascript code for the ODE and discrete runners from `odin.api` and saves them into `stores/runnerOde.js` and `stores/runnerDiscrete.js` (the runner are generic and shared across all stores)
1. For each `<store-name>`, it saves the config into `stores/<store-name>/config.json` and it compiles the model code (also via the odin api) and saves the response into `stores/<store-name>/model.json`.

We also build `wodin` frontend in static mode (just normal `wodin` frontend with an early return in the api service so we don't do any network requests since there are no `odin.api` and `redis` containers running) and copy the js and css files into the output folder. After this, we just commit the output folder into a github pages branch and github will deploy it.

### Run time

The `wodinStatic.ts` script is the entrypoint for run time wodin static. This script does the following:
1. Loads third party CDN scripts (e.g. for mathjax). It does this by creating a script tag with the right source and appends it to the body of the HTML document.
1. Awaits blocking scripts, e.g. loading the `runnerOde.js` and `runnerDiscrete.js`, that the app cannot run without, these runners loaded as global variables `odinjs` and `dust` respectively.
1. Queries the document and finds all tags with `data-w-store` attributes - these tags define the wodin components to render by class name, and the `data-w-store` attribute specifies the name of the store to use. These attribute values define all the stores requires by the site, and should match the `<store-name>` folder names in the user's config.
1. Gets the `stores/<store-name>/config.json` and `stores/<store-name>/model.json` for only the stores the user has used in the page.
1. For each `<store-name>` the user has used in the page, it initialises the store with the config, runners (using the global variables), model and finally runs the model with the runners. This initialisation was the responsibility of on mount hook of components like `WodinSession.vue` but we no longer mount those components so we have to manually initialise the store. Note: the api service is disabled in the wodin static build so returns undefined for all responses, this may break things if you want to mount certain components that do api requests. We intend to fix this soon.
1. For each `<store-name>` we loop over the components we want to mount. We define a selector for each one in `componentsAndSelectors` function and query the DOM for these selectors making sure they have `data-w-store` tag with value `<store-name>`. We mount the component to the correct selector with the correct store. `index.html` in this folder includes examples of all supported components.
