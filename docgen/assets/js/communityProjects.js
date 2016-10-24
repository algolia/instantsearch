import projects from '../data/community-projects.json';

function init() {
  const list = [];
  const template = [];
  const target = document.querySelector('[data-inject-community]');

  // Please, do not freak out.
  // I needed this regex to remove coma that
  // are not into a parenthesis. That way, I can
  // generate a linear-gradient as icon background
  // from :
  //       http://stackoverflow.com/a/28577629/1331432
  const regexComaNotInParenthesis = /,(?=(?:"[^"]*"|\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*}|[^"\[{}()\]])*$)/g;

  projects.forEach(function(e) {
    list.push({
      name: e.name,
      url: e.url,
      logo: e.logo,
      backgroundColor: e.backgroundColor ? e.backgroundColor : 'transparent'
    });
  });

  list.forEach(function(t) {
    let tpl = `<div class="dropdown-item"><a href="${t.url}"><span class="item-icon" style="background: ${t.backgroundColor}"><img src="${t.logo}" /></span><h4>${t.name}</h4></a></div>`;
    template.push(tpl);
  });
  target.innerHTML = String(template).replace(regexComaNotInParenthesis, '');
}

document.body.addEventListener('DOMContentLoaded', init());
