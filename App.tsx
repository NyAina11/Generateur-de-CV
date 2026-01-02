import React, { useState } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { CVData, TemplateId } from './types';
import { LayoutTemplate, Sparkles, Printer, FileText, Columns, Sidebar, Palette, X, Lightbulb } from 'lucide-react';
import { generateUniqueDesign } from './services/gemini';

const initialData: CVData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  themeColor: '#2563eb',
  templateId: 'modern'
};

const SUGGESTIONS = [
  "Minimaliste, noir et blanc, police clean",
  "Professionnel, bleu marine, avec sidebar",
  "Créatif, couleurs pastel, layout grille",
  "Élégant, vert forêt, police avec serif",
  "Tech, mode sombre, police monospace"
];

function App() {
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [showDesignDialog, setShowDesignDialog] = useState(false);
  const [designPrompt, setDesignPrompt] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const changeTheme = (color: string) => {
    setCvData({ ...cvData, themeColor: color });
  };

  const changeTemplate = (id: TemplateId) => {
    setCvData({ ...cvData, templateId: id });
  };

  const openDesignDialog = () => {
    if (cvData.personal.jobTitle && !designPrompt) {
      setDesignPrompt(`Un design professionnel pour un ${cvData.personal.jobTitle}...`);
    }
    setShowDesignDialog(true);
  };

  const applySuggestion = (text: string) => {
    setDesignPrompt(text);
  };

  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) return;
    
    setIsGeneratingDesign(true);
    try {
      const design = await generateUniqueDesign(designPrompt);
      setCvData({
        ...cvData,
        templateId: 'unique',
        designConfig: design
      });
      setShowDesignDialog(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération du design. Vérifiez votre clé API ou réessayez.");
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden relative">
      
      {/* Design Prompt Modal */}
      {showDesignDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-slate-200">
            <button 
              onClick={() => setShowDesignDialog(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2.5 rounded-xl">
                <Palette className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Design IA Personnalisé</h3>
                <p className="text-xs text-slate-500 font-medium">Propulsé par Gemini 3 Flash</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Décrivez votre style idéal
              </label>
              <textarea
                autoFocus
                className="w-full h-28 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 resize-none shadow-sm text-sm"
                placeholder="Ex: Je veux quelque chose de très épuré, avec beaucoup d'espace blanc, des titres en gras et une touche de jaune électrique."
                value={designPrompt}
                onChange={(e) => setDesignPrompt(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                <Lightbulb className="w-3 h-3" /> Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(sug)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button 
                onClick={() => setShowDesignDialog(false)}
                className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleGenerateDesign}
                disabled={isGeneratingDesign || !designPrompt.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGeneratingDesign ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Générer le Design
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - No Print */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-20 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white">
             <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">CV Forge AI</h1>
        </div>
        
        <div className="flex items-center gap-6">
          
          {/* Template Selector */}
          <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
            <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1">
              <LayoutTemplate className="w-3 h-3" /> Modèle
            </span>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button 
                onClick={() => changeTemplate('modern')} 
                className={`p-1.5 rounded-md transition-all ${cvData.templateId === 'modern' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Moderne"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button 
                onClick={() => changeTemplate('classic')} 
                className={`p-1.5 rounded-md transition-all ${cvData.templateId === 'classic' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Classique"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={() => changeTemplate('elegant')} 
                className={`p-1.5 rounded-md transition-all ${cvData.templateId === 'elegant' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Élégant"
              >
                <Sidebar className="w-4 h-4" />
              </button>
              
              {/* AI Design Button integrated in selector */}
              <button 
                onClick={openDesignDialog} 
                className={`p-1.5 rounded-md transition-all ${cvData.templateId === 'unique' ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md hover:shadow-lg'}`}
                title="Créer un design unique avec l'IA"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme Selector (Only for preset templates) */}
          {cvData.templateId !== 'unique' && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <span className="text-xs font-medium text-slate-500 uppercase">Thème</span>
              <button onClick={() => changeTheme('#2563eb')} className="w-5 h-5 rounded-full bg-blue-600 border border-slate-200 hover:scale-110 transition-transform"></button>
              <button onClick={() => changeTheme('#059669')} className="w-5 h-5 rounded-full bg-emerald-600 border border-slate-200 hover:scale-110 transition-transform"></button>
              <button onClick={() => changeTheme('#dc2626')} className="w-5 h-5 rounded-full bg-red-600 border border-slate-200 hover:scale-110 transition-transform"></button>
              <button onClick={() => changeTheme('#1e293b')} className="w-5 h-5 rounded-full bg-slate-800 border border-slate-200 hover:scale-110 transition-transform"></button>
            </div>
          )}
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 ml-2"
          >
            <Printer className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Editor */}
        <div className="w-full lg:w-5/12 h-full bg-white z-10 no-print shadow-2xl">
          <Editor data={cvData} onChange={setCvData} />
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full lg:w-7/12 h-full bg-slate-200/50 flex justify-center overflow-auto relative custom-scrollbar">
           <div className="transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 origin-top transition-transform duration-300 mt-8 mb-20">
             <Preview data={cvData} />
           </div>
        </div>
      </main>
    </div>
  );
}

export default App;