import type { ImageMetadata } from 'astro';
import dust2 from '../assets/art/c6ba2180.jpg';
import oldPfp from '../assets/art/3525b230.jpg';
import friendPfp from '../assets/art/4ed02664.jpg';
import poster from '../assets/art/12468312.jpg';
import geometryDash from '../assets/art/39249b05.jpg';
import lake from '../assets/art/2f297d23.jpg';
import antagonist from '../assets/art/bd5efe96.jpg';
import protagonist from '../assets/art/2dbfb7f8.jpg';
import friends from '../assets/art/191a6b44.jpg';
import giraffe from '../assets/art/d1bc936a.jpg';
import titleScreen from '../assets/art/4a026d2f.jpg';
import sunset from '../assets/art/7ff9075b.jpg';
import space from '../assets/art/6bfcf853.jpg';
import underground from '../assets/art/f2891b7b.jpg';
import world from '../assets/art/5a9c5a0a.jpg';

export interface Artwork {
  slug: string;
  title: string;
  caption: string;
  src: ImageMetadata;
}

export const artworks: Artwork[] = [
  { slug: 'de-dust2', title: 'de_dust2', caption: 'de_dust2 in mat_fullbright', src: dust2 },
  { slug: 'old-pfp', title: 'old pfp', caption: 'My old profile picture on websites.', src: oldPfp },
  { slug: 'friends-pfp', title: "friend's pfp", caption: "My friend's steam profile picture, drawn by request.", src: friendPfp },
  { slug: 'hardware-vs-software', title: 'hardware vs software', caption: 'Poster made for Computer Science competition explaining Hardware vs Software differences in 1st term.', src: poster },
  { slug: 'geometry-dash', title: 'geometry dash', caption: "I don't even know what this one is supposed to represent, but it's worth chucking in for padding. Geometry Dash 10 Year Anniversary fan artwork.", src: geometryDash },
  { slug: 'de-lake', title: 'de_lake', caption: 'Artwork of the counter-strike map DE_LAKE. My favourite map.', src: lake },
  { slug: 'epq-antagonist', title: 'EPQ antagonist', caption: 'Concept character art of the antagonist for my EPQ.', src: antagonist },
  { slug: 'epq-protagonist', title: 'EPQ protagonist', caption: 'Concept character art of the protagonist for my EPQ.', src: protagonist },
  { slug: 'friends', title: 'friends', caption: "Me and my friends. Drawn for someone's birthday!", src: friends },
  { slug: 'giraffe', title: 'giraffe', caption: 'Cute giraffe - made with Pixelmator Pro to demonstrate the app.', src: giraffe },
  { slug: 'title-screen', title: 'title screen', caption: 'Title screen background for a pygame project.', src: titleScreen },
  { slug: 'sunset', title: 'sunset', caption: '"Sunset" stage background for a pygame project.', src: sunset },
  { slug: 'space', title: 'space', caption: '"Space" stage background for a pygame project.', src: space },
  { slug: 'underground', title: 'underground', caption: '"Underground" stage background for a pygame project.', src: underground },
  { slug: 'world', title: 'world', caption: '"World" stage background for a pygame project.', src: world },
];
