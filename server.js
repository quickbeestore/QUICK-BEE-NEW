const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const THEME_DIR = __dirname;

// Honey Bee Theme Colors
const THEME = {
  primary: '#FDB913',      // Bright honey gold
  dark: '#8B4513',         // Saddle brown
  accent: '#000000',       // Black (bee stripes)
  light: '#FFF8DC',        // Cornsilk
  secondary: '#FFD700',    // Gold
  darkSecondary: '#6B4423' // Dark brown
};

const STYLES = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, ${THEME.light} 0%, #fff9e6 100%);
    color: ${THEME.dark};
    line-height: 1.6;
  }

  /* Honeycomb background pattern */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(253, 185, 19, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }

  .header {
    background: linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%);
    padding: 20px 40px;
    border-bottom: 4px solid ${THEME.dark};
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 28px;
    font-weight: 800;
    color: ${THEME.dark};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }

  .nav {
    display: flex;
    gap: 32px;
  }

  .nav a {
    color: ${THEME.dark};
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    position: relative;
  }

  .nav a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 3px;
    background: ${THEME.dark};
    transition: width 0.3s;
  }

  .nav a:hover::after {
    width: 100%;
  }

  .container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
  }

  .hero {
    background: linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darkSecondary} 100%);
    color: white;
    padding: 100px 40px;
    border-radius: 16px;
    text-align: center;
    margin-bottom: 60px;
    position: relative;
    overflow: hidden;
    border: 3px solid ${THEME.primary};
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }

  .hero::before {
    content: '🐝';
    position: absolute;
    font-size: 200px;
    opacity: 0.1;
    top: -40px;
    right: -40px;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  .hero h1 {
    font-size: 56px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .hero p {
    font-size: 20px;
    opacity: 0.95;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }

  .btn {
    display: inline-block;
    padding: 14px 40px;
    background: ${THEME.primary};
    color: ${THEME.dark};
    text-decoration: none;
    border-radius: 8px;
    font-weight: 700;
    transition: all 0.3s;
    border: 2px solid ${THEME.primary};
    cursor: pointer;
    font-size: 14px;
  }

  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(253, 185, 19, 0.4);
    background: white;
  }

  .btn-secondary {
    background: white;
    color: ${THEME.dark};
    border: 2px solid ${THEME.dark};
  }

  .btn-secondary:hover {
    background: ${THEME.primary};
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 40px 0;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 32px 24px;
    border: 2px solid ${THEME.primary};
    text-align: center;
    text-decoration: none;
    color: ${THEME.dark};
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary});
  }

  .card:hover {
    box-shadow: 0 12px 24px rgba(253, 185, 19, 0.3);
    transform: translateY(-8px);
    border-color: ${THEME.dark};
  }

  .card-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: inline-block;
    animation: buzz 2s ease-in-out infinite;
  }

  @keyframes buzz {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.05) rotate(2deg); }
  }

  .card h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: ${THEME.dark};
    font-weight: 700;
  }

  .card p {
    font-size: 14px;
    color: #666;
  }

  h2 {
    font-size: 36px;
    color: ${THEME.dark};
    margin-bottom: 32px;
    text-align: center;
    position: relative;
    display: inline-block;
    width: 100%;
  }

  h2::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary});
    margin: 12px auto 0;
    border-radius: 2px;
  }

  .section {
    background: white;
    padding: 48px;
    border-radius: 12px;
    margin: 40px 0;
    border-left: 6px solid ${THEME.primary};
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .section-title {
    color: ${THEME.dark};
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .section-desc {
    color: #666;
    font-size: 16px;
    margin-bottom: 24px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin: 24px 0;
  }

  .stat-box {
    background: linear-gradient(135deg, ${THEME.light} 0%, #fff9e6 100%);
    padding: 20px;
    border-radius: 8px;
    border: 2px solid ${THEME.primary};
    text-align: center;
  }

  .stat-number {
    font-size: 28px;
    font-weight: 800;
    color: ${THEME.primary};
  }

  .stat-label {
    font-size: 12px;
    color: ${THEME.dark};
    font-weight: 600;
    margin-top: 8px;
  }

  .back {
    margin-bottom: 20px;
  }

  .back a {
    color: ${THEME.primary};
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .back a:hover {
    gap: 12px;
  }

  footer {
    background: ${THEME.dark};
    color: white;
    padding: 48px 20px;
    text-align: center;
    margin-top: 80px;
    border-top: 4px solid ${THEME.primary};
  }

  footer p {
    font-size: 14px;
    opacity: 0.9;
  }

  .badge {
    display: inline-block;
    background: ${THEME.primary};
    color: ${THEME.dark};
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    margin: 8px 4px 0 0;
  }

  .honeycomb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
  }

  .honeycomb-item {
    background: linear-gradient(135deg, ${THEME.light} 0%, white 100%);
    border: 2px solid ${THEME.primary};
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s;
  }

  .honeycomb-item:hover {
    box-shadow: 0 8px 20px rgba(253, 185, 19, 0.3);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    .nav { gap: 16px; }
    .hero { padding: 60px 20px; }
    .hero h1 { font-size: 36px; }
    .section { padding: 24px; }
    h2 { font-size: 24px; }
  }
</style>
`;

// Serve static assets
app.use('/assets', express.static(path.join(THEME_DIR, 'assets')));
app.use('/cdn', express.static(path.join(THEME_DIR, 'assets')));

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QuickBee 🐝 - Your Everything Marketplace</title>
      ${STYLES}
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <a href="/" class="logo">🐝 QuickBee</a>
          <nav class="nav">
            <a href="/">Home</a>
            <a href="/pages/about-us">About</a>
            <a href="/pages/contact-support">Contact</a>
          </nav>
        </div>
      </div>

      <div class="container">
        <div class="hero">
          <h1>Welcome to QuickBee 🐝</h1>
          <p>Your complete marketplace for everything - Busy as a bee, shopping made easy!</p>
          <a href="#categories" class="btn">Start Exploring</a>
        </div>

        <div class="section">
          <h2>📦 Shop by Category</h2>
          <div class="grid">
            <a href="/pages/category-electronics" class="card">
              <div class="card-icon">📱</div>
              <h3>Electronics</h3>
              <p>Gadgets & devices</p>
            </a>
            <a href="/pages/category-fashion" class="card">
              <div class="card-icon">👗</div>
              <h3>Fashion</h3>
              <p>Apparel & style</p>
            </a>
            <a href="/pages/category-home-kitchen" class="card">
              <div class="card-icon">🏠</div>
              <h3>Home & Kitchen</h3>
              <p>Essentials & tools</p>
            </a>
            <a href="/pages/category-beauty" class="card">
              <div class="card-icon">💅</div>
              <h3>Beauty</h3>
              <p>Skincare & more</p>
            </a>
            <a href="/pages/category-sports" class="card">
              <div class="card-icon">⚽</div>
              <h3>Sports & Fitness</h3>
              <p>Get active</p>
            </a>
            <a href="/pages/category-books" class="card">
              <div class="card-icon">📚</div>
              <h3>Books</h3>
              <p>Knowledge awaits</p>
            </a>
            <a href="/pages/category-food" class="card">
              <div class="card-icon">🍕</div>
              <h3>Food & Beverages</h3>
              <p>Fresh & delicious</p>
            </a>
            <a href="/pages/category-toys" class="card">
              <div class="card-icon">🎮</div>
              <h3>Toys & Gaming</h3>
              <p>Fun for all ages</p>
            </a>
          </div>
        </div>

        <div class="section">
          <h2>🛠️ Our Services</h2>
          <div class="grid">
            <a href="/pages/service-delivery" class="card">
              <div class="card-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick & reliable</p>
            </a>
            <a href="/pages/service-installation" class="card">
              <div class="card-icon">🔧</div>
              <h3>Installation</h3>
              <p>Expert setup</p>
            </a>
            <a href="/pages/service-repair" class="card">
              <div class="card-icon">🔨</div>
              <h3>Repair Service</h3>
              <p>Professional care</p>
            </a>
          </div>
        </div>

        <div class="section">
          <h2>💼 Business & Rewards</h2>
          <div class="grid">
            <a href="/pages/wholesale" class="card">
              <div class="card-icon">📊</div>
              <h3>Wholesale</h3>
              <p>Bulk pricing</p>
            </a>
            <a href="/pages/loyalty-program" class="card">
              <div class="card-icon">⭐</div>
              <h3>Loyalty Program</h3>
              <p>Earn rewards</p>
            </a>
            <a href="/pages/referral-program" class="card">
              <div class="card-icon">🤝</div>
              <h3>Refer & Earn</h3>
              <p>Share & get paid</p>
            </a>
            <a href="/pages/gift-cards" class="card">
              <div class="card-icon">🎁</div>
              <h3>Gift Cards</h3>
              <p>Perfect gifts</p>
            </a>
          </div>
        </div>

        <div class="section">
          <h2>🔧 Tools & Features</h2>
          <div class="grid">
            <a href="/pages/product-comparison" class="card">
              <div class="card-icon">⚖️</div>
              <h3>Compare Products</h3>
              <p>Side-by-side</p>
            </a>
            <a href="/pages/mobile-app" class="card">
              <div class="card-icon">📲</div>
              <h3>Mobile App</h3>
              <p>Shop on the go</p>
            </a>
            <a href="/pages/blog-resources" class="card">
              <div class="card-icon">📖</div>
              <h3>Blog & Resources</h3>
              <p>Learn & grow</p>
            </a>
          </div>
        </div>

        <div class="section">
          <h2>ℹ️ About QuickBee</h2>
          <div class="grid">
            <a href="/pages/about-us" class="card">
              <div class="card-icon">🏢</div>
              <h3>Our Story</h3>
              <p>25+ years trusted</p>
            </a>
            <a href="/pages/trust-security" class="card">
              <div class="card-icon">🔒</div>
              <h3>Trust & Security</h3>
              <p>Safe shopping</p>
            </a>
            <a href="/pages/contact-support" class="card">
              <div class="card-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Always here</p>
            </a>
            <a href="/pages/partnerships-affiliates" class="card">
              <div class="card-icon">🤲</div>
              <h3>Partner With Us</h3>
              <p>Work together</p>
            </a>
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; 2026 QuickBee 🐝 - Busy as a bee, shopping made easy!</p>
        <p style="margin-top: 12px; font-size: 12px;">25+ years of trusted service | 50,000+ happy customers | 99.2% on-time delivery</p>
      </footer>
    </body>
    </html>
  `);
});

