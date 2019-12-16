import connectConfigureUserToken, {
  ConfigureUserTokenWidgetFactory,
} from '../../connectors/configure-user-token/connectConfigureUserToken';

type ConfigureUserToken = ConfigureUserTokenWidgetFactory<{}>;

const configureUserToken: ConfigureUserToken = widgetParams =>
  connectConfigureUserToken()(widgetParams);

export default configureUserToken;
