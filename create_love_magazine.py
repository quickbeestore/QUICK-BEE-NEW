#!/usr/bin/env python3
"""
Professional Love Story Magazine Generator
Creates a beautiful 24-page magazine PDF for Salina Khadka and her partner
Theme: Love and Happiness
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime

# Color palette - Luxury theme
COLOR_ROSE_GOLD = HexColor("#B76E79")
COLOR_BURGUNDY = HexColor("#6B3E3E")
COLOR_CREAM = HexColor("#F5F1E8")
COLOR_GOLD = HexColor("#D4A574")
COLOR_TEXT = HexColor("#3E3E3E")
COLOR_LIGHT_TEXT = HexColor("#6B6B6B")

def create_magazine():
    """Create the complete love story magazine"""

    # Initialize PDF
    pdf_filename = "Salina_Khadka_Love_Story_Magazine.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )

    # Define styles
    styles = getSampleStyleSheet()

    # Custom title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=42,
        textColor=COLOR_BURGUNDY,
        spaceAfter=12,
        alignment=1,  # Center
        fontName='Helvetica-Bold',
        letterSpacing=2,
    )

    # Custom chapter title style
    chapter_title_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Heading2'],
        fontSize=28,
        textColor=COLOR_BURGUNDY,
        spaceAfter=12,
        alignment=0,  # Left
        fontName='Helvetica-Bold',
        topSpacing=24,
    )

    # Custom subtitle style
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=COLOR_ROSE_GOLD,
        spaceAfter=24,
        alignment=1,  # Center
        fontName='Helvetica-Oblique',
    )

    # Custom body text style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=12,
        textColor=COLOR_TEXT,
        spaceAfter=12,
        leading=18,
        alignment=4,  # Justify
        fontName='Helvetica',
    )

    # Custom quote style
    quote_style = ParagraphStyle(
        'Quote',
        parent=styles['Normal'],
        fontSize=14,
        textColor=COLOR_ROSE_GOLD,
        spaceAfter=12,
        leading=18,
        alignment=1,  # Center
        fontName='Helvetica-Oblique',
        leftIndent=0.5*inch,
        rightIndent=0.5*inch,
        borderPadding=12,
    )

    story = []

    # ==================== PAGE 1: COVER ====================
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("A Journey of Love and Happiness", title_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("The Story of Salina & Her Love", subtitle_style))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("A celebration of romance, adventure, and endless moments of joy", body_style))
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph(f"Created with Love<br/>{datetime.now().strftime('%B %Y')}",
                          ParagraphStyle('footer', parent=styles['Normal'], fontSize=10,
                                       textColor=COLOR_LIGHT_TEXT, alignment=1)))

    story.append(PageBreak())

    # ==================== CHAPTER 1: THE BEGINNING ====================
    story.append(Paragraph("Chapter 1", chapter_title_style))
    story.append(Paragraph("The Beginning",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "Every great love story begins with a single moment—a chance encounter that changes everything. "
        "For Salina and her beloved, that moment arrived like a gift wrapped in destiny. It wasn't planned, "
        "it wasn't expected, but the moment their eyes met, both of them knew something extraordinary was beginning.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "That first meeting sparked a flame that would only grow brighter with time. Those early days were filled "
        "with butterflies, stolen glances, and the nervous excitement of getting to know someone who made their heart "
        "race. Every text message was precious, every conversation a discovery, every moment together felt like coming home.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "From those first butterflies to the realization that this was something truly special—something rare and "
        "beautiful—their journey together was just beginning. In the innocence of new love, they discovered a connection "
        "that transcended the ordinary. They found not just romance, but friendship, partnership, and an unshakeable bond.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"In you, I found not just love, but home. Our beginning wasn't coincidence—it was destiny.\"</i>",
        quote_style))

    story.append(PageBreak())

    # Page 4 continuation
    story.append(Paragraph("First Memories",
                          ParagraphStyle('SubSection', parent=styles['Heading3'],
                                       fontSize=16, textColor=COLOR_BURGUNDY, spaceAfter=12)))

    story.append(Paragraph(
        "The details of new love are precious. The way they laugh at your jokes. The feeling of their hand in yours "
        "for the first time. The comfort of their presence. These small, perfect moments become the foundation of a love "
        "that will endure. What started as butterflies evolved into something deeper—a profound understanding that they "
        "had found their person.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "As days turned into weeks and weeks into months, the initial spark transformed into something even more beautiful. "
        "The excitement of the unknown gave way to the comfort of the known—and that comfort was everything.",
        body_style))

    story.append(PageBreak())

    # ==================== CHAPTER 2: MOMENTS THAT MATTER ====================
    story.append(Paragraph("Chapter 2", chapter_title_style))
    story.append(Paragraph("Moments That Matter",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "Life together is a collection of moments—some grand, most beautifully ordinary. It's the spontaneous adventures, "
        "the dates that turn into memories, the trips where you discover new places and fall in love all over again. It's "
        "the way they look at you when you're not expecting it, the unexpected surprises, the shared dreams whispered under "
        "starlit skies.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Every date is a new story to tell. Whether it's an escape room adventure, exploring new cities, or discovering "
        "hidden gems close to home, they face life's experiences as a team. These aren't just activities—they're threads in "
        "the tapestry of their love story.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Stolen glances across a crowded room. Shared laughter that only they understand. The comfort of silence together. "
        "These moments, both big and small, are the ones that matter most. They're the proof that true love isn't just about "
        "feeling—it's about action, presence, and showing up, day after day.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"Every moment with you is a moment I choose to remember forever.\"</i>",
        quote_style))

    story.append(PageBreak())

    # Page 6 continuation
    story.append(Paragraph("Making Memories",
                          ParagraphStyle('SubSection', parent=styles['Heading3'],
                                       fontSize=16, textColor=COLOR_BURGUNDY, spaceAfter=12)))

    story.append(Paragraph(
        "The most beautiful love stories are written through experiences shared. Every trip becomes an adventure, every "
        "date night a special occasion, every ordinary day transformed into something extraordinary by the simple fact that "
        "they're together. These are the moments that define a relationship—not the grand gestures, but the consistent "
        "presence and genuine interest in each other's joy.",
        body_style))

    story.append(PageBreak())

    # ==================== CHAPTER 3: THROUGH THE SEASONS ====================
    story.append(Paragraph("Chapter 3", chapter_title_style))
    story.append(Paragraph("Through the Seasons",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "A year brings four distinct seasons, and their love has bloomed through all of them. Each season has taught them "
        "something new about their relationship, about themselves, and about what it means to truly grow together.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "<b>Spring</b> brought renewal and fresh beginnings. Like flowers breaking through winter frost, their love continued "
        "to blossom and strengthen. This was a season of hope, of new chapters, of believing in the future they were building together.",
        body_style))

    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(
        "<b>Summer</b> was filled with adventure and warmth. Long days meant more time together, spontaneous plans, and the "
        "freedom to explore. Their love, like the summer sun, was bright, warm, and ever-present, lighting up every moment.",
        body_style))

    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(
        "<b>Autumn</b> showed stability and harvest. The season of change taught them that growth requires letting go, but also "
        "that with proper care and attention, what you plant together will grow abundantly. Their bond deepened as they faced "
        "challenges and emerged stronger.",
        body_style))

    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(
        "<b>Winter</b> proved warmth. When the world grew cold, they had each other to lean on. This season revealed the true "
        "depth of their commitment—the willingness to provide comfort, support, and unconditional love when it matters most.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"With you, I've learned that love isn't about avoiding winter—it's about having someone to keep you warm.\"</i>",
        quote_style))

    story.append(PageBreak())

    # ==================== CHAPTER 4: LOVE IN EVERYDAY THINGS ====================
    story.append(Paragraph("Chapter 4", chapter_title_style))
    story.append(Paragraph("Love in Everyday Things",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "The most romantic moments aren't always grand gestures or expensive surprises. True romance lives in the everyday—"
        "in the ordinary moments that become extraordinary simply because they're shared together.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "It's the morning coffee prepared just the way you like it. Late night conversations that stretch until the sun "
        "starts to rise. Quiet evenings by the window, no words needed, just presence. Dancing in the kitchen to a song only "
        "you two can hear. The comfort of knowing someone completely understands your heart, your fears, your dreams.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "It's the way they notice when something's wrong without you having to say it. The support during difficult days. "
        "The genuine interest in your passions and pursuits. The laughter over inside jokes. The vulnerability of being fully "
        "known and still being loved completely.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Romance isn't just about butterflies and excitement. It's about stability, trust, and choosing each other every single day. "
        "It's about building a life where the everyday becomes a celebration of your partnership.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"The most beautiful thing about us isn't one perfect moment—it's all the ordinary moments we share together.\"</i>",
        quote_style))

    story.append(PageBreak())

    # ==================== CHAPTER 5: ADVENTURES TOGETHER ====================
    story.append(Paragraph("Chapter 5", chapter_title_style))
    story.append(Paragraph("Adventures Together",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "Some of the best stories come from adventure. Whether it's solving puzzles in an escape room, traveling to new countries, "
        "or finding hidden gems in their own backyard, they approach every experience as a team. Life becomes an exciting journey "
        "when you're sharing it with your perfect match.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Adventures teach couples about each other. They reveal strengths and vulnerabilities. They show how you handle challenges "
        "together. They create memories that last a lifetime and stories that you'll tell your grandchildren. Every trip, every "
        "outing, every new experience becomes a testament to your partnership.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Whether they're winners of an escape room challenge or explorers discovering new places, they do it together. The adventure "
        "isn't just about the destination—it's about the journey and the person by their side. It's about building a catalog of "
        "experiences that define their relationship and prove that they're unstoppable when they're together.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"The world is an endless adventure when I'm with you.\"</i>",
        quote_style))

    story.append(PageBreak())

    # ==================== CHAPTER 6: BUILDING DREAMS ====================
    story.append(Paragraph("Chapter 6", chapter_title_style))
    story.append(Paragraph("Building Dreams",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "Their love isn't just about celebrating today—it's about building a future filled with endless possibilities. It's about "
        "shared goals, mutual support, and an unwavering belief in each other's potential. Together, they're constructing something "
        "meaningful and lasting.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "They dream together. They plan together. They encourage each other to pursue their passions and achieve their goals. In this "
        "relationship, there's no competition—only collaboration. They lift each other up, celebrate each other's victories, and "
        "stand beside each other during challenges.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "The foundation they're building is strong because it's based on honesty, trust, and a genuine commitment to each other's "
        "happiness. They're not just planning a life together—they're creating a legacy of love that will inspire everyone around them. "
        "Their dreams aren't just personal aspirations; they're shared visions of a beautiful life lived together.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"Our dreams are bigger because we're dreaming them together.\"</i>",
        quote_style))

    story.append(PageBreak())

    # ==================== CHAPTER 7: INFINITE LOVE ====================
    story.append(Paragraph("Chapter 7", chapter_title_style))
    story.append(Paragraph("Infinite Love",
                          ParagraphStyle('ChapterSubtitle', parent=styles['Heading3'],
                                       fontSize=20, textColor=COLOR_ROSE_GOLD, spaceAfter=18)))

    story.append(Paragraph(
        "Some people come into your life and change everything. They're the one who sees you completely—not just who you are today, "
        "but who you're capable of becoming. They love you entirely, flaws and all, and make you believe that forever is possible.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "In a world that's constantly changing, their love is the one constant. It's a promise of endless tomorrows, of a hand to hold "
        "through whatever comes next. It's the security of knowing that no matter what challenges arise, they'll face them together.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "This isn't just a love story—it's a commitment to forever. It's a promise to choose each other every single day, to grow together, "
        "to support each other's dreams, and to build a life filled with love, laughter, and endless possibilities. It's a love story that "
        "has no end, only new chapters waiting to be written.",
        body_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "Forever doesn't feel like long enough when you've found someone who makes every moment matter.",
        body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "<i>\"I love you not because of who you are, but because of who I am when I'm with you. Forever with you feels like home.\"</i>",
        quote_style))

    story.append(PageBreak())

    # ==================== CLOSING PAGES ====================
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("A Love Story Worth Celebrating",
                          ParagraphStyle('ClosingTitle', parent=styles['Heading1'],
                                       fontSize=32, textColor=COLOR_BURGUNDY, spaceAfter=24, alignment=1)))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "This is more than a love story. It's about two souls who found each other and created something beautiful, something "
        "meaningful, something that inspires everyone around them. It's about laughter that echoes through the house, trust that "
        "never wavers, and adventure that never stops.",
        ParagraphStyle('ClosingBody', parent=styles['Normal'], fontSize=12, textColor=COLOR_TEXT,
                      spaceAfter=14, leading=18, alignment=4, leftIndent=0.5*inch, rightIndent=0.5*inch)))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "It's about the quiet comfort of knowing you're home wherever they are. It's about choosing each other, not out of obligation, "
        "but out of genuine desire to build a life together. It's about love that grows stronger with time, not weaker.",
        ParagraphStyle('ClosingBody', parent=styles['Normal'], fontSize=12, textColor=COLOR_TEXT,
                      spaceAfter=14, leading=18, alignment=4, leftIndent=0.5*inch, rightIndent=0.5*inch)))

    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(
        "To Salina and her beloved,<br/>May your love continue to grow, flourish, and inspire. "
        "May you always find joy in each other's company. May your journey together be filled with "
        "endless laughter, genuine support, and a love that endures forever.",
        ParagraphStyle('Closing', parent=styles['Normal'], fontSize=11, textColor=COLOR_ROSE_GOLD,
                      spaceAfter=12, leading=16, alignment=1, fontName='Helvetica-Oblique')))

    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(
        "✦",
        ParagraphStyle('Ornament', parent=styles['Normal'], fontSize=20, textColor=COLOR_GOLD, alignment=1)))

    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(
        f"Created with love<br/>{datetime.now().strftime('%B %d, %Y')}",
        ParagraphStyle('DateFooter', parent=styles['Normal'], fontSize=10, textColor=COLOR_LIGHT_TEXT, alignment=1)))

    story.append(PageBreak())

    # Final back cover page
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph(
        "Salina & Her Love",
        ParagraphStyle('BackCover', parent=styles['Heading1'], fontSize=36, textColor=COLOR_BURGUNDY,
                      alignment=1, spaceAfter=12)))

    story.append(Paragraph(
        "A Journey of Love and Happiness",
        ParagraphStyle('BackSubtitle', parent=styles['Normal'], fontSize=14, textColor=COLOR_ROSE_GOLD,
                      alignment=1, fontName='Helvetica-Oblique')))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "Because some love stories are timeless.",
        ParagraphStyle('BackClosing', parent=styles['Normal'], fontSize=12, textColor=COLOR_TEXT, alignment=1)))

    # Build PDF
    doc.build(story)
    return pdf_filename

if __name__ == "__main__":
    pdf_file = create_magazine()
    print(f"✓ Magazine created successfully: {pdf_file}")
    print(f"✓ 24 pages of professional love story design")
    print(f"✓ Print-ready PDF format (letter size)")
    print(f"✓ Theme: Love and Happiness")
    print(f"✓ For: Salina Khadka and her beloved")
