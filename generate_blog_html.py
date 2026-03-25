#!/usr/bin/env python3
"""
Generate deployable HTML files from markdown blog content
Creates a complete static blog system ready for production
"""

import os
import json
from datetime import datetime
import re

BASE_DIR = "/sessions/festive-keen-mayer/mnt/QUICKBEE"
OUTPUT_DIR = f"{BASE_DIR}/public/blogs"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="website">
    <meta name="theme-color" content="#667eea">
    <link rel="canonical" href="https://quickbee.store{canonical}">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }}

        header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}

        header h1 {{
            font-size: 2em;
            margin-bottom: 10px;
        }}

        nav {{
            background: white;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            position: sticky;
            top: 0;
            z-index: 100;
        }}

        nav a {{
            color: #667eea;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
        }}

        nav a:hover {{
            color: #764ba2;
        }}

        .container {{
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
            min-height: calc(100vh - 200px);
        }}

        .container h1 {{
            color: #667eea;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}

        .container h2 {{
            color: #764ba2;
            margin-top: 30px;
            margin-bottom: 15px;
        }}

        .container h3 {{
            color: #666;
            margin-top: 20px;
            margin-bottom: 10px;
        }}

        .meta {{
            color: #999;
            font-size: 0.9em;
            margin-bottom: 20px;
        }}

        .content {{
            line-height: 1.8;
        }}

        .content p {{
            margin-bottom: 15px;
        }}

        .content ul, .content ol {{
            margin-left: 20px;
            margin-bottom: 15px;
        }}

        .content li {{
            margin-bottom: 8px;
        }}

        .content a {{
            color: #667eea;
            text-decoration: none;
        }}

        .content a:hover {{
            text-decoration: underline;
        }}

        .cta {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            text-align: center;
        }}

        .cta a {{
            color: white;
            text-decoration: none;
            font-weight: bold;
        }}

        .category-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }}

        .category-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }}

        .category-card:hover {{
            transform: translateY(-5px);
        }}

        .category-card h3 {{
            color: #667eea;
            margin-top: 0;
        }}

        .category-card a {{
            color: #667eea;
            font-weight: bold;
        }}

        footer {{
            background: #333;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
        }}

        code {{
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}

        pre {{
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }}

        pre code {{
            background: none;
            padding: 0;
        }}

        blockquote {{
            border-left: 4px solid #667eea;
            padding-left: 20px;
            margin: 20px 0;
            color: #666;
        }}

        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }}

        table th, table td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}

        table th {{
            background: #667eea;
            color: white;
        }}

        @media (max-width: 768px) {{
            header h1 {{ font-size: 1.5em; }}
            nav a {{ margin: 0 8px; font-size: 0.9em; }}
            .container {{ padding: 20px 15px; }}
        }}
    </style>
</head>
<body>
    <header>
        <h1>🐝 QuickBee Blog</h1>
        <p>Expert Guides, Reviews & Tips</p>
    </header>

    <nav>
        <a href="/blogs">Home</a>
        <a href="/blogs/brownies">Brownies</a>
        <a href="/blogs/bubble-tea">Bubble Tea</a>
        <a href="/blogs/baby-care">Baby Care</a>
        <a href="/blogs/pet-care">Pet Care</a>
        <a href="/blogs/delivery-tips">Delivery Tips</a>
        <a href="/blogs/food-reviews">Food</a>
        <a href="/blogs/neighborhoods">Areas</a>
    </nav>

    <div class="container">
        {content}
    </div>

    <footer>
        <p>&copy; 2026 QuickBee. All rights reserved. | 🐝 Making shopping easy</p>
    </footer>

    <script>
        // Simple analytics tracking
        console.log('QuickBee Blog - ' + document.title);
    </script>
</body>
</html>
"""

def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown"""
    if not content.startswith('---'):
        return {}, content

    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_str = match.group(1)
    body = content[len(match.group(0)):]

    # Simple YAML parser
    data = {}
    for line in frontmatter_str.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            data[key] = value

    return data, body

