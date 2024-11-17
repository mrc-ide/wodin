import path from "path";
import fs from "fs";
import { ConfigReader } from "../configReader";
import { AppConfig, WodinConfig } from "../types";
import { version as wodinVersion } from "../version";
import { render } from "mustache";
import { ConfigController } from "../controllers/configController";
import { AppFileReader } from "../appFileReader";
import axios from "axios";
import { processArgs } from "./args";

const mkdirForce = (path: string) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
};

const { configPath, destPath, viewsPath } = processArgs();

const pathResolved = path.resolve(configPath);
const configReader = new ConfigReader(pathResolved);
const defaultCodeReader = new AppFileReader(`${pathResolved}/defaultCode`, "R");
const appHelpReader = new AppFileReader(`${pathResolved}/help`, "md");
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;

mkdirForce(destPath);
const appsPathFull = path.resolve(destPath, wodinConfig.appsPath);
if (fs.existsSync(appsPathFull)) {
    fs.rmSync(appsPathFull, { recursive: true });
}
fs.mkdirSync(appsPathFull);

const sessionId = null;
const shareNotFound = null;
const baseUrl = wodinConfig.baseUrl.replace(/\/$/, "");

const appNames = fs.readdirSync(path.resolve(configPath, wodinConfig.appsPath)).map(fileName => {
    return /(.*)\.config\.json/.exec(fileName)![1];
});

appNames.forEach(async appName => {
    const appNamePath = path.resolve(appsPathFull, appName);
    fs.mkdirSync(appNamePath);

    const configWithDefaults = ConfigController.readAppConfigFile(
        appName, wodinConfig.appsPath, baseUrl, configReader, defaultCodeReader, appHelpReader
    );
    const readOnlyConfigWithDefaults = { ...configWithDefaults, readOnlyCode: true };
    const configResponse = {
        status: "success",
        errors: null,
        data: readOnlyConfigWithDefaults
    };
    fs.writeFileSync(path.resolve(appNamePath, "config.json"), JSON.stringify(configResponse));
    

    const versionsResponse = await axios.get("http://localhost:8001/");
    fs.writeFileSync(path.resolve(appNamePath, "versions.json"), JSON.stringify(versionsResponse.data));


    const runnerResponse = await axios.get("http://localhost:8001/support/runner-ode");
    fs.writeFileSync(path.resolve(appNamePath, "runnerOde.json"), JSON.stringify(runnerResponse.data));

    if (configWithDefaults.appType === "stochastic") {
        const runnerResponse = await axios.get("http://localhost:8001/support/runner-discrete");
        fs.writeFileSync(path.resolve(appNamePath, "runnerDiscrete.json"), JSON.stringify(runnerResponse.data));
    }

    const modelResponse = await axios.post("http://localhost:8001/compile", {
        model: defaultCodeReader.readFile(appName),
        requirements: { timeType: configWithDefaults.appType === "stochastic" ? "discrete" : "continuous" }
    });
    fs.writeFileSync(path.resolve(appNamePath, "modelCode.json"), JSON.stringify(modelResponse.data));


    const config = configReader.readConfigFile(wodinConfig.appsPath, `${appName}.config.json`) as AppConfig;
    const viewOptions = {
        appName,
        baseUrl,
        appsPath: wodinConfig.appsPath,
        appType: config.appType,
        title: `${config.title} - ${wodinConfig.courseTitle}`,
        appTitle: config.title,
        courseTitle: wodinConfig.courseTitle,
        wodinVersion,
        loadSessionId: sessionId || "",
        shareNotFound: shareNotFound || "",
        mathjaxSrc: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
        enableI18n: wodinConfig.enableI18n ?? false, // if option not set then false by default
        defaultLanguage: wodinConfig?.defaultLanguage || "en",
        hotReload: false
    };
    
    const mustacheTemplate = fs.readFileSync(path.resolve(viewsPath, "app.mustache")).toString();
    const htmlFile = render(mustacheTemplate, viewOptions);
    fs.writeFileSync(path.resolve(appNamePath, "index.html"), htmlFile);
});
