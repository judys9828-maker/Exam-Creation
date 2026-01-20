
import React, { useState, useCallback } from 'react';
import { 
  GradeLevel, 
  Language, 
  ExamFormData, 
  Exam 
} from './types';
import { generateExam } from './services/geminiService';
import ExamPreview from './components/ExamPreview';

const App: React.FC = () => {
  const [formData, setFormData] = useState<ExamFormData>({
    topic: '',
    gradeLevel: 'Grade 4',
    itemCount: 20,
    language: 'Tagalog',
    questionType: 'Multiple Choice'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  const gradeLevels: GradeLevel[] = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 
    'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'itemCount' ? Math.min(50, Math.max(5, parseInt(value) || 0)) : value
    }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError("Paki-lagay ang paksa (Topic is required).");
      return;
    }

    setError(null);
    setIsLoading(true);
    setExam(null);
    setRawOutput(null);

    try {
      const result = await generateExam(formData);
      setExam(result);
    } catch (err: any) {
      console.error(err);
      setError("May mali sa pag-generate. Subukan muli.");
      if (err.response?.text) {
        setRawOutput(err.response.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      topic: '',
      gradeLevel: 'Grade 4',
      itemCount: 20,
      language: 'Tagalog',
      questionType: 'Multiple Choice'
    });
    setExam(null);
    setError(null);
    setRawOutput(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy.");
    }
  };

  const getExamText = useCallback(() => {
    if (!exam) return "";
    let text = `${exam.title}\n\n${exam.instructions}\n\n`;
    exam.items.forEach(item => {
      text += `${item.no}. ${item.question}\n`;
      text += `   A. ${item.choices.A}\n`;
      text += `   B. ${item.choices.B}\n`;
      text += `   C. ${item.choices.C}\n`;
      text += `   D. ${item.choices.D}\n\n`;
    });
    return text;
  }, [exam]);

  const getTOSText = useCallback(() => {
    if (!exam) return "";
    let text = `Table of Specification: ${exam.title}\n\n`;
    text += `Competency | Items | % | Placement\n`;
    text += `-----------------------------------\n`;
    exam.tos.forEach(e => {
      text += `${e.competency} | ${e.numItems} | ${e.percentage} | ${e.itemPlacement}\n`;
    });
    return text;
  }, [exam]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-10 text-center no-print">
        <h1 className="text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          <span className="bg-blue-600 text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-5a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
          </span>
          Exam Creator <span className="text-blue-600">(Simple)</span>
        </h1>
        <p className="mt-4 text-slate-600 text-lg">A4 Bond Paper Ready • Table of Specification Included</p>
      </header>

      <main className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Controls */}
        <section className="lg:w-1/4 space-y-6 no-print">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Exam Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Photosynthesis..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Grade Level</label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {gradeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Items (5-50)</label>
                <input
                  type="number"
                  name="itemCount"
                  min="5"
                  max="50"
                  value={formData.itemCount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Tagalog">Tagalog</option>
                  <option value="English">English</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Generate Exam"}
                </button>
                <button
                  onClick={handleClear}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>

            {exam && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / Save PDF
                </button>
                <button onClick={() => copyToClipboard(getTOSText())} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 rounded flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy TOS
                </button>
                <button onClick={() => copyToClipboard(getExamText())} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 rounded flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy Questions
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Output Area */}
        <section className="lg:w-3/4">
          {!exam && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[500px] border-4 border-dashed border-slate-200 rounded-3xl bg-slate-50 p-12 text-center no-print">
              <div className="w-24 h-24 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Ready to create?</h3>
              <p className="text-slate-500 mt-2 max-w-sm">Just fill in the topic and grade level to generate a complete exam pack.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[500px] no-print">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-bold text-slate-800">Drafting Exam & Table of Specification...</p>
              <p className="text-slate-500 mt-2">Our AI is designing items for {formData.gradeLevel}</p>
            </div>
          )}

          {exam && <ExamPreview exam={exam} />}

          {rawOutput && (
            <div className="mt-8 no-print p-4 bg-slate-50 rounded-lg">
              <details>
                <summary className="text-xs text-slate-400 cursor-pointer">Debug Data</summary>
                <pre className="mt-2 text-[10px] overflow-auto max-h-40">{rawOutput}</pre>
              </details>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm no-print">
        <p>&copy; {new Date().getFullYear()} Exam Creator (Simple). Optimized for Classroom Standards.</p>
      </footer>
    </div>
  );
};

export default App;
