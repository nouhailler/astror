(function(){
  var toggle = document.getElementById('navToggle');
  if (toggle){
    toggle.addEventListener('click', function(){
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function(e){
    if (document.body.classList.contains('nav-open')){
      var side = document.querySelector('.side');
      if (side && !side.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)){
        document.body.classList.remove('nav-open');
        toggle && toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.body.classList.remove('nav-open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Search page
  var input = document.getElementById('searchInput');
  if (input && window.ASTROR_SEARCH_INDEX){
    var results = document.getElementById('searchResults');
    var empty = document.getElementById('searchEmpty');
    var index = window.ASTROR_SEARCH_INDEX;

    function render(list){
      results.innerHTML = '';
      if (!list.length){ empty.style.display = 'block'; return; }
      empty.style.display = 'none';
      list.slice(0, 40).forEach(function(item){
        var a = document.createElement('a');
        a.className = 'res';
        // item.url est racine-absolu (ex: /guide/ciel/) ; cette page (/search/) est à
        // profondeur fixe 1, donc "../" ramène à la racine du site quel que soit le sous-répertoire de publication.
        a.href = '../' + item.url.replace(/^\//, '');
        a.innerHTML = '<div class="r-cat">' + item.cat + '</div><div class="r-title">' + item.title + '</div><div class="r-excerpt">' + item.excerpt + '</div>';
        results.appendChild(a);
      });
    }

    function search(q){
      q = q.trim().toLowerCase();
      if (!q){ render([]); empty.textContent = 'Tapez au moins un mot — recherche dans les titres, catégories et résumés.'; empty.style.display = 'block'; return; }
      var matches = index.filter(function(item){
        return (item.title + ' ' + item.cat + ' ' + item.excerpt).toLowerCase().indexOf(q) !== -1;
      });
      empty.textContent = 'Aucun résultat pour « ' + q + ' ».';
      render(matches);
    }

    var params = new URLSearchParams(location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    search(initial);
    input.addEventListener('input', function(){ search(input.value); });
    input.focus();
  }
})();
