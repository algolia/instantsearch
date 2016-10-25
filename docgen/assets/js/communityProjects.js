import projects from '../data/community-projects.json';

function init() {
  const list = [];
  const target = document.querySelector('[data-inject-community]');

  projects.forEach(e => {
    list.push({
      name: e.name,
      url: e.url,
      logo: e.logo,
      backgroundColor: e.backgroundColor ? e.backgroundColor : 'transparent',
    });
  });

  list.forEach(t => {
    const tpl = `
      <div class="dropdown-item">
        <a href="${t.url}">
          <span class="item-icon" style="background: ${t.backgroundColor}">
            <img src="${t.logo}" />
          </span>
          <h4>${t.name}</h4>
        </a>
      </div>`;
    target.innerHTML += tpl;
  });
}

export default init;

