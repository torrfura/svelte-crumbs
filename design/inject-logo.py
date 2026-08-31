import re, sys, pathlib
svg = pathlib.Path('../static/svelte-crumbs-v2.svg').read_text()
def sized(n):
    return re.sub(r'width="188" height="188"', f'width="{n}" height="{n}"', svg, count=1).replace('\n', '')
for path in sys.argv[1:]:
    p = pathlib.Path(path)
    t = p.read_text()
    for m in set(re.findall(r'@@LOGO(\d+)@@', t)):
        t = t.replace(f'@@LOGO{m}@@', sized(int(m)))
    p.write_text(t)
    print('injected', path)
