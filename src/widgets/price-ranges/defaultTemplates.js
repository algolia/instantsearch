export default {
  header: ``,
  item: `
    {{#from}}
      {{^to}}
        &ge;
      {{/to}}
      \${{from}}
    {{/from}}
    {{#to}}
      {{#from}}
        -
      {{/from}}
      {{^from}}
        &le;
      {{/from}}
      \${{to}}
    {{/to}}
  `,
  footer: ``
};
