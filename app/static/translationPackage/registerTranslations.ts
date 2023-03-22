import i18next from "i18next";
import { LanguageState } from "./store/state";

interface Resource {
    [key: string]: string
}

type ResourceObject<L extends string> = {
    [key in L]: Resource[]
}

export default function registerTranslations<L extends string>(languageState: LanguageState, resourceObject: ResourceObject<L>) {
    i18next.init({
        lng: languageState.currentLanguage,
        fallbackLng: "en",
        resources: {
            en: { translation: { hey: "hello"} }
        }
    });
    const languages = Object.keys(resourceObject) as L[];
    languages.forEach(lng => {
        registerResources(lng, resourceObject[lng]);
    })
};

const registerResources = (lng: string, resources: Resource[]) => {
    resources.forEach(resource => {
        addResource(lng, resource);
    })
};

const addResource = (lng: string, resource: Resource) => {
    console.log(lng);
    console.log(resource);

    const existingBundle = i18next.getResourceBundle(lng, "translation");
    if (!existingBundle) {
        i18next.addResources(lng, "translation", resource);
        return
    }
    const existingKeys = Object.keys(existingBundle);
    const resourceKeys = Object.keys(resource);
    const commonKeys = existingKeys.filter(key => {
        return resourceKeys.indexOf(key) > -1;
    });
    if (commonKeys.length > 0) {
        throw new Error(`The keys [${commonKeys.join(", ")}] are shared by more than
        one resource bundle. `)
    } else {
        i18next.addResources(lng, "translation", resource);
    }
};
