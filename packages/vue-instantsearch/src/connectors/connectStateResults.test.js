import connectStateResults from './connectStateResults';

it('is a connector', () => {
  const widgetFactory = connectStateResults(() => {});
  const widgetInstance = widgetFactory();
  expect(widgetInstance).toEqual(
    expect.objectContaining({
      init: expect.any(Function),
      render: expect.any(Function),
      dispose: expect.any(Function),
    })
  );
});

it('state & results are forwarded in render', () => {
  const renderFn = jest.fn();
  const widgetFactory = connectStateResults(renderFn);
  const widgetInstance = widgetFactory({ myParams: true });

  widgetInstance.init({});

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ state: undefined, results: undefined }),
    true
  );

  widgetInstance.render({
    state: { isState: true },
    results: { isResults: true },
  });

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({
      state: { isState: true },
      results: { isResults: true },
    }),
    false
  );
});

it('instantSearchInstance is forwarded', () => {
  const renderFn = jest.fn();
  const widgetFactory = connectStateResults(renderFn);
  const widgetInstance = widgetFactory({ myParams: true });

  const instantSearchInstance = {};

  widgetInstance.init({ instantSearchInstance });

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ instantSearchInstance }),
    true
  );

  widgetInstance.render({
    instantSearchInstance,
    state: { isState: true },
    results: { isResults: true },
  });

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({
      instantSearchInstance,
    }),
    false
  );
});

it('widgetParams are forwarded, and default to {}', () => {
  const renderFn = jest.fn();
  const widgetFactory = connectStateResults(renderFn);
  const widgetInstance = widgetFactory({ myParams: true });

  widgetInstance.init({});

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ widgetParams: { myParams: true } }),
    true
  );

  widgetInstance.render({});

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ widgetParams: { myParams: true } }),
    false
  );
});

it('widgetParams are optional, and default to {}', () => {
  const renderFn = jest.fn();
  const widgetFactory = connectStateResults(renderFn);
  const widgetInstance = widgetFactory();

  widgetInstance.init({});

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ widgetParams: {} }),
    true
  );

  widgetInstance.render({});

  expect(renderFn).toHaveBeenCalledWith(
    expect.objectContaining({ widgetParams: {} }),
    false
  );
});

it('unmountFn gets called on dispose', () => {
  const unmountFn = jest.fn();
  const widgetFactory = connectStateResults(() => {}, unmountFn);
  const widgetInstance = widgetFactory();
  widgetInstance.dispose();

  expect(unmountFn).toHaveBeenCalledTimes(1);
});

it('unmountFn is optional', () => {
  const unmountFn = jest.fn();
  const widgetFactory = connectStateResults(() => {}, unmountFn);
  const widgetInstance = widgetFactory();
  widgetInstance.dispose();
});
