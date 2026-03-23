import React, { useState, useEffect } from 'react';
import {
    Terminal,
    BookOpen,
    Zap,
    Code,
    ChevronRight,
    Copy,
    CheckCircle2,
    Database,
    LineChart,
    ArrowRight,
    Menu,
    X,
    MessageCircle,
    Heart,
    Send,
    User,
    MoreHorizontal,
    Repeat2
} from 'lucide-react';

// --- MOCK DATA ---
const LESSONS = [
    { id: 1, title: 'The q Philosophy', desc: 'Understanding right-to-left evaluation and why everything is a list.', time: '5 min', level: 'Beginner' },
    { id: 2, title: 'Atoms, Lists & Dictionaries', desc: 'The fundamental building blocks of kdb+ data structures.', time: '10 min', level: 'Beginner' },
    { id: 3, title: 'Tables & qSQL', desc: 'Querying in-memory tables with blistering speed.', time: '15 min', level: 'Intermediate' },
    { id: 4, title: 'Joins (aj, asof, wj)', desc: 'Mastering time-series joins, the bread and butter of quantitative finance.', time: '20 min', level: 'Advanced' },
    { id: 5, title: 'Tick Architecture', desc: 'Building a real-time data capture system from scratch.', time: '30 min', level: 'Advanced' },
];

const SNIPPETS = [
    {
        title: 'Filtering & Aggregation',
        description: 'Calculate the Volume-Weighted Average Price (VWAP) by symbol.',
        sql: 'SELECT sym, SUM(price * size) / SUM(size) as vwap\nFROM trade\nWHERE date = CURRENT_DATE\nGROUP BY sym',
        q: 'select vwap:size wavg price by sym from trade where date=.z.d'
    },
    {
        title: 'As-Of Joins',
        description: 'Join trades with the prevailing quote at the exact time of the trade.',
        sql: '-- Complex standard SQL involving subqueries and window functions\nSELECT t.*, q.bid, q.ask\nFROM trade t\nLEFT JOIN LATERAL (\n  SELECT bid, ask FROM quote q \n  WHERE q.sym = t.sym AND q.time <= t.time \n  ORDER BY time DESC LIMIT 1\n) q ON true',
        q: 'aj[`sym`time; trade; quote]'
    },
    {
        title: 'List Operations',
        description: 'Generate a list of 10 random numbers between 0 and 100.',
        python: 'import random\n[random.randint(0, 100) for _ in range(10)]',
        q: '10?100'
    }
];

const SEED_POSTS = [
    {
        id: 1,
        author: 'dev001',
        handle: '@dev001',
        avatar: '🧑‍💻',
        content: 'Just discovered that `aj` (as-of join) in q can replace 50+ lines of SQL window functions. My mind is blown. 🤯 This language is criminally underrated.',
        timestamp: '2h ago',
        likes: 24,
        replies: 5,
        reposts: 3,
        liked: false
    },
    {
        id: 2,
        author: 'dev002',
        handle: '@dev002',
        avatar: '👩‍🔬',
        content: 'Hot take: once you learn to read right-to-left evaluation in q, every other language starts feeling painfully verbose. `select avg price by sym from trade where date=.z.d` — chef\'s kiss.',
        timestamp: '4h ago',
        likes: 42,
        replies: 12,
        reposts: 8,
        liked: false
    },
    {
        id: 3,
        author: 'dev003',
        handle: '@dev003',
        avatar: '🐣',
        content: 'Day 3 of learning q. I typed `10?100` and got 10 random numbers. In Python that\'s `import random; [random.randint(0,100) for _ in range(10)]`. Why did nobody tell me about this earlier?',
        timestamp: '6h ago',
        likes: 67,
        replies: 8,
        reposts: 15,
        liked: false
    },
    {
        id: 4,
        author: 'dev004',
        handle: '@dev004',
        avatar: '📈',
        content: 'Built a tick data capture system in q today. The entire feedhandler + logging + historical database persistence fits in ~40 lines. Try doing that in Java. 😂',
        timestamp: '8h ago',
        likes: 31,
        replies: 4,
        reposts: 6,
        liked: false
    },
    {
        id: 5,
        author: 'dev005',
        handle: '@dev005',
        avatar: '🚀',
        content: 'Tip for q beginners: the kx documentation at code.kx.com is excellent but dense. This site\'s curriculum breaks things down really well. Start with atoms & lists, then tackle tables.',
        timestamp: '12h ago',
        likes: 53,
        replies: 7,
        reposts: 11,
        liked: false
    },
];

