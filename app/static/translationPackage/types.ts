type TranslationResources = {
  [key: string]: {
    [key: string]: string;
  };
};

type ResourceBundleProps = {
  language: string;
  namespace: string;
  translations: TranslationResources;
};

export default interface i18nInitProps {
  initialLanguage: string;
  fallBackLanguage?: string;
  bundles: Array<ResourceBundleProps>;
}
