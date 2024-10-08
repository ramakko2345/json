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
            let regex = isAspect ? `Aspect of ${rep.original}|${rep.original} Aspect|of ${rep.original}|${rep.original} of` : rep.original;
            let to = rep.new + (rep['boss_locates'] != null ? '(' + rep['boss_locates'] + ')' : '');
            try {
              const regExp = new RegExp(regex, options);
              node.nodeValue = node.nodeValue.replace(regExp, to);
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
    const removeRegex = (str) => {
      if (str.indexOf('(') < 0) return str;
      let r = '';
      let count = 0;
      for (let c of str) {
        if (c === '(')
          count++;
        else if (c === ')')
          count --;
        else if (count === 0 && c !== '?' && c !== '+') 
          r += c;
      }
      return r;
    };
    const sort = (replacements) => {
      const map = new Map();
      const results = [];
      replacements.forEach(rep => {
        if (rep.original && rep.new && rep.new.length > 0) {
          if (map.has(rep.original)) {
            if (rep.new != map.get(rep.original))
              console.log('exists:', rep.original, rep.new, map.get(rep.original));
          } else {
            rep.sort = removeRegex(rep.original);
            rep.original = rep.original.replace(/'/g, '[\'’]');
            results.push(rep);
            map.set(rep.original, rep.new);
          }
        }
      });
      results.sort((a, b) => (b.sort?.length || 0) - (a.sort?.length || 0));
      return results;
    };  
    json = {aspects: sort(data.aspects), replacements: sort(data.replacements)};

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
