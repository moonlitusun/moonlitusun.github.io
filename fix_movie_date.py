import re

with open('layouts/shortcodes/media-loader.html', 'r') as f:
    content = f.read()
    
# Add better fallback for date missing logic
content = content.replace("const dateDisplay = movie.date.split(' ')[0];", "const dateDisplay = (item.date || '').split(' ')[0];")

with open('layouts/shortcodes/media-loader.html', 'w') as f:
    f.write(content)

