export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  /** Poste toujours occupé : la date de fin est affichée « Présent ». */
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface Language {
  id: string;
  name: string;
  level: string; // ex : « Courant », « B2 »
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo?: string; // Image encodée en data URL (base64)
  summary: string;
}

export type TemplateId = 'modern' | 'classic' | 'elegant' | 'unique';

export type DesignLayout = 'sidebar-left' | 'sidebar-right' | 'single-column' | 'minimal-grid' | 'asymmetric';

export interface DesignConfig {
  layout: DesignLayout;

  header: {
    alignment: 'left' | 'center' | 'right';
    style: 'clean' | 'banner' | 'floating-box' | 'underlined';
    nameSize: 'normal' | 'large' | 'huge';
  };

  sections: {
    style: 'clean' | 'cards' | 'left-border' | 'timeline';
    titleStyle: 'simple' | 'uppercase-bold' | 'underlined' | 'highlighted' | 'bracketed';
    spacing: 'compact' | 'normal' | 'spacious';
  };

  /**
   * primary : couleur dominante (titres, bandeau, barre latérale)
   * secondary : texte secondaire (dates, entreprises)
   * background : fond de page · text : texte courant
   * accent : touches décoratives (bordures, puces, formes)
   */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };

  fonts: {
    heading: string;
    body: string;
  };

  decorative: {
    shape: 'none' | 'dots' | 'geometric' | 'waves' | 'tech-lines';
    borderStyle: 'none' | 'solid' | 'double' | 'dashed';
    useIcons: boolean;
  };
}

export interface CVData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  /** Centres d'intérêt, en texte libre (séparés par des virgules). */
  interests: string;
  themeColor: string;
  templateId: TemplateId;
  designConfig?: DesignConfig; // Utilisé par le modèle « unique » généré par l'IA
}

export type CVUpdater = (update: (previous: CVData) => CVData) => void;
