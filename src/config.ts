/**
 * @fileoverview Site-wide identity, social links, and 88x31 web buttons.
 */

/** Configuration for the Last.fm integration. */
export interface LastFmConfig {
  readonly user: string | undefined;
  readonly apiKey: string | undefined;
}

/** Core site identity and external account metadata. */
export interface SiteConfig {
  readonly name: string;
  readonly handle: string;
  readonly email: string;
  readonly cvUrl: string;
  readonly githubUsername: string;
  readonly repoUrl: string;
  readonly lastfm: LastFmConfig;
  readonly spotifyUrl: string;
}

/** A social profile entry rendered in the contact tile. */
export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly handle: string;
  /** CSS color used as the hover background. */
  readonly brandColor: string;
  /** Optional CSS text color on hover; defaults to `var(--base)`. */
  readonly inkColor?: string;
}

/** An 88x31 web button displayed in the waterfall tile. */
export interface WebButton {
  readonly name: string;
  readonly href?: string;
  /** Relative path under `public/` (prefixed with `/`) or absolute URL. */
  readonly imageSrc: string;
}

export const SITE: SiteConfig = {
  name: 'Milo Tekchandani',
  handle: 'milotek',
  email: 'milo@milotek.dev',
  cvUrl: 'https://github.com/milotek/milotek/raw/main/CV.pdf',
  githubUsername: 'milotek',
  repoUrl: 'https://github.com/milotek/milotek.dev',
  lastfm: {
    user: import.meta.env.PUBLIC_LASTFM_USER as string | undefined,
    apiKey: import.meta.env.PUBLIC_LASTFM_API_KEY as string | undefined,
  },
  spotifyUrl: 'https://open.spotify.com/user/31zsvravykeeizwyelb673odcu4q',
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: 'Email',
    href: `mailto:${SITE.email}`,
    handle: SITE.email,
    brandColor: 'var(--pink)',
  },
  {
    label: 'Phone',
    href: 'tel:+447745011538',
    handle: '+44 7745 011538',
    brandColor: 'var(--pink)',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/milotek',
    handle: '@milotek',
    brandColor: '#ffffff',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/fired/',
    handle: 'in/fired',
    brandColor: '#0a66c2',
    inkColor: '#ffffff',
  },
  {
    label: 'Spotify',
    href: SITE.spotifyUrl,
    handle: 'not in the groove',
    brandColor: '#1db954',
  },
  {
    label: 'HN',
    href: 'https://news.ycombinator.com/user?id=milotek',
    handle: 'milotek',
    brandColor: '#ff6600',
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/breakmyspinal',
    handle: '@breakmyspinal',
    brandColor: '#1da1f2',
    inkColor: '#ffffff',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/milo.tek/',
    handle: '@milo.tek',
    brandColor: '#e4405f',
    inkColor: '#ffffff',
  },
];

export const WEB_BUTTONS: readonly WebButton[] = [
  {
    name: 'bomberfish',
    href: 'https://bomberfish.ca',
    imageSrc: 'https://bomberfish.ca/button.gif',
  },
  {
    name: 'Half-Life',
    href: 'https://www.half-life.com',
    imageSrc: '/buttons/half-life.gif',
  },
  {
    name: 'NixOS',
    href: 'https://nixos.org',
    imageSrc: '/buttons/linuxnow2.gif',
  },
  {
    name: 'Steam',
    href: 'https://store.steampowered.com',
    imageSrc: '/buttons/steam.gif',
  },
  {
    name: 'Spotify',
    href: SITE.spotifyUrl,
    imageSrc: '/buttons/spotify.gif',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/milotek',
    imageSrc: '/buttons/github.gif',
  },
  {
    name: 'Internet Archive',
    href: 'https://web.archive.org',
    imageSrc: '/buttons/internetarchive.gif',
  },
  {
    name: 'Lambda',
    href: 'https://www.half-life.com',
    imageSrc: '/buttons/lambda2.gif',
  },
  {
    name: 'gamer cat',
    imageSrc: '/buttons/gamercat.gif',
  },
  {
    name: 'Google',
    href: 'https://www.google.com',
    imageSrc: '/buttons/google.gif',
  },
  {
    name: 'GNU/Linux',
    href: 'https://kernel.org',
    imageSrc: '/buttons/gnu-linux.gif',
  },
  {
    name: 'RSS',
    href: '/rss.xml',
    imageSrc: '/buttons/valid-rss.gif',
  },
  {
    name: 'Mod Archive',
    href: 'https://modarchive.org',
    imageSrc: '/buttons/modarchive.gif',
  },
  {
    name: 'Chrome',
    href: 'https://www.google.com/chrome/',
    imageSrc: '/buttons/best_chrome.gif',
  },
  {
    name: 'Any Browser',
    href: 'https://anybrowser.org/campaign/',
    imageSrc: '/buttons/anybrowser.gif',
  },
  {
    name: 'hacker powered',
    imageSrc: '/buttons/hackerpowered.gif',
  },
  {
    name: 'no cookies',
    imageSrc: '/buttons/nocookie.gif',
  },
  {
    name: 'Y2K',
    imageSrc: '/buttons/y2k.gif',
  },
];
