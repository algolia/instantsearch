import type { BreadcrumbComponentTemplates } from '../../components/Breadcrumb/Breadcrumb';

const defaultTemplates: BreadcrumbComponentTemplates = {
  home() {
    return 'Home';
  },
  separator() {
    return '>';
  },
};

export default defaultTemplates;
