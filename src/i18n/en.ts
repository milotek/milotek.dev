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
    'hi my name is Milo I am nineteen and I am from the UK and I like to play video games and my favourite video game is Left 4 Dead 2 and I work at <svg class="google" viewBox="0 0 24 24" role="img" aria-label="Google"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg> on <a href="https://search.google/google-app/">mobile search</a> and I like eating purple skittles<br><br>Please do not ask me about my fursona =)',
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
  'nowPlaying.mute': 'mute',
  'nowPlaying.unmute': 'unmute',

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
