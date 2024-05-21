javascript:(function(){
  let active = false;
  const func = (targetNode) => {
    if (active) return;
    active = true;
    fetch('https://ramakko2345.github.io/json/data.json?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
      const replaceTexts = (replacements, isAspect, options) => {
        const walk = node => {
          if ([1, 9, 11].includes(node.nodeType)) {
            let child = node.firstChild;
            while (child) {
              const next = child.nextSibling;
              walk(child);
              child = next;
            }
          } else if (node.nodeType === 3) {
            replacements.forEach(rep => {
              if (rep.original) {
                const regExp = new RegExp(isAspect ? `Aspect of ${rep.original}|${rep.original} Aspect|of ${rep.original}|${rep.original} of` : rep.original, options);
                node.nodeValue = node.nodeValue.replace(regExp, rep.new);
              }
            });
          }
        };
        walk(targetNode);
      };

      const aspects = data.aspects;
      aspects.sort((a, b) => (b.original?.length || 0) - (a.original?.length || 0));
      replaceTexts(aspects, true, 'gi');
      const reps = data.replacements;
      reps.sort((a, b) => (b.original?.length || 0) - (a.original?.length || 0));
      replaceTexts(reps, false, 'g');
      replaceTexts(aspects, false, 'gi');
    })
    .catch(error => console.error('Error loading JSON:', error));
    active = false;
  };

  func(document.body);

  if (document.body.getAttribute('obflg') != 't') {
    const callback = function(mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
              func(node);
            }
          });
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.body, {childList: true, subtree: true});
    
    document.body.setAttribute('obflg', 't');
  }
})();