// --- COMPONENTS ---

const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-lg bg-slate-900 border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{language}</span>
                <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
                    title="Copy to clipboard"
                >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm text-slate-300 whitespace-pre">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

const TerminalMock = () => {
    const lines = [
        { type: 'input', text: 'q)til 5' },
        { type: 'output', text: '0 1 2 3 4' },
        { type: 'input', text: 'q)trade:([] sym:`A`B`A`C; price:10.5 20.1 10.6 30.0; size:100 200 150 500)' },
        { type: 'output', text: '' },
        { type: 'input', text: 'q)select sum size by sym from trade' },
        { type: 'output', text: 'sym| size\n---| ----\nA  | 250\nB  | 200\nC  | 500' },
    ];

    return (
        <div className="rounded-xl overflow-hidden bg-[#0a0f18] shadow-2xl border border-slate-800 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="mx-auto text-xs font-mono text-slate-500">q (64-bit)</div>
            </div>
            <div className="p-6 font-mono text-sm sm:text-base leading-relaxed text-emerald-400/90 overflow-x-auto">
                <div className="text-slate-500 mb-4">KDB+ 4.0 2024.01.01 Copyright (C) 1993-2024 Kx Systems</div>
                {lines.map((line, idx) => (
                    <div key={idx} className={line.type === 'input' ? 'text-slate-100' : 'text-emerald-300/80 mb-4 whitespace-pre'}>
                        {line.text}
                    </div>
                ))}
                <div className="flex items-center text-slate-100 mt-2">
                    <span>q)</span>
                    <span className="w-2 h-5 ml-1 bg-emerald-400 animate-pulse"></span>
                </div>
            </div>
        </div>
    );
};

