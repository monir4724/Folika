#!/usr/bin/env python3
"""Sanitize HTML UTF-8 and inject page-copy.js + i18n.js where missing."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / 'pages'
COPY_TAG = '<script src="../js/page-copy.js"></script>'
I18N_TAG = '<script src="../js/i18n.js"></script>'


def sanitize(path: Path) -> None:
    raw = path.read_bytes()
    text = raw.decode('utf-8', errors='replace').replace('\ufffd', '')
    path.write_text(text, encoding='utf-8', newline='\n')


def inject_scripts(path: Path) -> None:
    text = path.read_text(encoding='utf-8')
    changed = False
    if COPY_TAG not in text:
        text = text.replace('<script src="../js/nav.js"></script>', COPY_TAG + '\n  <script src="../js/nav.js"></script>')
        if COPY_TAG not in text:
            text = text.replace('<script src="../js/main.js', COPY_TAG + '\n  <script src="../js/main.js', 1)
        changed = True
    if I18N_TAG not in text and 'profile-' in path.name:
        text = text.replace('<script src="../js/profile-utils.js"></script>', I18N_TAG + '\n  <script src="../js/profile-utils.js"></script>')
        changed = True
    if changed:
        path.write_text(text, encoding='utf-8', newline='\n')


def main() -> None:
    for html in sorted(PAGES.glob('*.html')):
        sanitize(html)
        inject_scripts(html)
    index = ROOT / 'index.html'
    if index.exists():
        sanitize(index)
        text = index.read_text(encoding='utf-8')
        if '<script src="js/page-copy.js"></script>' not in text:
            text = text.replace('<script src="js/nav.js"></script>', '<script src="js/page-copy.js"></script>\n  <script src="js/nav.js"></script>')
            index.write_text(text, encoding='utf-8', newline='\n')
    print('Sanitized and injected scripts for', len(list(PAGES.glob('*.html'))), 'pages')


if __name__ == '__main__':
    main()
