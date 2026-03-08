import { useNavigate } from 'react-router-dom';
import { Briefcase, Zap, Award, Globe, TrendingUp, Users, ArrowRight, CheckCircle, Building2 } from 'lucide-react';

export function DukamoLanding() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-1.5 rounded-full mb-5 font-medium">
          <TrendingUp size={14} /> Ethiopia's #1 Job & Gig Marketplace
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-4 leading-tight">
          Find Work. Hire Talent.<br />
          <span className="text-blue-600">Grow Ethiopia's Economy.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Dukamo connects 60M+ Ethiopian job seekers with employers and gig opportunities — local and from the diaspora.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/dukamo/jobs')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors">
            <Briefcase size={18} /> Browse Jobs <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/dukamo/gigs')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors">
            <Zap size={18} /> Find Gig Work
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '134M', label: 'Ethiopians', sub: 'Total addressable market' },
          { value: '40%', label: 'Youth Unemployed', sub: 'Opportunity gap to close' },
          { value: '$5B', label: 'Remittances/yr', sub: 'Diaspora sending money home' },
          { value: '0', label: 'Dominant Rival', sub: 'First-mover advantage' },
        ].map(s => (
          <div key={s.label} className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Everything on One Platform</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Briefcase, title: 'Job Board', desc: 'Full-time, part-time, contract — search 1000s of Ethiopian job listings', color: 'blue', path: '/dukamo/jobs' },
            { icon: Zap, title: 'Gig Marketplace', desc: 'Short-term tasks for skilled workers — post, bid, get paid fast', color: 'violet', path: '/dukamo/gigs' },
            { icon: Award, title: 'Skills Badges', desc: 'Earn verified credentials that employers trust — free and paid certifications', color: 'amber', path: '/dukamo/skills' },
            { icon: Globe, title: 'Diaspora Hub', desc: 'Ethiopian diaspora: hire local talent or support family from abroad', color: 'emerald', path: '/dukamo/diaspora' },
          ].map(f => {
            const Icon = f.icon;
            const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 border-blue-200', violet: 'bg-violet-100 text-violet-600 border-violet-200', amber: 'bg-amber-100 text-amber-600 border-amber-200', emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
            const btn: Record<string, string> = { blue: 'bg-blue-600 hover:bg-blue-700', violet: 'bg-violet-600 hover:bg-violet-700', amber: 'bg-amber-500 hover:bg-amber-600', emerald: 'bg-emerald-600 hover:bg-emerald-700' };
            return (
              <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-4 ${colors[f.color]}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 flex-1">{f.desc}</p>
                <button onClick={() => navigate(f.path)} className={`mt-4 w-full py-2 text-sm text-white font-medium rounded-lg transition-colors ${btn[f.color]}`}>
                  Explore →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Create Profile', desc: 'Sign up and build your worker or employer profile in minutes. Add skills, experience, and portfolio.' },
            { step: '2', title: 'Browse or Post', desc: 'Job seekers browse and apply. Employers post openings and review candidates. Gig workers bid on tasks.' },
            { step: '3', title: 'Get Paid', desc: 'Get hired or win a bid. Receive payment via TeleBirr, CBE Birr, or bank transfer.' },
          ].map(h => (
            <div key={h.step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{h.step}</div>
              <h3 className="font-bold text-lg mb-2">{h.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why trust */}
      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-5">Why Thousands Will Choose Dukamo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'No dominant competitor — first mover advantage',
            'Works on basic smartphones and slow internet',
            'Amharic + English language support',
            'TeleBirr & CBE Birr payment integration ready',
            'Diaspora can hire from anywhere in the world',
            'Verified skill badges build trust between parties',
            'Free to browse — employers pay only to post',
            '8–12% gig commission — transparent, no hidden fees',
          ].map(p => (
            <div key={p} className="flex items-start gap-2">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-600">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Join Ethiopia's Future?</h2>
        <p className="text-slate-500 mb-6">Join the platform that's opening opportunities for all Ethiopians</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/dukamo/dashboard/worker')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl">
            <Users size={16} /> I'm Looking for Work
          </button>
          <button onClick={() => navigate('/dukamo/dashboard/employer')} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-7 py-3 rounded-xl">
            <Building2 size={16} /> I'm Hiring
          </button>
        </div>
      </div>
    </div>
  );
}
