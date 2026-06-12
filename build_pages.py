"""Build / refresh all UMPA HTML pages with shared header, footer, and cross-links."""
import html as html_module
import re
from pathlib import Path
from urllib.parse import quote

GALLERY_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"}

root = Path(__file__).resolve().parent
header = (root / "includes" / "header.html").read_text(encoding="utf-8")
header += "\n" + (root / "includes" / "site-settings.html").read_text(encoding="utf-8")
footer = (root / "includes" / "footer.html").read_text(encoding="utf-8")
head_theme = (root / "includes" / "head-theme.html").read_text(encoding="utf-8")
page_links = ""

def page_head(data):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{data["description"]}">
<title>{data["title"]} | UMPA</title>
<link rel="shortcut icon" href="./Assets/images/logo.png" type="img/png" />
{head_theme}
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
"""

tail = """
<script src="js/script.js" defer></script>
</body>
</html>
"""


def _slide_markup(s):
    link = ""
    if s.get("link"):
        link = f'<a href="{s["link"]}" class="media-slide-link">{s.get("link_text", "Learn more →")}</a>'
    category = ""
    if s.get("category"):
        category = f'<span class="media-slide-category">{s["category"]}</span>'
    return f"""
          <article class="media-slide">
            <div class="media-slide-image">
              <img src="{s["img"]}" alt="{s["alt"]}" loading="lazy" />
            </div>
            <div class="media-slide-body">
              {category}
              <h3>{s["title"]}</h3>
              <p>{s["text"]}</p>
              {link}
            </div>
          </article>"""


def _tag_slides(slides, category):
    return [{**s, "category": category} for s in slides]


def media_carousel_html(slides, heading=None, section_class="page-block page-block--alt", inline=False, unified=False):
    """Build image + text carousel markup. Each slide: img, alt, title, text, link (optional)."""
    items = "".join(_slide_markup(s) for s in slides)
    heading_html = f'<h2 class="carousel-section-title">{heading}</h2>' if heading else ""
    unified_class = " media-carousel--unified" if unified else ""
    aria_label = heading or "Program highlights"
    counter_html = ""
    footer_html = '<div class="media-carousel-dots" aria-hidden="true"></div>'
    if unified:
        total = len(slides)
        counter_html = f"""
        <p class="media-carousel-counter" aria-live="polite">
          <span class="media-carousel-counter-current">1</span> / <span class="media-carousel-counter-total">{total}</span>
        </p>"""
        footer_html = f'<div class="media-carousel-footer">{counter_html}<div class="media-carousel-dots" aria-hidden="true"></div></div>'
    carousel_inner = f"""
    {heading_html}
    <div class="media-carousel-section" style="padding: 0; background: transparent;">
      <div class="media-carousel{unified_class}" role="region" aria-roledescription="carousel" aria-label="{aria_label}" tabindex="0">
        <div class="media-carousel-row">
          <button type="button" class="media-carousel-btn media-carousel-btn--prev" aria-label="Previous slide">&#8592;</button>
          <div class="media-carousel-viewport">
            <div class="media-carousel-track">{items}
            </div>
          </div>
          <button type="button" class="media-carousel-btn media-carousel-btn--next" aria-label="Next slide">&#8594;</button>
        </div>
        {footer_html}
      </div>
    </div>"""
    if inline:
        return carousel_inner
    return f"""
<section class="{section_class} media-carousel-section">
  <div class="page-block-inner">{carousel_inner}
  </div>
