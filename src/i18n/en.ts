// UI strings. Blog posts, projects and art captions live in their own content.
// `{name}` placeholders are filled in by t().
export default {
  lang: 'en-GB',

  'site.role': 'software engineering @ google, london',
  'site.description': 'Software Engineer @ Google, working on the Google Search app for Android and iOS.',

  'nav.label': 'Site',
  'nav.home': '/',
  'nav.projects': '/projects',
  'nav.blog': '/blog',
  'nav.art': '/art',
  'nav.contact': '/contact',

  'hero.brand': "milo tek's site",
  'hero.copyright': 'COPYRIGHT LOLOLOLOL',
  'hero.music': 'Music',
  'hero.flip': 'Flip the header',
  'hero.swap': 'Swap the picture',

  'footer.rss': 'rss',

  'home.about': 'about',
  'home.portrait': 'A drawing of me',
  'home.bio': 'hi my name is Milo I am nineteen and I am from the UK and I like to play video games and my favourite video game is Left 4 Dead 2 and I work at Google on mobile search and I like eating purple skittles',
  // HTML: rendered with set:html for the strikethrough.
  'home.bio.fursona': 'please <s>do not</s> ask me about my fursona',
  'home.nowPlaying': 'now playing',
  'home.lastfm': 'last.fm ↗',
  'home.projects': "things i've made",
  'home.allProjects': 'all projects →',
  'home.github': 'github',
  'home.contact': 'contact',
  'home.blog': 'blog',
  'home.everyPost': 'every post →',
  'home.buttons': 'buttons',

  'github.summary': '{contributions} contributions · {repos} repos',

  'nowPlaying.spotify': 'my spotify',
  'nowPlaying.live': 'listening now',
  'nowPlaying.last': 'last played {ago}',
  'nowPlaying.ago': '{n}{unit} ago',
  'nowPlaying.units': 's m h d w mo y',

  'buttons.copy': 'copy html',
  'buttons.copied': 'copied',
  'buttons.failed': 'clipboard said no',
  'buttons.mine': '{handle} button',

  'projects.title': 'projects',
  'projects.description': 'Things Milo Tekchandani has built: backend and infrastructure, hardware, apps, games.',
  'project.label': 'project',
  'project.details': 'details',
  'project.by': 'by',
  'project.year': 'year',
  'project.tech': 'made with',

  'blog.title': 'blog',
  'blog.description': 'Writing by Milo Tekchandani. Keyboards, VR headsets, Lua, whatever else.',
  'blog.rss': 'rss ↗',
  'blog.back': '← every post',
  'rss.title': '{handle} blog',
  'rss.description': 'Terrible writing from milo@milotek.dev.',

  'art.title': 'art',
  'art.description': 'Drawings and pixel art by Milo Tekchandani, mostly made in Procreate.',
  'art.back': '← all art',

  '404.title': '404',
  '404.description': 'Not here.',
  '404.image': 'A badly drawn stick figure giving a thumbs up next to two cogs, captioned UNDER CONSTRUCTION.',
  '404.home': 'back home',
} as const;
