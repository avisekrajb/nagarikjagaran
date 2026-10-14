/**
 * FeatureToggle — सुपर एडमिनको फिचर टगल अनुसार बाल घटक हटाउने/देखाउने।
 *
 * ⚠ default export **FeatureToggle component** नै हो।
 * SiteConfigContext को default (context object) हुनु हुन्ँन — त्यो
 * component होइन, `<C />` बनाउँदा "render is not a function" आउँछ।
 */
export {
  FeatureToggle as default,
  FeatureToggle,
  useSiteConfig,
  SiteConfigProvider
} from "../context/SiteConfigContext";
