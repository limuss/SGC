import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  User, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Link2, 
  MessageCircle, 
  Bookmark, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Award,
  Filter,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { ARTICLES, CATEGORIES } from '../data/articles';

export default function KnowledgeCenter({ onBackToParent, onSubmitInquiry }) {
  // Client-side nested sub-routing state
  const [currentArticleSlug, setCurrentArticleSlug] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const postsPerPage = 6;
  const contentTopRef = useRef(null);

  // Parse URL subpaths on mount and on popstate
  useEffect(() => {
    const parseUrl = () => {
      try {
        const path = decodeURIComponent(window.location.pathname);
        const segments = path.split('/').filter(Boolean);
        
        // Expected structures: 
        // 1. /Knowledge Center
        // 2. /Knowledge Center/sell-gold-in-chandigarh
        if (segments.length >= 2 && segments[0].toLowerCase() === 'knowledge center') {
          const subSlug = segments.slice(1).join('/');
          const articleExists = ARTICLES.some(a => a.slug === subSlug);
          if (articleExists) {
            setCurrentArticleSlug(subSlug);
            window.scrollTo(0, 0);
            return;
          }
        }
        
        // Handle categories search parameters if any
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        if (catParam && CATEGORIES.some(c => c.id === catParam)) {
          setSelectedCategory(catParam);
        }
        
        setCurrentArticleSlug(null);
      } catch (e) {
        console.error('Error parsing blog subpath URL:', e);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Sync state changes with browser History API for dynamic subpaths
  const navigateToArticle = (slug) => {
    try {
      window.history.pushState({ article: slug }, '', `/Knowledge Center/${slug}`);
      setCurrentArticleSlug(slug);
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn('History API navigation failed:', e);
      setCurrentArticleSlug(slug);
    }
  };

  const navigateToHome = () => {
    try {
      window.history.pushState({}, '', '/Knowledge Center');
      setCurrentArticleSlug(null);
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn('History API navigation failed:', e);
      setCurrentArticleSlug(null);
    }
  };

  // Find currently open article
  const currentArticle = useMemo(() => {
    if (!currentArticleSlug) return null;
    return ARTICLES.find(a => a.slug === currentArticleSlug);
  }, [currentArticleSlug]);

  // Dynamic SEO Tags & Schema Injection
  useEffect(() => {
    let scriptTags = [];
    
    if (currentArticle) {
      // 1. Update Document Title & Meta Description
      document.title = currentArticle.metaTitle || currentArticle.title;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', currentArticle.metaDescription);
      }

      // 2. Inject Article JSON-LD Schema
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": currentArticle.title,
        "description": currentArticle.metaDescription,
        "image": [
          window.location.origin + currentArticle.featuredImage
        ],
        "datePublished": "2026-01-15T08:00:00+05:30",
        "dateModified": "2026-06-25T10:00:00+05:30",
        "author": [{
          "@type": "Person",
          "name": currentArticle.author.name,
          "jobTitle": currentArticle.author.title,
          "url": "https://sgcindia.org/about"
        }],
        "publisher": {
          "@type": "Organization",
          "name": "Salafiya Group of Companies",
          "logo": {
            "@type": "ImageObject",
            "url": "https://sgcindia.org/src/assets/images/sgc_logo_uploaded.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        }
      };

      const articleScript = document.createElement('script');
      articleScript.type = 'application/ld+json';
      articleScript.className = 'seo-schema-tag';
      articleScript.text = JSON.stringify(articleSchema);
      document.head.appendChild(articleScript);
      scriptTags.push(articleScript);

      // 3. Inject FAQ Schema if the article has FAQs
      if (currentArticle.faqs && currentArticle.faqs.length > 0) {
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": currentArticle.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.className = 'seo-schema-tag';
        faqScript.text = JSON.stringify(faqSchema);
        document.head.appendChild(faqScript);
        scriptTags.push(faqScript);
      }

      // 4. Inject Breadcrumb Schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Knowledge Center",
            "item": window.location.origin + "/Knowledge%20Center"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": currentArticle.title,
            "item": window.location.href
          }
        ]
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.className = 'seo-schema-tag';
      breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
      scriptTags.push(breadcrumbScript);

    } else {
      // General Blog main view
      document.title = 'SGC Gold Knowledge Center | Expert Precious Metals Guides Chandigarh';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Explore verified guides, local bullion tax guidelines, and precious metals valuation guides written by certified SGC appraisers in Chandigarh, Mohali, and Panchkula.');
      }
    }

    // Cleanup generated scripts when article changes or component unmounts
    return () => {
      scriptTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [currentArticle]);

  // Handle Full-Text Searching & Filtering
  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(article => {
      // 1. Category Filter
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      // 2. Search Query Filter (Title, introduction, keywords, and body contents)
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        article.title.toLowerCase().includes(query) ||
        article.intro.toLowerCase().includes(query) ||
        article.focusKeyword.toLowerCase().includes(query) ||
        article.secondaryKeywords.some(kw => kw.toLowerCase().includes(query)) ||
        article.sections.some(sec => sec.title.toLowerCase().includes(query) || sec.content.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / postsPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredArticles.slice(startIndex, startIndex + postsPerPage);
  }, [filteredArticles, currentPage]);

  // Sync page index if filtered list size shrinks below page boundary
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredArticles, totalPages, currentPage]);

  // Social Sharing Action Handlers
  const handleShare = (platform) => {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(currentArticle ? currentArticle.title : document.title);
    
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
      return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Quick helper to scroll smoothly to a specific H2 section anchor in the article
  const handleScrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Related posts (same category or general)
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    return ARTICLES.filter(a => a.slug !== currentArticle.slug && (a.category === currentArticle.category || a.category !== ''))
      .slice(0, 2);
  }, [currentArticle]);

  return (
    <div className="min-h-screen bg-[#060608] font-sans text-gray-100 antialiased relative selection:bg-yellow-500 selection:text-black">
      
      {/* Background Ornate Glow Effects */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Ornate Header Segment */}
      <div className="border-b border-yellow-500/10 bg-[#090b11]/80 backdrop-blur-md sticky top-0 z-30 py-4 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToParent}
              className="p-2 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 transition-colors cursor-pointer group"
              title="Return to Parent corporate portal"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="h-6 w-[1px] bg-yellow-500/20" />
            <div className="flex flex-col">
              <span className="text-[10px] text-yellow-500 font-bold tracking-[0.2em] uppercase font-serif">SGC Premium Desk</span>
              <h1 className="text-sm font-semibold tracking-wide text-white uppercase">KNOWLEDGE CENTER</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onSubmitInquiry) {
                  // Pre-fill general enquiry
                  onSubmitInquiry({
                    name: 'Guest',
                    phone: '',
                    email: '',
                    businessSection: 'gold',
                    message: 'Hello, I was reading your Knowledge Center articles and would like to consult with an SGC Gold Appraisal specialist.'
                  });
                }
              }}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold text-xs tracking-widest hover:bg-yellow-400 transition-colors uppercase shadow-[0_4px_15px_rgba(234,179,8,0.2)] cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Direct Consultation
            </button>
          </div>
        </div>
      </div>

      <div ref={contentTopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <AnimatePresence mode="wait">
          {!currentArticle ? (
            
            /* --- KNOWLEDGE CENTER DIRECTORY / MAIN INDEX VIEW --- */
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Hero Header */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-bold text-yellow-500 tracking-[0.3em] uppercase block">EXPERT LITERATURE & RESOURCE HUB</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white leading-tight">
                  Demystifying Precious Metals & Debt Resolutions
                </h2>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Welcome to SGC's regulatory resources center. Every piece is written directly by our certified bullion appraisers to ensure absolute transparency, local market adherence, and professional EEAT compliance across the Tricity (Chandigarh, Mohali, Panchkula).
                </p>
              </div>

              {/* Controls Layout (Search & Category Filters) */}
              <div className="bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 shadow-2xl space-y-5">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  
                  {/* Search Bar */}
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search articles by keywords, regions (Chandigarh, Mohali), pure gold value, FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded bg-[#060608] border border-yellow-500/20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  {/* Clear Filter Indicators */}
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Categories Tabs */}
                <div className="border-t border-yellow-500/5 pt-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Filter by Core Category:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[#060608] text-gray-400 border border-yellow-500/10 hover:text-white hover:border-yellow-500/30'
                      }`}
                    >
                      All Resources ({ARTICLES.length})
                    </button>
                    {CATEGORIES.map(cat => {
                      const count = ARTICLES.filter(a => a.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-yellow-500 text-black'
                              : 'bg-[#060608] text-gray-400 border border-yellow-500/10 hover:text-white hover:border-yellow-500/30'
                          }`}
                        >
                          {cat.name} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Articles Grid */}
              {paginatedArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article, index) => (
                    <motion.article
                      key={article.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#090b11] border border-yellow-500/10 hover:border-yellow-500/30 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col group h-full"
                    >
                      {/* Featured Image Area */}
                      <div className="relative aspect-video overflow-hidden bg-black shrink-0">
                        <img 
                          src={article.featuredImage} 
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-[#090b11]/20 to-transparent" />
                        <span className="absolute top-3 left-3 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                          {CATEGORIES.find(c => c.id === article.category)?.name || 'General'}
                        </span>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-gray-300">
                          <Clock className="w-3 h-3 text-yellow-500" />
                          <span>{article.readingTime}</span>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          {/* Last updated indicator */}
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Calendar className="w-3 h-3 text-yellow-500/50" />
                            <span>Updated {article.lastUpdated}</span>
                          </div>

                          <h3 
                            onClick={() => navigateToArticle(article.slug)}
                            className="text-base font-serif font-bold text-white group-hover:text-yellow-500 transition-colors cursor-pointer leading-snug line-clamp-2"
                          >
                            {article.title}
                          </h3>

                          <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed">
                            {article.intro}
                          </p>
                        </div>

                        {/* Author line & CTA */}
                        <div className="pt-4 border-t border-yellow-500/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-yellow-500/20 bg-gray-900 shrink-0">
                              {article.author.avatar ? (
                                <img 
                                  src={article.author.avatar} 
                                  alt={article.author.name} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-yellow-500/15 text-yellow-500 text-xs font-bold font-serif">
                                  {article.author.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-semibold text-gray-300 leading-none">{article.author.name}</span>
                              <span className="text-[8px] text-gray-500">{article.author.title.split('&')[0]}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => navigateToArticle(article.slug)}
                            className="text-[11px] font-bold text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 group"
                          >
                            <span>READ ARTICLE</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="text-center py-16 bg-[#090b11] border border-dashed border-yellow-500/10 rounded-xl space-y-3">
                  <Search className="w-8 h-8 text-yellow-500/40 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Resources Found</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    We couldn't find any guidelines matching your query: <span className="text-yellow-500 font-semibold">"{searchQuery}"</span>. Try adjusting your parameters or browse our general category tabs.
                  </p>
                </div>
              )}

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-yellow-500/5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      contentTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-[#090b11] border border-yellow-500/15 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    PREVIOUS
                  </button>
                  <span className="text-xs text-gray-400 font-mono">
                    Page <span className="text-yellow-500 font-semibold">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      contentTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-[#090b11] border border-yellow-500/15 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    NEXT
                  </button>
                </div>
              )}

              {/* Trust/EEAT Banner */}
              <div className="bg-gradient-to-r from-yellow-500/5 via-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-500 border border-yellow-500/30 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-center md:text-left flex-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Verified Professional Standards</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    Every article and financial release program listed here complies directly with Indian Gold Hallmarking Regulations, Bureau of Indian Standards (BIS) directives, and the Reserve Bank of India (RBI) guidelines for mortgaged asset liquidations.
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* --- INDIVIDUAL DETAILED ARTICLE SCREEN VIEW --- */
            <motion.div
              key="article-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              
              {/* Breadcrumb Navigation bar */}
              <nav className="flex items-center flex-wrap gap-2 text-[10px] sm:text-xs text-gray-400 font-light border-b border-yellow-500/5 pb-4">
                <button onClick={onBackToParent} className="hover:text-yellow-500 transition-colors uppercase">SGC Group</button>
                <ChevronRight className="w-3 h-3 text-yellow-500/40" />
                <button onClick={navigateToHome} className="hover:text-yellow-500 transition-colors uppercase font-semibold">Knowledge Center</button>
                <ChevronRight className="w-3 h-3 text-yellow-500/40" />
                <span className="text-yellow-500 font-medium truncate max-w-xs sm:max-w-md uppercase">{currentArticle.title}</span>
              </nav>

              {/* Article Hero Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Article Body content (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Title & Metadata Header */}
                  <div className="space-y-4">
                    <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest inline-block border border-yellow-500/20">
                      {CATEGORIES.find(c => c.id === currentArticle.category)?.name}
                    </span>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-white leading-tight">
                      {currentArticle.title}
                    </h2>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-gray-400 border-b border-yellow-500/10 pb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="font-semibold text-gray-200">{currentArticle.author.name}</span>
                      </div>
                      <div className="h-3.5 w-[1px] bg-yellow-500/10 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Last Updated: {currentArticle.lastUpdated}</span>
                      </div>
                      <div className="h-3.5 w-[1px] bg-yellow-500/10 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{currentArticle.readingTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Featured Hero Banner */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-yellow-500/20 shadow-2xl bg-black">
                    <img 
                      src={currentArticle.featuredImage} 
                      alt={currentArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060608]/70 via-transparent to-transparent" />
                  </div>

                  {/* Intro Segment */}
                  <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-serif font-light border-l-4 border-yellow-500 pl-4 py-1 italic bg-yellow-500/[0.02]">
                    {currentArticle.intro}
                  </p>

                  {/* Dynamic Table of Contents (TOC) inside article body for mobile/compact layout */}
                  <div className="bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 lg:hidden space-y-3">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      TABLE OF CONTENTS
                    </h4>
                    <ul className="space-y-2 text-xs">
                      {currentArticle.sections.map(sec => (
                        <li key={sec.id}>
                          <button
                            onClick={() => handleScrollToHeading(sec.id)}
                            className="text-gray-400 hover:text-yellow-500 hover:underline text-left"
                          >
                            {sec.title}
                          </button>
                        </li>
                      ))}
                      {currentArticle.faqs && currentArticle.faqs.length > 0 && (
                        <li>
                          <button
                            onClick={() => handleScrollToHeading('faq-section')}
                            className="text-gray-400 hover:text-yellow-500 hover:underline text-left"
                          >
                            Frequently Asked Questions (FAQ)
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Render Sections with beautiful H2/H3 styling and spacing */}
                  <div className="space-y-10 text-gray-300 font-light text-sm sm:text-base leading-relaxed">
                    {currentArticle.sections.map(sec => (
                      <div 
                        key={sec.id} 
                        id={sec.id} 
                        className="scroll-mt-24 space-y-4"
                      >
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white border-b border-yellow-500/10 pb-2 flex items-center gap-2">
                          <span className="text-yellow-500 text-sm">✦</span>
                          {sec.title}
                        </h3>
                        
                        {/* Format Markdown bold, lists, and tables correctly using fallback text layout */}
                        <div className="whitespace-pre-wrap leading-relaxed space-y-3 prose prose-invert max-w-none text-gray-300">
                          {sec.content.split('\n\n').map((para, pIdx) => {
                            if (para.startsWith('- ') || para.startsWith('* ')) {
                              return (
                                <ul key={pIdx} className="list-disc pl-5 space-y-2 text-gray-300 my-3">
                                  {para.split('\n').map((li, lIdx) => (
                                    <li key={lIdx}>{li.replace(/^[\s-*]+/, '')}</li>
                                  ))}
                                </ul>
                              );
                            }
                            if (para.startsWith('|')) {
                              // Render structured table
                              const rows = para.split('\n').filter(Boolean);
                              const headerCols = rows[0].split('|').map(s => s.trim()).filter(Boolean);
                              const dataRows = rows.slice(2).map(r => r.split('|').map(s => s.trim()).filter(Boolean));
                              return (
                                <div key={pIdx} className="overflow-x-auto my-4 border border-yellow-500/10 rounded">
                                  <table className="min-w-full divide-y divide-yellow-500/10 text-xs text-left">
                                    <thead className="bg-[#090b11]">
                                      <tr>
                                        {headerCols.map((col, cIdx) => (
                                          <th key={cIdx} className="px-4 py-2 font-serif font-bold text-yellow-500">{col}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-yellow-500/5 bg-[#060608]/50">
                                      {dataRows.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                          {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-4 py-2.5 font-light text-gray-300">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }
                            return (
                              <p key={pIdx} className="leading-relaxed">
                                {para}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* FAQ Schema Accordions */}
                    {currentArticle.faqs && currentArticle.faqs.length > 0 && (
                      <div id="faq-section" className="scroll-mt-24 bg-[#090b11] border border-yellow-500/10 rounded-xl p-6 sm:p-8 space-y-6">
                        <div className="space-y-1.5 border-b border-yellow-500/10 pb-3">
                          <span className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase">Answers from the Experts</span>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Frequently Asked Questions</h3>
                        </div>

                        <div className="space-y-4">
                          {currentArticle.faqs.map((faq, idx) => (
                            <div key={idx} className="bg-[#060608] border border-yellow-500/5 rounded-lg p-4 space-y-2">
                              <h4 className="font-serif text-sm font-bold text-yellow-500 flex items-start gap-2">
                                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded uppercase shrink-0 font-sans mt-0.5">Q</span>
                                <span>{faq.question}</span>
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-400 font-light pl-6 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Internal Linking Quick Navigator */}
                  <div className="p-5 bg-[#090b11] border border-yellow-500/10 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block">Local Services Direct Assistance:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <button 
                        onClick={onBackToParent}
                        className="bg-[#060608] border border-yellow-500/10 hover:border-yellow-500/30 p-3 rounded text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-[9px] text-gray-500 uppercase block">01 / Parent Portal</span>
                        <span className="font-bold text-white group-hover:text-yellow-500 transition-colors">SGC Corporate Office</span>
                      </button>
                      <button 
                        onClick={() => {
                          // Quick trigger back to gold parent
                          onBackToParent();
                          setTimeout(() => {
                            const el = document.getElementById('navbar-desktop-gold-link') || document.getElementById('navbar-mobile-gold-link');
                            el?.click();
                          }, 500);
                        }}
                        className="bg-[#060608] border border-yellow-500/10 hover:border-yellow-500/30 p-3 rounded text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-[9px] text-gray-500 uppercase block">02 / Specialist Desk</span>
                        <span className="font-bold text-white group-hover:text-yellow-500 transition-colors">SGC Gold Buying Office</span>
                      </button>
                      <button 
                        onClick={() => {
                          // Scroll down to contact forms
                          onBackToParent();
                          setTimeout(() => {
                            const contactEl = document.getElementById('contact');
                            contactEl?.scrollIntoView({ behavior: 'smooth' });
                          }, 500);
                        }}
                        className="bg-[#060608] border border-yellow-500/10 hover:border-yellow-500/30 p-3 rounded text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-[9px] text-gray-500 uppercase block">03 / Consultation</span>
                        <span className="font-bold text-white group-hover:text-yellow-500 transition-colors">Contact Tricity Branch</span>
                      </button>
                    </div>
                  </div>

                  {/* Deeply integrated localized CTA */}
                  <div className="bg-gradient-to-r from-[#090b11] via-yellow-500/[0.03] to-[#090b11] border border-yellow-500/20 rounded-xl p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">{currentArticle.cta.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">{currentArticle.cta.text}</p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                      <button
                        onClick={() => {
                          if (onSubmitInquiry) {
                            onSubmitInquiry({
                              name: 'Visitor',
                              phone: '',
                              email: '',
                              businessSection: 'gold',
                              message: currentArticle.cta.prefillMessage
                            });
                          }
                        }}
                        className="w-full sm:w-auto bg-yellow-500 text-black px-6 py-3 rounded font-bold text-xs tracking-widest hover:bg-yellow-400 transition-all uppercase shadow-lg shadow-yellow-500/15 cursor-pointer text-center"
                      >
                        {currentArticle.cta.buttonText}
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                        <span>Zero appraisal charges • Instant Bank Transfers</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side: Sidebar Navigation/Widget Column (4 Cols) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  
                  {/* Table of Contents for Wide Desktop Layout */}
                  <div className="hidden lg:block bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-yellow-500/10">
                      <BookOpen className="w-4 h-4" />
                      TABLE OF CONTENTS
                    </h4>
                    <ul className="space-y-3 text-xs">
                      {currentArticle.sections.map(sec => (
                        <li key={sec.id}>
                          <button
                            onClick={() => handleScrollToHeading(sec.id)}
                            className="text-gray-400 hover:text-yellow-500 transition-colors hover:underline text-left leading-relaxed block"
                          >
                            {sec.title}
                          </button>
                        </li>
                      ))}
                      {currentArticle.faqs && currentArticle.faqs.length > 0 && (
                        <li>
                          <button
                            onClick={() => handleScrollToHeading('faq-section')}
                            className="text-gray-400 hover:text-yellow-500 transition-colors hover:underline text-left leading-relaxed block"
                          >
                            Frequently Asked Questions (FAQ)
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Social Sharing Widget */}
                  <div className="bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest pb-2 border-b border-yellow-500/5">
                      SHARE RESOURCE
                    </h4>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="p-2.5 rounded bg-[#060608] hover:bg-green-500/10 border border-yellow-500/10 hover:border-green-500/30 text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2.5 rounded bg-[#060608] hover:bg-blue-600/10 border border-yellow-500/10 hover:border-blue-600/30 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Share on Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2.5 rounded bg-[#060608] hover:bg-sky-400/10 border border-yellow-500/10 hover:border-sky-400/30 text-gray-400 hover:text-sky-400 transition-colors cursor-pointer"
                        title="Share on Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="p-2.5 rounded bg-[#060608] hover:bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer flex-1 flex items-center justify-center gap-2 text-xs font-medium"
                        title="Copy Link URL"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>{shareSuccess ? 'COPIED!' : 'COPY LINK'}</span>
                      </button>
                    </div>
                  </div>

                  {/* EEAT Author Card details */}
                  <div className="bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest pb-2 border-b border-yellow-500/5">
                      VERIFIED AUTHOR
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-500/20 bg-gray-900 shrink-0">
                        {currentArticle.author.avatar ? (
                          <img 
                            src={currentArticle.author.avatar} 
                            alt={currentArticle.author.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-500/15 text-yellow-500 text-sm font-bold font-serif">
                            {currentArticle.author.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-serif font-bold text-white leading-tight">{currentArticle.author.name}</span>
                        <span className="text-[10px] text-yellow-500/80">{currentArticle.author.title}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {currentArticle.author.bio}
                    </p>
                  </div>

                  {/* Related Articles column widget */}
                  {relatedArticles.length > 0 && (
                    <div className="bg-[#090b11] border border-yellow-500/10 rounded-xl p-5 space-y-4">
                      <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest pb-2 border-b border-yellow-500/5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500" />
                        RELATED ARTICLES
                      </h4>
                      <div className="space-y-4">
                        {relatedArticles.map(a => (
                          <div 
                            key={a.slug} 
                            onClick={() => navigateToArticle(a.slug)}
                            className="group cursor-pointer space-y-1 block border-b border-yellow-500/5 pb-3 last:border-0 last:pb-0"
                          >
                            <span className="text-[9px] text-yellow-500/70 uppercase font-medium">
                              {CATEGORIES.find(c => c.id === a.category)?.name}
                            </span>
                            <h5 className="text-xs font-bold text-gray-200 group-hover:text-yellow-500 transition-colors leading-snug">
                              {a.title}
                            </h5>
                            <span className="text-[10px] text-gray-500 block">{a.readingTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Return Button */}
                  <button
                    onClick={navigateToHome}
                    className="w-full text-center py-2.5 rounded bg-[#090b11] border border-yellow-500/10 hover:border-yellow-500/20 text-xs text-gray-400 hover:text-white transition-colors uppercase font-semibold block"
                  >
                    BACK TO KNOWLEDGE CENTER
                  </button>

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
