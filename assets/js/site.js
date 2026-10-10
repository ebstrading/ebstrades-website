(function () {
  'use strict';
  var doc = document;

  /* ---- mobile navigation ---- */
  var toggle = doc.getElementById('nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- copy buttons ---- */
  function copyText(text, btn, fallbackEl) {
    var original = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? 'Copied' : 'Select and copy';
      setTimeout(function () { btn.textContent = original; }, 2200);
    }
    function selectFallback() {
      if (fallbackEl) {
        var range = doc.createRange();
        range.selectNodeContents(fallbackEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      done(false);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, selectFallback);
    } else {
      selectFallback();
    }
  }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy'), btn, btn.parentNode.querySelector('[data-copy-source]'));
    });
  });

  /* ---- window film series tabs ---- */
  var vlt = doc.querySelector('[data-vlt-tabs]');
  if (vlt) {
    var tabs = vlt.querySelectorAll('[role="tab"]');
    var panels = vlt.querySelectorAll('[role="tabpanel"]');
    var show = function (id) {
      Array.prototype.forEach.call(tabs, function (t) {
        var on = t.getAttribute('aria-controls') === id;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      Array.prototype.forEach.call(panels, function (p) { p.hidden = p.id !== id; });
    };
    vlt.querySelector('.vlt-tabs').hidden = false;
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { show(t.getAttribute('aria-controls')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        show(next.getAttribute('aria-controls'));
      });
    });
    show(tabs[0].getAttribute('aria-controls'));
  }

  /* ---- enquiry form: builds a message for WhatsApp or email ---- */
  var form = doc.getElementById('enquiry-form');
  if (form) {
    var WA_NUMBER = '971563004171';
    var EMAIL = 'info@ebstrades.com';
    var out = doc.getElementById('enquiry-text');
    var status = doc.getElementById('enquiry-status');
    var waLink = doc.getElementById('send-whatsapp');
    var mailLink = doc.getElementById('send-email');
    var copyBtn = doc.getElementById('copy-enquiry');

    var val = function (id) { var el = doc.getElementById(id); return el ? el.value.trim() : ''; };

    var compose = function () {
      var products = Array.prototype.map.call(
        form.querySelectorAll('input[name="products"]:checked'),
        function (c) { return c.value; }
      );
      var rows = [
        ['Name', val('f-name')],
        ['Company', val('f-company')],
        ['Country', val('f-country')],
        ['Business type', val('f-type')],
        ['Email', val('f-email')],
        ['Phone / WhatsApp', val('f-phone')],
        ['Products', products.join(', ')],
        ['Estimated quantity', val('f-qty')],
        ['Delivery terms', val('f-terms')]
      ];
      var text = 'Wholesale enquiry for EBS Trading LLC\n';
      rows.forEach(function (r) { if (r[1]) text += '\n' + r[0] + ': ' + r[1]; });
      var msg = val('f-message');
      if (msg) text += '\n\nDetails:\n' + msg;
      return text;
    };

    var refresh = function () {
      var text = compose();
      out.textContent = text;
      waLink.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
      var subject = 'Wholesale enquiry' + (val('f-company') ? ' from ' + val('f-company') : '');
      mailLink.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    };

    var required = [
      ['f-name', 'Enter your name.'],
      ['f-country', 'Enter the country you want the goods delivered to.'],
      ['f-email', 'Enter an email address we can reply to.']
    ];
    var validate = function () {
      var first = null;
      required.forEach(function (r) {
        var el = doc.getElementById(r[0]);
        var err = doc.getElementById(r[0] + '-err');
        var bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        err.textContent = bad ? (el.type === 'email' && el.value.trim() ? 'This email address looks incomplete.' : r[1]) : '';
        if (bad && !first) first = el;
      });
      if (first) {
        first.focus();
        status.textContent = 'Fill in the marked fields, then send.';
      }
      return !first;
    };

    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    form.addEventListener('submit', function (e) { e.preventDefault(); if (validate()) waLink.focus(); });
    [waLink, mailLink].forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!validate()) { e.preventDefault(); return; }
        status.textContent = link === waLink
          ? 'WhatsApp should open with your enquiry filled in. Press send there. If nothing opened, copy the enquiry and message +971 56 300 4171.'
          : 'Your email app should open with the enquiry filled in. Press send there. If nothing opened, copy the enquiry and email info@ebstrades.com.';
      });
    });
    copyBtn.addEventListener('click', function () { copyText(compose(), copyBtn, out); });
    try {
      var wanted = new URLSearchParams(window.location.search).get('country');
      if (wanted) doc.getElementById('f-country').value = wanted.slice(0, 60);
    } catch (e) { /* older browsers: leave the field empty */ }
    refresh();
  }
})();
