import path from "path";
import fs from "fs";
import { readFile } from "../configReader";
import axios from "axios";

export const buildWodinStaticSite = async (configPath: string, destPath: string) => {
    const storesPath = path.resolve(configPath, "stores")
    const stores = fs.readdirSync(storesPath, { recursive: false }) as string[];
    
    // bootstrapping and making sure the folder structure is correct
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
    }
    const destStoresPath = path.resolve(destPath, "stores");
    if (fs.existsSync(destStoresPath)) {
        fs.rmSync(destStoresPath, { recursive: true });
    }
    fs.mkdirSync(destStoresPath);
    
    // copy in their config specific files (assets to come soon)
    fs.cpSync(path.resolve(configPath, "index.html"), path.resolve(destPath, "index.html"));
    
    // get runners
    const runnerOdeResponse = await axios.get("http://localhost:8001/support/runner-ode");
    fs.writeFileSync(path.resolve(destStoresPath, "runnerOde.js"), runnerOdeResponse.data.data);
    const runnerDiscreteResponse = await axios.get("http://localhost:8001/support/runner-discrete");
    fs.writeFileSync(path.resolve(destStoresPath, "runnerDiscrete.js"), runnerDiscreteResponse.data.data);
    
    // make folder per store with config.json (their config + default code) and
    // model.json (model response from odin.api)
    stores.forEach(async store => {
        const destStorePath = path.resolve(destStoresPath, store);
        fs.mkdirSync(destStorePath);
        const model = readFile(path.resolve(storesPath, store, "model.R")).split("\n");
    
        const config = JSON.parse(readFile(path.resolve(storesPath, store, "config.json"))) as { appType: string };
        fs.writeFileSync(path.resolve(destStorePath, "config.json"), JSON.stringify({ ...config, defaultCode: model }));
    
        const timeType = config.appType === "stochastic" ? "discrete" : "continuous";
        const modelResponse = await axios.post("http://localhost:8001/compile", { model, requirements: { timeType } });
        fs.writeFileSync(path.resolve(destStorePath, `model.json`), JSON.stringify(modelResponse.data.data));
    });
};
