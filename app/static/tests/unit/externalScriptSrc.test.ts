import { externalScripts, loadThirdPartyCDNScripts } from "../../src/externalScriptSrc"

describe("external script src", () => {
    test("mounts enternal scripts to document", () => {
        loadThirdPartyCDNScripts();
        externalScripts.forEach((src, i) => {
            const script = document.body.getElementsByTagName("script").item(i)
            expect(script!.src).toBe(src);
            expect(script!.defer).toBe(true);
        })
    });
});
