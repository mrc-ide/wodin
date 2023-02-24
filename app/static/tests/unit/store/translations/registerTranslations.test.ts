import registerTranslations from "../../../../src/app/store/translations/registerTranslations";
import i18next from "i18next";
import { Store } from "vuex";
import { AppState } from "../../../../src/app/store/appState/state";
import { Language } from "../../../../src/app/store/translations/locales";
import { mockBasicState } from "../../../mocks";

describe("Register translations", () => {
    it("initialises i18next", () => {
        const store: Store<AppState> = {
            state: {
                language: {
                    currentLanguage: Language.en
                }
            }
        } as any;
        const spyi18nextInit = jest.spyOn(i18next, "init");
        registerTranslations(store);
        expect(spyi18nextInit).toHaveBeenCalled();
    });
});