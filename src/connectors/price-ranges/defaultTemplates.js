export default {
  header: '',
  item: `
    {{#from}}
      {{^to}}
        &ge;
      {{/to}}
      {{currency}}{{#helpers.formatNumber}}{{from}}{{/helpers.formatNumber}}
    {{/from}}
    {{#to}}
      {{#from}}
        -
      {{/from}}
      {{^from}}
        &le;
      {{/from}}
      {{#helpers.formatNumber}}{{to}}{{/helpers.formatNumber}}
    {{/to}}
  `,
  footer: '',
};
