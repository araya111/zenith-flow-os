/* ==========================================================================
   scratchpad.js — Mind Garden Scratchpad for Zenith Flow OS v2
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'zfo_scratchpad_v2';
  const AUTOSAVE_DELAY = 800;

  let previewMode = false;
  let saveTimeout = null;

  const editor        = document.getElementById('scratchpad-editor');
  const preview       = document.getElementById('scratchpad-preview');
  const wordCount     = document.getElementById('scratchpad-word-count');
  const charCount     = document.getElementById('scratchpad-char-count');
  const previewToggle = document.getElementById('scratchpad-preview-toggle');
  const exportBtn     = document.getElementById('scratchpad-export-btn');
  const clearBtn      = document.getElementById('scratchpad-clear-btn');
  const autosaveBadge = document.getElementById('scratchpad-autosave-badge');

  // ── Load ────────────────────────────────────────────────────────────────────
  function load() {
    const saved = localStorage.getItem(STORAGE_KEY) || '';
    if (editor) editor.value = saved;
    updateCounts();
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  function scheduleSave() {
    clearTimeout(saveTimeout);
    if (autosaveBadge) { autosaveBadge.textContent = 'Saving...'; autosaveBadge.style.color = 'var(--accent-2)'; }
    saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, editor ? editor.value : '');
      if (autosaveBadge) { autosaveBadge.textContent = '✓ Saved'; autosaveBadge.style.color = ''; }
    }, AUTOSAVE_DELAY);
  }

  // ── Counts ─────────────────────────────────────────────────────────────────
  function updateCounts() {
    if (!editor) return;
    const text  = editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (wordCount) wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    if (charCount) charCount.textContent = `${text.length} chars`;
  }

  // ── Markdown Renderer (no external deps) ────────────────────────────────────
  function renderMarkdown(md) {
    let html = md
      // Escape
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>')
      .replace(/_(.+?)_/g,           '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // Checkboxes
      .replace(/^- \[x\] (.+)$/gmi, '<div class="preview-check checked">☑ $1</div>')
      .replace(/^- \[ \] (.+)$/gm,  '<div class="preview-check">☐ $1</div>')
      // Unordered list items
      .replace(/^[*\-] (.+)$/gm,    '<li>$1</li>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr style="border-color:var(--border-dim);margin:0.5rem 0">')
      // Line breaks (double newline = paragraph break)
      .split('\n\n').map(p => {
        if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<blockquote') || p.startsWith('<div')) return p;
        return `<p style="margin-bottom:0.35rem">${p.replace(/\n/g,'<br>')}</p>`;
      }).join('');

    return html;
  }

  // ── Preview toggle ──────────────────────────────────────────────────────────
  function togglePreview() {
    previewMode = !previewMode;

    if (previewMode) {
      if (preview) {
        preview.innerHTML = renderMarkdown(editor ? editor.value : '');
        preview.classList.remove('hidden');
      }
      if (editor) editor.classList.add('hidden');
      if (previewToggle) previewToggle.textContent = '✏️ Edit';
    } else {
      if (preview) preview.classList.add('hidden');
      if (editor)  editor.classList.remove('hidden');
      if (previewToggle) previewToggle.textContent = 'Preview';
    }
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  function exportMarkdown() {
    const content  = editor ? editor.value : '';
    const blob     = new Blob([content], { type: 'text/markdown' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `mind-garden-${new Date().toLocaleDateString('en-CA')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.Zenith) window.Zenith.showToast('📄 Exported to .md file!', '🌿');
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (editor) {
    editor.addEventListener('input', () => {
      updateCounts();
      scheduleSave();
    });
    editor.addEventListener('keydown', e => {
      // Tab key → insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end   = editor.selectionEnd;
        editor.value = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
    });
  }

  if (previewToggle) previewToggle.addEventListener('click', togglePreview);
  if (exportBtn)     exportBtn.addEventListener('click', exportMarkdown);
  if (clearBtn)      clearBtn.addEventListener('click', () => {
    if (editor) editor.value = '';
    updateCounts();
    scheduleSave();
    if (previewMode) togglePreview();
  });

  // ── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', load);

})();
