import React, {PropTypes, Component} from 'react';

export default function createShowMore(configure) {
  const hasConfigure = typeof configure === 'function';
  return Composed => class AlgoliaShowMore extends Component {
    static propTypes = {
      initialLimit: PropTypes.number,
    };

    constructor(props) {
      super();

      const {initialLimit} = hasConfigure ?
        configure(props) :
        props;

      if (typeof initialLimit === 'undefined') {
        throw new Error(
          'AlgoliaShowMore requires a initialLimit prop'
        );
      }

      this.state = {limit: initialLimit};
    }

    show = limit => {
      this.setState({limit});
    };

    render() {
      return (
        <Composed
          limit={this.state.limit}
          show={this.show}
          {...this.props}
        />
      );
    }
  };
}