</section>"""


AWARENESS_SLIDES = [
    {
        "img": "imgs/educating-peers-through-drammar.jpg",
        "alt": "UMPA awareness campaign with youth",
        "title": "Awareness Campaigns &amp; Pro-Life Clubs",
        "text": "We organize and conduct awareness campaigns to target groups and form pro-life youth clubs across Uganda.",
        "link": "awareness-campaigns.html",
    },
    {
        "img": "imgs/ppedited.png",
        "alt": "Interactive educative session",
        "title": "Educative Talks &amp; Moral Formation",
        "text": "We empower people to embrace moral values through educative talks and videos. Our sessions are very interactive—we discuss with participants, encourage debate on moral issues, and always include question-and-answer sessions for clarity.",
        "link": "awareness-campaigns.html",
    },
    {
        "img": "imgs/edited.png",
        "alt": "Outreach in schools and communities",
        "title": "Reaching Every Community",
        "text": "We meet audiences of different ages, education levels, and religious affiliations—empowering the young and old to choose to uphold morals. We reach primary and secondary schools, tertiary institutions, universities, churches, houses of formation, and corporate entities.",
        "link": "pro-life-clubs.html",
        "link_text": "About our clubs →",
    },
]

CONVENTIONS_SLIDES = [
    {
        "img": "imgs/p3.jpg",
        "alt": "Pro-life annual convention gathering",
        "title": "Annual Conventions &amp; Diocesan Pro-Life Days",
        "text": "We organize and conduct Pro-life annual conventions and diocesan Pro-life days. The young people, together with other age groups, get together to share more about issues that UMPA stands for.",
        "link": "upcoming-events.html",
    },
    {
        "img": "imgs/educating-peers-through-drammar.jpg",
        "alt": "Spiritual nourishment with church leaders",
        "title": "Spiritual Nourishment &amp; Moral Empowerment",
        "text": "Participants receive spiritual nourishment from church leaders who empower them on how to live according to the morals acceptable by the Church.",
        "link": "upcoming-events.html",
    },
    {
        "img": "imgs/ppedited.png",
        "alt": "Youth showcasing talents at convention",
        "title": "A Platform for Youth Talents",
        "text": "Young people are given a platform to showcase their talents—celebrating gifts while growing in faith and commitment to the pro-life mission.",
        "link": "upcoming-events.html",
        "link_text": "View events →",
    },
]

RADIO_TV_SLIDES = [
    {
        "img": "imgs/edited.png",
        "alt": "Radio and television studio",
        "title": "Radio &amp; TV Talk Shows",
        "text": "We hold radio and TV talk shows. Since 2014, UMPA has presented programs on Radio Maria every Thursday from 11:00&nbsp;am to 12:00&nbsp;pm.",
        "link": "upcoming-events.html",
    },
    {
        "img": "imgs/ppedited.png",
        "alt": "Discussing life and family issues on air",
        "title": "Life, Family &amp; Human Dignity",
        "text": "We discuss issues that affect the dignity of the human person and the traditional family. Our program uses reason, science, culture, and faith to help listeners make life- and family-affirming choices.",
    },
    {
        "img": "imgs/p3.jpg",
        "alt": "Radio Maria Uganda broadcast",
        "title": "Radio Maria &amp; Uganda Catholic Television",
        "text": "Our radio program is among the most listened to on Radio Maria Uganda. We also hold occasional talk shows on Radio Sapientia and Uganda Catholic Television.",
        "link": "contact.html",
        "link_text": "Contact us →",
    },
]

COUNSELING_SLIDES = [
    {
        "img": "imgs/p3.jpg",
        "alt": "Compassionate counseling support",
        "title": "Psychosocial Support",
        "text": "We offer psychosocial support and pro-life guidance and counselling—walking with people in crisis with compassion, confidentiality, and faith.",
        "link": "counseling-family-guidance.html",
    },
    {
        "img": "imgs/educating-peers-through-drammar.jpg",
        "alt": "Support for women and families",
        "title": "Women &amp; Families in Crisis",
        "text": "We counsel women with crisis pregnancies and those suffering post-abortion effects, and support families in crisis among many other life-related concerns.",
        "link": "counseling-family-guidance.html",
    },
    {
        "img": "imgs/ppedited.png",
        "alt": "Guidance for youth and healing",
        "title": "Youth, Healing &amp; Freedom",
        "text": "We guide young people struggling with same-sex attractions and those desiring to stop practicing homosexuality, and help those affected by addictions—especially pornography.",
        "link": "counseling-family-guidance.html",
        "link_text": "Get support →",
    },
]

NFP_SLIDES = [
    {
        "img": "imgs/edited.png",
        "alt": "Married couple learning natural family planning",
        "title": "Natural Family Planning (NFP)",
        "text": "Natural Family Planning is entirely pro-life and acceptable by all cultures and religions, including the Catholic Church. It respects God&rsquo;s design for married love and human sexuality.",
        "link": "natural-family-planning.html",
    },
    {
        "img": "imgs/p3.jpg",
        "alt": "Healthy and effective family planning",
        "title": "Healthy, Effective &amp; Free of Complications",
        "text": "NFP is the only category of family planning methods completely free of health complications—yet as effective as, or even more effective than, artificial methods.",
        "link": "natural-family-planning.html",
    },
    {
        "img": "imgs/educating-peers-through-drammar.jpg",
        "alt": "NFP instruction for couples",
        "title": "A Method for Every Couple",
        "text": "We teach a range of natural family planning methods—including for irregular cycles and breastfeeding mothers. These methods foster healthy relationships and can also be used to achieve pregnancy.",
        "link": "natural-family-planning.html",
        "link_text": "Learn about NFP →",
    },
]

CHARITY_SLIDES = [
    {
        "img": "imgs/educating-peers-through-drammar.jpg",
        "alt": "UMPA ambassadors on a charity outreach",
        "title": "Charitable Activities",
        "text": "We organize charitable activities. We believe we are not placed in this world for ourselves but for each other—an act of kindness, however small, never goes to waste.",
        "link": "charity-outreach.html",
    },
    {
        "img": "imgs/p3.jpg",
        "alt": "Sharing basic items with the vulnerable",
        "title": "Sharing With the Vulnerable",
        "text": "Every year UMPA ambassadors and most of our Pro-life club members organize charitable activities aimed at extending kindness to the vulnerable through sharing basic items with them.",
        "link": "charity-outreach.html",
    },
    {
        "img": "imgs/ppedited.png",
        "alt": "Listening and comforting those in need",
        "title": "Presence, Comfort &amp; Dignity",
        "text": "We also create time just to be with them—to listen, to comfort, and to share a smile. We want them to feel loved and valuable.",
        "link": "charity-outreach.html",
        "link_text": "About our outreach →",
    },
]

ABOUT_US_ALL_SLIDES = (
    _tag_slides(AWARENESS_SLIDES, "Awareness &amp; Clubs")
    + _tag_slides(CONVENTIONS_SLIDES, "Conventions &amp; Events")
    + _tag_slides(RADIO_TV_SLIDES, "Radio &amp; Television")
    + _tag_slides(COUNSELING_SLIDES, "Counseling &amp; Support")
    + _tag_slides(NFP_SLIDES, "Natural Family Planning")
    + _tag_slides(CHARITY_SLIDES, "Charity &amp; Outreach")
)

WHAT_WE_DO_CAROUSEL = media_carousel_html(AWARENESS_SLIDES)

CONVENTIONS_CAROUSEL = media_carousel_html(
    CONVENTIONS_SLIDES,
    heading="Pro-Life Conventions &amp; Diocesan Days",
    section_class="page-block",
)

RADIO_TV_CAROUSEL = media_carousel_html(
    RADIO_TV_SLIDES,
    heading="Radio &amp; Television Outreach",
    section_class="page-block page-block--alt",
)

COUNSELING_CAROUSEL = media_carousel_html(
    COUNSELING_SLIDES,
    heading="Psychosocial Support &amp; Counselling",
    section_class="page-block",
)

NFP_CAROUSEL = media_carousel_html(
    NFP_SLIDES,
    heading="Natural Family Planning",
    section_class="page-block page-block--alt",
)

CHARITY_CAROUSEL = media_carousel_html(
    CHARITY_SLIDES,
    heading="Charitable Activities &amp; Outreach",
    section_class="page-block",
)

PROGRAMS_OUTREACH_CAROUSEL = media_carousel_html(
    ABOUT_US_ALL_SLIDES,
    heading="Our Programs &amp; Outreach",
    section_class="page-block page-block--alt",
    unified=True,
)

PROGRAMS_PARENT = ("programs.html", "Programs")


ABOUT_US_JOURNEY_SECTION = """
  <section class="journey-section page-block" id="our-journey">
    <div class="page-block-inner journey-grid">
      <div class="journey-visual">
        <div class="journey-visual-frame">
          <img src="imgs/222.jpg" alt="UMPA volunteers at a pro-life fundraising outreach" loading="lazy" />
        </div>
        <span class="journey-visual-deco" aria-hidden="true"></span>
      </div>
      <div class="journey-content">
        <p class="journey-eyebrow">Our Journey</p>
        <h2 class="journey-heading">The UMPA Story</h2>
        <div class="journey-timeline-scroll">
          <div class="journey-timeline">
            <div class="journey-timeline-line" aria-hidden="true"></div>

            <div class="journey-item journey-item--left">
              <article class="journey-card">
                <span class="journey-year">2008</span>
                <h3>Founded in Kampala</h3>
                <p>Uganda Martyrs Pro-life Apostolate was established in the Archdiocese of Kampala under Archbishop Dr. Cyprian Kizito Lwanga, with a mission to promote and defend human life from conception to natural death.</p>
              </article>
              <div class="journey-node" aria-hidden="true"><i class="fa-solid fa-church"></i></div>
              <div class="journey-spacer"></div>
            </div>

            <div class="journey-item journey-item--right">
              <div class="journey-spacer"></div>
              <div class="journey-node" aria-hidden="true"><i class="fa-solid fa-users"></i></div>
              <article class="journey-card">
                <span class="journey-year">2010s</span>
                <h3>Growing Through Parishes &amp; Schools</h3>
                <p>Pro-life clubs and awareness campaigns spread across parishes, primary and secondary schools, universities, and communities&mdash;empowering young people and families to uphold moral values.</p>
              </article>
            </div>

            <div class="journey-item journey-item--left">
              <article class="journey-card">
                <span class="journey-year">2014</span>
                <h3>Voice on Radio Maria</h3>
                <p>UMPA began weekly radio talk shows on Radio Maria Uganda every Thursday, bringing pro-life education on life, family, and human dignity to listeners nationwide.</p>
              </article>
              <div class="journey-node" aria-hidden="true"><i class="fa-solid fa-tower-broadcast"></i></div>
              <div class="journey-spacer"></div>
            </div>

            <div class="journey-item journey-item--right">
              <div class="journey-spacer"></div>
              <div class="journey-node" aria-hidden="true"><i class="fa-solid fa-calendar-days"></i></div>
              <article class="journey-card">
                <span class="journey-year">Ongoing</span>
                <h3>Conventions &amp; Diocesan Days</h3>
                <p>Annual pro-life conventions and diocesan pro-life days unite youth and communities for spiritual nourishment, moral formation, and celebration of God-given talents.</p>
              </article>
            </div>

            <div class="journey-item journey-item--left">
              <article class="journey-card">
                <span class="journey-year">Today</span>
                <h3>A Culture of Life Across Uganda</h3>
                <p>From counseling and natural family planning to charity outreach and media programs, UMPA continues to serve with integrity, compassion, and the conviction that every human life matters.</p>
              </article>
              <div class="journey-node" aria-hidden="true"><i class="fa-solid fa-heart"></i></div>
              <div class="journey-spacer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
