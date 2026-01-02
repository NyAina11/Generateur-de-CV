import React, { useState } from 'react';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp, Briefcase, GraduationCap, User, Wrench } from 'lucide-react';
import { CVData, Experience, Education, Skill } from '../types';
import { generateSummary, improveExperienceDescription } from '../services/gemini';

interface EditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updatePersonal = (field: string, value: string) => {
    onChange({
      ...data,
      personal: { ...data.personal, [field]: value }
    });
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp);
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(e => e.id !== id) });
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      year: ''
    };
    onChange({ ...data, education: [newEdu, ...data.education] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu);
    onChange({ ...data, education: updated });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  // --- Skills Handlers ---
  const addSkill = () => {
    const newSkill: Skill = { id: crypto.randomUUID(), name: '', level: 4 };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    const updated = data.skills.map(s => s.id === id ? { ...s, [field]: value } : s);
    onChange({ ...data, skills: updated });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  // --- AI Handlers ---
  const handleGenerateSummary = async () => {
    if (!data.personal.jobTitle) {
      alert("Veuillez d'abord entrer un titre de poste.");
      return;
    }
    setAiLoading('summary');
    try {
      const summary = await generateSummary(data.personal.jobTitle, "Expérimenté, motivé, professionnel");
      updatePersonal('summary', summary);
    } catch (e) {
      alert("Erreur lors de la génération IA");
    } finally {
      setAiLoading(null);
    }
  };

  const handleImproveExperience = async (id: string, description: string, role: string) => {
    if (!description || !role) return;
    setAiLoading(`exp-${id}`);
    try {
      const improved = await improveExperienceDescription(description, role);
      updateExperience(id, 'description', improved);
    } catch (e) {
      alert("Erreur IA");
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-white shadow-xl lg:rounded-r-3xl z-10 relative custom-scrollbar">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <span className="bg-slate-900 text-white p-2 rounded-lg text-sm">EDIT</span>
        Éditeur de CV
      </h2>

      <div className="space-y-4">
        {/* Personal Info */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button 
            onClick={() => toggleSection('personal')}
            className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <User className="w-5 h-5 text-indigo-600" />
              Infos Personnelles
            </div>
            {activeSection === 'personal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {activeSection === 'personal' && (
            <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Nom complet" 
                  className="input-field"
                  value={data.personal.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                />
                <input 
                  type="text" placeholder="Titre du poste (ex: Développeur Full Stack)" 
                  className="input-field"
                  value={data.personal.jobTitle}
                  onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                />
                <input 
                  type="email" placeholder="Email" 
                  className="input-field"
                  value={data.personal.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                />
                <input 
                  type="tel" placeholder="Téléphone" 
                  className="input-field"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal('phone', e.target.value)}
                />
                <input 
                  type="text" placeholder="Ville, Pays" 
                  className="input-field"
                  value={data.personal.location}
                  onChange={(e) => updatePersonal('location', e.target.value)}
                />
                <input 
                  type="text" placeholder="Site web / LinkedIn" 
                  className="input-field"
                  value={data.personal.website}
                  onChange={(e) => updatePersonal('website', e.target.value)}
                />
              </div>
              
              <div className="relative mt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Résumé Professionnel</label>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={aiLoading === 'summary'}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
                  >
                    <Wand2 className="w-3 h-3" />
                    {aiLoading === 'summary' ? 'Génération...' : 'Générer avec IA'}
                  </button>
                </div>
                <textarea 
                  rows={4}
                  placeholder="Bref résumé de votre profil..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={data.personal.summary}
                  onChange={(e) => updatePersonal('summary', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button 
            onClick={() => toggleSection('experience')}
            className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center gap-2 font-semibold text-slate-700">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Expérience
            </div>
            {activeSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {activeSection === 'experience' && (
            <div className="p-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative p-4 bg-slate-50 rounded-lg border border-slate-200 group">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input 
                      type="text" placeholder="Entreprise" className="input-field"
                      value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <input 
                      type="text" placeholder="Rôle" className="input-field"
                      value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    />
                    <div className="flex gap-2">
                       <input 
                        type="text" placeholder="Début (ex: 2020)" className="input-field"
                        value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                       <input 
                        type="text" placeholder="Fin (ex: Présent)" className="input-field"
                        value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                   <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-500">Description</label>
                      <button 
                        onClick={() => handleImproveExperience(exp.id, exp.description, exp.role)}
                        disabled={aiLoading === `exp-${exp.id}` || !exp.description}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
                      >
                        <Wand2 className="w-3 h-3" />
                         {aiLoading === `exp-${exp.id}` ? 'Reformulation...' : 'Améliorer'}
                      </button>
                    </div>
                    <textarea 
                      rows={3}
                      placeholder="Décrivez vos tâches et accomplissements..."
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={addExperience}
                className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" /> Ajouter une expérience
              </button>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button 
            onClick={() => toggleSection('education')}
            className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center gap-2 font-semibold text-slate-700">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Formation
            </div>
            {activeSection === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {activeSection === 'education' && (
             <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
               {data.education.map((edu) => (
                 <div key={edu.id} className="relative p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-3">
                    <button 
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input 
                      type="text" placeholder="École / Université" className="input-field"
                      value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" placeholder="Diplôme" className="input-field"
                        value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      />
                      <input 
                        type="text" placeholder="Année" className="input-field"
                        value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                      />
                    </div>
                 </div>
               ))}
               <button 
                onClick={addEducation}
                className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" /> Ajouter une formation
              </button>
             </div>
          )}
        </div>

        {/* Skills */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button 
            onClick={() => toggleSection('skills')}
            className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center gap-2 font-semibold text-slate-700">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Compétences
            </div>
            {activeSection === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {activeSection === 'skills' && (
             <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-3">
                 {data.skills.map(skill => (
                   <div key={skill.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                     <div className="flex-1">
                        <input 
                          className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none text-sm py-1 mb-2"
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                          placeholder="Compétence (ex: React)"
                        />
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase w-10">Niveau {skill.level}/5</span>
                           <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            step="1"
                            value={skill.level}
                            onChange={(e) => updateSkill(skill.id, 'level', parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                           />
                        </div>
                     </div>
                     <button onClick={() => removeSkill(skill.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
               <button 
                onClick={addSkill}
                className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 font-medium mt-2"
              >
                <Plus className="w-4 h-4" /> Ajouter une compétence
              </button>
             </div>
          )}
        </div>
      </div>
      
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Editor;