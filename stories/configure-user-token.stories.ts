import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits, withInsights } from '../.storybook/decorators';

storiesOf('Basics|ConfigureUserToken', module).add(
  'Inject user token from cookie',
  withHits(
    withInsights(({ search, container, instantsearch }) => {
      const description = document.createElement('div');
      description.innerHTML = `
        <p>UserToken provided from algolia cookie: logged helper state contains</p>
        <pre><code>{ userToken: '...'}</code></pre>
        
        <form id="user-token-form">
            <input type="text" name="userToken" />
            <button type="submit"> set user token </button> 
        </form>
      `;

      description
        .querySelector('#user-token-form')!
        .addEventListener('submit', event => {
          event.preventDefault();
          const userToken = (description.querySelector(
            '[name="userToken"]'
          ) as HTMLInputElement).value;
          (window as any).aa('setUserToken', userToken);
        });

      container.appendChild(description);

      search.addWidgets([instantsearch.widgets.configureUserToken()]);
    }),
    {
      searchFunction(helper) {
        action('helper.state.userToken')(helper.state.userToken);
        helper.search();
      },
    }
  )
);
