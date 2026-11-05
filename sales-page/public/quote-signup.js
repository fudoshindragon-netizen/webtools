/* Daily quote sign-up — posts to /api/subscribe and reports exactly what happened.
   No optimistic "thanks!" unless the server actually accepted the address. */
(function () {
  var forms = document.querySelectorAll('form[data-quote-signup]');
  if (!forms.length) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(form, text, state) {
    var msg = form.querySelector('[data-quote-signup-msg]');
    if (!msg) return;
    msg.textContent = text;
    if (state) {
      msg.setAttribute('data-state', state);
    } else {
      msg.removeAttribute('data-state');
    }
  }

  function busy(form, isBusy) {
    var button = form.querySelector('button[type="submit"]');
    var input = form.querySelector('input[type="email"]');
    if (button) {
      button.disabled = isBusy;
      button.textContent = isBusy ? 'Sending…' : (button.getAttribute('data-label') || 'Sign me up');
    }
    if (input) input.disabled = isBusy;
  }

  Array.prototype.forEach.call(forms, function (form) {
    var button = form.querySelector('button[type="submit"]');
    if (button && !button.getAttribute('data-label')) {
      button.setAttribute('data-label', button.textContent.trim());
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var input = form.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : '';

      if (!EMAIL_RE.test(email)) {
        say(form, "That doesn't look like an email address.", 'error');
        if (input) input.focus();
        return;
      }

      busy(form, true);
      say(form, 'One moment…', '');

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(function (response) {
          return response.json().catch(function () {
            return {};
          }).then(function (body) {
            return { status: response.status, ok: response.ok, body: body };
          });
        })
        .then(function (result) {
          if (result.ok && result.body && result.body.ok) {
            if (input) input.value = '';
            busy(form, true);
            if (button) button.textContent = 'You’re on the list';
            say(form, "You're in. The first quote arrives tomorrow morning.", 'ok');
            return;
          }

          busy(form, false);

          if (result.status === 503 || (result.body && result.body.reason === 'not_configured')) {
            say(form, 'Sign-up opens shortly.', 'error');
            return;
          }
          if (result.status === 400) {
            say(form, "That doesn't look like an email address.", 'error');
            return;
          }
          say(form, "That didn't go through. Try again in a minute.", 'error');
        })
        .catch(function () {
          busy(form, false);
          say(form, "Couldn't reach the server. Try again in a minute.", 'error');
        });
    });
  });
})();