"""

ABOUT_US_CORE_VALUES_SECTION = """
  <section class="core-values-section" id="core-values">
    <div class="core-values-inner">
      <header class="core-values-header">
        <h2 class="core-values-title">Our Core Values</h2>
        <span class="core-values-accent" aria-hidden="true"></span>
      </header>
      <div class="core-values-grid">
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-user-shield"></i></div>
          <h3>Human Dignity</h3>
          <p>Every human person has inherent worth as created in the image of God.</p>
        </article>
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-heart-pulse"></i></div>
          <h3>Right to Life for Every Human Being</h3>
          <p>The right to life belongs to every human being from conception until natural death.</p>
        </article>
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-hands-holding-child"></i></div>
          <h3>Respect for Human Life</h3>
          <p>Honoring every human life as sacred and worthy of protection.</p>
        </article>
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></div>
          <h3>Integrity</h3>
          <p>Acting with honesty, faithfulness, and moral courage in all we do.</p>
        </article>
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-heart"></i></div>
          <h3>Love and Compassion</h3>
          <p>Serving others with Christ-like love, mercy, and compassionate care.</p>
        </article>
      </div>
    </div>
  </section>
"""

MISSION_VISION_PAGE_SECTION = """
  <section class="core-values-section" id="vision-mission">
    <div class="core-values-inner">
      <header class="core-values-header">
        <h2 class="core-values-title">Our Vision &amp; Mission</h2>
        <span class="core-values-accent" aria-hidden="true"></span>
      </header>
      <div class="core-values-grid core-values-grid--duo">
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-eye"></i></div>
          <h3>Vision</h3>
          <p>A population knowledgeable about the value of every human life and a society based on a genuine and authentic respect for every human life.</p>
        </article>
        <article class="core-values-card">
          <div class="core-values-icon" aria-hidden="true"><i class="fa-solid fa-bullseye"></i></div>
          <h3>Mission</h3>
          <p>Commitment to promoting a culture of life.</p>
        </article>
      </div>
    </div>
  </section>
