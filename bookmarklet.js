javascript:(function(){
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
                const regExp = new RegExp(isAspect ? `Aspect of ${rep.original}|${rep.original} Aspect` : rep.original, options);
                node.nodeValue = node.nodeValue.replace(regExp, rep.new);
              }
            });
          }
        };
        walk(document.body);
      };

      replaceTexts(data.aspects, true, 'gi');
      const reps = data.replacements;
      reps.sort((a, b) => (b.original?.length || 0) - (a.original?.length || 0));
      replaceTexts(reps, false, 'g');
    })
    .catch(error => console.error('Error loading JSON:', error));
})();
