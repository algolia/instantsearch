import React, {PropTypes, Component} from 'react';
import {isNaN} from 'lodash';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('RangeInput');

class RangeInput extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    canRefine: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = this.props.canRefine ?
      {from: props.currentRefinement.min, to: props.currentRefinement.max} : {from: '', to: ''};
  }

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.canRefine) {
      this.setState({from: nextProps.currentRefinement.min, to: nextProps.currentRefinement.max});
    }
    if (this.context.canRefine) this.context.canRefine(nextProps.canRefine);
  }

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isNaN(parseFloat(this.state.from, 10)) && !isNaN(parseFloat(this.state.to, 10))) {
      this.props.refine({min: this.state.from, max: this.state.to});
    }
  };

  render() {
    const {translate, canRefine} = this.props;
    return (
      <form {...cx('root', !canRefine && 'noRefinement')} onSubmit={this.onSubmit}>
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
  submit: 'ok',
  separator: 'to',
})(RangeInput);
