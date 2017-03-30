import instantsearch from '../index.js';
    var options = {
      appId: 'RQ1BNZGU00',
      apiKey: '9fadaed55bc261d2f78a677f97bd5bde',
      indexName: 'FEEDS'
    };
    var search = instantsearch(options);

    search.addWidget(
      instantsearch.widgets.rangeSlider({
        container: '#age',
        attributeName: 'meta.age',
        templates: {
          header: 'Age'
        },
        tooltips: {
          format: function(rawValue) {
            return rawValue;
          }
        }
      })
    );

    search.addWidget(
      instantsearch.widgets.rangeSlider({
        container: '#sentiment',
        attributeName: 'analysis.docSentiment.score',
        templates: {
          header: 'Sentiment Score'
        },
        tooltips: {
          format: function(rawValue) {
            return rawValue;
          }
        }
      })
    );
    search.start();


