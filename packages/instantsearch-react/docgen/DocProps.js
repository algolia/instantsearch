import React, {PropTypes} from 'react';

function stringifyType(type) {
  if (type.name === 'shape') {
    // @TODO: Handle shapes.
    return 'shape';
  }

  if (type.name === 'arrayOf') {
    return `[${stringifyType(type.value)}]`;
  }

  if (type.name === 'oneOf') {
    return `oneOf(${type.value})`;
  }

  if (type.name === 'union') {
    return `oneOfType([${type.value.map(stringifyType).join(', ')}])`;
  }

  return type.name;
}

function Prop(props) {
  const {prop} = props;
  return (
    <div>
      <p><strong>{prop.name}</strong> <code>{stringifyType(prop.type)}</code></p>
      <p>
        {prop.required &&
          <span>Required</span>
        }
        {prop.defaultValue &&
          <span>Defaults to <code>{prop.defaultValue.value}</code></span>
        }
      </p>
      {prop.description &&
        <p dangerouslySetInnerHTML={{__html: prop.description}} />
      }
    </div>
  );
}

Prop.propTypes = {
  prop: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.object.isRequired,
    required: PropTypes.bool,
    defaultValue: PropTypes.object,
    description: PropTypes.string,
  }),
};

function DocProps(props) {
  return (
    <div>
      {props.props.map(prop =>
        <Prop
          key={prop.name}
          prop={prop}
        />
      )}
    </div>
  );
}

DocProps.propTypes = {
  props: PropTypes.array.isRequired,
};

export default DocProps;
