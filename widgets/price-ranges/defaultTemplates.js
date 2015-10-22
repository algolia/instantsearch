module.exports = {
  header: ``,
  range: `
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
    <span>{{count}}</span>`,
  footer: ``
};
