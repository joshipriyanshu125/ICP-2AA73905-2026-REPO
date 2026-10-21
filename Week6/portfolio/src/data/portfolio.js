// All personal information is intentionally provisional. Replace it here later.
// Reference artwork is used only to preview the requested design, not as your work.
export const profile = {
  name: 'Your Name',
  firstName: 'Your Name',
  headline: ['Design engineer &', 'AI enthusiast'],
  description: 'Independent engineer focused on interfaces that feel calm, considered, and quietly fast.',
  portrait: 'https://rbp-portfolio.vercel.app/josh.webp',
  portraitAlt: 'Illustrated developer — reference placeholder, replace with your portrait',
  email: '',
  socials: { linkedin: '', x: '' },
  contactText: 'I’m always open to discussing new projects, creative ideas, or opportunities to be part of your visions. Just reach out!',
};

const referenceImage = (path) => `https://cdn.dribbble.com/userupload/${path}?resize=1024x768&vertical=center`;

export const projects = [
  {
    id: 'project-one', name: 'Project One', icon: 'sparkles',
    headline: 'An AI writing companion that thinks alongside you, bringing ideas, edits, and drafts into one focused space.',
    description: 'A placeholder for your first project. Add the problem you explored, the experience you built, and what makes it special.',
    role: 'Your role', year: 'Year',
    image: referenceImage('46128964/file/b92b9d268dd928642ca94bd49e32923a.jpg'),
    imageAlt: 'Reference artwork for a writing interface — project placeholder',
    aspectRatio: '752 / 497', url: '', demo: true,
  },
  {
    id: 'project-two', name: 'Project Two', icon: 'asterisk',
    headline: 'A thoughtful brand and product experience for a creative studio.',
    description: 'Your second project will live here. Share the idea, the process, and how you brought the details together.',
    role: 'Your role', year: 'Year',
    image: referenceImage('24599416/file/original-1ae5075dcd129aebb16bdbca24b41ac7.png'),
    imageAlt: 'Reference artwork for a creative studio — project placeholder',
    aspectRatio: '4 / 3', url: '', demo: true,
  },
  {
    id: 'project-three', name: 'Project Three', icon: 'chart',
    headline: 'Calm analytics for a clearer perspective.',
    description: 'A space for your next project. Describe how you turned a complex problem into a simple, useful experience.',
    role: 'Your role', year: 'Year',
    image: referenceImage('47357856/file/75841fa59f32f05ca6c5ddf02d08dfe6.png'),
    imageAlt: 'Reference artwork for an analytics interface — project placeholder',
    aspectRatio: '4 / 3', url: '', demo: true,
  },
  {
    id: 'project-four', name: 'Project Four', icon: 'music',
    headline: 'Reimagining a booking experience, helping people find exactly what they are looking for.',
    description: 'Use this space to introduce another piece of your work, the decisions behind it, and the things you learned along the way.',
    role: 'Your role', year: 'Year',
    image: referenceImage('43955214/file/original-d4cde1de803e84b97d8892e3444c04b0.png'),
    imageAlt: 'Reference artwork for a booking interface — project placeholder',
    aspectRatio: '4 / 3', url: '', demo: true,
  },
  {
    id: 'project-five', name: 'Project Five', icon: 'notebook',
    headline: 'A pocket-sized research tool that makes room for the thinking.',
    description: 'Add a project overview here, including your contribution, the tools you used, and what you would like visitors to discover.',
    role: 'Your role', year: 'Year',
    image: referenceImage('30310902/file/original-621e7fe47be9d11ee14544456c693bec.png'),
    imageAlt: 'Reference artwork for a research tool — project placeholder',
    aspectRatio: '4 / 3', url: '', demo: true,
  },
  {
    id: 'project-six', name: 'Project Six', icon: 'message',
    headline: 'A friendlier interface for new conversations.',
    description: 'A final placeholder for an experiment, a collaboration, or a personal project you are excited to share.',
    role: 'Your role', year: 'Year',
    image: referenceImage('16560717/file/original-c6f745d50302d66609bfe080f99f5396.png'),
    imageAlt: 'Reference artwork for a conversation interface — project placeholder',
    aspectRatio: '4 / 3', url: '', demo: true,
  },
];

export const about = {
  paragraphs: [
    'A designer and developer passionate about building intuitive, human-centered digital experiences. This is a placeholder introduction for your background, interests, and the perspective you bring to your work.',
    'Your story belongs here. Share how you got started, the ideas that inspire you, and the experiences that shaped the way you approach design and development.',
    'Use this space to talk about what you are exploring now, what you would like to build next, and the opportunities you are looking for.',
  ],
  experience: [
    { name: 'Your latest experience', role: 'Your role', period: 'Start – Present', icon: 'briefcase' },
    { name: 'Your previous experience', role: 'Your role', period: 'Start – End', icon: 'code' },
    { name: 'An internship or collaboration', role: 'Your role', period: 'Start – End', icon: 'layers' },
    { name: 'An independent project', role: 'Your role', period: 'Start – End', icon: 'sparkles' },
  ],
  education: [
    { name: 'Your university or college', role: 'Your degree', period: 'Start – End', initial: 'U' },
    { name: 'A course or certification', role: 'Your specialization', period: 'Year', initial: 'C' },
    { name: 'Your learning journey', role: 'A skill you explored', period: 'Year', initial: 'L' },
  ],
  skills: ['UI/UX Design', 'Design Systems', 'Prototyping & Motion', 'Frontend Development', 'TypeScript & React', 'Interaction Design', 'Performance Tuning', 'Accessibility', 'Visual Identity'],
  stack: [
    { name: 'Figma', color: '#282828', symbol: 'figma' },
    { name: 'React', color: '#1fb6cb', symbol: 'react' },
    { name: 'Next.js', color: '#222222', symbol: 'nextdotjs' },
    { name: 'TypeScript', color: '#2f74c0', symbol: 'typescript' },
    { name: 'shadcn/ui', color: '#5b54ff', symbol: 'shadcnui' },
    { name: 'Cursor', color: '#111111', symbol: 'cursor' },
    { name: 'GSAP', color: '#0ae448', symbol: 'gsap' },
    { name: 'GitHub', color: '#181717', symbol: 'github' },
    { name: 'Vercel', color: '#0a0a0a', symbol: 'vercel' },
    { name: 'Tailwind CSS', color: '#2bbcf5', symbol: 'tailwindcss' },
  ],
  photos: [
    { src: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=480&auto=format&fit=crop&q=80', alt: 'Green leaves — placeholder moodboard photo' },
    { src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=480&auto=format&fit=crop&q=80', alt: 'Mountain lake — placeholder moodboard photo' },
    { src: 'https://rbp-portfolio.vercel.app/josh.webp', alt: 'Illustrated developer — placeholder portrait' },
    { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=480&auto=format&fit=crop&q=80', alt: 'Forest sunlight — placeholder moodboard photo' },
    { src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=480&auto=format&fit=crop&q=80', alt: 'Ocean waves — placeholder moodboard photo' },
    { src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&auto=format&fit=crop&q=80', alt: 'A creative workspace — placeholder moodboard photo' },
  ],
};
