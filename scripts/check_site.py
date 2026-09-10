"""Check built HTML for missing local links/assets and obsolete canonical URLs."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'public').resolve()
errors = set()
origin = 'https://thinkmo.github.io/'


class Page(HTMLParser):
    def __init__(self, relative):
        super().__init__()
        self.relative = relative

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            if not attrs.get('href', '').startswith(origin):
                errors.add(f'{self.relative}: incorrect canonical URL')
        for key in ('href', 'src'):
            value = attrs.get(key, '')
            if not value or value.startswith('#'):
                continue
            url = urlsplit(urljoin(origin + self.relative, value))
            if url.scheme not in ('http', 'https') or url.netloc != 'thinkmo.github.io':
                continue
            target = root / unquote(url.path).lstrip('/')
            if not target.is_file() and not (target / 'index.html').is_file():
                errors.add(f'{self.relative}: missing {value}')


for required in ('index.html', '404.html', 'index.xml', 'sitemap.xml', 'robots.txt'):
    if not (root / required).is_file():
        errors.add(f'Missing required output: {required}')
legacy_paths = Path(__file__).with_name('legacy-paths.txt').read_text(encoding='utf-8').splitlines()
for relative in legacy_paths:
    if not (root / relative).is_file():
        errors.add(f'Missing legacy article URL: {relative}')
pages = list(root.rglob('*.html'))
for path in pages:
    Page(path.relative_to(root).as_posix()).feed(path.read_text(encoding='utf-8'))
if errors:
    sys.exit('\n'.join(sorted(errors)))
print(f'Validated {len(pages)} HTML files and {len(legacy_paths)} legacy article URLs: OK.')
