import React from 'react';
import { CVData, DesignConfig, Experience } from '../types';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface PreviewProps {
  data: CVData;
}

// --- Icons Component helper ---
const ContactItem = ({ icon: Icon, text, color, style }: { icon: any, text: string, color?: string, style?: any }) => (
  <div className="flex items-center gap-2" style={{ color, ...style }}>
    <Icon className="w-3.5 h-3.5 shrink-0" />
    <span className="text-[0.9em]">{text}</span>
  </div>
);

// --- TEMPLATE 1: MODERN ---
const ModernTemplate: React.FC<PreviewProps> = ({ data }) => {
  const themeColor = data.themeColor || '#2563eb';

  return (
    <div className="w-full h-full p-[12mm] bg-white text-slate-800">
      {/* Header */}
      <header className="border-b-2 pb-6 mb-8" style={{ borderColor: themeColor }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-2">
              {data.personal.fullName || 'Votre Nom'}
            </h1>
            <h2 className="text-xl font-medium" style={{ color: themeColor }}>
              {data.personal.jobTitle || 'Titre du poste'}
            </h2>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-1">
            {data.personal.email && <div className="flex justify-end"><ContactItem icon={Mail} text={data.personal.email} /></div>}
            {data.personal.phone && <div className="flex justify-end"><ContactItem icon={Phone} text={data.personal.phone} /></div>}
            {data.personal.location && <div className="flex justify-end"><ContactItem icon={MapPin} text={data.personal.location} /></div>}
            {data.personal.website && <div className="flex justify-end"><ContactItem icon={Globe} text={data.personal.website} /></div>}
          </div>
        </div>
        
        {data.personal.summary && (
          <p className="mt-4 text-sm text-slate-700 leading-relaxed max-w-2xl">
            {data.personal.summary}
          </p>
        )}
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
          {data.experience.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1 flex items-center gap-2" style={{ color: themeColor, borderColor: '#e2e8f0' }}>
                Expérience Professionnelle
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-800">{exp.role}</h4>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-600 mb-2">{exp.company}</div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1 flex items-center gap-2" style={{ color: themeColor, borderColor: '#e2e8f0' }}>
                Formation
              </h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{edu.school}</h4>
                      <div className="text-sm text-slate-600">{edu.degree}</div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {edu.year}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="col-span-4 space-y-8">
          {data.skills.length > 0 && (
            <section>
               <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color: themeColor, borderColor: '#e2e8f0' }}>
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span key={skill.id} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// --- TEMPLATE 2: CLASSIC ---
const ClassicTemplate: React.FC<PreviewProps> = ({ data }) => {
  return (
    <div className="w-full h-full p-[15mm] bg-white text-slate-900 font-serif">
      {/* Header */}
      <header className="text-center border-b-2 border-slate-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-2 font-serif">
          {data.personal.fullName || 'Votre Nom'}
        </h1>
        <h2 className="text-lg italic text-slate-600 mb-4 font-serif">
          {data.personal.jobTitle || 'Titre du poste'}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 text-xs font-sans text-slate-600 uppercase tracking-wider">
          {data.personal.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.personal.email}</div>}
          {data.personal.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.personal.phone}</div>}
          {data.personal.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.personal.location}</div>}
          {data.personal.website && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> {data.personal.website}</div>}
        </div>
      </header>

      {/* Summary */}
      {data.personal.summary && (
        <section className="mb-8 text-center px-8">
          <p className="text-sm leading-relaxed italic text-slate-700">
            "{data.personal.summary}"
          </p>
        </section>
      )}

      {/* Skills (Top for classic) */}
      {data.skills.length > 0 && (
        <section className="mb-8">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest mb-3 border-b border-slate-300 pb-1 font-sans">Compétences Clés</h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {data.skills.map((skill) => (
              <span key={skill.id} className="font-medium text-slate-700">• {skill.name}</span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
           <h3 className="text-left text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-800 pb-1 font-sans">Expérience</h3>
           <div className="space-y-6">
             {data.experience.map((exp) => (
               <div key={exp.id}>
                 <div className="flex justify-between items-baseline">
                   <h4 className="font-bold text-lg">{exp.role}</h4>
                   <span className="text-sm italic font-sans text-slate-600">{exp.startDate} - {exp.endDate}</span>
                 </div>
                 <div className="font-medium text-slate-700 mb-2">{exp.company}</div>
                 <div className="text-sm leading-relaxed text-slate-800 text-justify">
                   {exp.description}
                 </div>
               </div>
             ))}
           </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section>
          <h3 className="text-left text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-800 pb-1 font-sans">Formation</h3>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-md">{edu.school}</h4>
                  <div className="text-sm italic text-slate-600">{edu.degree}</div>
                </div>
                <span className="text-sm font-sans text-slate-600">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- TEMPLATE 3: ELEGANT ---
const ElegantTemplate: React.FC<PreviewProps> = ({ data }) => {
  const themeColor = data.themeColor || '#2563eb';
  
  return (
    <div className="w-full h-full bg-white flex">
      {/* Sidebar */}
      <div className="w-[32%] h-full text-white p-8 flex flex-col gap-8 print:bg-red-500" style={{ backgroundColor: themeColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        {/* Profile */}
        <div className="text-center sm:text-left">
           <div className="w-24 h-24 bg-white/20 rounded-full mx-auto sm:mx-0 mb-4 flex items-center justify-center text-4xl font-bold">
             {data.personal.fullName.charAt(0)}
           </div>
           <h1 className="text-2xl font-bold leading-tight mb-2">{data.personal.fullName}</h1>
           <p className="text-white/90 font-medium">{data.personal.jobTitle}</p>
        </div>

        {/* Contact */}
        <div className="space-y-3 text-sm text-white/90">
           {data.personal.email && <div className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0" /> {data.personal.email}</div>}
           {data.personal.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {data.personal.phone}</div>}
           {data.personal.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {data.personal.location}</div>}
           {data.personal.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 shrink-0" /> {data.personal.website}</div>}
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4 border-b border-white/20 pb-1">Compétences</h3>
            <div className="space-y-2">
              {data.skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{skill.name}</span>
                  </div>
                  <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, skill.level * 20))}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-[68%] p-8 space-y-8">
        
        {/* Summary */}
        {data.personal.summary && (
          <section>
             <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
               <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span>
               Profil
             </h3>
             <p className="text-sm text-slate-600 leading-relaxed text-justify">
               {data.personal.summary}
             </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span>
              Expériences
            </h3>
            <div className="border-l-2 border-slate-100 ml-3 space-y-8">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-8">
                  {/* Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white" style={{ backgroundColor: themeColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                  
                  <h4 className="font-bold text-slate-800 text-lg">{exp.role}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-600 text-sm">{exp.company}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span>
              Formation
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="bg-slate-50 p-4 rounded-lg border-l-4" style={{ borderColor: themeColor }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{edu.school}</h4>
                      <p className="text-sm text-slate-600">{edu.degree}</p>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-500 shadow-sm">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// --- TEMPLATE 4: UNIQUE (AI Generated Config) ---
const UniqueTemplate: React.FC<PreviewProps> = ({ data }) => {
  // Safe default config
  const config: DesignConfig = data.designConfig || {
    layout: 'single-column',
    header: { alignment: 'left', style: 'clean', nameSize: 'large' },
    sections: { style: 'clean', titleStyle: 'uppercase-bold', spacing: 'normal' },
    colors: { primary: '#000', secondary: '#444', background: '#fff', text: '#222', accent: '#ddd' },
    fonts: { heading: 'Inter', body: 'Inter' },
    decorative: { shape: 'none', borderStyle: 'none', useIcons: true }
  };

  const { colors, fonts, header, sections, layout, decorative } = config;

  // --- Styles ---
  const containerStyle = {
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.body,
  };

  const sectionSpacing = 
    sections.spacing === 'compact' ? 'space-y-4 mb-6' : 
    sections.spacing === 'spacious' ? 'space-y-10 mb-12' : 'space-y-6 mb-8';
  
  const headingFont = { fontFamily: fonts.heading };
  
  // Name Size
  const nameClass = 
    header.nameSize === 'huge' ? 'text-6xl tracking-tighter' : 
    header.nameSize === 'large' ? 'text-4xl tracking-tight' : 'text-3xl';

  // Section Title Styles
  const SectionTitle = ({ title }: { title: string }) => {
    let classes = `mb-4 ${headingFont}`;
    let style: any = { color: colors.primary, fontFamily: fonts.heading };
    let content = <>{title}</>;

    switch (sections.titleStyle) {
      case 'uppercase-bold':
        classes += ' text-sm font-bold uppercase tracking-widest';
        break;
      case 'underlined':
        classes += ' text-lg font-bold border-b-2 pb-1';
        style.borderColor = colors.accent;
        break;
      case 'highlighted':
        classes += ' text-lg font-bold inline-block px-2 py-1';
        style.backgroundColor = colors.accent;
        style.color = colors.background; // Contrast?
        if (colors.background === '#ffffff' && colors.accent.startsWith('#f')) style.color = colors.text;
        break;
      case 'bracketed':
        classes += ' text-xl font-bold text-center';
        content = <span style={{color: colors.secondary}}>[ <span style={{color: colors.primary}}>{title}</span> ]</span>;
        style = { fontFamily: fonts.heading };
        break;
      default: // simple
        classes += ' text-xl font-semibold';
        break;
    }
    return <h3 className={classes} style={style}>{content}</h3>;
  };

  // Background Decorator
  const Decorator = () => {
    if (decorative.shape === 'none') return null;
    
    const style: any = { position: 'absolute', pointerEvents: 'none', zIndex: 0 };
    
    if (decorative.shape === 'dots') {
      return (
        <div style={{ ...style, top: 0, right: 0, width: '200px', height: '200px', opacity: 0.1, backgroundImage: `radial-gradient(${colors.primary} 1px, transparent 1px)`, backgroundSize: '10px 10px' }} />
      );
    }
    if (decorative.shape === 'geometric') {
      return (
        <>
          <div style={{ ...style, top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: colors.accent, opacity: 0.1 }} />
          <div style={{ ...style, bottom: '100px', right: '-50px', width: '150px', height: '150px', transform: 'rotate(45deg)', backgroundColor: colors.primary, opacity: 0.05 }} />
        </>
      );
    }
    if (decorative.shape === 'tech-lines') {
      return (
         <div style={{ ...style, top: 0, bottom: 0, left: '20px', width: '1px', backgroundColor: colors.accent, opacity: 0.3 }}>
             <div style={{ position: 'absolute', top: '10%', left: '-2px', width: '5px', height: '5px', backgroundColor: colors.primary }}></div>
             <div style={{ position: 'absolute', bottom: '20%', left: '-2px', width: '5px', height: '5px', backgroundColor: colors.primary }}></div>
         </div>
      );
    }
    return null;
  };

  // Content Components
  const ContactInfo = ({ vertical = false }: { vertical?: boolean }) => {
    const items = [
      { i: Mail, t: data.personal.email },
      { i: Phone, t: data.personal.phone },
      { i: MapPin, t: data.personal.location },
      { i: Globe, t: data.personal.website },
    ].filter(x => x.t);

    return (
      <div className={`flex ${vertical ? 'flex-col gap-2' : 'flex-wrap gap-4'} text-sm opacity-90 mt-4`} style={{ color: colors.secondary }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
             {decorative.useIcons && <item.i className="w-3.5 h-3.5" style={{ color: colors.primary }} />}
             <span>{item.t}</span>
          </div>
        ))}
      </div>
    );
  };

  const Header = () => {
    const alignClass = header.alignment === 'center' ? 'text-center items-center' : header.alignment === 'right' ? 'text-right items-end' : 'text-left items-start';
    
    let containerClass = `flex flex-col ${alignClass} mb-10 relative z-10`;
    let bgStyle = {};

    if (header.style === 'banner') {
      containerClass += ' p-8 -mx-12 -mt-12 mb-12';
      bgStyle = { backgroundColor: colors.primary, color: colors.background };
    } else if (header.style === 'floating-box') {
      containerClass += ' p-8 bg-white shadow-lg rounded-xl mb-12';
      // Invert text color if primary is used as bg
      if (colors.background !== '#ffffff') bgStyle = { backgroundColor: '#ffffff', color: '#000' };
    } else if (header.style === 'underlined') {
        containerClass += ' border-b-2 pb-6';
        bgStyle = { borderColor: colors.accent };
    }

    const textColor = header.style === 'banner' ? colors.background : colors.text;

    return (
      <header className={containerClass} style={bgStyle}>
         <h1 className={`${nameClass} font-bold leading-none mb-2`} style={{ fontFamily: fonts.heading, color: header.style === 'banner' ? 'white' : colors.text }}>
           {data.personal.fullName}
         </h1>
         <p className="text-xl font-medium opacity-90" style={{ color: header.style === 'banner' ? 'rgba(255,255,255,0.8)' : colors.primary }}>
           {data.personal.jobTitle}
         </p>
         
         {layout !== 'sidebar-left' && layout !== 'sidebar-right' && (
           <div className={`mt-4 ${header.alignment === 'center' ? 'flex justify-center' : header.alignment === 'right' ? 'flex justify-end' : ''}`}>
             <ContactInfo vertical={false} />
           </div>
         )}
         
         {/* Summary in header for single column layouts sometimes looks good */}
         {data.personal.summary && layout === 'single-column' && header.alignment === 'center' && (
             <p className="mt-6 max-w-lg opacity-80 text-sm leading-relaxed">{data.personal.summary}</p>
         )}
      </header>
    );
  };

  const ExperienceItem: React.FC<{ exp: Experience }> = ({ exp }) => {
    if (sections.style === 'cards') {
      return (
        <div className="p-5 rounded-lg border border-transparent shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: colors.background === '#ffffff' ? '#f8fafc' : 'rgba(255,255,255,0.05)', borderColor: colors.accent + '40' }}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg" style={{ color: colors.text }}>{exp.role}</h4>
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>{exp.startDate} - {exp.endDate}</span>
          </div>
          <div className="font-medium text-sm mb-3" style={{ color: colors.secondary }}>{exp.company}</div>
          <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
        </div>
      );
    }
    
    if (sections.style === 'timeline') {
        return (
            <div className="relative pl-6 border-l-2" style={{ borderColor: colors.accent }}>
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                <h4 className="font-bold text-lg leading-none mb-1" style={{ color: colors.text }}>{exp.role}</h4>
                <div className="text-sm mb-2 opacity-70" style={{ color: colors.secondary }}>{exp.company} | {exp.startDate} - {exp.endDate}</div>
                <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
            </div>
        )
    }

    // Default clean/left-border
    return (
      <div className={`mb-6 ${sections.style === 'left-border' ? 'border-l-4 pl-4' : ''}`} style={{ borderColor: colors.primary }}>
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
            <h4 className="font-bold text-lg" style={{ color: colors.text }}>{exp.role}</h4>
            <span className="text-sm font-medium opacity-60" style={{ color: colors.secondary }}>{exp.startDate} - {exp.endDate}</span>
         </div>
         <div className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>{exp.company}</div>
         <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">{exp.description}</p>
      </div>
    );
  };

  const Sidebar = () => (
    <div className={`h-full flex flex-col gap-8 ${layout === 'sidebar-left' || layout === 'asymmetric' ? 'pr-6' : 'pl-6'}`} style={{ color: layout === 'asymmetric' ? colors.text : 'inherit' }}>
       
       {/* Contact in Sidebar if layout demands */}
       {(layout === 'sidebar-left' || layout === 'sidebar-right' || layout === 'asymmetric') && (
         <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">Contact</h3>
            <ContactInfo vertical={true} />
         </div>
       )}

       {data.personal.summary && (layout === 'sidebar-left' || layout === 'sidebar-right') && (
         <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Profil</h3>
            <p className="text-sm leading-relaxed opacity-90">{data.personal.summary}</p>
         </div>
       )}

       {data.skills.length > 0 && (
         <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(skill => (
                <span key={skill.id} className="px-2 py-1 text-xs rounded border bg-opacity-10" style={{ borderColor: colors.accent, backgroundColor: colors.accent, color: colors.text }}>
                  {skill.name}
                </span>
              ))}
            </div>
         </div>
       )}

       {data.education.length > 0 && (layout.includes('sidebar') || layout === 'asymmetric') && (
         <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">Formation</h3>
            <div className="space-y-4">
              {data.education.map(edu => (
                <div key={edu.id}>
                  <div className="font-bold text-sm">{edu.school}</div>
                  <div className="text-xs opacity-80">{edu.degree}</div>
                  <div className="text-xs opacity-50">{edu.year}</div>
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  );

  // --- Layout Renderers ---
  
  if (layout === 'sidebar-left') {
    return (
      <div className="flex w-full h-full relative overflow-hidden" style={containerStyle}>
        <Decorator />
        <div className="w-[30%] p-8 min-h-full relative z-10" style={{ backgroundColor: colors.secondary, color: colors.background }}>
           <Sidebar />
        </div>
        <div className="w-[70%] p-12 relative z-10">
           <Header />
           <div className={sectionSpacing}>
              {data.experience.length > 0 && (
                <section>
                  <SectionTitle title="Expérience" />
                  <div className="space-y-6">
                    {data.experience.map(exp => <ExperienceItem key={exp.id} exp={exp} />)}
                  </div>
                </section>
              )}
           </div>
        </div>
      </div>
    );
  }

  if (layout === 'sidebar-right') {
     return (
      <div className="flex w-full h-full relative overflow-hidden" style={containerStyle}>
        <Decorator />
        <div className="w-[70%] p-12 relative z-10">
           <Header />
            <div className={sectionSpacing}>
              {data.experience.length > 0 && (
                <section>
                  <SectionTitle title="Expérience" />
                  <div className="space-y-6">
                    {data.experience.map(exp => <ExperienceItem key={exp.id} exp={exp} />)}
                  </div>
                </section>
              )}
           </div>
        </div>
        <div className="w-[30%] p-8 min-h-full border-l relative z-10" style={{ borderColor: colors.accent, backgroundColor: colors.background === '#ffffff' ? '#fcfcfc' : 'rgba(0,0,0,0.02)' }}>
           <Sidebar />
        </div>
      </div>
    );
  }

  if (layout === 'minimal-grid') {
    return (
      <div className="p-12 w-full h-full relative overflow-hidden" style={containerStyle}>
         <Decorator />
         <Header />
         <div className="grid grid-cols-12 gap-10 mt-8 relative z-10">
            <div className="col-span-4">
               <div className="mb-8">
                  <SectionTitle title="Profil" />
                  <p className="text-sm opacity-80 leading-relaxed">{data.personal.summary}</p>
               </div>
               <div className="mb-8">
                  <SectionTitle title="Compétences" />
                   <div className="space-y-2">
                    {data.skills.map(skill => (
                      <div key={skill.id} className="flex justify-between items-center text-sm border-b pb-1" style={{ borderColor: colors.accent }}>
                        <span>{skill.name}</span>
                        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full" style={{ width: `${skill.level * 20}%`, backgroundColor: colors.primary }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div>
                  <SectionTitle title="Formation" />
                  <div className="space-y-4">
                    {data.education.map(edu => (
                      <div key={edu.id}>
                        <div className="font-bold text-sm">{edu.school}</div>
                        <div className="text-xs opacity-70">{edu.degree}</div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            <div className="col-span-8">
               <SectionTitle title="Expérience" />
               <div className="space-y-8 mt-6">
                  {data.experience.map(exp => <ExperienceItem key={exp.id} exp={exp} />)}
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (layout === 'asymmetric') {
    return (
      <div className="w-full h-full relative overflow-hidden p-12" style={containerStyle}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', backgroundColor: colors.accent, opacity: 0.1, zIndex: 0 }}></div>
        <Decorator />
        
        <div className="relative z-10 grid grid-cols-3 gap-12">
            <div className="col-span-2">
                <h1 className={`${nameClass} font-black mb-2 leading-none`} style={{ color: colors.primary, fontFamily: fonts.heading }}>{data.personal.fullName}</h1>
                <p className="text-xl font-bold mb-8" style={{ color: colors.secondary }}>{data.personal.jobTitle}</p>
                
                {data.personal.summary && <p className="text-sm mb-12 opacity-80 border-l-4 pl-4" style={{ borderColor: colors.primary }}>{data.personal.summary}</p>}

                <SectionTitle title="Expérience Professionnelle" />
                <div className="space-y-8 mt-6">
                   {data.experience.map(exp => <ExperienceItem key={exp.id} exp={exp} />)}
                </div>
            </div>

            <div className="col-span-1 pt-20">
                <div className="bg-white/50 p-6 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
                   <Sidebar />
                </div>
            </div>
        </div>
      </div>
    )
  }

  // Default Single Column (Classic but flexible)
  return (
    <div className="p-[12mm] w-full h-full relative overflow-hidden" style={containerStyle}>
       <Decorator />
       <div className="relative z-10 max-w-3xl mx-auto">
         <Header />
         
         <div className={sectionSpacing}>
            {data.experience.length > 0 && (
              <section>
                 <SectionTitle title="Expérience" />
                 <div className="space-y-8">
                   {data.experience.map(exp => <ExperienceItem key={exp.id} exp={exp} />)}
                 </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-8 mt-8">
               {data.education.length > 0 && (
                 <section>
                    <SectionTitle title="Formation" />
                    <div className="space-y-4">
                      {data.education.map(edu => (
                        <div key={edu.id} className="border-l-2 pl-3" style={{ borderColor: colors.accent }}>
                          <div className="font-bold text-sm">{edu.school}</div>
                          <div className="text-xs opacity-70">{edu.degree}</div>
                          <div className="text-xs opacity-50">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                 </section>
               )}
               
               {data.skills.length > 0 && (
                 <section>
                    <SectionTitle title="Compétences" />
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map(skill => (
                        <span key={skill.id} className="text-sm font-medium border-b border-transparent hover:border-current transition-colors">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                 </section>
               )}
            </div>
         </div>
       </div>
    </div>
  );
};


const Preview: React.FC<PreviewProps> = ({ data }) => {
  const renderTemplate = () => {
    switch (data.templateId) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'elegant':
        return <ElegantTemplate data={data} />;
      case 'unique':
        return <UniqueTemplate data={data} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className="w-full h-full flex justify-center p-8 bg-slate-100 overflow-y-auto no-print">
      <div 
        id="cv-preview"
        className="bg-white shadow-2xl print-container print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: 'auto', 
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

export default Preview;