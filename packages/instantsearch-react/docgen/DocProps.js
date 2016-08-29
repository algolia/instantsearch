import React, {PropTypes} from 'react';
import doctrine from 'doctrine';
import marked from 'marked';

import renderer from './renderer';
import highlight from './highlight';

function intercalate(list, a) {
  const newList = [];
  for (let i = 0; i < list.length - 1; i++) {
    newList.push(list[i], a);
  }
  newList.push(list[list.length - 1]);
  return newList;
}

function compareRequiredThenName(a, b) {
  if (a[1].required && !b[1].required) {
    return -1;
  }
  if (b[1].required && !a[1].required) {
    return 1;
  }
  if (a[0] < b[0]) {
    return -1;
  }
  return 1;
}

function renderType(type, namedTypes, prefix) {
  if (type.name === 'shape') {
    const namedType = namedTypes.find(t => t.type === type);
    if (namedType) {
      return (
        <a key={namedType.name} href={`#${prefix}-type-${namedType.name}`}>
          {namedType.name}
        </a>
      );
    }
    return 'shape';
  }

  if (type.name === 'arrayOf') {
    return ['[', renderType(type.value, namedTypes, prefix), ']'];
  }

  if (type.name === 'enum') {
    return `oneOf([${type.value.map(v => v.value).join(', ')}])`;
  }

  if (type.name === 'union') {
    const unionTypes = type.value.map(t => renderType(t, namedTypes, prefix));
    return ['oneOfType([', ...intercalate(unionTypes, ', '), '])'];
  }

  return type.name;
}

function getShapes(type, path) {
  if (type.name === 'shape') {
    const shapes = [{path, type}];
    return Object.keys(type.value).reduce((res, key) =>
      res.concat(getShapes(type.value[key], `${path}.${key}`))
    , shapes);
  }

  if (type.name === 'arrayOf') {
    return getShapes(type.value, `${path}[]`);
  }

  if (type.name === 'union') {
    return type.value.reduce((res, unionType) =>
      res.concat(getShapes(unionType, path))
    , []);
  }

  return [];
}

function Entry(props) {
  const {
    prefix,
    parentId,
    required,
    name,
    type,
    namedTypes,
    description,
    defaultValue,
  } = props;

  const id = `${parentId}-entry-${name}`;

  return (
    <div id={id} className="Entry">
      <div className="Entry__head">
        {required &&
          <span className="Entry__badge">required</span>
        }
        <span className="Entry__name">{name}</span>
        <span className="Entry__type">
          <code>{renderType(type, namedTypes, prefix)}</code>
        </span>
        <span className="Entry__link">
          <a href={`#${id}`}>#</a>
        </span>
      </div>

      {description &&
        <div
          className="Entry__description"
          dangerouslySetInnerHTML={{__html: description}}
        />
      }

      {defaultValue &&
        <div className="Entry__default">
          Defaults to
          {' '}
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(defaultValue.value, 'js', true),
            }}
          />
        </div>
      }

    </div>
  );
}

Entry.propTypes = {
  prefix: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  type: PropTypes.object.isRequired,
  namedTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  description: PropTypes.string,
  defaultValue: PropTypes.object,
};

function Type(props) {
  const {prefix, name, type, namedTypes} = props;

  const id = `${prefix}-type-${name}`;

  const entries = Object.entries(type.value)
    .sort(compareRequiredThenName)
    .map(([entryName, entryType]) =>
      <Entry
        key={entryName}
        prefix={prefix}
        parentId={id}
        name={entryName}
        required={entryType.required}
        type={entryType}
        namedTypes={namedTypes}
        description={marked(entryType.description || '', {renderer})}
      />
    );

  return (
    <div id={id} className="Type">
      <div className="Type__head">
        <span className="Type__name">{name}</span>
        <span className="Type__link">
          <a href={`#${id}`}>#</a>
        </span>
      </div>
      <div className="Type__entries">
        {entries}
      </div>
    </div>
  );
}

Type.propTypes = {
  prefix: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.object.isRequired,
  namedTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function Prop(props) {
  const {prop, prefix} = props;

  const {description, tags} = doctrine.parse(prop.description || '');

  const isPublic = tags.some(tag => tag.title === 'public');

  if (!isPublic) {
    return null;
  }

  const defines = tags.find(tag => tag.title === 'defines');
  const typeNames = defines ? defines.description.split(' ') : [];
  const shapes = getShapes(prop.type, prop.name);

  const namedTypes = typeNames.map((name, i) => ({
    name,
    type: shapes[i].type,
  }));

  const mdDesc = marked(description, {renderer});

  return (
    <div className="Prop">
      <Entry
        prefix={prefix}
        parentId={`${prefix}-props`}
        name={prop.name}
        required={prop.required}
        type={prop.type}
        namedTypes={namedTypes}
        description={mdDesc}
        defaultValue={prop.defaultValue}
      />
      {namedTypes.length > 0 &&
        <div className="Prop__types">
          {namedTypes.map(({name, type}) =>
            <Type
              prefix={prefix}
              key={name}
              name={name}
              type={type}
              namedTypes={namedTypes}
            />
          )}
        </div>
      }
    </div>
  );
}

Prop.propTypes = {
  prop: PropTypes.object.isRequired,
  prefix: PropTypes.string.isRequired,
};

function DocProps(props) {
  const {propTypes, prefix} = props;
  const sortedProps = Object.entries(propTypes)
    .sort(compareRequiredThenName)
    .map(([name, prop]) => ({
      ...prop,
      name,
    }));
  return (
    <div className="DocProps">
      {sortedProps.map(prop =>
        <Prop
          key={prop.name}
          prefix={prefix}
          prop={prop}
        />
      )}
    </div>
  );
}

DocProps.propTypes = {
  propTypes: PropTypes.object.isRequired,
  prefix: PropTypes.string.isRequired,
};

export default DocProps;
