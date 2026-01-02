export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
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

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export type TemplateId = 'modern' | 'classic' | 'elegant' | 'unique';

export interface DesignConfig {
  layout: 'sidebar-left' | 'sidebar-right' | 'single-column' | 'minimal-grid' | 'asymmetric';
  
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
  themeColor: string;
  templateId: TemplateId;
  designConfig?: DesignConfig; // Added for the 'unique' template
}

export type SectionType = 'personal' | 'experience' | 'education' | 'skills';

export enum AIActionType {
  GENERATE_SUMMARY = 'GENERATE_SUMMARY',
  IMPROVE_EXPERIENCE = 'IMPROVE_EXPERIENCE',
}