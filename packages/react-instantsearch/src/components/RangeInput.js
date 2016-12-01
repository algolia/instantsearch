import React, {PropTypes, Component} from 'react';
import {isNaN} from 'lodash';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('RangeInput');

class RangeInput extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {from: props.currentRefinement.min, to: props.currentRefinement.max};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({from: nextProps.currentRefinement.min, to: nextProps.currentRefinement.max});
  }

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isNaN(parseFloat(this.state.from, 10)) && !isNaN(parseFloat(this.state.to, 10))) {
      this.props.refine({min: this.state.from, max: this.state.to});
    }
  };

  render() {
    const {translate} = this.props;
    return (
      <form {...cx('root')} onSubmit={this.onSubmit}>
        <label {...cx('labelMin')}>
          <input {...cx('inputMin')}
                 type="number" value={this.state.from} onChange={e => this.setState({from: e.target.value})}
          />
        </label>
        <span {...cx('separator')}>{translate('separator')}</span>
        <label {...cx('labelMax')}>
          <input {...cx('inputMax')}
                 type="number" value={this.state.to} onChange={e => this.setState({to: e.target.value})}
          />
        </label>
        <button {...cx('submit')} type="submit">{translate('submit')}
        </button>
      </form>
    );
  }
}

export default translatable({
  submit: 'go',
  separator: 'to',
})(RangeInput);
