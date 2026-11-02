"""Package the already-built static game with p2game.json at the archive root."""
import json
from pathlib import Path
import subprocess
import sys
import zipfile

project = Path(__file__).resolve().parent.parent
build = project / 'dist'
subprocess.run(['node', 'scripts/validate-p2game.cjs'], cwd=project, check=True)
manifest = json.loads((build / 'p2game.json').read_text())
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else project / 'plans' / 'releases' / f"{manifest['id']}-{manifest['version']}.zip"
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in sorted(build.rglob('*')):
        if file.is_symlink():
            raise ValueError(f'Symlinks cannot be packaged: {file}')
        if file.is_file():
            archive.write(file, file.relative_to(build).as_posix())
with zipfile.ZipFile(output) as archive:
    assert 'index.html' in archive.namelist() and 'p2game.json' in archive.namelist()
    assert archive.testzip() is None
print(output)
