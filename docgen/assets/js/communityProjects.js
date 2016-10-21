import projects from '../data/community-projects.json';

function init() {
  const list = [];
  const template = [];
  const target = document.querySelector('[data-inject-community]');


  projects.forEach(function(e){
    list.push({
      name: e.name,
      url: e.url,
      logo: e.logo,
      backgroundColor: e.backgroundColor ? e.backgroundColor : 'transparent'
    })
  });

  list.forEach(function(t) {
    let tpl = '<div class="dropdown-item"><a href="'+ t.url +'"><span class="item-icon" style="background-color: '+ t.backgroundColor +'"><span><img src="'+ t.logo +'" onerror="this.src=\'images/logo-community.svg\'"></span></span><h4>'+ t.name +'</h4></a></div>';
    template.push(tpl);
  });
  target.innerHTML = String(template).replace(/[,]/g, '');
}

document.body.addEventListener('DOMContentLoaded', init());
