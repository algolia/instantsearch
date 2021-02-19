// @TODO: move this to ../search-box.tsx once that exists
import { Template } from "../../types";

export type SearchBoxCSSClasses = {
  root: string;
  form: string;
  input: string;
  submit: string;
  submitIcon: string;
  reset: string;
  resetIcon: string;
  loadingIndicator: string;
  loadingIcon: string;
};

export type SearchBoxTemplates = {
  submit: Template;
  reset: Template;
  loadingIndicator: Template;
};
