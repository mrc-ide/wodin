import i18next from "i18next";
import { LanguageStateMutation } from "../../store/mutations";
import { LanguageAction, actions } from "../../store/actions";

describe("Language actions", () => {
    i18next.init({
        lng: "en",
        resources: {
            en: {
                translation: {
                    hello: "hello"
                }
            },
            fr: {
                translation: {
                    hello: "bonjour"
                }
            }
        }
    });

    it("UpdateLanguage commits change language mutation and i18next function", async () => {
        const commit = jest.fn();
        const spyChangeLanguage = jest.spyOn(i18next, "changeLanguage");
        await (actions[LanguageAction.UpdateLanguage] as any)({ commit }, "fr");
        expect(commit).toBeCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(LanguageStateMutation.ChangeLanguage);
        expect(commit.mock.calls[0][1]).toStrictEqual("fr");
        expect(spyChangeLanguage).toBeCalled();
    });
});
