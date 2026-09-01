import os

for root, dirs, files in os.walk("."):
    level = root.count(os.sep)
    indent = " " * 4 * level
    print(f"{indent}{os.path.basename(root)}/")
    for f in files:
        print(f"{indent}{' ' * 4}{f}")
