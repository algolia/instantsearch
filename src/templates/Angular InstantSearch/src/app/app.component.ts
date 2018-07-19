import { Component } from '@angular/core';
import * as algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  '{{appId}}',
  '{{apiKey}}'
);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  config = {
    indexName: '{{indexName}}',
    searchClient,
  };
}
