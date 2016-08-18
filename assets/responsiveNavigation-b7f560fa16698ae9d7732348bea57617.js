function responsiveNavigation() {
  var navigation = document.querySelector('.ac-nav');
  var links = navigation.querySelectorAll('a');
  var navigationAsSelect = document.createElement('select');

  if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    navigationAsSelect.classList.add('display-on-small', 'device');
  } else {
    navigationAsSelect.classList.add('display-on-small');
  }

  for( var i = 0; i<links.length; i++ ) {
    var option = document.createElement('option');
    option.text = links[i].title;
    option.value = links[i].href;
    option.selected = links[i].getAttribute('data-current') === 'true';
    navigationAsSelect.appendChild(option);
  }

  navigation.appendChild(navigationAsSelect);
  navigation.addEventListener('change', function(e){
    return window.location = e.target.value;
  });
}
responsiveNavigation();
