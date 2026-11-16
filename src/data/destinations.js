/**
 * Easy-to-edit list of town destinations.
 * Keep URLs on your own GitHub Pages account relative to the origin.
 * A destination with url:null is under construction and does not navigate.
 */
export const DESTINATIONS = [
  {
    id: 'contact', name: 'Contact-ID', label: 'CONTACT-ID',
    description: 'Your digital contact card. Say hello, get in touch, or save my contact information.',
    url: '/Contact-ID/',
    position: { x: 20, z: -24 }, radius: 12,
    color: '#bd8192'
  },
  {
    id: 'portfolio', name: 'Portfolio', label: 'PORTFOLIO',
    description: 'Projects, technical skills, and professional experience. This website is still being developed.',
    url: '/Portfolio/',
    position: { x: -21, z: 35 }, radius: 12,
    color: '#ddc49b'
  },
  {
    // The Source Hub sits on the small cul-de-sac behind the spawn point.
    id: 'github', name: 'GitHub', label: 'GITHUB',
    description: 'Visit the SpookCoffee GitHub profile to explore source code and public repositories.',
    url: 'https://github.com/SpookCoffee',
    position: { x: 18, z: -106 }, radius: 8.5,
    color: '#b4b8c2'
  },
  {
    id: 'tofu', name: 'Mountain Tofu Shop', label: 'TOFU SHOP',
    description: 'A quiet roadside tofu shop inspired by mountain-pass delivery stories. Step inside the Tofu-Delivery website.',
    url: '/Tofu-Delivery/',
    position: { x: 69, z: 82 }, radius: 12,
    color: '#e4dfc7'
  },
  {
    id: 'worksite', name: 'Work In Progress', label: 'WORK IN PROGRESS',
    description: 'Follow the main road beyond the tofu-shop turnoff to a new construction site at the unpaved northern end.',
    url: null,
    position: { x: 21, z: 109 }, radius: 9.5,
    color: '#b1aa88'
  }
];