"""

ABOUT_US_REDIRECTS = {
    "who-we-are.html": "about-us.html#who-we-are",
    "leadership.html": "about-us.html#leadership",
    "what-we-do.html": "programs.html",
}

# Standalone pages for each nav dropdown item
dropdown_pages = {
    "awareness-campaigns.html": {
        "title": "Awareness Campaigns",
        "description": "UMPA awareness campaigns and educative talks for moral formation.",
        "banner": "Awareness Campaigns",
        "intro": "Interactive campaigns and educative sessions that empower communities to uphold moral values.",
        "parent": PROGRAMS_PARENT,
        "carousel_html": media_carousel_html([
            {
                "img": "imgs/educating-peers-through-drammar.jpg",
                "alt": "Awareness campaign",
                "title": "Targeted Awareness Campaigns",
                "text": "We organize and conduct awareness campaigns to target groups, bringing the pro-life message to schools, churches, and communities.",
            },
            {
                "img": "imgs/ppedited.png",
                "alt": "Educative talk and discussion",
                "title": "Talks, Videos &amp; Q&amp;A",
                "text": "We empower people through educative talks and videos. Sessions are interactive, with discussion, debate on moral issues, and question-and-answer time for clarity.",
            },
        ]),
        "body_html": """
      <p>We meet audiences from different age groups, education levels, and religious backgrounds. Our aim is to help both young and old choose to uphold morals in daily life.</p>
      <p>We reach out to primary and secondary schools, tertiary institutions, universities, churches, houses of formation, and corporate entities.</p>
        """,
    },
    "pro-life-clubs.html": {
        "title": "Pro-Life Clubs",
        "description": "UMPA pro-life youth clubs in schools and parishes.",
        "banner": "Pro-Life Clubs",
        "intro": "Forming and supporting pro-life youth clubs as part of our awareness work.",
        "parent": PROGRAMS_PARENT,
        "carousel_html": media_carousel_html([
            {
                "img": "imgs/p3.jpg",
                "alt": "Pro-life youth club activities",
                "title": "Pro-Life Youth Clubs",
                "text": "We organize awareness campaigns and form pro-life youth clubs so young people can lead peers in defending life and living with moral courage.",
            },
            {
                "img": "imgs/educating-peers-through-drammar.jpg",
                "alt": "Peer education through drama",
                "title": "Peer-Led Formation",
                "text": "Club members engage their schools and communities through drama, discussion, prayer, and outreach—mentored by UMPA coordinators.",
            },
        ]),
        "body_html": """
      <p>Pro-life clubs are a vital part of how UMPA reaches young people. Clubs are formed in schools and parishes with ongoing mentorship, materials, and program support from our team.</p>
      <p><a href="join-club.html">Interested in starting or joining a club?</a> Contact us to get started.</p>
        """,
    },
    "counseling-family-guidance.html": {
        "title": "Counseling & Family Guidance",
        "description": "Psychosocial support and pro-life counselling from UMPA.",
        "banner": "Counseling & Family Guidance",
        "intro": "Compassionate psychosocial support and pro-life guidance for individuals and families.",
        "parent": PROGRAMS_PARENT,
        "carousel_html": COUNSELING_CAROUSEL,
        "body_html": """
      <p>We offer psychosocial support. We also offer guidance and counselling on matters of pro-life—including women with crisis pregnancy and those suffering post-abortion effects, young people struggling with same-sex attractions and those desiring to stop practicing homosexuality, those affected with addictions especially pornography, families in crisis, and many other issues.</p>
      <p><a href="contact.html">Contact us</a> to speak with a counsellor in confidence.</p>
        """,
    },
    "natural-family-planning.html": {
        "title": "Natural Family Planning",
        "description": "Natural Family Planning (NFP) taught by UMPA — pro-life, healthy, and Church-approved.",
        "banner": "Natural Family Planning",
        "intro": "Entirely pro-life family planning that respects God&rsquo;s design for marriage and human sexuality.",
        "parent": PROGRAMS_PARENT,
        "carousel_html": NFP_CAROUSEL,
        "body_html": """
      <p>Natural Family Planning (NFP) is entirely &ldquo;pro-life&rdquo; and acceptable by all cultures and religions including the Catholic Church. It respects God&rsquo;s design for married love and human sexuality.</p>
      <p>It is the only category of family planning methods that is completely free of health complications yet as effective as or even more effective than artificial methods. We teach a range of natural family planning methods and there is a method suitable for each one—even those with irregular cycles and breastfeeding mothers. These methods foster healthy relationships and can also be used to achieve pregnancy.</p>
      <p><a href="contact.html">Contact us</a> to learn more or register for instruction.</p>
        """,
    },
    "charity-outreach.html": {
        "title": "Charity Outreach",
        "description": "UMPA charitable activities — kindness and practical support for the vulnerable.",
        "banner": "Charity Outreach",
        "intro": "Extending kindness to the vulnerable through sharing, presence, and care.",
        "parent": PROGRAMS_PARENT,
        "carousel_html": CHARITY_CAROUSEL,
        "body_html": """
      <p>We organize charitable activities. We believe that we are not placed in this world for ourselves but for each other. An act of kindness, however small it is, never goes to waste.</p>
      <p>Every year UMPA ambassadors and most of our Pro-life club members organize charitable activities aimed at extending kindness to the vulnerable through sharing with them some basic items. We also create time just to be with them, to listen, to comfort and to share a smile; we want them to feel loved and valuable.</p>
      <p><a href="contact.html">Contact us</a> to volunteer or support an outreach.</p>
        """,
    },
    "training-programs.html": {
        "title": "Training Programs",
        "description": "UMPA training for pro-life ambassadors and leaders.",
        "banner": "Training Programs",
        "intro": "Equipping leaders to advance the pro-life mission.",
        "parent": PROGRAMS_PARENT,
        "body": "We run workshops and training programs for ambassadors, catechists, and leaders equipped with knowledge and skills to advance the pro-life mission in their communities.",
    },
    "upcoming-events.html": {
        "title": "Events",
        "description": "UMPA Pro-life annual conventions, diocesan pro-life days, and gatherings.",
        "banner": "Events",
        "intro": "Annual conventions and diocesan pro-life days that unite youth and communities in faith and mission.",
        "parent": ("index.html", "Home"),
        "carousel_html_2": CONVENTIONS_CAROUSEL,
        "body_html": """
      <p>We organize and conduct Pro-life annual conventions and diocesan Pro-life days. The young people, together with other age groups, get together to share more about issues that UMPA stands for and also get spiritual nourishment from church leaders who empower them on how to live according to the morals acceptable by the Church.</p>
      <p>The young people are also given a platform to showcase their talents. <a href=\"contact.html\">Contact us</a> for upcoming dates or to partner on an event.</p>
        """,
    },
    "gallery.html": {
        "title": "Gallery",
        "description": "Photo gallery of UMPA programs and outreach.",
        "banner": "Gallery",
        "intro": "Moments from our programs and community outreach.",
        "parent": ("upcoming-events.html", "Events"),
        "body": "Photos from UMPA programs, dramatized peer education, parish activities, and community outreach will appear here.",
    },
    "join-club.html": {
        "title": "Join a Club",
        "description": "Join a UMPA pro-life club.",
        "banner": "Join a Club",
        "intro": "Start or join a pro-life club in your school or parish.",
        "parent": ("index.html", "Home"),
        "body": "Start or join a pro-life club in your school or parish. We provide materials, mentorship, and ongoing program support. <a href=\"contact.html\">Contact us</a> to get started.",
    },
    "volunteer.html": {
        "title": "Volunteer",
        "description": "Volunteer with UMPA Uganda Martyrs Pro-life Apostolate.",
        "banner": "Volunteer",
        "intro": "Give your time and talents to defend life.",
        "parent": ("join-club.html", "Get Involved"),
        "body": "Offer your time for outreach, events, counseling support, and community programs. <a href=\"contact.html\">Contact us</a> to volunteer.",
    },
    "partner-with-us.html": {
        "title": "Partner With Us",
        "description": "Partner with UMPA parishes, schools, and organizations.",
        "banner": "Partner With Us",
        "intro": "Work together for life-affirming programs in your community.",
        "parent": ("join-club.html", "Get Involved"),
        "body": "Parishes, schools, and organizations can partner with UMPA for training, campaigns, and joint initiatives. <a href=\"contact.html\">Contact us</a> to explore partnership.",
    },
    "support-our-work.html": {
        "title": "Support Our Work",
        "description": "Support UMPA through donations and contributions.",
        "banner": "Support Our Work",
        "intro": "Help us reach more communities and defend life.",
        "parent": ("join-club.html", "Get Involved"),
        "body": "Your generous contributions help us reach more communities and defend life at every stage. <a href=\"contact.html\">Contact us</a> to learn how to give.",
    },
}

CONTACT_ADDRESS = "Plot 670, Namirembe Road, Kampala, Uganda"
CONTACT_MAP_EMBED = (
    "https://www.google.com/maps?q=Plot+670,+Namirembe+Road,+Kampala,+Uganda&hl=en&z=16&output=embed"
)
CONTACT_MAP_LINK = (
    "https://www.google.com/maps/search/?api=1&query=Plot+670,+Namirembe+Road,+Kampala,+Uganda"
)

CONTACT_FORM_SECTION = f"""
        <section class="page-block" id="contact-form">
          <div class="page-block-inner contact-layout-inner">
            <div class="contact-layout-form">
              <h2>Send a Message</h2>
              <ul class="contact-list">
                <li><i class="fa-regular fa-envelope"></i> <a href="mailto:prolife.klarch@yahoo.com">prolife.klarch@yahoo.com</a></li>
                <li><i class="fa-solid fa-phone"></i> <a href="tel:+256785566505">+256 785 566505</a></li>
                <li><i class="fa-solid fa-location-dot"></i> {CONTACT_ADDRESS}</li>
              </ul>
              <form
                id="contactForm"
                class="contact-form"
                action="https://formsubmit.co/prolife.klarch@yahoo.com"
                method="POST"
              >
                <input type="hidden" name="_subject" value="New message — UMPA website contact form" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="" data-umpa-next="sent" />
                <div class="contact-form-honeypot" aria-hidden="true">
                  <label for="_gotcha">Leave this empty</label>
                  <input type="text" name="_gotcha" id="_gotcha" tabindex="-1" autocomplete="off" />
                </div>
                <label for="contact-name">Name</label>
                <input type="text" id="contact-name" name="name" required placeholder="Your name" autocomplete="name" />
                <label for="contact-email">Email</label>
                <input type="email" id="contact-email" name="email" required placeholder="your@email.com" autocomplete="email" />
                <label for="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows="5" required placeholder="How can we help?"></textarea>
                <div id="contactFormStatus" class="contact-form-status" role="status" hidden></div>
                <button type="submit" class="contact-submit" id="contactSubmitBtn">Send Message</button>
              </form>
            </div>
            <aside class="contact-layout-map" aria-label="Office location map">
              <h2 class="contact-map-heading">Find Us</h2>
              <p class="contact-map-address"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> {CONTACT_ADDRESS}</p>
              <div class="contact-map-frame">
                <iframe
                  src="{CONTACT_MAP_EMBED}"
                  title="Map: {CONTACT_ADDRESS}"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen
                ></iframe>
              </div>
              <a href="{CONTACT_MAP_LINK}" class="contact-map-link" target="_blank" rel="noopener noreferrer">
                Open in Google Maps <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
              </a>
            </aside>
          </div>
        </section>
