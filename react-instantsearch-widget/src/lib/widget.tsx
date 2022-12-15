import { Component } from './component';
import { connect } from './connector';

type WidgetParams = {
  /**
   * Placeholder text for input element.
   */
  placeholder?: string;
};

export const : React.ElementType<WidgetParams> = connect(
  Component,
  { $$widgetType: '' }
);
