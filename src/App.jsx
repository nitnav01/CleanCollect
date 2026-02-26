import React, { useState, useEffect, useRef } from 'react';
import {
  Recycle, Truck, Leaf, LogOut, Plus, Clock, CheckCircle,
  XCircle, Menu, X, Trash2, Package, ArrowRight,
  ShieldCheck, Zap, ChevronDown, MapPin, Droplet, MoveRight,
  Database, RefreshCw, Layers, User, AlertCircle, Mail, Lock,
  Wind, Battery, Bell, Cpu, Smartphone
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- GLOBAL STYLES ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

  :root {
    --color-cream: #FDFCF8;
    --color-forest: #0A332B;
    --color-gold: #D4AF37;
  }

  body {
    font-family: 'Playfair Display', serif;
    background-color: var(--color-cream);
    color: var(--color-forest);
    overflow-x: hidden;
    letter-spacing: -0.02em;
  }

  .font-ui { font-family: system-ui, -apple-system, sans-serif; }

  .bg-grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .glass-dark {
    background: rgba(10, 51, 43, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #FDFCF8;
  }

  .animate-gradient-text {
    background-size: 200% auto;
    animation: shine 4s linear infinite;
  }
  @keyframes shine { to { background-position: 200% center; } }

  .toast-enter { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  @keyframes plantGrow {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .plant-animate {
    transform-origin: center center;
    animation: plantGrow 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

// --- ANIMATION HOOKS ---

const useOnScreen = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) { setIsVisible(true); return; }

    // Immediately reveal if already in viewport (above-the-fold content)
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

const useScrollScrub = (startOffset = 0, endOffset = 1000) => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      const viewportHeight = window.innerHeight;

      let rawProgress = (scrollTop - (elementTop - viewportHeight * 0.1)) / (rect.height - viewportHeight);
      const clamped = Math.min(Math.max(rawProgress, 0), 1);
      setProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [startOffset, endOffset]);

  return [ref, progress];
};

// --- HELPERS & LOGIC ---

const getItemWeight = (type) => {
  switch(type) {
    case 'Laptop': return 2.2;
    case 'Mobile': return 0.2;
    case 'Tablet': return 0.5;
    case 'Accessories': return 0.15;
    case 'Batteries': return 0.1;
    default: return 1.0;
  }
};

const calculateImpact = (requests) => {
  const collected = requests.filter(r => r.status === 'Collected');
  const totalWeight = collected.reduce((acc, r) => acc + (r.quantity * getItemWeight(r.item_type)), 0);

  return {
    weight: totalWeight.toFixed(1),
    co2: (totalWeight * 1.44).toFixed(1),
    toxins: (totalWeight * 0.05).toFixed(2)
  };
};

// --- ANIMATION COMPONENTS ---

const Reveal = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useOnScreen(0.1);
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-[60px] scale-95'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const StaggeredText = ({ text, className = "", delay = 0 }) => {
  const [ref, isVisible] = useOnScreen(0.1);
  const words = text.split(" ");
  return (
    <span ref={ref} className={`${className} inline-block`} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em] -mb-2 pb-2">
          <span
            className={`inline-block transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}
            style={{ transitionDelay: `${delay + (i * 40)}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

const Counter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useOnScreen(0.5);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(ease * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isVisible, hasAnimated, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// --- SHARED UI ---

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-amber-100/50 text-amber-900 border-amber-200/50',
    Scheduled: 'bg-blue-100/50 text-blue-900 border-blue-200/50',
    Collected: 'bg-emerald-100/50 text-emerald-900 border-emerald-200/50'
  };
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border font-ui ${styles[status]}`}>{status}</span>;
};

const AmbientLight = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-60"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-60"></div>
    <div className="bg-grain"></div>
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-[100] toast-enter">
    <div className="glass-dark px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500/20 max-w-md">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {type === 'success' ? <Mail size={18} /> : <AlertCircle size={18} />}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{type === 'success' ? 'Notification' : 'Alert'}</h4>
        <p className="text-emerald-100/70 text-xs mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="text-emerald-100/40 hover:text-white ml-2 flex-shrink-0"><X size={16}/></button>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [appUser, setAppUser] = useState(null);
  const [view, setView] = useState('landing');
  const [authReady, setAuthReady] = useState(false);
  const [minLoadDone, setMinLoadDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadProfile = async (session) => {
    let profile = null;
    for (let i = 0; i < 4; i++) {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (data) { profile = data; break; }
      await new Promise(r => setTimeout(r, 600));
    }
    const userProfile = profile || {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name || session.user.email.split('@')[0],
      role: session.user.user_metadata?.role || 'resident',
    };
    setAppUser(userProfile);
    setView('dashboard');
    return userProfile;
  };

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadDone(true), 2000);
    let initialCheckDone = false;

    // Restore existing session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await loadProfile(session);
      initialCheckDone = true;
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked a password reset link — show the reset form
        setView('reset-password');
        setAuthReady(true);
      } else if (event === 'SIGNED_IN' && session && initialCheckDone) {
        // Fires when user confirms their email via the link in their inbox
        await loadProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setAppUser(null);
        setView('landing');
      }
    });

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAppUser(null);
    setView('landing');
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const navigateTo = (newView) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  if (!authReady || !minLoadDone) return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#FDFCF8] relative overflow-hidden">
        <div className="plant-animate">
            <svg id="plant-svg" viewBox="0 0 100 100" width="120" height="120" className="text-emerald-800 fill-current">
                <path d="M50 10 L40 30 L60 30 Z" />
            </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-emerald-100/30 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
        </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] relative selection:bg-emerald-900 selection:text-[#FDFCF8]">
      <AmbientLight />
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FDFCF8]/97 backdrop-blur-sm flex flex-col items-center justify-center gap-8 md:hidden">
          <button className="absolute top-6 right-6 p-2" onClick={() => setMobileMenuOpen(false)}>
            <X size={28} className="text-emerald-900" />
          </button>
          {appUser ? (
            <>
              <div className="text-center mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-900/40 font-ui">{appUser.role === 'admin' ? 'Administrator' : appUser.role === 'recycler' ? 'Recycler' : 'Resident'}</p>
                <p className="text-2xl font-bold text-emerald-900">{appUser.name}</p>
              </div>
              <button onClick={() => navigateTo('dashboard')} className="text-xl font-bold text-emerald-950 py-2">Dashboard</button>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-xl font-bold text-red-500 py-2">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('landing')} className="text-xl font-bold text-emerald-950 py-2">Home</button>
              <button onClick={() => navigateTo('process')} className="text-xl font-bold text-emerald-950 py-2">Our Process</button>
              <button onClick={() => navigateTo('auth')} className="mt-4 w-52 bg-emerald-950 text-white py-4 rounded-full text-center font-bold text-lg font-ui">
                Sign In
              </button>
            </>
          )}
        </div>
      )}

      <nav className="fixed w-full z-50 top-0 pt-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer mix-blend-multiply" onClick={() => setView('landing')}>
             <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center mr-3 text-[#FDFCF8]">
                <Recycle size={20} strokeWidth={1.5} />
             </div>
             <span className="font-bold text-2xl text-emerald-950 tracking-tight">CleanCollect.</span>
          </div>

          <div className="hidden md:flex items-center gap-2 glass px-2 py-2 rounded-full shadow-sm">
            {appUser ? (
              <>
                <div className="px-6 flex flex-col items-end leading-none border-r border-emerald-900/10 pr-6 mr-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">{appUser.role === 'admin' ? 'Administrator' : appUser.role === 'recycler' ? 'Recycler' : 'Resident'}</span>
                   <span className="font-bold text-emerald-900">{appUser.name}</span>
                </div>
                <button onClick={() => setView('dashboard')} className="bg-emerald-900 text-[#FDFCF8] px-6 py-3 rounded-full text-sm font-medium hover:bg-emerald-800 transition-all shadow-lg active:scale-95">Dashboard</button>
                <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-emerald-900/40 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
              </>
            ) : (
              <button onClick={() => setView('auth')} className="bg-emerald-900 text-[#FDFCF8] px-8 py-3 rounded-full text-sm font-medium hover:bg-emerald-800 transition-all shadow-lg flex items-center gap-2 group">
                Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            )}
          </div>
          <button className="md:hidden p-2 text-emerald-900 z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <main className="relative z-10 min-h-[100dvh] flex flex-col">
        {view === 'landing' && <LandingPage onGetStarted={() => setView(appUser ? 'dashboard' : 'auth')} onViewProcess={() => setView('process')} />}
        {view === 'process' && <ProcessPage onBack={() => setView('landing')} onGetStarted={() => setView(appUser ? 'dashboard' : 'auth')} />}
        {view === 'auth' && <AuthPage setAppUser={setAppUser} setView={setView} showNotification={showNotification} />}
        {view === 'reset-password' && <ResetPasswordPage setView={setView} showNotification={showNotification} />}
        {view === 'dashboard' && appUser && <Dashboard appUser={appUser} showNotification={showNotification} />}
      </main>

      {view !== 'auth' && (
        <footer className="relative z-10 py-12 border-t border-emerald-900/5 mt-auto bg-white/40 backdrop-blur-sm">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-emerald-900/40">
              <p>© 2025 CleanCollect Inc.</p>
              <div className="flex gap-8 mt-4 md:mt-0">
                 <a href="#" className="hover:text-emerald-900 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-emerald-900 transition-colors">Manifesto</a>
                 <a href="#" className="hover:text-emerald-900 transition-colors">Contact</a>
              </div>
           </div>
        </footer>
      )}
    </div>
  );
}

// --- 1. Landing Page ---
function LandingPage({ onGetStarted, onViewProcess }) {
  return (
    <div className="flex flex-col">
      {/* Immersive Hero */}
      <section className="min-h-[100dvh] flex flex-col justify-center px-6 relative overflow-hidden pt-32 pb-40">
        <div className="absolute inset-0 z-0">
            <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
                alt="Technology and Nature Blend"
                className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF8]/90 via-[#FDFCF8]/70 to-[#FDFCF8]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-7">
            <Reveal>
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-900/10 bg-white/60 backdrop-blur-md mb-8 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-900/80 font-ui">The Standard for E-Waste</span>
               </div>
            </Reveal>

            <h1 className="font-serif text-[3rem] leading-[0.95] md:text-[5rem] lg:text-[6.5rem] font-bold text-emerald-950 mb-10">
              <StaggeredText text="Refining" delay={100} /> <br/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 animate-gradient-text">
                 Responsibility.
              </span>
            </h1>

            <Reveal delay={300}>
                <p className="text-lg md:text-2xl font-light text-emerald-900/80 max-w-xl leading-relaxed mb-8">
                We curate the journey of your obsolete technology from dormancy to ethical destruction. White-glove collection for the conscious estate.
                </p>
            </Reveal>

            {/* Quick Stats Block */}
            <Reveal delay={400}>
                <div className="grid grid-cols-3 gap-2 md:gap-6 mb-10">
                    <div className="border-l-2 border-emerald-900/10 pl-3 md:pl-4">
                        <div className="text-xl md:text-3xl font-serif font-bold text-emerald-950">
                            <Counter end={57} suffix="M+" />
                        </div>
                        <div className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-900/50 mt-1 font-ui">Tonnes Wasted</div>
                    </div>
                    <div className="border-l-2 border-emerald-900/10 pl-3 md:pl-4">
                        <div className="text-xl md:text-3xl font-serif font-bold text-red-800/80">
                            <Counter end={82} suffix="%" />
                        </div>
                        <div className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-900/50 mt-1 font-ui">Lost to Landfills</div>
                    </div>
                    <div className="border-l-2 border-emerald-900/10 pl-3 md:pl-4">
                        <div className="text-xl md:text-3xl font-serif font-bold text-emerald-600">
                            <Counter end={100} suffix="%" />
                        </div>
                        <div className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-900/50 mt-1 font-ui">Traceable</div>
                    </div>
                </div>
            </Reveal>

            <Reveal delay={500}>
                <p className="text-sm font-bold text-emerald-900/60 uppercase tracking-widest mb-8 flex items-center font-ui">
                    <span className="w-8 h-px bg-emerald-900/30 mr-3"></span>
                    Join the mission to close the loop.
                </p>

                <div className="flex flex-wrap gap-4">
                <button onClick={onGetStarted} className="bg-emerald-950 text-[#FDFCF8] text-base md:text-lg px-8 md:px-10 py-4 md:py-5 rounded-full hover:bg-emerald-900 transition-all shadow-2xl active:scale-95">
                    Schedule Collection
                </button>
                <button onClick={onViewProcess} className="px-8 md:px-10 py-4 md:py-5 rounded-full border border-emerald-900/20 text-emerald-950 text-base md:text-lg hover:bg-emerald-900/5 transition-all bg-white/30 backdrop-blur-sm">
                    The Process
                </button>
                </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block h-[400px] lg:h-[650px]">
             <Reveal delay={600} className="h-full w-full">
                 <div className="absolute inset-0 bg-emerald-900 rounded-[40px] overflow-hidden shadow-2xl rotate-3 group">
                    <img
                      src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=80"
                      alt="Clean Electronics Components"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900/40 to-transparent"></div>
                    <div className="p-12 h-full flex flex-col justify-between relative z-10 text-[#FDFCF8]">
                       <div className="glass-dark p-4 rounded-2xl w-fit">
                          <ShieldCheck size={32} strokeWidth={1.5} className="text-emerald-400"/>
                       </div>
                       <div>
                          <h3 className="text-4xl mb-4">Zero Trace.</h3>
                          <p className="font-light text-white/80 text-lg leading-relaxed">
                            Our military-grade data destruction protocols ensure your digital footprint vanishes completely alongside the hardware.
                          </p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute inset-0 border border-emerald-900/10 rounded-[40px] -rotate-3 -z-10"></div>
             </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 2: The Crisis */}
      <section className="py-20 md:py-32 px-6 bg-[#0A332B] text-emerald-50 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10">
             <img src="https://images.unsplash.com/photo-1612965110667-4175024b0dcc?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover grayscale" alt="Landfill texture" />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
               <Reveal>
                  <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs mb-6 font-ui"><AlertCircle size={16}/> The Crisis</div>
                  <div className="text-3xl md:text-5xl lg:text-7xl text-white mb-8 leading-[1.1]">
                     <StaggeredText text="A Tsunami of Toxic E-Waste." />
                  </div>
                  <p className="text-lg md:text-xl text-emerald-100/70 font-light leading-relaxed mb-12">
                     The world generates 57 million tonnes of e-waste annually—equivalent to the weight of the Great Wall of China. Without intervention, this figure is set to double by 2050.
                  </p>

                  <div className="grid grid-cols-2 gap-6 md:gap-8 border-t border-white/10 pt-8">
                     <div className="border-l border-emerald-500/30 pl-4 md:pl-6">
                        <div className="text-2xl md:text-4xl font-bold text-white mb-1">82%</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-ui">Discarded Informally</div>
                     </div>
                     <div className="border-l border-emerald-500/30 pl-4 md:pl-6">
                        <div className="text-2xl md:text-4xl font-bold text-white mb-1">$57B</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-ui">Raw Material Lost</div>
                     </div>
                     <div className="border-l border-emerald-500/30 pl-4 md:pl-6">
                        <div className="text-2xl md:text-4xl font-bold text-white mb-1">High</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-ui">Groundwater Risk</div>
                     </div>
                     <div className="border-l border-emerald-500/30 pl-4 md:pl-6">
                        <div className="text-2xl md:text-4xl font-bold text-white mb-1">Zero</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-ui">Data Security</div>
                     </div>
                  </div>
               </Reveal>

               <Reveal delay={200}>
                  <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border border-white/10 group relative">
                     <img src="https://images.unsplash.com/photo-1614201756100-1ccde6a6589e?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover grayscale " alt="E-waste mountain"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                     <div className="absolute bottom-10 left-10 right-10">
                        <p className="text-base md:text-lg italic text-white/90">"Informal recycling exposes workers to hazardous carcinogens while recovering less than 20% of valuable materials."</p>
                        <p className="text-xs font-bold text-emerald-500 mt-4 uppercase tracking-widest font-ui">— Global E-waste Monitor</p>
                     </div>
                  </div>
               </Reveal>
            </div>
         </div>
      </section>

      {/* SECTION 3: The Solution */}
      <section className="py-20 md:py-32 px-6 relative">
         <div className="max-w-7xl mx-auto text-center">
            <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-800 font-bold text-xs uppercase tracking-widest mb-8 font-ui">
                <CheckCircle size={14} /> The Solution
                </div>
                <div className="text-3xl md:text-5xl lg:text-6xl text-emerald-950 mb-8 leading-tight">
                    <StaggeredText text="Building the Circular Infrastructure." />
                </div>
                <p className="text-lg md:text-xl text-emerald-900/60 max-w-2xl mx-auto mb-16 font-light">
                CleanCollect bridges the gap. We provide the logistics, security, and transparency needed to turn a global hazard into a sustainable resource.
                </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-20">
               {[
                  { title: "Traceability", desc: "End-to-end digital tracking from your doorstep to the refinery.", icon: MapPin },
                  { title: "Compliance", desc: "Full regulatory adherence for individuals and enterprises.", icon: ShieldCheck },
                  { title: "Regeneration", desc: "Returning raw materials to the manufacturing economy.", icon: RefreshCw }
               ].map((item, i) => (
                  <Reveal key={i} delay={i * 150} className="h-full">
                      <div className="glass p-8 md:p-10 rounded-[40px] hover:bg-white transition-colors duration-500 group border border-emerald-900/5 h-full">
                        <div className="w-16 h-16 rounded-full bg-emerald-900/5 text-emerald-900 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                            <item.icon size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl text-emerald-950 mb-4">{item.title}</h3>
                        <p className="text-emerald-900/60 leading-relaxed">{item.desc}</p>
                      </div>
                  </Reveal>
               ))}
            </div>

            {/* Final CTA */}
            <Reveal delay={300}>
                <div className="mt-20 bg-emerald-950 rounded-[3rem] p-8 md:p-20 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute -right-20 -top-20 text-white/5 transform group-hover:scale-110 transition-transform duration-1000"><Recycle size={400} /></div>

                    <div className="relative z-10">
                        <div className="text-2xl md:text-4xl lg:text-5xl text-[#FDFCF8] mb-8 leading-tight">
                             <StaggeredText text="Make the World a Better Place." />
                        </div>
                        <p className="text-emerald-100/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Your old electronics can either poison the earth or power the future. The choice is yours.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-[#FDFCF8] text-emerald-950 text-lg font-bold px-10 md:px-12 py-4 md:py-5 rounded-full hover:bg-emerald-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
                        >
                            Join the Movement — Schedule Pickup
                        </button>
                    </div>
                </div>
            </Reveal>
         </div>
      </section>
    </div>
  );
}

// --- 2. Process Page ---
function ProcessPage({ onBack, onGetStarted }) {
  return (
    <div className="flex flex-col pb-20 pt-12 bg-[#FDFCF8]">
      <div className="px-6 py-12 md:py-16 max-w-7xl mx-auto w-full border-b border-emerald-900/5 mb-16 md:mb-20">
         <button onClick={onBack} className="text-emerald-900/50 hover:text-emerald-900 flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors font-ui">
            <MoveRight className="rotate-180" size={16} /> Back to Overview
         </button>
         <div className="text-4xl md:text-6xl lg:text-8xl text-emerald-950 mb-8 leading-tight">
            <StaggeredText text="The Lifecycle of" /> <br/>
            <span className="italic text-emerald-900/60"><StaggeredText text="Stewardship." delay={300} /></span>
         </div>
         <Reveal delay={500}>
            <p className="mt-4 text-lg md:text-xl text-emerald-900/60 max-w-2xl font-light leading-relaxed">
                Technology connects us, but its disposal often divides us from nature. We bridge that gap with a process built on human trust, security, and absolute transparency.
            </p>
         </Reveal>
      </div>

      {/* PHASE 1: Collection */}
      <section className="px-6 mb-20 md:mb-32">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center mb-16 md:mb-24">
               <Reveal className="w-full md:w-1/2 relative group">
                  <div className="absolute inset-0 bg-emerald-900/10 rounded-[40px] rotate-3 transition-transform group-hover:rotate-6"></div>
                  <img
                     src="https://images.unsplash.com/photo-1550041473-d296a3a8a18a?auto=format&fit=crop&w=1000&q=80"
                     alt="Handing over electronic waste"
                     className="relative rounded-[40px] shadow-2xl object-cover h-[280px] md:h-[500px] w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-lg max-w-xs">
                     <div className="flex items-center gap-3 mb-2 text-emerald-800 font-bold text-sm uppercase tracking-widest font-ui">
                        <User size={16} /> Verified Personnel
                     </div>
                     <p className="text-emerald-950 text-sm leading-relaxed">Every agent is background-checked and trained in secure handling protocols.</p>
                  </div>
               </Reveal>
               <div className="w-full md:w-1/2">
                  <Reveal delay={200}>
                      <div className="text-emerald-900/20 text-7xl md:text-9xl leading-none -ml-2 mb-4 select-none">01</div>
                      <div className="text-2xl md:text-4xl lg:text-5xl text-emerald-950 mb-6 leading-tight">
                          <StaggeredText text="The Handover" />
                      </div>
                      <p className="text-lg md:text-xl text-emerald-900/70 font-light leading-relaxed mb-8">
                         It's not just a pickup; it's a transfer of responsibility. Our uniformed steward arrives at your scheduled time, weighs your items in front of you, and provides an instant digital receipt.
                      </p>
                      <ul className="space-y-4">
                         {[
                            "GPS-tracked fleet ensures chain of custody never breaks.",
                            "Instant digital manifest sent to your dashboard.",
                            "Tamper-proof transit cases for data-bearing devices."
                         ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-emerald-900/80">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div> {item}
                            </li>
                         ))}
                      </ul>
                  </Reveal>
               </div>
            </div>
         </div>
      </section>

      {/* PHASE 2: Processing */}
      <section className="px-6 mb-20 md:mb-32 bg-emerald-900/5 py-16 md:py-24">
         <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
               <Reveal>
                   <div className="text-emerald-900/20 text-7xl md:text-9xl leading-none -ml-2 mb-4 select-none">02</div>
                   <div className="text-2xl md:text-4xl lg:text-5xl text-emerald-950 mb-6 leading-tight">
                       <StaggeredText text="The Sanctuary" />
                   </div>
                   <p className="text-lg md:text-xl text-emerald-900/70 font-light leading-relaxed mb-8">
                      Your devices enter our ISO-certified facility—a clean, organized environment where chaos is turned into order. Here, expert technicians manually segregate hazardous batteries from recoverable metals.
                   </p>
                   <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm">
                         <ShieldCheck size={32} className="text-emerald-600 mb-4"/>
                         <h4 className="font-bold text-emerald-950 mb-2">Data Wipe</h4>
                         <p className="text-sm text-emerald-900/60">3-pass DoD standard overwrite.</p>
                      </div>
                      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm">
                         <RefreshCw size={32} className="text-emerald-600 mb-4"/>
                         <h4 className="font-bold text-emerald-950 mb-2">Dismantling</h4>
                         <p className="text-sm text-emerald-900/60">Precision separation of materials.</p>
                      </div>
                   </div>
               </Reveal>
            </div>
            <Reveal delay={200} className="order-1 md:order-2 relative group">
                <div className="absolute -inset-4 border border-emerald-900/10 rounded-[48px] rotate-2 group-hover:rotate-0 transition-all duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1000&q=80"
                  alt="Industrial e-waste recycling machinery"
                  className="relative rounded-[40px] shadow-2xl object-cover h-[280px] md:h-[500px] w-full"
               />
            </Reveal>
         </div>
      </section>

      {/* PHASE 3: Metrics */}
      <section className="px-6 mb-20 md:mb-32">
         <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <Reveal>
                <div className="text-emerald-900/10 text-7xl md:text-9xl leading-none mb-4 select-none">03</div>
                <div className="text-2xl md:text-4xl text-emerald-950 mb-4 mt-[-30px] md:mt-[-40px] relative z-10 leading-tight">
                    <StaggeredText text="Precision Recovery" />
                </div>
                <p className="text-emerald-900/60 leading-relaxed text-base md:text-lg font-light max-w-2xl mx-auto">
                We measure success not just by what we collect, but by how efficiently we return materials to the circular economy.
                </p>
            </Reveal>
         </div>

         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             {[
                { label: 'Gold Recovery', val: '98%', icon: Layers },
                { label: 'Toxic Capture', val: '100%', icon: ShieldCheck },
                { label: 'Plastic Reuse', val: 'Recycled', icon: RefreshCw },
                { label: 'Glass', val: 'Smelted', icon: Database }
             ].map((stat, i) => (
                <Reveal key={i} delay={i * 100}>
                    <div className="glass p-6 md:p-8 rounded-[32px] flex flex-col items-center justify-center text-center aspect-square hover:bg-white transition-colors border border-emerald-900/5 group cursor-default">
                    <stat.icon className="text-emerald-900/30 mb-3 md:mb-4 group-hover:text-emerald-600 transition-colors" size={24} />
                    <div className="text-xl md:text-3xl text-emerald-950 mb-1">{stat.val}</div>
                    <div className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-900/50 font-ui">{stat.label}</div>
                    </div>
                </Reveal>
             ))}
         </div>
      </section>

      {/* PHASE 4: Transformation */}
      <section className="px-6 mb-20 md:mb-32">
         <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-12 md:mb-16">
                <div className="text-2xl md:text-4xl lg:text-5xl text-emerald-950 leading-tight">
                    <StaggeredText text="The Choice is Yours." />
                </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
               <Reveal className="relative rounded-[40px] overflow-hidden group h-[280px] md:h-[500px]">
                  <img
                     src="https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80"
                     alt="Landfill e-waste"
                     className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
                  <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
                     <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 md:mb-6 text-red-400 backdrop-blur-sm"><AlertCircle /></div>
                     <h3 className="text-2xl md:text-4xl mb-3 md:mb-4">The Landfill Legacy</h3>
                     <p className="text-white/70 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                        Informal disposal leaks lead, mercury, and cadmium into the soil. A single battery can contaminate thousands of liters of groundwater, affecting communities for generations.
                     </p>
                     <span className="text-red-300 text-sm font-bold uppercase tracking-widest font-ui">Without CleanCollect</span>
                  </div>
               </Reveal>

               <Reveal delay={200} className="relative rounded-[40px] overflow-hidden group h-[280px] md:h-[500px]">
                  <img
                     src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80"
                     alt="Nature restoration"
                     className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-emerald-900/40 group-hover:bg-emerald-900/30 transition-colors"></div>
                  <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
                     <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center mb-4 md:mb-6 text-emerald-300 backdrop-blur-sm"><Leaf /></div>
                     <h3 className="text-2xl md:text-4xl mb-3 md:mb-4">Material Rebirth</h3>
                     <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                        Resources are recovered. Gold returns to jewelry, copper to wiring, and plastic to new products. The earth is left untouched, and the future remains green.
                     </p>
                     <span className="text-emerald-300 text-sm font-bold uppercase tracking-widest font-ui">With CleanCollect</span>
                  </div>
               </Reveal>
            </div>
         </div>
      </section>

      {/* PHASE 5: Testimonial */}
      <section className="px-6 mb-20">
         <Reveal>
             <div className="max-w-4xl mx-auto bg-white border border-emerald-900/10 p-8 md:p-12 rounded-[40px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5"><User size={200}/></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                   <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-emerald-50 shadow-lg flex-shrink-0"
                      alt="Happy customer"
                   />
                   <div>
                      <div className="flex text-yellow-400 mb-4">
                         {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                      </div>
                      <p className="text-xl md:text-2xl text-emerald-950 leading-relaxed italic mb-6">
                         "I used to feel guilty storing old gadgets because I didn't know where to send them. The collection agent was so professional, and seeing the 'Toxins Diverted' metric on my dashboard actually makes me feel like I'm making a difference."
                      </p>
                      <div>
                         <div className="font-bold text-emerald-900">Sarah Jenkins</div>
                         <div className="text-sm text-emerald-900/50">Architect & Mother</div>
                      </div>
                   </div>
                </div>
             </div>
         </Reveal>
      </section>

      <div className="text-center mt-10 px-6">
         <button onClick={onGetStarted} className="bg-emerald-950 text-[#FDFCF8] text-lg px-10 md:px-12 py-4 md:py-5 rounded-full hover:bg-emerald-900 transition-all shadow-2xl active:scale-95 transform hover:-translate-y-1">
            Start Your Impact Journey
         </button>
      </div>
    </div>
  );
}

// --- 3. Auth Page ---
function AuthPage({ setAppUser, setView, showNotification }) {
  const [authMode, setAuthMode] = useState('login');
  const [signupRole, setSignupRole] = useState('resident');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  const getFriendlyAuthError = (error) => {
    const msg = error?.message || '';
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
    if (msg.includes('User already registered') || msg.includes('already been registered')) return 'An account with this email already exists. Please sign in.';
    if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in.';
    if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) return 'Network error. Check your connection and try again.';
    return msg || 'Something went wrong. Please try again.';
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });
        if (error) throw error;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        // Fallback: if profile not found, use auth user metadata
        const userProfile = profile || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0],
          role: data.user.user_metadata?.role || 'resident',
        };
        setAppUser(userProfile);
        setView('dashboard');

      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: { name: name || email.split('@')[0], role: signupRole },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;

        if (data.session) {
          // Auto-confirm still on (shouldn't happen, but handle gracefully)
          let profile = null;
          for (let i = 0; i < 3; i++) {
            await new Promise(r => setTimeout(r, 600));
            const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            if (p) { profile = p; break; }
          }
          const userProfile = profile || { id: data.user.id, email: data.user.email, name: name || data.user.email.split('@')[0], role: signupRole };
          setAppUser(userProfile);
          showNotification(`Welcome ${userProfile.name}!`);
          setView('dashboard');
        } else {
          // Email confirmation required — standard path
          setSuccessMsg(`Account created! We sent a confirmation email to ${email.toLowerCase().trim()}. Click the link to verify, then sign in here.`);
        }
      }
    } catch (error) {
      setErrorMsg(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo: `${window.location.origin}/` }
    );
    if (error) setErrorMsg(getFriendlyAuthError(error));
    else setSuccessMsg(`Password reset link sent to ${email.toLowerCase().trim()}. Check your inbox.`);
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left Visual Side */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
         <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Green technology"
         />
         <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply"></div>
         <div className="absolute inset-0 flex items-center justify-center p-20 text-center text-white">
            <div>
                <Leaf size={64} className="mx-auto mb-8 text-emerald-300" />
                <h2 className="text-5xl mb-6">Join the Circle.</h2>
                <p className="text-xl font-light leading-relaxed opacity-90">
                    Become part of a community dedicated to closing the loop on electronic waste. Responsible disposal starts here.
                </p>
            </div>
         </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start overflow-y-auto px-6 lg:px-24 pt-[88px] pb-12 lg:pt-8 lg:justify-center">
        <div className="w-full max-w-md">
           <div className="mb-10">
              <div className="text-3xl md:text-4xl text-emerald-950 mb-3 leading-tight">
                  <StaggeredText text={
                    authMode === 'login' ? 'Welcome Back.' :
                    authMode === 'signup' ? 'Create Account.' :
                    'Reset Access.'
                  } />
              </div>
              <p className="text-emerald-900/50 font-ui">
                  {authMode === 'login' && 'Sign in to access your portfolio.'}
                  {authMode === 'signup' && 'Start your responsible recycling journey.'}
                  {authMode === 'forgot' && 'Enter your email to receive a reset link.'}
              </p>
           </div>

           {authMode === 'forgot' ? (
               <div className="space-y-6">
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Email Address"
                        required
                        className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />

                      {successMsg && (
                          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100 font-ui">
                              <p className="font-medium"><Mail className="inline mr-2" size={16}/> {successMsg}</p>
                          </div>
                      )}

                      {errorMsg && (
                          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center font-medium font-ui">
                              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {errorMsg}
                          </div>
                      )}

                      {!successMsg && (
                           <button disabled={loading} className="w-full bg-emerald-950 text-[#FDFCF8] py-5 rounded-full mt-4 hover:bg-emerald-900 transition-all shadow-xl active:scale-95 disabled:opacity-70 font-ui">
                              {loading ? 'Sending...' : 'Send Reset Link'}
                           </button>
                      )}
                  </form>

                  <button onClick={() => { setAuthMode('login'); clearMessages(); }} className="w-full text-center text-sm font-bold uppercase tracking-widest text-emerald-900/40 hover:text-emerald-900 mt-6 font-ui">
                     Back to Sign In
                  </button>
               </div>
           ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                  <div className="space-y-4">
                    {/* Role selector */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-900/40 mb-3 font-ui">I am a</p>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setSignupRole('resident')}
                          className={`flex-1 py-3 rounded-full border text-sm font-bold font-ui uppercase tracking-wider transition-all ${signupRole === 'resident' ? 'bg-emerald-950 text-white border-emerald-950' : 'border-emerald-900/20 text-emerald-900/60 hover:border-emerald-900/40'}`}>
                          Resident
                        </button>
                        <button type="button" onClick={() => setSignupRole('recycler')}
                          className={`flex-1 py-3 rounded-full border text-sm font-bold font-ui uppercase tracking-wider transition-all ${signupRole === 'recycler' ? 'bg-emerald-950 text-white border-emerald-950' : 'border-emerald-900/20 text-emerald-900/60 hover:border-emerald-900/40'}`}>
                          Recycler / Agent
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Full Name"
                      required
                      className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  )}
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Email Address"
                    required
                    className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />

                  <div className="relative">
                      <input
                        type="password"
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        placeholder="Password"
                        required
                        className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      {authMode === 'login' && (
                          <button type="button" onClick={() => { setAuthMode('forgot'); clearMessages(); }} className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-emerald-900/40 hover:text-emerald-900 transition-colors font-ui">
                              Forgot?
                          </button>
                      )}
                  </div>
                  {authMode === 'signup' && (
                    <p className="text-xs text-emerald-900/40 font-ui">Minimum 6 characters</p>
                  )}

                  {errorMsg && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center font-medium font-ui">
                          <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {errorMsg}
                      </div>
                  )}

                  {successMsg && (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm font-medium font-ui">
                          <CheckCircle size={16} className="inline mr-2" /> {successMsg}
                      </div>
                  )}

                  <button disabled={loading} className="w-full bg-emerald-950 text-[#FDFCF8] py-5 rounded-full mt-8 hover:bg-emerald-900 transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center font-ui">
                  {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Processing...</>
                  ) : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                  </button>

                  <div className="mt-8 text-center">
                      <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); clearMessages(); }} className="text-sm font-bold uppercase tracking-widest text-emerald-900/40 hover:text-emerald-900 transition-colors font-ui">
                          {authMode === 'login' ? 'Create an Account' : 'Already have an account? Sign In'}
                      </button>
                  </div>
              </form>
           )}
        </div>
      </div>
    </div>
  );
}

// --- 4. Dashboard ---
function Dashboard({ appUser, showNotification }) {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('pickup_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    if (appUser.role === 'recycler') return; // RecyclerDashboard has its own fetching
    fetchRequests();

    const channel = supabase
      .channel('pickup_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' },
        () => fetchRequests())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [appUser.role]);

  if (appUser.role === 'recycler') {
    return <RecyclerDashboard appUser={appUser} showNotification={showNotification} />;
  }

  const myRequests = appUser.role === 'resident'
    ? requests.filter(r => r.user_id === appUser.id)
    : requests;

  const impact = calculateImpact(myRequests);

  return (
    <div className="flex-1 px-4 md:px-6 pb-20 pt-12">
      <div className="max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-12 gap-4 md:gap-10 pt-10 border-b border-emerald-900/5 pb-6 md:pb-10">
            <div>
               <div className="text-4xl md:text-5xl lg:text-6xl text-emerald-950 mb-2 leading-tight">
                   <StaggeredText text="Overview" />
               </div>
               <p className="text-emerald-900/50 text-base md:text-lg font-light">Welcome, {appUser.name}.</p>
            </div>

            {appUser.role === 'resident' && (
              <button onClick={() => setShowForm(true)} className="bg-emerald-900 text-[#FDFCF8] px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-emerald-800 transition-all shadow-lg flex items-center gap-3 font-ui w-fit">
                 <Plus size={20} /> <span className="font-medium">New Collection</span>
              </button>
            )}
         </div>

         {/* Dynamic Impact Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
            <div className="glass-dark p-6 md:p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                     <div className="text-emerald-300 font-bold uppercase tracking-widest text-xs font-ui">Weight Diverted</div>
                     <Layers className="text-emerald-400" size={20} />
                  </div>
                  <div className="text-4xl md:text-5xl text-white">{impact.weight} <span className="text-base md:text-lg text-emerald-400">kg</span></div>
               </div>
               <div className="text-emerald-100/60 text-sm mt-4 relative z-10">Total electronic waste saved from landfills.</div>
               <div className="absolute right-0 bottom-0 opacity-10"><Layers size={150} /></div>
            </div>

            <div className="glass p-6 md:p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[160px] md:min-h-[200px] border border-emerald-900/5">
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs font-ui">CO2 Offset</div>
                     <Wind className="text-emerald-900/60" size={20} />
                  </div>
                  <div className="text-4xl md:text-5xl text-emerald-950">{impact.co2} <span className="text-base md:text-lg text-emerald-900/60">kg</span></div>
               </div>
               <div className="text-emerald-900/60 text-sm mt-4">Equivalent to driving a car for {(impact.co2 * 4).toFixed(0)} km.</div>
            </div>

            <div className="glass p-6 md:p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[160px] md:min-h-[200px] border border-emerald-900/5">
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs font-ui">Toxins Prevented</div>
                     <Droplet className="text-emerald-900/60" size={20} />
                  </div>
                  <div className="text-4xl md:text-5xl text-emerald-950">{impact.toxins} <span className="text-base md:text-lg text-emerald-900/60">kg</span></div>
               </div>
               <div className="text-emerald-900/60 text-sm mt-4">Lead & Mercury kept out of groundwater.</div>
            </div>
         </div>

         {appUser.role === 'resident' ? (
           <ResidentView
             requests={myRequests}
             appUser={appUser}
             showForm={showForm}
             setShowForm={setShowForm}
             showNotification={showNotification}
             refreshRequests={fetchRequests}
           />
         ) : (
           <AdminView requests={requests} refreshRequests={fetchRequests} />
         )}
      </div>
    </div>
  );
}

function ResidentView({ requests, appUser, showForm, setShowForm, showNotification, refreshRequests }) {
  const emptyForm = { itemType: 'Laptop', otherItemType: '', quantity: 1, date: '', time: '', mobile: '', addressLine: '', pincode: '' };
  const [formData, setFormData] = useState(emptyForm);

  const pincodeComplete = formData.pincode.length === 6;
  const isServiceable  = formData.pincode === '122002';
  const showUnavailable = pincodeComplete && !isServiceable;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showUnavailable) {
      // Outside service area → save to waitlist for later outreach
      const { error } = await supabase.from('waitlist').insert([{
        user_id: appUser.id,
        email: appUser.email,
        name: appUser.name,
        mobile: formData.mobile,
        pincode: formData.pincode,
      }]);
      if (error) { showNotification('Something went wrong. Please try again.', 'error'); return; }
      setShowForm(false);
      showNotification(`Noted! We'll reach out to ${formData.mobile} when service launches in ${formData.pincode}.`);
      setFormData(emptyForm);
      return;
    }

    // Serviceable pickup
    const finalItemType = formData.itemType === 'Other' ? formData.otherItemType : formData.itemType;
    const { error } = await supabase.from('pickup_requests').insert([{
      user_id: appUser.id,
      user_email: appUser.email,
      user_name: appUser.name,
      item_type: finalItemType,
      other_item_type: formData.itemType === 'Other' ? formData.otherItemType : null,
      quantity: formData.quantity,
      date: formData.date,
      time: formData.time,
      mobile: formData.mobile,
      address: formData.addressLine,
      pincode: formData.pincode,
      status: 'Pending',
    }]);

    if (error) {
      showNotification('Failed to submit request. Please try again.', 'error');
      return;
    }

    setShowForm(false);
    showNotification(`Request for ${finalItemType} received!`);
    setFormData(emptyForm);
    refreshRequests();
  };

  const handleDelete = async (id) => {
    if(confirm("Withdraw this request?")) {
      await supabase.from('pickup_requests').delete().eq('id', id);
      refreshRequests();
    }
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12">
       <div>
          {requests.length === 0 ? (
             <div className="bg-white/60 p-8 md:p-10 rounded-[40px] border border-emerald-900/5 shadow-lg text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-800 mb-6">
                   <Package size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl text-emerald-950 mb-4 font-serif">Your portfolio is waiting.</h3>
                <p className="text-emerald-900/60 leading-relaxed mb-8 max-w-2xl mx-auto">
                   India ranks 3rd globally in e-waste generation, producing 3.2 million tonnes annually.
                </p>
                <button onClick={() => setShowForm(true)} className="bg-emerald-900 text-[#FDFCF8] px-8 py-3 rounded-full text-sm font-medium hover:bg-emerald-800 transition-all shadow-lg font-ui">Schedule First Pickup</button>
             </div>
          ) : (
            <div>
               <h3 className="font-serif text-xl md:text-2xl text-emerald-950 mb-6 md:mb-8">Active Portfolio</h3>
               <div className="space-y-3 md:space-y-4">
                  {requests.map(req => (
                    <div key={req.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-8 bg-white/40 border border-emerald-900/5 rounded-[28px] md:rounded-[32px] hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all duration-500">
                       <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-900/5 flex-shrink-0 flex items-center justify-center text-emerald-900"><Package strokeWidth={1} size={24}/></div>
                          <div>
                             <h3 className="text-lg md:text-2xl text-emerald-950">{req.item_type}</h3>
                             <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-emerald-900/40 uppercase tracking-widest mt-1 font-ui">
                                <span>Qty: {req.quantity}</span>
                                <span>•</span>
                                <span>{req.date}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 md:gap-6 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                          <StatusBadge status={req.status} />
                          {req.status === 'Pending' && <button onClick={() => handleDelete(req.id)} className="p-2 md:p-3 text-emerald-900/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
       </div>

       {/* Education Card */}
       <div className="relative rounded-[40px] overflow-hidden w-full h-[220px] md:h-[300px] shadow-lg group mt-4">
           <img
              src="https://images.unsplash.com/photo-1550041473-d296a3a8a18a?auto=format&fit=crop&w=1200&q=80"
              alt="Did you know e-waste"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-emerald-900/80 mix-blend-multiply"></div>
           <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center items-center text-center text-white">
              <div className="flex items-center gap-2 mb-4 text-emerald-300 text-sm font-bold uppercase tracking-widest font-ui"><Zap size={20}/> Did you know?</div>
              <p className="text-lg md:text-2xl lg:text-3xl font-serif leading-relaxed max-w-3xl">
                 "95% of India's e-waste is processed by the informal sector, releasing toxic lead and mercury into our soil and groundwater."
              </p>
           </div>
       </div>

       {/* Request Form Modal */}
       {showForm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
            <div className="glass-dark w-full max-w-lg mx-4 p-6 md:p-10 rounded-[40px] relative shadow-2xl overflow-y-auto max-h-[90dvh]">
               <div className="flex justify-between items-center mb-6 md:mb-8">
                  <div>
                     <h2 className="text-2xl md:text-3xl text-white">Request Collection</h2>
                     {showUnavailable && <p className="text-orange-300 text-xs mt-1 font-ui">Outside current service area</p>}
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white p-1"><X size={24}/></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 font-ui">

                  {/* ── Address fields (shown first so pincode can gate the rest) ── */}
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Street Address / Locality</label>
                     <textarea rows="2" className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none resize-none placeholder-white/30" placeholder="House/flat no., street, area, landmark…" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} required={!showUnavailable}></textarea>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Pincode</label>
                        {pincodeComplete && (
                           <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${isServiceable ? 'text-emerald-400' : 'text-orange-400'}`}>
                              {isServiceable ? '✓ Service available' : '⚠ Outside service area'}
                           </span>
                        )}
                     </div>
                     <input type="text" inputMode="numeric" maxLength={6} required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none placeholder-white/30" placeholder="6-digit pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} />
                  </div>

                  {/* ── Service unavailable banner ── */}
                  {showUnavailable && (
                     <div className="bg-orange-500/15 border border-orange-400/30 rounded-xl p-4 space-y-1">
                        <p className="text-orange-200 text-sm font-bold">Service not yet available at {formData.pincode}.</p>
                        <p className="text-orange-200/80 text-xs leading-relaxed">We currently operate in Gurugram (122002). Leave your mobile number below and we'll notify you as soon as we expand to your area.</p>
                     </div>
                  )}

                  {/* ── Scheduling fields (only for serviceable areas) ── */}
                  {!showUnavailable && (
                     <>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Item Type</label>
                           <select required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none" value={formData.itemType} onChange={e => setFormData({...formData, itemType: e.target.value})}>
                              {['Laptop', 'Mobile', 'Tablet', 'Batteries', 'Other'].map(o => <option key={o} className="text-emerald-950">{o}</option>)}
                           </select>
                        </div>
                        {formData.itemType === 'Other' && (
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Specify Item</label>
                              <input type="text" required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none placeholder-white/30" placeholder="E.g. Printer, Monitor…" value={formData.otherItemType} onChange={e => setFormData({...formData, otherItemType: e.target.value})} />
                           </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Quantity</label>
                              <input type="number" min="1" required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Preferred Date</label>
                              <input type="date" required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Time Slot</label>
                           <input type="time" required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                        </div>
                     </>
                  )}

                  {/* ── Mobile number (always shown) ── */}
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">Mobile Number</label>
                     <input type="tel" inputMode="tel" autoComplete="tel" required className="w-full bg-white/5 border-none rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-400 outline-none placeholder-white/30" placeholder="+91…" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  </div>

                  <button type="submit" className={`w-full font-bold py-4 md:py-5 rounded-xl transition-all mt-2 ${showUnavailable ? 'bg-orange-400 text-white hover:bg-orange-300' : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'}`}>
                     {showUnavailable ? 'Notify Me When Available' : 'Confirm Request'}
                  </button>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}

function AdminView({ requests, refreshRequests }) {
  const [waitlist, setWaitlist] = useState([]);

  useEffect(() => {
    supabase.from('waitlist').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setWaitlist(data || []));
  }, []);

  const updateStatus = async (id, s) => {
    await supabase.from('pickup_requests').update({ status: s }).eq('id', id);
    refreshRequests();
  };

  return (
    <div className="space-y-6">
      {/* ── Pickup Requests ── */}
      <div className="bg-white/50 backdrop-blur-xl border border-emerald-900/5 rounded-[40px] overflow-hidden">
        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-emerald-900/5">
          {requests.length === 0 && (
            <p className="p-8 text-center text-emerald-900/40 font-ui">No requests yet.</p>
          )}
          {requests.map(req => (
            <div key={req.id} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-emerald-950">{req.user_name}</p>
                  <p className="text-xs text-emerald-900/50 font-ui">{req.user_email}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="text-sm text-emerald-900/70 font-ui space-y-1">
                <p className="font-bold text-emerald-900">{req.quantity}x {req.item_type}</p>
                <p>{req.date} at {req.time}</p>
                <p className="text-emerald-900/50">{req.address}{req.pincode ? ` · ${req.pincode}` : ''}</p>
                {req.mobile && <p className="text-emerald-900/50">{req.mobile}</p>}
              </div>
              <div className="flex gap-2 pt-1 font-ui">
                {req.status === 'Pending' && (
                  <button onClick={() => updateStatus(req.id, 'Scheduled')} className="px-5 py-2 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-200">
                    Approve
                  </button>
                )}
                {req.status === 'Scheduled' && (
                  <button onClick={() => updateStatus(req.id, 'Collected')} className="px-5 py-2 bg-emerald-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-800">
                    Finalize
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
           <table className="w-full text-left">
              <thead className="text-xs font-bold uppercase tracking-widest text-emerald-900/40 border-b border-emerald-900/5 font-ui">
                 <tr><th className="p-6 lg:p-8">User</th><th className="p-6 lg:p-8">Details</th><th className="p-6 lg:p-8">Mobile</th><th className="p-6 lg:p-8">Status</th><th className="p-6 lg:p-8 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/5">
                 {requests.map(req => (
                    <tr key={req.id} className="hover:bg-white/50 transition-colors">
                       <td className="p-6 lg:p-8 text-base lg:text-xl text-emerald-950">{req.user_name}</td>
                       <td className="p-6 lg:p-8">
                          <div className="font-bold text-emerald-900">{req.quantity}x {req.item_type}</div>
                          <div className="text-sm text-emerald-900/40">{req.address}{req.pincode ? ` · ${req.pincode}` : ''}</div>
                          <div className="text-xs text-emerald-900/30">{req.date} {req.time}</div>
                       </td>
                       <td className="p-6 lg:p-8 text-sm text-emerald-900/60 font-ui">{req.mobile || '—'}</td>
                       <td className="p-6 lg:p-8"><StatusBadge status={req.status} /></td>
                       <td className="p-6 lg:p-8 text-right space-x-2 font-ui">
                          {req.status === 'Pending' && <button onClick={() => updateStatus(req.id, 'Scheduled')} className="px-6 py-2 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-200">Approve</button>}
                          {req.status === 'Scheduled' && <button onClick={() => updateStatus(req.id, 'Collected')} className="px-6 py-2 bg-emerald-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-800">Finalize</button>}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* ── Expansion Waitlist ── */}
      <div className="bg-white/50 backdrop-blur-xl border border-emerald-900/5 rounded-[40px] overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-emerald-900/5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-emerald-950">Expansion Waitlist</h3>
            <p className="text-xs text-emerald-900/40 font-ui mt-1 uppercase tracking-widest">Contacts from outside service area</p>
          </div>
          <span className="bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-ui">{waitlist.length} contacts</span>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-emerald-900/5">
          {waitlist.length === 0 && <p className="p-8 text-center text-emerald-900/40 font-ui">No waitlist entries yet.</p>}
          {waitlist.map(w => (
            <div key={w.id} className="p-5 space-y-1 font-ui">
              <p className="font-bold text-emerald-950">{w.name || '—'}</p>
              <p className="text-sm text-emerald-900/60">{w.email}</p>
              <div className="flex gap-4 text-sm text-emerald-900/50 pt-1">
                <span>{w.mobile}</span>
                <span className="font-bold text-orange-600">{w.pincode}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs font-bold uppercase tracking-widest text-emerald-900/40 border-b border-emerald-900/5 font-ui">
              <tr><th className="p-6 lg:p-8">Name</th><th className="p-6 lg:p-8">Email</th><th className="p-6 lg:p-8">Mobile</th><th className="p-6 lg:p-8">Pincode</th><th className="p-6 lg:p-8">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {waitlist.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-emerald-900/40 font-ui">No waitlist entries yet.</td></tr>
              )}
              {waitlist.map(w => (
                <tr key={w.id} className="hover:bg-white/50 transition-colors">
                  <td className="p-6 lg:p-8 text-emerald-950">{w.name || '—'}</td>
                  <td className="p-6 lg:p-8 text-sm text-emerald-900/60 font-ui">{w.email}</td>
                  <td className="p-6 lg:p-8 text-sm text-emerald-900/80 font-ui">{w.mobile}</td>
                  <td className="p-6 lg:p-8"><span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full font-ui">{w.pincode}</span></td>
                  <td className="p-6 lg:p-8 text-sm text-emerald-900/40 font-ui">{new Date(w.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 5. Reset Password Page ---
function ResetPasswordPage({ setView, showNotification }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg('Passwords do not match.'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      showNotification('Password updated! Please sign in with your new password.');
      await supabase.auth.signOut();
      setView('auth');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <div className="text-3xl md:text-4xl text-emerald-950 mb-3 leading-tight">
            <StaggeredText text="Set New Password." />
          </div>
          <p className="text-emerald-900/50 font-ui">Choose a strong password for your account.</p>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="New Password"
            required
            className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm Password"
            required
            className="w-full bg-white border-b border-emerald-900/10 px-0 py-4 text-lg outline-none focus:border-emerald-900 transition-colors placeholder:text-emerald-900/20 text-emerald-950 font-ui"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center font-medium font-ui">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {errorMsg}
            </div>
          )}
          <button disabled={loading} className="w-full bg-emerald-950 text-[#FDFCF8] py-5 rounded-full mt-8 hover:bg-emerald-900 transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center font-ui">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Updating...</> : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 6. Recycler Onboarding ---
function RecyclerOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to the Recycler Hub.',
      desc: "You're now part of CleanCollect's certified collection network. You will fulfill e-waste pickup requests from residents in your area.",
      Icon: Recycle,
    },
    {
      title: 'Browse & Accept Jobs.',
      desc: 'Every pending resident request is visible on your dashboard. Accept a job to assign it to yourself, then mark it collected once done.',
      Icon: Truck,
    },
    {
      title: 'Track Your Impact.',
      desc: 'Every kilogram you collect reduces toxic waste entering landfills. Your hub tracks total collections and your environmental contribution.',
      Icon: Leaf,
    },
  ];

  const { title, desc, Icon } = steps[step];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-[#FDFCF8]">
      <div className="w-full max-w-lg text-center">
        {/* Step dots */}
        <div className="flex gap-2 justify-center mb-14">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-emerald-900' : 'w-4 bg-emerald-900/15'}`} />
          ))}
        </div>

        <div className="w-24 h-24 bg-emerald-950 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-white transition-all duration-500">
          <Icon size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl md:text-4xl text-emerald-950 mb-6 leading-tight">{title}</h2>
        <p className="text-lg text-emerald-900/60 leading-relaxed mb-12 max-w-md mx-auto font-light">{desc}</p>

        <div className="flex gap-4 justify-center">
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="bg-emerald-950 text-white px-10 py-4 rounded-full flex items-center gap-2 hover:bg-emerald-900 transition-all font-ui font-bold">
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={onComplete}
              className="bg-emerald-950 text-white px-10 py-4 rounded-full flex items-center gap-2 hover:bg-emerald-900 transition-all font-ui font-bold">
              Start Collecting <ArrowRight size={18} />
            </button>
          )}
          {step === 0 && (
            <button onClick={onComplete}
              className="px-10 py-4 rounded-full border border-emerald-900/20 text-emerald-900/50 hover:text-emerald-900 transition-colors font-ui">
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 7. Recycler Dashboard ---
function RecyclerJobCard({ req, action, actionLabel, actionClass }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-emerald-900/5 rounded-[28px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-800">
          <Package size={22} />
        </div>
        <div>
          <p className="font-bold text-emerald-950 text-lg">{req.quantity}× {req.item_type}</p>
          <p className="text-sm text-emerald-900/60 font-ui mt-0.5">{req.user_name} · {req.date} at {req.time}</p>
          <p className="text-xs text-emerald-900/40 font-ui mt-0.5">{req.address}</p>
          {req.mobile && <p className="text-xs text-emerald-700/60 font-ui mt-0.5">{req.mobile}</p>}
        </div>
      </div>
      <button onClick={action}
        className={`${actionClass} px-6 py-2.5 rounded-full text-sm font-bold font-ui uppercase tracking-wider flex-shrink-0 transition-all active:scale-95`}>
        {actionLabel}
      </button>
    </div>
  );
}

function RecyclerDashboard({ appUser, showNotification }) {
  const [requests, setRequests] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem(`recycler_onboarded_${appUser.id}`)
  );

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('pickup_requests').select('*').order('created_at', { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase.channel('recycler_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => fetchRequests())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const availableJobs = requests.filter(r => r.status === 'Pending');
  const myJobs = requests.filter(r => r.recycler_id === appUser.id);
  const activeJobs = myJobs.filter(r => r.status === 'Scheduled');
  const completedJobs = myJobs.filter(r => r.status === 'Collected');

  const acceptJob = async (id) => {
    const { error } = await supabase.from('pickup_requests')
      .update({ status: 'Scheduled', recycler_id: appUser.id }).eq('id', id);
    if (!error) { showNotification('Job accepted! Coordinate pickup with the resident.'); fetchRequests(); }
    else showNotification('Failed to accept job. Please try again.', 'error');
  };

  const completeJob = async (id) => {
    const { error } = await supabase.from('pickup_requests')
      .update({ status: 'Collected' }).eq('id', id);
    if (!error) { showNotification('Collection complete! Great work.'); fetchRequests(); }
    else showNotification('Failed to update status. Try again.', 'error');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(`recycler_onboarded_${appUser.id}`, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <RecyclerOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex-1 px-4 md:px-6 pb-20 pt-12">
      <div className="max-w-7xl mx-auto">
        <div className="pt-10 border-b border-emerald-900/5 pb-6 md:pb-10 mb-6 md:mb-12">
          <div className="text-4xl md:text-5xl lg:text-6xl text-emerald-950 mb-2 leading-tight">
            <StaggeredText text="Recycler Hub" />
          </div>
          <p className="text-emerald-900/50 text-base md:text-lg font-light">Welcome back, {appUser.name}.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
          <div className="glass-dark p-5 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[120px] md:min-h-[180px] relative overflow-hidden">
            <div className="text-emerald-300 font-bold uppercase tracking-widest text-xs font-ui">Available</div>
            <div className="text-3xl md:text-5xl text-white">{availableJobs.length}</div>
            <div className="text-emerald-100/50 text-xs font-ui">Pending jobs</div>
            <div className="absolute right-0 bottom-0 opacity-10"><Package size={120} /></div>
          </div>
          <div className="glass p-5 md:p-8 rounded-[32px] border border-emerald-900/5 flex flex-col justify-between min-h-[120px] md:min-h-[180px]">
            <div className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs font-ui">Active</div>
            <div className="text-3xl md:text-5xl text-emerald-950">{activeJobs.length}</div>
            <div className="text-emerald-900/40 text-xs font-ui">Accepted by you</div>
          </div>
          <div className="glass p-5 md:p-8 rounded-[32px] border border-emerald-900/5 flex flex-col justify-between min-h-[120px] md:min-h-[180px]">
            <div className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs font-ui">Completed</div>
            <div className="text-3xl md:text-5xl text-emerald-600">{completedJobs.length}</div>
            <div className="text-emerald-900/40 text-xs font-ui">Total collections</div>
          </div>
        </div>

        {/* Active jobs */}
        {activeJobs.length > 0 && (
          <div className="mb-10 md:mb-14">
            <h3 className="font-serif text-xl md:text-2xl text-emerald-950 mb-6">My Active Jobs</h3>
            <div className="space-y-4">
              {activeJobs.map(req => (
                <RecyclerJobCard key={req.id} req={req}
                  action={() => completeJob(req.id)}
                  actionLabel="Mark Collected"
                  actionClass="bg-emerald-900 text-white hover:bg-emerald-800" />
              ))}
            </div>
          </div>
        )}

        {/* Available pickups */}
        <div>
          <h3 className="font-serif text-xl md:text-2xl text-emerald-950 mb-6">Available Pickups</h3>
          {availableJobs.length === 0 ? (
            <div className="bg-white/60 p-8 md:p-10 rounded-[40px] border border-emerald-900/5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-800 mb-4"><Package size={28} /></div>
              <p className="text-emerald-950 font-serif text-xl mb-2">No pending pickups right now.</p>
              <p className="text-emerald-900/50 font-light text-sm">New requests from residents will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableJobs.map(req => (
                <RecyclerJobCard key={req.id} req={req}
                  action={() => acceptJob(req.id)}
                  actionLabel="Accept Job"
                  actionClass="bg-emerald-100 text-emerald-900 hover:bg-emerald-200" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