// Pages route
app.get('/pages/:slug', (req, res) => {
  const slug = req.params.slug;
  const templatePath = path.join(THEME_DIR, 'templates', `page.${slug}.json`);

  if (fs.existsSync(templatePath)) {
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    res.send(renderTemplate(slug, template));
  } else {
    res.status(404).send(renderTemplate('not-found', { sections: {}, order: [] }));
  }
});

function renderTemplate(slug, template) {
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - QuickBee 🐝</title>
      ${STYLES}
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <a href="/" class="logo">🐝 QuickBee</a>
          <nav class="nav">
            <a href="/">Home</a>
            <a href="/pages/about-us">About</a>
            <a href="/pages/contact-support">Contact</a>
          </nav>
        </div>
      </div>

      <div class="container">
        <div class="back">
          <a href="/">← Back to Home</a>
        </div>

        <div class="section" style="border-left: 6px solid ${THEME.dark}; border-top: 4px solid ${THEME.primary};">
          <h1 style="font-size: 42px; color: ${THEME.dark}; margin-bottom: 16px;">${title}</h1>

          ${template.sections && template.order ? template.order.map(sectionId => {
            const section = template.sections[sectionId];
            if (section.settings && section.settings.title) {
              return `
                <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, ${THEME.light} 0%, white 100%); border-radius: 8px; border-left: 4px solid ${THEME.primary};">
                  <h2 style="font-size: 24px; color: ${THEME.dark}; margin-bottom: 12px;">${section.settings.title}</h2>
                  <p style="color: #666; margin-bottom: 16px;">${section.settings.description || 'Quality products and services you can trust.'}</p>
                  ${section.settings.total_reviews ? `<p style="color: ${THEME.primary}; font-weight: 700;">⭐ ${section.settings.average_rating}/5 (${section.settings.total_reviews} reviews, ${section.settings.verified_buyers} verified)</p>` : ''}
                  <a href="#" class="btn" style="margin-top: 16px;">Learn More</a>
                </div>
              `;
            }
            return '';
          }).join('') : '<div class="section"><p>Page content loading...</p></div>'}
        </div>
      </div>

      <footer>
        <p>&copy; 2026 QuickBee 🐝 - Busy as a bee, shopping made easy!</p>
      </footer>
    </body>
    </html>
  `;
}

app.listen(PORT, () => {
  console.log(`🐝 QuickBee Honey Bee Theme running at http://localhost:${PORT}`);
  console.log(`Theme: Gold & Brown with Bee 🐝 motifs`);
});
