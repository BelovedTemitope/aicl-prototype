/* AICL prototype runtime: renders each page's template with its Component logic, in any browser, with no build step. */
(function () {
  var app, tpl, comp, mounted = false, notesOn = true;

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state) : patch;
    for (var k in p) this.state[k] = p[k];
    render();
  };
  DCLogic.prototype.forceUpdate = function () { render(); };

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function resolve(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }

  function fill(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = resolve(p, scope); return v == null ? '' : String(v); });
  }

  function child(scope, name, val, idx) {
    var s = Object.create(scope); s[name] = val; s.$index = idx; return s;
  }

  function walk(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(fill(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'helmet') return;
    if (tag === 'sc-for') {
      var list = resolve((node.getAttribute('list') || '').replace(HOLE, '$1').trim(), scope) || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) kids(node, child(scope, as, list[i], i), out);
      return;
    }
    if (tag === 'sc-if') {
      if (resolve((node.getAttribute('value') || '').replace(HOLE, '$1').trim(), scope)) kids(node, scope, out);
      return;
    }
    var el = node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml'
      ? document.createElementNS(node.namespaceURI, node.localName) : document.createElement(tag);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var m = val.match(WHOLE);
      if (m) {
        var v = resolve(m[1], scope);
        if (name.indexOf('on') === 0) { if (typeof v === 'function') el.addEventListener(name.slice(2), v); continue; }
        if (v == null || v === false) continue;
        el.setAttribute(name, v === true ? '' : String(v));
      } else if (name.indexOf('on') !== 0) {
        el.setAttribute(name, val.indexOf('{{') >= 0 ? fill(val, scope) : val);
      }
    }
    kids(node, scope, el);
    out.appendChild(el);
  }

  function kids(node, scope, out) {
    var src = node.localName === 'template' ? node.content : node;
    for (var c = src.firstChild; c; c = c.nextSibling) walk(c, scope, out);
  }

  function render() {
    var saved = [].map.call(app.querySelectorAll('input, select, textarea'), function (f) { return f.value; });
    var vals = comp.renderVals();
    var frag = document.createDocumentFragment();
    kids(tpl, vals, frag);
    app.innerHTML = '';
    app.appendChild(frag);
    var fields = app.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length && i < saved.length; i++) if (saved[i]) fields[i].value = saved[i];
    enhance();
    if (!mounted) { mounted = true; if (comp.componentDidMount) comp.componentDidMount(); }
  }

  function enhance() {
    var nav = app.querySelector('nav');
    if (!nav || app.querySelector('.aicl-menu-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'aicl-menu-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>Menu';
    btn.addEventListener('click', function () {
      var open = document.body.classList.toggle('aicl-menu-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.parentNode.appendChild(btn);
  }

  function demoBar() {
    var bar = document.createElement('div');
    bar.id = 'aicl-demobar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;padding:6px 12px;background:#0b0a2d;color:#dedede;font:500 12px Roboto,Arial,sans-serif';
    var label = document.createElement('span');
    label.textContent = 'AICL website prototype';
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'true');
    b.style.cssText = 'padding:4px 10px;border-radius:12px;border:1px dashed #9a6b00;background:#fff7d6;color:#4d3500;font:600 12px Roboto,Arial,sans-serif;cursor:pointer';
    b.textContent = 'Pipeline notes: on';
    b.addEventListener('click', function () {
      notesOn = !notesOn; comp.props.showNotes = notesOn;
      b.textContent = 'Pipeline notes: ' + (notesOn ? 'on' : 'off'); b.setAttribute('aria-pressed', String(notesOn));
      render();
    });
    bar.appendChild(label); bar.appendChild(b);
    if (window.AICL_HUB) {
      var h = document.createElement('a');
      h.href = window.AICL_HUB; h.textContent = 'All pages';
      h.style.cssText = 'padding:4px 10px;border-radius:12px;background:#ffffff;color:#0b0a2d;font:600 12px Roboto,Arial,sans-serif;text-decoration:none';
      bar.appendChild(h);
    }
    document.body.insertBefore(bar, document.body.firstChild);
  }

  window.DCStart = function (Component) {
    tpl = document.getElementById('dc');
    var helm = tpl.content.querySelector('helmet');
    if (helm) while (helm.firstChild) document.head.appendChild(helm.firstChild);
    var props = {};
    try {
      var decl = JSON.parse(document.getElementById('dc-props').textContent);
      for (var k in decl) if (k.charAt(0) !== '$' && 'default' in decl[k]) props[k] = decl[k]['default'];
    } catch (err) {}
    app = document.createElement('div');
    app.id = 'app';
    tpl.parentNode.insertBefore(app, tpl);
    comp = new Component(props);
    render();
    demoBar();
  };
})();