"""

# Standalone pages (contact, resources)
pages = {
    "contact.html": {
        "title": "Contact Us",
        "description": "Contact UMPA Uganda Martyrs Pro-life Apostolate.",
        "banner": "Contact Us",
        "intro": "We would love to hear from you.",
        "banner_image": "imgs/about.jpeg",
        "breadcrumb": ("index.html", "Home"),
        "sections": [],
        "extra": CONTACT_FORM_SECTION,
    },
    "resources.html": {
        "title": "Resources",
        "description": "Pro-life resources and materials from UMPA.",
        "banner": "Resources",
        "intro": "Educational materials for homes, schools, and parishes.",
        "sections": [
            ("materials", "Educational Materials", 'Brochures and guides for clubs and parishes. See our <a href="awareness-campaigns.html">programs</a>.'),
            ("downloads", "Downloads", "PDFs and printable resources will be listed here as they become available."),
        ],
    },
}


def build_redirect_page(target):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
<title>Redirect | UMPA</title>
<script>location.replace("{target}");</script>
</head>
<body>
<p><a href="{target}">Continue to About Us</a></p>
</body>
</html>
"""


def build_about_us_page():
    data = {
        "title": "About Us",
        "description": "About UMPA — who we are, leadership, and what we do.",
        "banner": "About Us",
        "intro": "Uganda Martyrs Pro-life Apostolate (UMPA) promotes and defends human life from conception until natural death.",
    }
    content = f"""
<main class="page-main">
  <section class="page-banner page-banner--blend">
    <div class="page-banner-photo" aria-hidden="true">
      <img src="imgs/use.jpeg" alt="" loading="eager" />
    </div>
    <div class="page-banner-inner">
      <p class="page-breadcrumb"><a href="index.html">Home</a> / About Us</p>
      <h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>

{ABOUT_US_JOURNEY_SECTION}

  <section class="page-block page-block--alt" id="who-we-are">
    <div class="page-block-inner page-prose">
      <h2 class="page-section-title">Who We Are</h2>
      <p>Uganda Martyrs Pro-life Apostolate (UMPA) is an organization that promotes and defends human life from the moment of conception until natural death. The organization was founded in the Archdiocese of Kampala in April 2008 under Archbishop Dr. Cyprian Kizito Lwanga.</p>
      <p>The right to life is the most fundamental human right from which all others flow. Like all believers in the one God, we believe that life is sacred, a gift from God and should be protected as such since life has its authentic origin in God. UMPA exists to promote and defend this life and the institution of marriage consisting of one man (XY) and one woman (XX), basing on the holy scriptures that say &ldquo;God created man in the image of himself, in the image of God he created him; male and female he created them.&rdquo; (Genesis 1:26&ndash;27)</p>
    </div>
  </section>

  <section class="page-block" id="background">
    <div class="page-block-inner page-prose">
      <h2 class="page-section-title">Background</h2>
      <p>Uganda Martyrs Pro-life Apostolate (UMPA) is a Christian organisation that promotes and defends human life from conception until natural death.</p>
      <p>The right to life is the most fundamental human right from which all others flow. We believe that life is sacred, a gift from God and should be protected as such since life has its authentic origin in God. The Organisation addresses all behaviours and practices that put the dignity of the human person at risk. These include:</p>
      <ul class="background-issues-list">
        <li>Abortion</li>
        <li>Drug and substance abuse</li>
        <li>Homosexuality</li>
        <li>Environmental degradation</li>
        <li>Suicide</li>
        <li>Euthanasia</li>
        <li>Human sacrifice</li>
        <li>Pornography</li>
        <li>Mob justice</li>
        <li>Domestic violence</li>
        <li>Sexual immorality</li>
        <li>Rape</li>
        <li>Defilement</li>
        <li>Artificial reproductive technologies</li>
        <li>Other behaviours that promote the culture of death</li>
      </ul>
      <p>UMPA was founded by Archbishop Dr. Cyprian Kizito Lwanga of Kampala Archdiocese in 2008. This was in response to the high rates of abortion in Uganda [according to Singh et al (2005), an estimated 297,000 abortions per year were being performed]. This meant that every 2 minutes an unborn baby was being brutally murdered through abortion. The problem of abortion and other anti-life practices are increasing at an alarming rate.</p>
    </div>
  </section>

  <section class="page-block page-block--alt" id="what-we-do">
    <div class="page-block-inner page-prose">
      <h2 class="page-section-title">What We Do</h2>
      <p>Uganda Martyrs Pro-life Apostolate (UMPA) organizes and conducts awareness campaigns targeting diverse groups and forms pro-life youth clubs. We empower people to embrace moral values through educative talks and videos.</p>
      <p>Our sessions are very interactive: we discuss with people and, whenever possible, encourage them to debate different moral issues. We always encourage question-and-answer sessions to allow for clarity.</p>
      <p><a href="programs.html">Explore our programs and outreach →</a></p>
    </div>
  </section>

{ABOUT_US_CORE_VALUES_SECTION}

  <section class="page-block page-block--alt" id="leadership">
    <div class="page-block-inner page-prose">
      <h2 class="page-section-title">Leadership</h2>
      <p>UMPA is led by committed coordinators, chaplains, and volunteer leaders who guide programs across parishes, schools, and communities in Uganda.</p>

      <article class="leadership-founder">
        <div class="leadership-founder-badge">Founder</div>
        <h3>Archbishop Dr. Cyprian Kizito Lwanga</h3>
        <p class="leadership-role">Founder, Uganda Martyrs Pro-life Apostolate</p>
        <p>UMPA was founded in 2008 under his leadership as Archbishop of Kampala, in response to the growing culture of death and high rates of abortion in Uganda.</p>
      </article>

      <div class="leadership-team">
        <article class="leadership-card">
          <div class="leadership-card-icon" aria-hidden="true"><i class="fa-solid fa-user-tie"></i></div>
          <h3>Dr. Sandra Nabachwa</h3>
          <p class="leadership-role">Director</p>
          <p class="leadership-contact"><i class="fa-solid fa-phone" aria-hidden="true"></i> <a href="tel:+256782568460">+256 782 568 460</a></p>
        </article>
        <article class="leadership-card">
          <div class="leadership-card-icon" aria-hidden="true"><i class="fa-solid fa-user-pen"></i></div>
          <h3>Ms. Resty Ingabire</h3>
          <p class="leadership-role">General Secretary / Counselor</p>
          <p class="leadership-contact"><i class="fa-solid fa-phone" aria-hidden="true"></i> <a href="tel:+256772481938">+256 772 481 938</a></p>
        </article>
        <article class="leadership-card">
          <div class="leadership-card-icon" aria-hidden="true"><i class="fa-solid fa-cross"></i></div>
          <h3>Rev. Fr. Charles Lwanga Makoboza</h3>
          <p class="leadership-role">Chaplain</p>
          <p class="leadership-contact"><i class="fa-solid fa-phone" aria-hidden="true"></i> <a href="tel:+256705299750">+256 705 299 750</a></p>
        </article>
      </div>

      <p class="page-back"><a href="index.html">← Back to Home</a></p>
    </div>
  </section>
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def build_mission_vision_page():
    data = {
        "title": "Vision, Mission & Values",
        "description": "UMPA vision, mission, and core values — Uganda Martyrs Pro-life Apostolate.",
        "banner": "Vision, Mission & Values",
        "intro": "What guides our work to promote and defend human life in Uganda.",
    }
    content = f"""
