export const site = {
  name: 'Milo Tekchandani',
  handle: 'milotek',
  email: 'milo@milotek.dev',
  cv: 'https://github.com/milotek/milotek/raw/main/CV.pdf',
  github: 'milotek',
  repo: 'https://github.com/milotek/milotek.dev',
  lastfm: {
    user: import.meta.env.PUBLIC_LASTFM_USER as string | undefined,
    apiKey: import.meta.env.PUBLIC_LASTFM_API_KEY as string | undefined,
  },
  spotify: 'https://open.spotify.com/user/31zsvravykeeizwyelb673odcu4q',
} as const;

export const socials = [
  { label: 'Email', href: `mailto:${site.email}`, handle: site.email, colour: 'var(--pink)' },
  { label: 'Phone', href: 'tel:+447745011538', handle: '+44 7745 011538', colour: 'var(--pink)' },
  { label: 'GitHub', href: 'https://github.com/milotek', handle: '@milotek', colour: '#ffffff' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fired/', handle: 'in/fired', colour: '#0a66c2', ink: 'white' },
  { label: 'Spotify', href: site.spotify, handle: 'not in the groove', colour: '#1db954' },
  { label: 'HN', href: 'https://news.ycombinator.com/user?id=milotek', handle: 'milotek', colour: '#ff6600' },
  { label: 'Twitter', href: 'https://twitter.com/breakmyspinal', handle: '@breakmyspinal', colour: '#1da1f2', ink: 'white' },
  { label: 'Instagram', href: 'https://www.instagram.com/milo.tek/', handle: '@milo.tek', colour: '#e4405f', ink: 'white' },
];

export const buttons = [
  { name: 'bomberfish', href: 'https://bomberfish.ca', button: 'https://bomberfish.ca/button.gif' },
  { name: 'Half-Life', href: 'https://www.half-life.com', button: '/buttons/half-life.gif' },
  { name: 'NixOS', href: 'https://nixos.org', button: '/buttons/linuxnow2.gif' },
  { name: 'Steam', href: 'https://store.steampowered.com', button: '/buttons/steam.gif' },
  { name: 'Spotify', href: site.spotify, button: '/buttons/spotify.gif' },
  { name: 'GitHub', href: 'https://github.com/milotek', button: '/buttons/github.gif' },
  { name: 'Internet Archive', href: 'https://web.archive.org', button: '/buttons/internetarchive.gif' },
  { name: 'Lambda', href: 'https://www.half-life.com', button: '/buttons/lambda2.gif' },
  { name: 'gamer cat', button: '/buttons/gamercat.gif' },
  { name: 'Google', href: 'https://www.google.com', button: '/buttons/google.gif' },
  { name: 'GNU/Linux', href: 'https://kernel.org', button: '/buttons/gnu-linux.gif' },
  { name: 'RSS', href: '/rss.xml', button: '/buttons/valid-rss.gif' },
  { name: 'Mod Archive', href: 'https://modarchive.org', button: '/buttons/modarchive.gif' },
  { name: 'Chrome', href: 'https://www.google.com/chrome/', button: '/buttons/best_chrome.gif' },
  { name: 'Any Browser', href: 'https://anybrowser.org/campaign/', button: '/buttons/anybrowser.gif' },
  { name: 'hacker powered', button: '/buttons/hackerpowered.gif' },
  { name: 'no cookies', button: '/buttons/nocookie.gif' },
  { name: 'Y2K', button: '/buttons/y2k.gif' },
];
