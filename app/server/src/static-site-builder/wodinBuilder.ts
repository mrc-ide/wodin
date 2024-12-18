import path from "path";
import fs from "fs";
import { readFile } from "../configReader";
import axios from "axios";
import { processArgs } from "./args";

const mkdirForce = (path: string) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
};

const { configPath, destPath } = processArgs();

const storesPath = path.resolve(configPath, "stores")
const stores = fs.readdirSync(storesPath, { recursive: false }) as string[];

mkdirForce(destPath);
const destStoresPath = path.resolve(destPath, "stores");
if (fs.existsSync(destStoresPath)) {
    fs.rmSync(destStoresPath, { recursive: true });
}
fs.mkdirSync(destStoresPath);

fs.cpSync(path.resolve(configPath, "index.html"), path.resolve(destPath, "index.html"));

const getRunners = async () => {
    const runnerOdeResponse = await axios.get("http://localhost:8001/support/runner-ode");
    fs.writeFileSync(path.resolve(destStoresPath, "runnerOde.js"), runnerOdeResponse.data.data);
    
    const runnerDiscreteResponse = await axios.get("http://localhost:8001/support/runner-discrete");
    fs.writeFileSync(path.resolve(destStoresPath, "runnerDiscrete.js"), runnerDiscreteResponse.data.data);
}
getRunners();

stores.forEach(async store => {
    const destStorePath = path.resolve(destStoresPath, store);
    fs.mkdirSync(destStorePath);

    const model = readFile(path.resolve(storesPath, store, "model.R")).split("\n");

    const config = JSON.parse(readFile(path.resolve(storesPath, store, "config.json"))) as { appType: string };
    fs.writeFileSync(path.resolve(destStorePath, "config.json"), JSON.stringify({ ...config, defaultCode: model }));

    const modelResponse = await axios.post("http://localhost:8001/compile", {
        model,
        requirements: { timeType: config.appType === "stochastic" ? "discrete" : "continuous" }
    });
    fs.writeFileSync(path.resolve(destStorePath, `model.json`), JSON.stringify(modelResponse.data.data));
});