<main class="page-main">
  <section class="page-banner page-banner--blend">
    <div class="page-banner-photo" aria-hidden="true">
      <img src="imgs/use.jpeg" alt="" loading="eager" />
    </div>
    <div class="page-banner-inner">
      <p class="page-breadcrumb"><a href="index.html">Home</a> / {data["title"]}</p>
      <h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>

{MISSION_VISION_PAGE_SECTION}

{ABOUT_US_CORE_VALUES_SECTION}

  <section class="page-block page-block--alt">
    <div class="page-block-inner page-prose">
      <p class="page-back"><a href="index.html">← Back to Home</a></p>
    </div>
  </section>
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def build_programs_page():
    data = {
        "title": "Programs",
        "description": "UMPA programs and outreach — awareness, clubs, counseling, media, and charity across Uganda.",
        "banner": "Programs",
        "intro": "We empower communities through awareness campaigns, pro-life clubs, counseling, media outreach, and charitable work.",
    }
    content = f"""
<main class="page-main">
  <section class="page-banner">
    <div class="page-banner-inner">
      <p class="page-breadcrumb"><a href="index.html">Home</a> / Programs</p>
      <h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>

  {PROGRAMS_OUTREACH_CAROUSEL}

  <section class="page-block">
    <div class="page-block-inner page-prose">
      <h2 class="page-section-title">Who We Reach</h2>
      <p>We meet audiences from different age groups, education status, and religious affiliations. The aim is to empower the young and old to choose to uphold morals.</p>
      <ul class="reach-out-list">
        <li>Primary schools</li>
        <li>Secondary schools</li>
        <li>Tertiary institutions</li>
        <li>Universities</li>
        <li>Churches</li>
        <li>Houses of formation</li>
        <li>Corporate entities</li>
      </ul>
      <h2 class="page-section-title">Our Program Areas</h2>
      <ul class="what-we-do-list">
        <li>
          <h3>Awareness Campaigns</h3>
          <p>Interactive campaigns and educative sessions in schools, churches, and communities.</p>
          <a href="awareness-campaigns.html">Learn more →</a>
        </li>
        <li>
          <h3>Pro-Life Clubs</h3>
          <p>Forming and mentoring pro-life youth clubs in schools and parishes.</p>
          <a href="pro-life-clubs.html">Learn more →</a>
        </li>
        <li>
          <h3>Counseling &amp; Family Guidance</h3>
          <p>Psychosocial support, pro-life counselling, and natural family planning.</p>
          <a href="counseling-family-guidance.html">Learn more →</a>
        </li>
        <li>
          <h3>Natural Family Planning</h3>
          <p>Teaching methods that respect God&rsquo;s design for marriage and family life.</p>
          <a href="natural-family-planning.html">Learn more →</a>
        </li>
        <li>
          <h3>Charity Outreach</h3>
          <p>Practical care for mothers, families, and vulnerable persons.</p>
          <a href="charity-outreach.html">Learn more →</a>
        </li>
        <li>
          <h3>Training Programs</h3>
          <p>Equipping pro-life ambassadors with knowledge and skills.</p>
          <a href="training-programs.html">Learn more →</a>
        </li>
      </ul>
      <p class="page-back"><a href="index.html">← Back to Home</a></p>
    </div>
  </section>
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def list_gallery_image_files():
    imgs_dir = root / "imgs"
    if not imgs_dir.is_dir():
        return []
    return sorted(
        (
            p.name
            for p in imgs_dir.iterdir()
            if p.is_file() and p.suffix.lower() in GALLERY_IMAGE_EXTS
        ),
        key=str.casefold,
    )


def build_gallery_grid_html():
    items = []
    for name in list_gallery_image_files():
        src = "imgs/" + quote(name)
        label = html_module.escape(Path(name).stem.replace("_", " ").replace("-", " "))
        items.append(
            f'      <a class="photo-gallery-item" href="{src}" target="_blank" rel="noopener noreferrer">\n'
            f'        <img src="{src}" alt="UMPA — {label}" loading="lazy" />\n'
            f"      </a>"
        )
    return "\n".join(items)


def build_gallery_page(data):
    parent_href, parent_label = data["parent"]
    images = list_gallery_image_files()
    count = len(images)
    grid = build_gallery_grid_html() if count else (
        '      <p class="photo-gallery-empty">No images found in the <code>imgs</code> folder.</p>'
    )
    content = f"""
