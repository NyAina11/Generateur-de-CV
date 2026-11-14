import { createId } from '../lib/cv';
import { CVData } from '../types';

/** CV fictif servant d'exemple : il montre le rendu avant de saisir ses propres informations. */
export function createSampleCV(): CVData {
  return {
    personal: {
      fullName: 'Camille Durand',
      jobTitle: 'Cheffe de projet digital',
      email: 'camille.durand@example.com',
      phone: '06 12 34 56 78',
      location: 'Lyon, France',
      website: 'linkedin.com/in/camille-durand',
      photo: '',
      summary:
        "Cheffe de projet digital avec 6 ans d'expérience dans la conception et le pilotage de sites e-commerce. Habituée à coordonner des équipes pluridisciplinaires et à livrer dans les délais, avec une attention constante portée à l'expérience utilisateur.",
    },
    experience: [
      {
        id: createId(),
        role: 'Cheffe de projet digital',
        company: 'Maison Lumière',
        startDate: '2021',
        endDate: '',
        current: true,
        description:
          "• Pilotage de la refonte du site e-commerce (équipe de 8 personnes, budget de 250 k€)\n• Mise en place d'une méthode agile qui a réduit les délais de livraison de 30 %\n• Suivi des indicateurs de conversion et animation des comités de pilotage",
      },
      {
        id: createId(),
        role: 'Chargée de projet web',
        company: 'Agence Pixel & Co',
        startDate: '2018',
        endDate: '2021',
        current: false,
        description:
          "• Gestion simultanée d'une dizaine de projets clients, du cahier des charges à la mise en ligne\n• Rédaction des spécifications fonctionnelles et recette des livrables\n• Formation des clients à la prise en main de leur outil de gestion de contenu",
      },
    ],
    education: [
      { id: createId(), school: 'Université Lumière Lyon 2', degree: 'Master Marketing digital', year: '2018' },
      { id: createId(), school: 'IUT de Grenoble', degree: 'BUT Métiers du multimédia et de l’internet', year: '2016' },
    ],
    skills: [
      { id: createId(), name: 'Gestion de projet agile', level: 5 },
      { id: createId(), name: 'UX design', level: 4 },
      { id: createId(), name: 'SEO', level: 4 },
      { id: createId(), name: 'Google Analytics', level: 4 },
      { id: createId(), name: 'Figma', level: 3 },
      { id: createId(), name: 'HTML / CSS', level: 3 },
    ],
    languages: [
      { id: createId(), name: 'Français', level: 'Langue maternelle' },
      { id: createId(), name: 'Anglais', level: 'Courant' },
      { id: createId(), name: 'Espagnol', level: 'Intermédiaire' },
    ],
    interests: 'Randonnée, photographie, bénévolat associatif',
    themeColor: '#2563eb',
    templateId: 'modern',
  };
}
