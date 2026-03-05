import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    style_start = content.find('<style>')
    if style_start == -1: return

    style_end = content.find('</style>')
    if style_end == -1: return

    new_content = content[:style_start] + '{{< media-style >}}\n' + content[style_end + 8:]

    with open(filepath, 'w') as f:
        f.write(new_content)

process_file('content/mine/books.md')
process_file('content/mine/movies.md')

