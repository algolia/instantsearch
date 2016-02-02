export default {
  header: ``,
  item: `
    {{#from}}
      {{^to}}
        &ge;
      {{/to}}
      {{currency}}{{from}}
    {{/from}}
    {{#to}}
      {{#from}}
        -
      {{/from}}
      {{^from}}
        &le;
      {{/from}}
      {{to}}
    {{/to}}
  `,
  footer: ``
};
