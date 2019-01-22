import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import PoweredBy, {
  PoweredByCSSClasses,
} from '../../components/PoweredBy/PoweredBy';
import connectPoweredBy, {
  PoweredByRenderOptions,
} from '../../connectors/powered-by/connectPoweredBy';
import { getContainerNode } from '../../lib/utils';
import { component } from '../../lib/suit';

type PoweredByOptions = {
  container: string | HTMLElement;
  cssClasses?: Partial<PoweredByCSSClasses>;
  theme?: Theme;
};

type PoweredByRendererOptions = {
  container: HTMLElement;
  cssClasses: PoweredByCSSClasses;
};

export type PoweredByWidgetParams = {
  theme?: Theme;
};

type PoweredByRenderingOptions = PoweredByRenderOptions & {
  widgetParams: PoweredByWidgetParams;
};

export type Theme = 'dark' | 'light';

const suit = component('PoweredBy');

const renderer = ({ container, cssClasses }: PoweredByRendererOptions) => (
  { url, widgetParams }: PoweredByRenderingOptions,
  isFirstRender: boolean
) => {
  if (isFirstRender) {
    const { theme } = widgetParams;

    render(
      <PoweredBy cssClasses={cssClasses} url={url} theme={theme!} />,
      container
    );

    return;
  }
};

const usage = `Usage:
poweredBy({
  container,
  [ theme = 'light' ],
})`;

export default function poweredBy(widgetOptions: PoweredByOptions) {
  const { container, cssClasses: userCssClasses = {}, theme = 'light' } =
    widgetOptions || ({} as any);

  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses: PoweredByCSSClasses = {
    root: cx(
      suit(),
      suit({ modifierName: theme === 'dark' ? 'dark' : 'light' }),
      userCssClasses.root
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    logo: cx(suit({ descendantName: 'logo' }), userCssClasses.logo),
  };

  const specializedRenderer = renderer({
    container: containerNode,
    cssClasses,
  });

  try {
    const makeWidget = connectPoweredBy(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );

    return makeWidget({ theme });
  } catch (error) {
    throw new Error(usage);
  }
}
