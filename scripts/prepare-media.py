"""Create small still previews while preserving original itch.io GIF bytes."""
import json
from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

games = json.loads(Path('src/content/games.json').read_text(encoding='utf-8'))

def prepare(game):
    target = Path('public') / game['gif'].lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        req = Request(game['sourceGif'], headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=45) as response:
            target.write_bytes(response.read())
    with Image.open(target) as im:
        frames = im.n_frames
        im.seek(0)
        im.convert('RGB').save(Path('public') / game['poster'].lstrip('/'), quality=82, method=6)
    return {'id': game['id'], 'bytes': target.stat().st_size, 'frames': frames}

with ThreadPoolExecutor(max_workers=3) as pool:
    print(json.dumps(list(pool.map(prepare, games)), indent=2))
