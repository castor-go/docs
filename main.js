(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'castor-theme';

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* Storage can be unavailable; the theme still works for this page view. */
    }
  };

  const setTheme = (theme, persist) => {
    root.dataset.theme = theme;
    if (themeMeta) {
      themeMeta.content = theme === 'dark' ? '#2B2420' : '#E8DCCF';
    }
    if (toggle) {
      const dark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (persist) {
      saveTheme(theme);
    }
  };

  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', (event) => {
      if (!getSavedTheme()) {
        setTheme(event.matches ? 'dark' : 'light', false);
      }
    });
  }

  const status = document.getElementById('copy-status');

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) {
      throw new Error('Copy command was unavailable');
    }
  };

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.querySelector(button.dataset.copyTarget);
      if (!target) {
        return;
      }

      const text = target.textContent.trim();
      try {
        await copyText(text);
        button.classList.add('is-copied');
        if (status) {
          status.textContent = 'Copied to clipboard.';
        }
        window.setTimeout(() => button.classList.remove('is-copied'), 1800);
      } catch {
        if (status) {
          status.textContent = 'Copy failed. Select the text and copy it manually.';
        }
      }
    });
  });
})();