<main class="page-main">
  <section class="page-banner page-banner--blend">
    <div class="page-banner-photo" aria-hidden="true">
      <img src="imgs/gallery.jpeg" alt="" loading="eager" />
    </div>
    <div class="page-banner-inner">
      <p class="page-breadcrumb"><a href="{parent_href}">{parent_label}</a> / {data["title"]}</p>
      <h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>

  <section class="photo-gallery-section">
    <div class="photo-gallery-inner">
      <p class="photo-gallery-count">{count} photos</p>
      <div class="photo-gallery-grid">
{grid}
      </div>
      <p class="page-back"><a href="{parent_href}">← Back to {parent_label}</a></p>
    </div>
  </section>
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def build_join_club_page():
    data = {
        "title": "Get Involved",
        "description": (
            "Get involved with UMPA — join a pro-life club, volunteer, partner with schools "
            "and parishes, or support our work across Uganda."
        ),
    }
    join_body = (root / "includes" / "join-club-body.html").read_text(encoding="utf-8")
    content = f'<main class="page-main join-club-landing get-involved-portal events-portal">\n{join_body}\n</main>'
    return page_head(data) + header + content + footer + tail


def build_simple_page(filename, data):
    parent_href, parent_label = data["parent"]
    content = f"""
<main class="page-main">
  <section class="page-banner">
    <div class="page-banner-inner">
      <p class="page-breadcrumb"><a href="{parent_href}">{parent_label}</a> / {data["title"]}</p>
      <h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>
  {data.get("carousel_html", "")}
  {data.get("carousel_html_2", "")}
  {data.get("carousel_html_3", "")}
  {data.get("carousel_html_4", "")}
  {data.get("carousel_html_5", "")}
  {data.get("carousel_html_6", "")}
  <section class="page-block">
    <div class="page-block-inner page-prose">
      {data.get("body_html", f"<p>{data.get('body', '')}</p>")}
      <p class="page-back"><a href="{parent_href}">← Back to {parent_label}</a></p>
    </div>
  </section>
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def _page_banner_block(data):
    breadcrumb = ""
    bc = data.get("breadcrumb")
    if bc:
        parent_href, parent_label = bc
        breadcrumb = (
            f'<p class="page-breadcrumb"><a href="{parent_href}">{parent_label}</a> / '
            f'{data["banner"]}</p>\n      '
        )
    banner_image = data.get("banner_image")
    if banner_image:
        return f"""
  <section class="page-banner page-banner--blend">
    <div class="page-banner-photo" aria-hidden="true">
      <img src="{banner_image}" alt="" loading="eager" />
    </div>
    <div class="page-banner-inner">
      {breadcrumb}<h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>"""
    return f"""
  <section class="page-banner">
    <div class="page-banner-inner">
      {breadcrumb}<h1>{data["banner"]}</h1>
      <p>{data["intro"]}</p>
    </div>
  </section>"""


def build_overview_page(filename, data):
    sections_html = ""
    for i, (sid, heading, body) in enumerate(data["sections"]):
        alt = " page-block--alt" if i % 2 else ""
        sections_html += f"""
        <section class="page-block{alt}" id="{sid}">
          <div class="page-block-inner">
            <h2>{heading}</h2>
            <p>{body}</p>
          </div>
        </section>
        """

    extra = data.get("extra", "")
    if extra:
        sections_html = extra + sections_html

    content = f"""