def markdown_to_html(markdown_text):
    """Convert markdown to basic HTML"""
    html = markdown_text

    # Headers
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold and italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)

    # Paragraphs
    html = re.sub(r'\n\n+', '</p><p>', html)
    html = '<p>' + html + '</p>'

    # Lists
    html = re.sub(r'^- (.*?)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*?</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)

    # Code blocks
    html = re.sub(r'```(.*?)```', r'<pre><code>\1</code></pre>', html, flags=re.DOTALL)

    return html

def create_blog_index():
    """Create main blog index page"""
    content = """
    <h1>🐝 QuickBee Blog</h1>
    <p style="font-size: 1.1em;">Expert guides, honest reviews, and practical tips for all your QuickBee needs.</p>

    <div class="category-grid">
        <div class="category-card">
            <h3>🍫 Brownies</h3>
            <p>Recipes, guides, reviews, and storage tips for delicious brownies.</p>
            <a href="/blogs/brownies">Browse Brownies →</a>
        </div>

        <div class="category-card">
            <h3>🧋 Bubble Tea</h3>
            <p>Everything about bubble tea - flavors, recipes, health info, and trends.</p>
            <a href="/blogs/bubble-tea">Explore Bubble Tea →</a>
        </div>

        <div class="category-card">
            <h3>👶 Baby Care</h3>
            <p>Essential resources and guides for new parents on a budget.</p>
            <a href="/blogs/baby-care">Baby Care Guide →</a>
        </div>

        <div class="category-card">
            <h3>🐾 Pet Care</h3>
            <p>Complete guides for dogs, cats, and small pets.</p>
            <a href="/blogs/pet-care">Pet Care Guide →</a>
        </div>

        <div class="category-card">
            <h3>🚀 Delivery Tips</h3>
            <p>Optimize your QuickBee experience with expert tips.</p>
            <a href="/blogs/delivery-tips">Delivery Tips →</a>
        </div>

        <div class="category-card">
            <h3>⭐ Food Reviews</h3>
            <p>Honest reviews and recommendations for food on QuickBee.</p>
            <a href="/blogs/food-reviews">Food Reviews →</a>
        </div>
    </div>

    <h2>Latest Articles</h2>
    <p>Browse our complete library of 100+ articles below:</p>

    <div class="category-grid">
        <div class="category-card">
            <h3>All Articles</h3>
            <p>Access all 100+ blog articles organized by category.</p>
            <a href="/blogs/all">View All Articles →</a>
        </div>

        <div class="category-card">
            <h3>Neighborhood Guides</h3>
            <p>Area-specific shopping guides for Kathmandu, Lalitpur & Bhaktapur.</p>
            <a href="/blogs/neighborhoods">Browse Areas →</a>
        </div>
    </div>

    <div class="cta">
        <h3>Ready to get the best deals?</h3>
        <p><a href="/">Download QuickBee App</a> and start ordering now!</p>
    </div>
    """

    html = HTML_TEMPLATE.format(
        title="QuickBee Blog - Guides, Reviews & Tips",
        description="Expert guides, honest reviews, and practical tips for QuickBee services",
        keywords="guides, reviews, tips, brownies, bubble tea, baby care, pets, delivery",
        canonical="/blogs",
        content=content
    )

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(f"{OUTPUT_DIR}/index.html", 'w') as f:
        f.write(html)

    print(f"✅ Created: /blogs/index.html")

def process_markdown_files():
    """Process all markdown files and generate HTML"""
    blog_dir = f"{BASE_DIR}/content/blog"

    if not os.path.exists(blog_dir):
        print("❌ Blog directory not found!")
        return

    count = 0
    for root, dirs, files in os.walk(blog_dir):
        for file in files:
            if file.endswith('.md') and file != 'index.md':
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(root, blog_dir)

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    frontmatter, body = extract_frontmatter(content)

                    title = frontmatter.get('title', file.replace('.md', '').replace('-', ' ').title())
                    description = frontmatter.get('description', '')
                    keywords = frontmatter.get('keywords', '')
                    slug = frontmatter.get('slug', file.replace('.md', ''))
                    canonical = frontmatter.get('canonical', f"/blogs/{slug}")

                    # Convert markdown body to HTML
                    html_content = markdown_to_html(body)

                    # Create output directory
                    if relative_path == '.':
                        output_file = f"{OUTPUT_DIR}/{slug}/index.html"
                    else:
                        output_dir = f"{OUTPUT_DIR}/{relative_path}"
                        os.makedirs(output_dir, exist_ok=True)
                        output_file = f"{output_dir}/{slug if file != 'index.md' else 'index'}.html"

                    os.makedirs(os.path.dirname(output_file), exist_ok=True)

                    html = HTML_TEMPLATE.format(
                        title=title,
                        description=description[:160],  # Meta description limit
                        keywords=keywords,
                        canonical=canonical,
                        content=f'<div class="content">{html_content}</div>'
                    )

                    with open(output_file, 'w') as f:
                        f.write(html)

                    count += 1
                    if count % 10 == 0:
                        print(f"  ✓ Processed {count} files...")

                except Exception as e:
                    print(f"  ⚠️ Error processing {filepath}: {e}")

    print(f"✅ Processed {count} markdown files to HTML")

def create_deployment_package():
    """Create a deployment-ready package"""
    print("\n📦 Creating deployment package...")

    # Create .htaccess for Apache
    htaccess = """<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /blogs/
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>

<IfModule mod_gzip.c>
    mod_gzip_on Yes
    mod_gzip_dechunk Yes
    mod_gzip_item_include file \.(html?|txt|css|js|json)$
    mod_gzip_item_include mime ^application/json$
    mod_gzip_item_exclude rspheader ^Content-Encoding:.*gzip
    mod_gzip_item_exclude rspheader ^Transfer-Encoding:.*chunked
</IfModule>
"""

    with open(f"{OUTPUT_DIR}/.htaccess", 'w') as f:
        f.write(htaccess)

    print("✅ Created: .htaccess (Apache routing)")

if __name__ == "__main__":
    try:
        print("🚀 Generating Deployable HTML Blog...\n")
        print("📝 Creating blog index...")
        create_blog_index()

        print("📄 Processing markdown files...")
        process_markdown_files()

        print("📦 Creating deployment config...")
        create_deployment_package()

        print(f"\n✅ SUCCESS! Blog files generated in: {OUTPUT_DIR}")
        print(f"\n📋 Next steps:")
        print(f"   1. Upload /public/blogs/ to your web server")
        print(f"   2. Configure routing (use .htaccess or nginx config)")
        print(f"   3. Test at: https://quickbee.store/blogs")
        print(f"   4. Submit sitemap to Google Search Console")
        print(f"\n🎉 Your blog is ready for production!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
