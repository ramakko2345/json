javascript:(function(){
  const url = 'https://ramakko2345.github.io/json/data.json';
  const replaceNodes = (targetNode, replacements, isAspect, options) => {
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
          if (rep.original && rep.new && rep.new.length > 0 && !rep.error) {
            const regex = isAspect ? `Aspect of ${rep.original}|${rep.original} Aspect|of ${rep.original}|${rep.original} of` : rep.original;
            try {
              const regExp = new RegExp(regex, options);
              node.nodeValue = node.nodeValue.replace(regExp, rep.new);
            } catch(e) {
              console.error('Error replace :', e, regex, rep);
              rep.error = true;
            }
          }
        });
      }
    };
    walk(targetNode);
  };
  let json = null;
  const replaceTexts = (targetNode) => {
    if (!json) return;
    replaceNodes(targetNode, json.aspects, true, 'gi');
    replaceNodes(targetNode, json.replacements, false, 'g');
    replaceNodes(targetNode, json.aspects, false, 'g');
  };
  

  fetch(url + '?' + new Date().getTime())
  .then(response => response.json())
  .then(data => {
    data.aspects.sort((a, b) => (b.original?.length || 0) - (a.original?.length || 0));
    data.replacements.sort((a, b) => (b.original?.length || 0) - (a.original?.length || 0));
    let map = new Map();
    let aspects = [];
    const dup = (replacements, lists) => {
      replacements.forEach(rep => {
        if (rep.original && rep.new && rep.new.length > 0) {
          rep.original = rep.original.replace(/'/g, '[\'’]');
          if (map.has(rep.original)) {
            console.log('exists:', rep.original, rep.new, map.get(rep.original));
          } else {
            lists.push(rep);
            map.set(rep.original, rep.new);
          }
        }
      });
    };
    dup(data.aspects, aspects);
    map = new Map();
    let replacements = [];
    dup(data.replacements, replacements);
    json = {aspects: aspects, replacements: replacements};
    replaceTexts(document.body);

    if (document.body.getAttribute('obflg') != 't') {
      const callback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
                replaceTexts(node);
              }
            });
          }
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(document.body, {childList: true, subtree: true});
      document.body.setAttribute('obflg', 't');
    }
  })
  .catch(error => console.error('Error loading JSON:', error));


})();