const ForumComposer = ({ onPost }) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const maxLength = 280;

    const handleSubmit = () => {
        if (text.trim().length === 0) return;
        onPost(text.trim());
        setText('');
        setIsFocused(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    const charPercent = (text.length / maxLength) * 100;
    const isOverLimit = text.length > maxLength;

    return (
        <div className={`rounded-2xl bg-slate-900/60 border transition-all duration-300 ${isFocused ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]' : 'border-slate-800'
            }`}>
            <div className="p-5">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 flex-shrink-0 shadow-lg">
                        <User size={22} />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => text.length === 0 && setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            placeholder="Share your q insights, ask a question, or flex your one-liners..."
                            className="w-full bg-transparent text-slate-200 placeholder-slate-600 resize-none outline-none text-base leading-relaxed min-h-[60px]"
                            rows={isFocused ? 3 : 2}
                            maxLength={300}
                        />
                    </div>
                </div>
            </div>
            {(isFocused || text.length > 0) && (
                <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
                                <circle
                                    cx="18" cy="18" r="14" fill="none" strokeWidth="2"
                                    strokeDasharray={`${Math.min(charPercent, 100) * 0.88} 88`}
                                    className={isOverLimit ? 'stroke-rose-500' : charPercent > 80 ? 'stroke-amber-400' : 'stroke-emerald-400'}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <span className={`text-xs font-mono ${isOverLimit ? 'text-rose-400' : 'text-slate-500'}`}>
                            {text.length}/{maxLength}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 hidden sm:inline">Ctrl+Enter to post</span>
                        <button
                            onClick={handleSubmit}
                            disabled={text.trim().length === 0 || isOverLimit}
                            className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${text.trim().length > 0 && !isOverLimit
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <Send size={14} />
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ForumPost = ({ post, onLike }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group relative p-5 rounded-2xl bg-slate-900/30 border border-slate-800 hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-700 group-hover:border-slate-600 transition-colors">
                    {post.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-white truncate">{post.author}</span>
                            <span className="text-slate-500 text-sm truncate">{post.handle}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-500 text-sm flex-shrink-0">{post.timestamp}</span>
                        </div>
                        <button className="text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Body Text */}
                    <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-1 -ml-2">
                        {/* Reply */}
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all text-sm group/btn">
                            <MessageCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span className="font-medium">{post.replies}</span>
                        </button>

                        {/* Repost */}
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all text-sm group/btn">
                            <Repeat2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span className="font-medium">{post.reposts}</span>
                        </button>

                        {/* Like */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm group/btn ${post.liked
                                    ? 'text-rose-400'
                                    : 'text-slate-500 hover:text-rose-400 hover:bg-rose-400/10'
                                }`}
                        >
                            <Heart
                                size={16}
                                fill={post.liked ? 'currentColor' : 'none'}
                                className={`group-hover/btn:scale-110 transition-transform ${post.liked ? 'animate-[heartBeat_0.3s_ease-in-out]' : ''}`}
                            />
                            <span className="font-medium">{post.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APPLICATION ---

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [forumPosts, setForumPosts] = useState(SEED_POSTS);

    const handleNewPost = (content) => {
        const newPost = {
            id: Date.now(),
            author: 'You',
            handle: '@anonymous',
            avatar: '✨',
            content,
            timestamp: 'just now',
            likes: 0,
            replies: 0,
            reposts: 0,
            liked: false
        };
        setForumPosts(prev => [newPost, ...prev]);
    };

    const handleLike = (postId) => {
        setForumPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
                : post
        ));
    };

    const navigate = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">

            {/* NAVIGATION */}
            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div
                            className="flex items-center space-x-2 cursor-pointer group"
                            onClick={() => navigate('home')}
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 group-hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                q
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">learn<span className="text-emerald-400">kdb</span></span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button
                                onClick={() => navigate('home')}
                                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => navigate('learn')}
                                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${activeTab === 'learn' ? 'text-emerald-400' : 'text-slate-400'}`}
                            >
                                Curriculum
                            </button>
                            <button
                                onClick={() => navigate('snippets')}
                                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${activeTab === 'snippets' ? 'text-emerald-400' : 'text-slate-400'}`}
                            >
                                q vs The World
                            </button>
                            <button
                                onClick={() => navigate('forum')}
                                className={`text-sm font-medium transition-colors hover:text-emerald-400 flex items-center gap-1.5 ${activeTab === 'forum' ? 'text-emerald-400' : 'text-slate-400'}`}
                            >
                                <MessageCircle size={15} />
                                Forum
                            </button>
                        </div>

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <button onClick={() => navigate('learn')} className="px-4 py-2 rounded-md bg-slate-800 text-sm font-medium hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 transition-all">
                                Start Coding
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-slate-400 hover:text-white"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
                        <button
                            onClick={() => navigate('home')}
                            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === 'home' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => navigate('learn')}
                            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === 'learn' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            Curriculum
                        </button>
                        <button
                            onClick={() => navigate('snippets')}
                            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === 'snippets' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            q vs The World
                        </button>
                        <button
                            onClick={() => navigate('forum')}
                            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === 'forum' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            💬 Forum
                        </button>
                    </div>
                )}
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)]">

                {/* HOME VIEW */}
                {activeTab === 'home' && (
                    <div className="space-y-24 animate-in fade-in duration-500">
                        {/* Hero Section */}
                        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 pt-10">
                            <div className="flex-1 space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                    <Zap size={16} />
                                    <span>The language of Wall Street</span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                                    Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">kdb+/q</span> without the headache.
                                </h1>
                                <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Fast, expressive, and a little intimidating. We break down the world's most powerful time-series database language into bite-sized, interactive lessons.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <button onClick={() => navigate('learn')} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 flex items-center justify-center space-x-2 transition-colors">
                                        <span>Start Learning</span>
                                        <ArrowRight size={18} />
                                    </button>
                                    <button onClick={() => navigate('snippets')} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 flex items-center justify-center space-x-2 transition-colors border border-slate-700">
                                        <Code size={18} />
                                        <span>View Snippets</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-lg lg:max-w-none">
                                <TerminalMock />
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="py-12 border-t border-slate-800">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-white mb-4">Why learn q?</h2>
                                <p className="text-slate-400">There is a reason the top hedge funds rely on it.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { icon: <Zap className="text-amber-400" size={32} />, title: "Blistering Speed", desc: "Vector-based operations and in-memory execution make complex analytics on billions of rows instantaneous." },
                                    { icon: <Database className="text-blue-400" size={32} />, title: "Built-in DB", desc: "q isn't just a language; it's deeply integrated with kdb+, creating a seamless flow from raw data to analytics." },
                                    { icon: <LineChart className="text-emerald-400" size={32} />, title: "Time-Series Native", desc: "Built specifically to handle order books, market data, and sensors. `asof` and `window` joins are native primitives." }
                                ].map((feature, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-6">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* LEARN VIEW */}
                {activeTab === 'learn' && (
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Curriculum</h2>
                            <p className="text-lg text-slate-400">From writing your first function to designing high-frequency tick architectures.</p>
                        </div>

                        <div className="space-y-4">
                            {LESSONS.map((lesson) => (
                                <div key={lesson.id} className="group relative flex items-start gap-6 p-6 rounded-xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                                        {lesson.id}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <div className="flex space-x-3 text-xs font-medium text-slate-500">
                                                <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800">{lesson.time}</span>
                                                <span className={`px-2 py-1 rounded-md border ${lesson.level === 'Beginner' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                                                    lesson.level === 'Intermediate' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                        'text-rose-400 border-rose-400/20 bg-rose-400/10'
                                                    }`}>
                                                    {lesson.level}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 leading-relaxed">{lesson.desc}</p>
                                    </div>
                                    <div className="hidden sm:flex self-center text-slate-600 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">Ready to try it yourself?</h4>
                                <p className="text-slate-400">Download the free non-commercial version of kdb+ to start hacking.</p>
                            </div>
                            <a
                                href="https://code.kx.com/q/learn/install/"
                                target="_blank"
                                rel="noreferrer"
                                className="whitespace-nowrap px-6 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                            >
                                Installation Guide
                            </a>
                        </div>
                    </div>
                )}

                {/* SNIPPETS VIEW */}
                {activeTab === 'snippets' && (
                    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-bold text-white mb-4">q vs The World</h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                Yes, it looks like someone fell asleep on the keyboard. But once you understand it, you'll realize how verbose other languages are.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {SNIPPETS.map((snippet, idx) => (
                                <div key={idx} className="bg-slate-900/30 rounded-2xl p-6 lg:p-8 border border-slate-800">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-white mb-2">{snippet.title}</h3>
                                        <p className="text-slate-400">{snippet.description}</p>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-6">
                                        {/* Standard Language */}
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-slate-500 ml-1">
                                                {snippet.sql ? 'Traditional SQL' : 'Python'}
                                            </div>
                                            <CodeBlock
                                                language={snippet.sql ? 'SQL' : 'Python'}
                                                code={snippet.sql || snippet.python}
                                            />
                                        </div>

                                        {/* q Idiom */}
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-emerald-500/80 ml-1 flex items-center">
                                                <Zap size={14} className="mr-1 inline" /> The q Way
                                            </div>
                                            <CodeBlock language="q" code={snippet.q} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FORUM VIEW */}
                {activeTab === 'forum' && (
                    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <MessageCircle size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Forum</h2>
                                </div>
                            </div>
                            <p className="text-slate-400 text-base">
                                Share tips, ask questions, or show off your most elegant q one-liners. Be nice — we're all learning. ✌️
                            </p>
                        </div>

                        {/* Composer */}
                        <div className="mb-8">
                            <ForumComposer onPost={handleNewPost} />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-slate-800"></div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {forumPosts.length} post{forumPosts.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-px bg-slate-800"></div>
                        </div>

                        {/* Feed */}
                        <div className="space-y-3">
                            {forumPosts.map((post) => (
                                <ForumPost key={post.id} post={post} onLike={handleLike} />
                            ))}
                        </div>

                        {/* End of Feed */}
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
                                <Terminal size={14} />
                                You've reached the end — go write some q!
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* FOOTER */}
            <footer className="bg-slate-950 border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center font-mono font-bold text-emerald-500 text-xs">
                            q
                        </div>
                        <span className="text-slate-400 font-semibold">learnkdb</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        Designed for those who want to query a billion rows before their coffee gets cold.
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">
                            <BookOpen size={20} />
                        </a>
                        <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">
                            <Terminal size={20} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
