import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roleKey = (role: string) => role.trim().toLowerCase().replace(/\s+/g, ' ');

const roleContent = {
  operator: {
    title: 'Production workspace',
    description: 'Create tyre production entries and keep a clear history of your own work.',
    action: 'Create production entry',
    link: '/excursions',
    items: ['New production entry', 'My entry history'],
  },
  leader: {
    title: 'Business intelligence',
    description: 'Review production performance and reports across your business unit.',
    action: 'Open reports',
    link: '/tracking',
    items: ['Production overview', 'Business unit reports'],
  },
  quality: {
    title: 'Quality control centre',
    description: 'Register sales, edit production records, and follow every change in the audit log.',
    action: 'Open quality workspace',
    link: '/payments',
    items: ['Sales records', 'Production history', 'Audit log'],
  },
} as const;

function getRoleContent(role: string) {
  const normalized = roleKey(role);
  if (normalized.includes('product') || normalized.includes('operator')) return roleContent.operator;
  if (normalized.includes('business') || normalized.includes('leader')) return roleContent.leader;
  if (normalized.includes('quality') || normalized.includes('supervisor')) return roleContent.quality;
  return null;
}

export default function HomePage() {
  const { username, role, isLogedIn: isLoggedIn } = useAuth();
  const workspace = getRoleContent(role);

  return (
    <section className="space-y-8" aria-label="Shared home page">
      <div className="grid gap-6 overflow-hidden border border-[#183b70]/10 bg-[#183b70] text-white lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative px-7 py-10 sm:px-10 sm:py-14">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#e4002b] [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)] opacity-90" />
          <div className="relative max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5c400]">Michelin TMS portal</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl">Move every tyre forward.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-blue-100">One shared space for production, quality, sales, and business-unit decisions.</p>
            {!isLoggedIn && <p className="mt-8 text-sm font-semibold text-white/80">Sign in to access your role workspace.</p>}
            {isLoggedIn && <p className="mt-8 text-sm font-semibold text-white/80">Welcome back, {username}. Your workspace is ready.</p>}
          </div>
        </div>
        <div className="hidden items-end justify-end p-10 lg:flex">
          <div className="relative z-10 max-w-xs border-l-2 border-[#f5c400] pl-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f5c400]">Built for the road ahead</p>
            <p className="mt-3 text-2xl font-bold leading-tight">Reliable data. Confident decisions.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <article className="border-t-4 border-[#e4002b] bg-white p-6 shadow-[0_12px_30px_rgba(24,59,112,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Michelin news</p>
          <h2 className="mt-4 text-2xl font-black text-[#183b70]">Smarter mobility starts with visibility.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Stay close to the production signals that help teams make better decisions, faster.</p>
          <span className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Latest update · 16 Sep 2026</span>
        </article>
        <article className="border-t-4 border-[#f5c400] bg-white p-6 shadow-[0_12px_30px_rgba(24,59,112,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#183b70]">Key safety tips</p>
          <ul className="mt-5 space-y-4 text-sm leading-5 text-slate-600">
            <li className="flex gap-3"><span className="font-black text-[#e4002b]">01</span>Confirm tyre identity before recording a change.</li>
            <li className="flex gap-3"><span className="font-black text-[#e4002b]">02</span>Use the latest approved measurement and status.</li>
            <li className="flex gap-3"><span className="font-black text-[#e4002b]">03</span>Escalate quality exceptions as soon as they appear.</li>
          </ul>
        </article>
        <article className="border-t-4 border-[#183b70] bg-white p-6 shadow-[0_12px_30px_rgba(24,59,112,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#183b70]">How to use TMS</p>
          <ol className="mt-5 space-y-4 text-sm leading-5 text-slate-600">
            <li><strong className="mr-2 text-[#183b70]">01</strong>Choose your workspace from the top navigation.</li>
            <li><strong className="mr-2 text-[#183b70]">02</strong>Record changes while the information is fresh.</li>
            <li><strong className="mr-2 text-[#183b70]">03</strong>Use reports and history to verify the result.</li>
          </ol>
        </article>
      </div>

      {isLoggedIn && workspace && (
        <section className="border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Role workspace">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Your role workspace</p>
              <h2 className="mt-3 text-3xl font-black text-[#183b70]">{workspace.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{workspace.description}</p>
            </div>
            <Link to={workspace.link} className="inline-flex shrink-0 items-center justify-center bg-[#e4002b] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#b90024]">{workspace.action}</Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {workspace.items.map((item, index) => <div key={item} className="border-l-2 border-[#f5c400] bg-slate-50 px-4 py-4"><span className="text-xs font-bold text-[#e4002b]">0{index + 1}</span><p className="mt-2 text-sm font-semibold text-[#183b70]">{item}</p></div>)}
          </div>
        </section>
      )}
    </section>
  );
}
