/**
 * @fileoverview English UI strings.
 *
 * Blog posts, project write-ups, and artwork captions live in their own
 * content files. Placeholders like `{name}` are interpolated by the translator
 * returned from `createTranslator()`.
 */

export const EN_STRINGS = {
  lang: 'en-GB',

  'site.role': 'Software Engineer @ Google',
  'site.description':
    'Software Engineer @ Google, working on the Google Search app for Android and iOS.',

  'nav.label': 'Site',
  'nav.home': '/',
  'nav.about': '/about',
  'nav.projects': '/projects',
  'nav.blog': '/blog',
  'nav.art': '/art',
  'nav.contact': '/contact',

  'hero.brand': "milo tek's site",
  'hero.copyright': 'COPYRIGHT LOLOLOLOL',
  'hero.aaaa': 'Easter egg #1',
  'hero.flip': 'Easter egg #2',
  'hero.swap': 'Easter egg #3',

  'footer.source': 'source',

  'home.about': 'about',
  'home.portrait': 'A drawing of me',
  'home.bio':
    'hi my name is Milo I am nineteen and I am from the UK and I like to play video games and my favourite video game is Left 4 Dead 2 and I work at <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span> on mobile search and I like eating purple skittles',
  'home.bio.fursona': 'Please do not ask me about my fursona =)',
  'home.nowPlaying': 'listening to...',
  'home.projects': 'projects',
  'home.allProjects': 'all projects ↗',
  'home.github': 'activity',
  'home.contact': 'contact',
  'home.blog': 'blogposts',
  'home.more': 'more ↗',
  'home.buttons': 'bullshit',

  'about.title': 'about',

  'error.broke': '{what} broke',

  'github.day': '{count} contributions on {date}',
  'github.dayOne': '1 contribution on {date}',
  'github.stars': 'stars',
  'github.forks': 'forks',
  'github.summary': '{contributions} contributions · {repos} repos',

  'nowPlaying.live': 'now!',
  'nowPlaying.title': 'title',
  'nowPlaying.artist': 'artist',
  'nowPlaying.time': 'time',
  'nowPlaying.ago': '{n}{unit} ago',
  'nowPlaying.units': 's m h d w mo y',
  'nowPlaying.play': 'play',
  'nowPlaying.pause': 'pause',

  'projects.title': 'projects',
  'projects.description':
    'Projects developed fully or in part by Milo Tek. Frontend, backend, software, hardware, apps, games... stuff...',
  'project.label': 'project',
  'project.details': 'details',
  'project.by': 'by',
  'project.year': 'in',
  'project.tech': 'with',

  'blog.title': 'blog',
  'blog.description':
    'Really awful blogposts written by Milo Tek - someone who should have their keyboard taken away.',
  'blog.rss': 'rss ↗',
  'blog.back': 'all posts ↗',
  'rss.title': '{handle} blog',
  'rss.description': 'Terrible writing from milo@milotek.dev.',

  'art.title': 'art',
  'art.description':
    'EXTREMELY HIGH QUALITY FINE ART FROM THE GREAT AND POWERFUL MILO TEK',
  'art.back': 'all art ↗',

  '404.title': '404s and heartbreaks </3',
  '404.description': 'Not here.',
  // Rendered with set:html; the Wayback link gets the missing page's address in 404.astro.
  '404.body':
    '<p>Sometimes you have to accept the fact that there\'s NOT A PAGE HERE because hey thats how life works. It may sound unfair but one day your WEBSITE WILL PROBABLY ALSO 404. You will PROBABLY FIND WHAT YOU WERE LOOKING FOR IF YOU CHECK THE <a class="wayback" href="https://web.archive.org/web/*/milotek.dev/*">WAYBACK MACHINE FOR THIS SITE</a> and you will be happy for 5 seconds and move on with your life. It\'s that easy. Come on now, let\'s all go to sleep.</p><p>If you can\'t find what you were looking for, <em>still</em>, please do <a href="{contact}">contact me</a>!</p>',
  '404.image':
    'A crudely drawn stick figure giving a thumbs up next to a broken mess, captioned UNDER CONSTRUCTION.',
  '404.home': "let's go home",
} as const;
