import { useMenu } from 'react-instantsearch';

function App() {
  return (
    <InstantSearch>
      <MenuSelect attribute="category" />
    </InstantSearch>
  );
}

function MenuSelect(props) {
  const { items, refine } = useMenu(props, {
    $$widgetType: 'custom.menuSelect',
  });

  return (
    <select onChange={(event) => refine(event.target.value)}>
      {items.map((item) => (
        <option key={item.label} value={item.value} selected={item.isRefined}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
