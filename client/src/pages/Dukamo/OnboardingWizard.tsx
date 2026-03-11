import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, Briefcase, Users, Globe, MapPin } from 'lucide-react';
import { apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const COUNTRIES = ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania', 'Somalia', 'Other'];
const INDUSTRIES = ['Technology', 'Construction', 'Healthcare', 'Education', 'Hospitality', 'Finance', 'Agriculture', 'Logistics', 'Creative Arts', 'Other'];
const SKILLS_LIST = ['Driving', 'Plumbing', 'Electrician', 'Carpentry', 'Masonry', 'IT Support', 'Web Development', 'Graphic Design', 'Teaching', 'Nursing', 'Accounting', 'Marketing', 'Customer Service', 'Cooking', 'Tailoring', 'Photography'];

export function OnboardingWizard() {
  const { user, refreshUser } = useAuth() as any;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const isWorker = user?.role === 'worker';
  const totalSteps = 3;

  const [workerForm, setWorkerForm] = useState({
    bio: '', location: '', country: 'Ethiopia', skills: [] as string[],
    experience_years: '0', hourly_rate: '', currency: 'ETB',
    open_to_remote_international: false, english_level: 'basic',
  });
  const [employerForm, setEmployerForm] = useState({
    company_name: '', industry: '', location: '', country: 'Ethiopia',
    website: '', description: '',
  });

  function toggleSkill(skill: string) {
    setWorkerForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));
  }

  async function finish() {
    setSaving(true);
    try {
      if (isWorker) {
        await apiPost('/api/worker-profiles', {
          ...workerForm,
          skills: workerForm.skills.join(', '),
          experience_years: parseInt(workerForm.experience_years) || 0,
          hourly_rate: workerForm.hourly_rate ? parseFloat(workerForm.hourly_rate) : null,
        });
      } else {
        await apiPost('/api/employer-profiles', employerForm);
      }
      // Mark profile complete
      await apiPut('/api/auth/me', { profile_complete: true });
      if (refreshUser) await refreshUser();
      navigate('/');
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            {isWorker ? <Users size={13} /> : <Briefcase size={13} />}
            {isWorker ? 'Worker' : 'Employer'} Setup — Step {step} of {totalSteps}
          </div>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? 'bg-emerald-500 w-12' : 'bg-slate-200 w-6'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {/* Worker Steps */}
          {isWorker && step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Tell us about yourself</h2>
                <p className="text-slate-500 text-sm mt-1">This helps employers find and trust you</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Short Bio</label>
                <textarea
                  value={workerForm.bio}
                  onChange={e => setWorkerForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Describe your experience and what you do best..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Country</label>
                  <select value={workerForm.country} onChange={e => setWorkerForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">City / Town</label>
                  <input value={workerForm.location} onChange={e => setWorkerForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Addis Ababa"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          )}

          {isWorker && step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Your skills & rate</h2>
                <p className="text-slate-500 text-sm mt-1">Select your top skills so employers can find you</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">Select Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_LIST.map(skill => (
                    <button key={skill} onClick={() => toggleSkill(skill)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${workerForm.skills.includes(skill) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400'}`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Experience (Years)</label>
                  <input type="number" min="0" value={workerForm.experience_years}
                    onChange={e => setWorkerForm(f => ({ ...f, experience_years: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Hourly Rate (Optional)</label>
                  <input type="number" min="0" placeholder="e.g. 100" value={workerForm.hourly_rate}
                    onChange={e => setWorkerForm(f => ({ ...f, hourly_rate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          )}

          {isWorker && step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">International work</h2>
                <p className="text-slate-500 text-sm mt-1">Unlock global opportunities from the diaspora and beyond</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={workerForm.open_to_remote_international}
                    onChange={e => setWorkerForm(f => ({ ...f, open_to_remote_international: e.target.checked }))}
                    className="mt-0.5 accent-emerald-600 w-4 h-4" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Globe size={14} className="text-emerald-600" /> Open to international remote work</p>
                    <p className="text-xs text-slate-500 mt-0.5">Your profile will appear in global search results for employers in US, EU, Gulf, and diaspora</p>
                  </div>
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">English Level</label>
                <select value={workerForm.english_level} onChange={e => setWorkerForm(f => ({ ...f, english_level: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="basic">Basic — I understand simple sentences</option>
                  <option value="conversational">Conversational — I can hold a conversation</option>
                  <option value="fluent">Fluent — I'm comfortable in professional settings</option>
                </select>
              </div>
            </div>
          )}

          {/* Employer Steps */}
          {!isWorker && step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Your Company</h2>
                <p className="text-slate-500 text-sm mt-1">Tell us about your business</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Company Name *</label>
                <input value={employerForm.company_name} onChange={e => setEmployerForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Addis Tech Solutions"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Industry</label>
                  <select value={employerForm.industry} onChange={e => setEmployerForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select...</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Country</label>
                  <select value={employerForm.country} onChange={e => setEmployerForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    {[...COUNTRIES, 'United States', 'United Kingdom', 'UAE', 'Germany'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {!isWorker && step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Company details</h2>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Location</label>
                <input value={employerForm.location} onChange={e => setEmployerForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Bole, Addis Ababa"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Website (Optional)</label>
                <input value={employerForm.website} onChange={e => setEmployerForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yourcompany.com"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea value={employerForm.description} onChange={e => setEmployerForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does your company do? What kind of talent are you looking for?"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3} />
              </div>
            </div>
          )}

          {!isWorker && step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">You're all set!</h2>
                <p className="text-slate-500 text-sm mt-1">Review your information before we create your profile</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2"><Briefcase size={14} className="text-emerald-600" /><span className="text-sm font-medium">{employerForm.company_name}</span></div>
                <div className="flex items-center gap-2"><Globe size={14} className="text-emerald-600" /><span className="text-sm text-slate-600">{employerForm.country}</span></div>
                {employerForm.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /><span className="text-sm text-slate-600">{employerForm.location}</span></div>}
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">Your employer profile will be created and you can start posting jobs and gigs right away!</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={!isWorker ? (step === 1 && !employerForm.company_name.trim()) : false}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                {saving ? 'Saving...' : <><CheckCircle size={16} /> Finish Setup</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
