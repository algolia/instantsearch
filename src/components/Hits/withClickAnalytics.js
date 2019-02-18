import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';

export default C =>
  class WithClickAnalyticsWrapper extends Component {
    static propTypes = {
      hits: PropTypes.array.isRequired,
      results: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);
      this.ref = null;
    }

    componentDidMount() {
      const node = this.ref.getDOMNode();
      node.addEventListener('click', ev => {
        const event = ev.target.getAttribute('data-analytics-event');
        const payload = ev.target.getAttribute('data-analytics-payload');
        if (event && payload) {
          // event should be oneOf ['clickedObjectIDsAfterSearch', ...]
          // payload should be valid json
          let jsonPayload;
          try {
            jsonPayload = JSON.parse(payload);
          } catch (e) {
            console.error('Invalid JSON event payload');
            return;
          }

          // call aa(eventType, eventPayload)
          console.log(event, jsonPayload);
        }
      });
    }

    render() {
      const {
        results: { index, hitsPerPage, page, queryID },
      } = this.props;

      const hits = this.props.hits.map((hit, position) => ({
        ...hit,
        __hitAbsoluteIndex: hitsPerPage * page + position + 1,
        __index: index,
        __queryID: queryID,
        analytics: {
          clickedObjectIDsAfterSearch: eventName => {
            const payload = {
              eventName,
              index,
              queryID,
              objectIDs: [hit.objectID],
              positions: [hitsPerPage * page + position + 1],
            };
            return `
              data-analytics-event="clickedObjectIDsAfterSearch"
              data-analytics-payload='${JSON.stringify(payload)}'
            `;
          },
        },
      }));

      return <C ref={node => (this.ref = node)} {...this.props} hits={hits} />;
    }
  };
