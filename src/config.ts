export const site = {
  name: 'Milo Tekchandani',
  handle: 'milotek',
  role: 'Software Engineering @ Google, London',
  description: 'Software Engineer @ Google, working on the Google Search app for Android and iOS.',
  email: 'milo@milotek.dev',
  cv: 'https://github.com/milotek/milotek/raw/main/CV.pdf',
  github: 'milotek',
  lastfm: {
    user: import.meta.env.PUBLIC_LASTFM_USER as string | undefined,
    apiKey: import.meta.env.PUBLIC_LASTFM_API_KEY as string | undefined,
  },
  spotify: 'https://open.spotify.com/user/31zsvravykeeizwyelb673odcu4q',
} as const;

export const socials = [
  { label: 'Email', href: `mailto:${site.email}`, handle: site.email },
  { label: 'GitHub', href: 'https://github.com/milotek', handle: '@milotek' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fired/', handle: 'in/fired' },
  { label: 'Instagram', href: 'https://www.instagram.com/milo.tek/', handle: '@milo.tek' },
  { label: 'Spotify', href: site.spotify, handle: 'milotek' },
];

export const friends = [{ name: 'test', href: 'https://bomberfish.ca', button: 'https://bomberfish.ca/button.gif' }];
