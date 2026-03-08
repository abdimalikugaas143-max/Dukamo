import { useNavigate } from 'react-router-dom';
import { Globe, DollarSign, Users, Briefcase, Zap, ArrowRight, Heart } from 'lucide-react';

export function DiasporaHub() {
  const navigate = useNavigate();

  const benefits = [
    { icon: DollarSign, title: 'Pay in USD/EUR', desc: 'Pay in your local currency — workers receive in ETB via TeleBirr or bank transfer', color: 'emerald' },
    { icon: Users, title: 'Verified Talent', desc: 'All workers have verified profiles, skill badges, and public reviews from previous clients', color: 'blue' },
    { icon: Globe, title: 'Fully Remote', desc: 'Filter by remote-ready workers — software, design, finance, admin, data entry and more', color: 'violet' },
    { icon: Heart, title: 'Impact at Home', desc: 'Every hire creates income for Ethiopian families and builds the local digital economy', color: 'rose' },
  ];

  const useCases = [
    { title: 'Hire a Developer', cat: 'technology', desc: 'Full-stack, mobile, data science — Ethiopian tech talent at fraction of Western rates' },
    { title: 'Design & Branding', cat: 'design', desc: 'Logo, UI/UX, social media graphics — quality creative work delivered remotely' },
    { title: 'Pay Family Bills', cat: 'finance', desc: 'Post a task for a local agent to pay utility bills, school fees, or medical costs' },
    { title: 'Construction Supervision', cat: 'construction', desc: 'Hire a trusted local supervisor to oversee your property construction back home' },
    { title: 'Virtual Assistant', cat: 'education', desc: 'Admin support, scheduling, customer service — English-speaking VAs available' },
    { title: 'Legal & Accounting', cat: 'finance', desc: 'Local lawyers and accountants for business registration, tax filing, property docs' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={20} />
            <span className="text-emerald-200 font-medium text-sm">Diaspora Hub</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Hire Ethiopian Talent. Support Back Home.</h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Connect with skilled professionals in Ethiopia — developers, designers, builders, legal experts.
            Pay in USD or ETB. 100% remote or local.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/dukamo/gigs/post')} className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50">
              <Zap size={16} /> Post a Task <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate('/dukamo/jobs/post')} className="flex items-center gap-2 bg-blue-800/40 text-white font-medium px-5 py-2.5 rounded-lg border border-blue-400/30 hover:bg-blue-800/60">
              <Briefcase size={16} /> Post a Job
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Ethiopia Population', value: '134M', sub: 'Potential users' },
          { label: 'Diaspora Worldwide', value: '3M+', sub: 'In high-income countries' },
          { label: 'Annual Remittances', value: '$5B', sub: 'Flowing home yearly' },
          { label: 'Youth Unemployment', value: '40%', sub: 'Skilled talent available' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Why Dukamo for diaspora */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Why Hire Through Dukamo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map(b => {
            const Icon = b.icon;
            const colors: Record<string, string> = { emerald: 'bg-emerald-100 text-emerald-600', blue: 'bg-blue-100 text-blue-600', violet: 'bg-violet-100 text-violet-600', rose: 'bg-rose-100 text-rose-600' };
            return (
              <div key={b.title} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[b.color]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{b.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular use cases */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Popular for Diaspora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map(uc => (
            <div key={uc.title} className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all" onClick={() => navigate(`/dukamo/gigs?category=${uc.cat}`)}>
              <h3 className="font-semibold text-slate-800">{uc.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{uc.desc}</p>
              <span className="text-blue-600 text-sm font-medium mt-3 flex items-center gap-1">Browse tasks <ArrowRight size={14} /></span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-800 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
        <p className="text-slate-400 mb-5">Post a task in 2 minutes. Get bids within hours.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => navigate('/dukamo/gigs/post')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg">Post a Gig Task</button>
          <button onClick={() => navigate('/dukamo/jobs')} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg border border-slate-600">Browse Workers</button>
        </div>
      </div>
    </div>
  );
}
