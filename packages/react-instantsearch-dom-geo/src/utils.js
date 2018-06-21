import PropTypes from 'prop-types';

export const registerEvents = (events, props, instance) => {
  const eventsAvailable = Object.keys(events);
  const listeners = Object.keys(props)
    .filter(key => eventsAvailable.indexOf(key) !== -1)
    .map(name =>
      instance.addListener(events[name], event => {
        props[name]({ event, marker: instance });
      })
    );

  return () => {
    listeners.forEach(listener => listener.remove());
  };
};

export const createListenersPropTypes = eventTypes =>
  Object.keys(eventTypes).reduce(
    (acc, name) => ({ ...acc, [name]: PropTypes.func }),
    {}
  );

export const createFilterProps = excludes => props =>
  Object.keys(props)
    .filter(name => excludes.indexOf(name) === -1)
    .reduce(
      (acc, name) => ({
        ...acc,
        [name]: props[name],
      }),
      {}
    );
