import configureUserToken from '../configure-user-token';
import connectConfigureUserToken from '../../../connectors/configure-user-token/connectConfigureUserToken';

jest.mock('../../../connectors/configure-user-token/connectConfigureUserToken');

describe('configureUserToken', () => {
  it('should call the connector', () => {
    const widget = jest.fn();
    (connectConfigureUserToken as jest.Mock).mockImplementationOnce(
      () => widget
    );

    configureUserToken({});

    expect(connectConfigureUserToken).toHaveBeenCalledTimes(1);
    expect(widget).toHaveBeenNthCalledWith(1, {});
  });
});