<main class="page-main">
{_page_banner_block(data)}
  {sections_html}
  {page_links}
</main>
"""
    return page_head(data) + header + content + footer + tail


def sync_index():
    index_path = root / "index.html"
    html = index_path.read_text(encoding="utf-8")
    match = re.search(r"</nav>\s*(.*?)\s*<!-- FOOTER -->", html, re.S)
    if not match:
        raise SystemExit("Could not find index.html main content.")
    main = match.group(1)
    # Site settings widget is in the shared header only — remove duplicates from saved body
    main = re.sub(
        r"<!-- SITE SETTINGS \(theme & font\) -->\s*"
        r'<div class="site-settings" id="siteSettings">.*?</aside>\s*</div>\s*',
        "",
        main,
        flags=re.S,
    )
    replacements = {
        'href="about.html"': 'href="about-us.html"',
        'href="who-we-are.html"': 'href="about-us.html"',
        'href="what-we-do.html"': 'href="programs.html"',
        'href="about-us.html#what-we-do"': 'href="programs.html"',
        'href="services.html"': 'href="awareness-campaigns.html"',
        'href="events.html"': 'href="upcoming-events.html"',
        'href="get-involved.html"': 'href="join-club.html"',
        'href="#values"': 'href="about-us.html"',
        'href="#education"': 'href="awareness-campaigns.html"',
        'href="#support"': 'href="counseling-family-guidance.html"',
        'href="#community"': 'href="pro-life-clubs.html"',
        'href="#training"': 'href="training-programs.html"',
        'href="#programs"': 'href="programs.html"',
        'href="get-involved.html#volunteer"': 'href="volunteer.html"',
        'href="get-involved.html#donate"': 'href="support-our-work.html"',
    }
    for old, new in replacements.items():
        main = main.replace(old, new)

    # Homepage body (hero, mission, What We Do cards, impact, join) is maintained in index.html.

    index_head = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="UMPA Uganda Martyrs Pro-life Apostolate">
<title>UMPA Uganda Martyrs Pro-life Apostolate</title>
<link rel="shortcut icon" href="./Assets/images/logo.png" type="img/png" />
""" + head_theme + """
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
"""
    index_path.write_text(index_head + header + "\n" + main.strip() + "\n\n" + footer + tail, encoding="utf-8")
    print("Synced index.html")


(root / "about-us.html").write_text(build_about_us_page(), encoding="utf-8")
print("Wrote about-us.html")

(root / "mission-vision-values.html").write_text(build_mission_vision_page(), encoding="utf-8")
print("Wrote mission-vision-values.html")

(root / "programs.html").write_text(build_programs_page(), encoding="utf-8")
print("Wrote programs.html")

for filename, target in ABOUT_US_REDIRECTS.items():
    (root / filename).write_text(build_redirect_page(target), encoding="utf-8")
    print("Wrote redirect", filename, "->", target)

_gallery_data = dropdown_pages.pop("gallery.html")
(root / "gallery.html").write_text(build_gallery_page(_gallery_data), encoding="utf-8")
print("Wrote gallery.html (%d images)" % len(list_gallery_image_files()))

dropdown_pages.pop("join-club.html", None)
(root / "join-club.html").write_text(build_join_club_page(), encoding="utf-8")
print("Wrote join-club.html")

# Full portal layouts maintained in HTML (not build_simple_page)
for _gi_portal in ("volunteer.html", "partner-with-us.html", "support-our-work.html"):
    dropdown_pages.pop(_gi_portal, None)

for filename, data in dropdown_pages.items():
    (root / filename).write_text(build_simple_page(filename, data), encoding="utf-8")
    print("Wrote", filename)

for filename, data in pages.items():
    (root / filename).write_text(build_overview_page(filename, data), encoding="utf-8")
    print("Wrote", filename)

sync_index()
print("Done — all dropdown pages created.")
