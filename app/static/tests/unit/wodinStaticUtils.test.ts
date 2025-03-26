import { AppType } from "@/store/appState/state";
import {
    componentsAndSelectors, getStoreOptions, waitForBlockingScripts,
    getStoresInPage, getConfigAndModelForStores, getDeepCopiedStoreOptions,
    initialiseStore,
    registerRedrawGraphPlugins
} from "@/wodinStaticUtils";
import { storeOptions as basicStoreOptions } from "@/store/basic/basic";
import { storeOptions as fitStoreOptions } from "@/store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "@/store/stochastic/stochastic";
import { AppStateMutation } from "@/store/appState/mutations";
import { ModelMutation } from "@/store/model/mutations";
import { ModelAction } from "@/store/model/actions";
import { nextTick } from "vue";

const { mockConfigRes, mockModelRes, mockGet, mockRerunModel, mockRerunSensitivity } = vi.hoisted(() => {
    const mockConfigRes = (s: string) => `config-${s}`;
    const mockModelRes = (s: string) => `model-${s}`;
    const mockGet = vi.fn().mockImplementation((url: string) => {
        const store = url.split("/").at(-2);
        const type = url.split("/").at(-1) === "config.json" ? "config" : "model";
        return { data: `${type}-${store}` };
    });
    const mockRerunModel = vi.fn();
    const mockRerunSensitivity = vi.fn();
    return { mockConfigRes, mockModelRes, mockGet, mockRerunModel, mockRerunSensitivity };
});
vi.mock("axios", () => ({ default: { get: mockGet } }));
vi.mock("@/store/plugins", async (importOriginal) => {
    const actual = await importOriginal() as object;
    return {
        ...actual,
        rerunModel: mockRerunModel,
        rerunSensitivity: mockRerunSensitivity
    };
});

describe("wodin static utils", () => {
    test("can get correct store options", () => {
        const b = getStoreOptions(AppType.Basic);
        expect(b).toStrictEqual(basicStoreOptions);

        const f = getStoreOptions(AppType.Fit);
        expect(f).toStrictEqual(fitStoreOptions);

        const s = getStoreOptions(AppType.Stochastic);
        expect(s).toStrictEqual(stochasticStoreOptions);
    });

    test("get store options throws error if not correct app type", () => {
        expect(() => getStoreOptions("hey" as any)).toThrowError("Unknown app type");
    });

    test("component and selector interpolates store correctly", () => {
        const { selector } = componentsAndSelectors("test-store")[0];
        expect(selector).toContain(`data-w-store="test-store"`);
    });

    test("can wait for blocking scripts", async () => {
        let promiseDone = false;
        const mockScript = { async: true, src: "", onload: null };
        const createElementSpy = vi.spyOn(document, "createElement")
            .mockImplementation(() => mockScript as any);
        const documentBodySpy = vi.spyOn(document.body, "append");

        waitForBlockingScripts(["test-script"]).then(() => promiseDone = true);
        (mockScript.onload as any)();
        await vi.waitFor(() => expect(promiseDone).toBe(true));

        expect(createElementSpy).toBeCalledTimes(1);
        expect((documentBodySpy.mock.calls[0][0] as any).async).toBe(false);
        expect((documentBodySpy.mock.calls[0][0] as any).src).toBe("test-script");
    });

    test("get stores in page returns unique list of stores", async () => {
        const testStores = ["store1", "store1", "store2"];
        vi.spyOn(document, "querySelectorAll").mockImplementation(() => {
            return testStores.map(s => ({ getAttribute: vi.fn().mockImplementation(() => s) })) as any
        });
        const storesInPage = getStoresInPage();
        expect(storesInPage).toStrictEqual(["store1", "store2"]);
    });

    test("can get configs and models for stores", async () => {
        const testStores = ["store1", "store2"];
        const configAndModelObj = await getConfigAndModelForStores(testStores);
        testStores.forEach(s => {
            expect(configAndModelObj[s].config).toBe(mockConfigRes(s));
            expect(configAndModelObj[s].modelResponse).toBe(mockModelRes(s));
        })
    });

    test("can deep copy store options", () => {
        const mockStoreOptions = {
            state: { key1: "hey1" },
            modules: {
                mod1: { state: { key2: "hey2" } },
                mod2: { state: { key3: "hey3" } }
            }
        };
        const copy = getDeepCopiedStoreOptions(mockStoreOptions as any) as any;
        copy.state.key1 = "what1";
        copy.modules.mod1.state.key2 = "what2";
        copy.modules.mod2.state.key3 = "what3";
        expect(mockStoreOptions.state.key1).toBe("hey1");
        expect(mockStoreOptions.modules.mod1.state.key2).toBe("hey2");
        expect(mockStoreOptions.modules.mod2.state.key3).toBe("hey3");
    });

    test("can initialise store", async () => {
        (globalThis as any).odinjs = "test odinjs";
        (globalThis as any).dust = "test dust";

        const commit = vi.fn();
        const dispatch = vi.fn();
        await initialiseStore(
            { commit, dispatch } as any,
            { appType: AppType.Basic, defaultCode: ["test", "code"] },
            "test model res" as any
        );

        expect(commit).toBeCalledTimes(4);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfig);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            appType: AppType.Basic,
            basicProp: "",
            defaultCode: ["test", "code"],
            endTime: 100,
            readOnlyCode: true,
            stateUploadIntervalMillis: 2_000_000,
            maxReplicatesRun: 100,
            maxReplicatesDisplay: 50
        });
        expect(commit.mock.calls[1][0]).toBe(`model/${ModelMutation.SetOdinRunnerOde}`);
        expect(commit.mock.calls[1][1]).toBe("test odinjs");
        expect(commit.mock.calls[2][0]).toBe(`model/${ModelMutation.SetOdinRunnerDiscrete}`);
        expect(commit.mock.calls[2][1]).toBe("test dust");
        expect(commit.mock.calls[3][0]).toBe(`model/${ModelMutation.SetOdinResponse}`);
        expect(commit.mock.calls[3][1]).toBe("test model res");

        expect(dispatch).toBeCalledTimes(1);

        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.CompileModel}`);
    });

    it("register redraw graph plugins works for run model", async () => {
        const testStoreName = "test-store";
        const mockDispatch = vi.fn();
        const mockStore = { dispatch: mockDispatch } as any;
        vi.spyOn(document, "querySelector").mockImplementation(selector => {
            return selector.includes("w-run-graph") as any;
        });
        registerRedrawGraphPlugins(testStoreName, mockStore);
        await nextTick();
        expect(mockRerunModel.mock.calls[0][0]).toStrictEqual(mockStore);
    });

    it("register redraw graph plugins works for run sensitivity", async () => {
        const testStoreName = "test-store";
        const mockDispatch = vi.fn();
        const mockStore = { dispatch: mockDispatch } as any;
        vi.spyOn(document, "querySelector").mockImplementation(selector => {
            return selector.includes("w-sens-graph") as any;
        });
        registerRedrawGraphPlugins(testStoreName, mockStore);
        await nextTick();
        expect(mockRerunSensitivity.mock.calls[0][0]).toStrictEqual(mockStore);
    });
});
