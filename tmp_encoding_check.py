from pathlib import Path
root = Path('.')
problems = []
for p in root.rglob('*'):
    if p.is_file() and p.suffix in ['.py', '.sol', '.md', '.txt']:
        try:
            p.read_bytes().decode('cp1252')
        except Exception as e:
            print(p, e)
            problems.append(p)
print('done', len(problems))
