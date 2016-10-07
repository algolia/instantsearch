import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import {isNaN} from 'lodash';
import translatable from '../../core/translatable';

import theme from './RangeInput.css';

class RangeInput extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {from: props.value.min, to: props.value.max};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({from: nextProps.value.min, to: nextProps.value.max});
  }

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isNaN(parseFloat(this.state.from, 10)) && !isNaN(parseFloat(this.state.to, 10))) {
      this.props.refine({min: this.state.from, max: this.state.to});
    }
  };

  render() {
    const {applyTheme, translate} = this.props;
    return (
      <form {...applyTheme('root', 'root')} onSubmit={this.onSubmit}>
        <label {...applyTheme('labelMin', 'labelMin')}>
          <input {...applyTheme('inputMin', 'inputMin')}
                 type="number" value={this.state.from} onChange={e => this.setState({from: e.target.value})}
          />
        </label>
        <span {...applyTheme('separator', 'separator')}>{translate('separator')}</span>
        <label {...applyTheme('labelMax', 'labelMax')}>
          <input {...applyTheme('inputMax', 'inputMax')}
                 type="number" value={this.state.to} onChange={e => this.setState({to: e.target.value})}
          />
        </label>
        <button {...applyTheme('submit', 'submit')} type="submit">{translate('submit')}
        </button>
      </form>
    );
  }
}

export default themeable(theme)(translatable({
  submit: 'go',
  separator: 'to',
})(RangeInput)
);
