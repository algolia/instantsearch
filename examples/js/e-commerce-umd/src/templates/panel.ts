export const collapseButtonText = ({ collapsed }: { collapsed: boolean }) =>
  collapsed
    ? `
<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
  <path fill="#21243d" d="M6 6V0h1v6h6v1H7v6H6V7H0V6h6z" fill-rule="evenodd"/>
</svg>
  `
    : `
<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
  <path fill="#21243d" d="M0 6h13v1H0z" fill-rule="evenodd"/>
</svg>
  `;
