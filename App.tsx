import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BookOpen, AlertTriangle, Brain, Sparkles, PenTool, Loader2 } from 'lucide-react';
import axios from 'axios';

interface GradingResult {
  grade: number;
  percentage: number;
  feedback: string;
  grammar_errors: number;
  vocabulary_diversity: number;
  readability_score: number;
}

function App() {
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/grade-essay', {
        essay_text: essay
      });

      setResult(response.data);
    } catch (err) {
      setError('Failed to grade essay. Please try again.');
      console.error('Error grading essay:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto py-8 w-full">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <PenTool className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">AI Essay Grading</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant, comprehensive feedback on your essays using advanced AI analysis
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="essay" className="block text-3xl text-center font-semibold text-gray-800 mb-5">
                  Your Essay
                </label>
                <textarea
                  id="essay"
                  rows={14}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-gray-700 resize-none"
                  placeholder="Paste your essay here for analysis..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={!essay.trim() || loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition duration-200 ease-in-out
                  ${loading || !essay.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Grade Essay
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <label htmlFor="essay" className="block text-3xl text-center font-semibold text-gray-800 mb-5">
              Grading And Scores
            </label>
            {result ? (
              <div className="space-y-8">
                <div className="grid gap-8">

                  <div className="grid gap-8 border rounded-lg p-[10%]">
                    <div className="flex flex-col items-center">
                      <div style={{ width: 140, height: 140 }}>
                        <CircularProgressbar
                          value={result.grade * 10}
                          maxValue={100}
                          text={`${result.grade}/10`}
                          styles={buildStyles({
                            pathColor: '#4f46e5',
                            textColor: '#4f46e5',
                            trailColor: '#e5e7eb',
                            pathTransitionDuration: 1
                          })}
                        />
                      </div>
                      <p className="mt-3 text-lg font-medium text-gray-700">Grade</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div style={{ width: 140, height: 140 }}>
                        <CircularProgressbar
                          value={result.percentage}
                          text={`${Math.round(result.percentage)}%`}
                          styles={buildStyles({
                            pathColor: '#4f46e5',
                            textColor: '#4f46e5',
                            trailColor: '#e5e7eb',
                            pathTransitionDuration: 1
                          })}
                        />
                      </div>
                      <p className="mt-3 text-lg font-medium text-gray-700">Score</p>
                    </div>
                  </div>
                </div>



              </div>

            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Submit your essay to receive detailed AI analysis and feedback
                </p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <label htmlFor="essay" className="block text-3xl text-center font-semibold text-gray-800 mb-5">
              AI Analysis and Feedback
            </label>
            {result ? (
              <div className="space-y-4">

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl transition-all hover:bg-gray-100">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Grammar Check</h3>
                      <p className="text-gray-600">{result.grammar_errors} errors found</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl transition-all hover:bg-gray-100">
                    <Brain className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Vocabulary Diversity</h3>
                      <p className="text-gray-600">{(result.vocabulary_diversity * 100).toFixed(1)}% unique words</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl transition-all hover:bg-gray-100">
                    <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Readability Score</h3>
                      <p className="text-gray-600">{result.readability_score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">AI Feedback</h3>
                      <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (<div className="h-full flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Submit your essay to receive detailed AI analysis and feedback
              </p>
            </div>)}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;