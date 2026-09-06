import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, ShieldCheck, Phone, Send, CheckCircle2, 
  Scale, FileText, Clock, Building2, Lock, ArrowRight,
  MessageCircle, Award
} from 'lucide-react';
import sgcLogo from '../assets/images/sgc_logo_uploaded.png';
import { submitToFormBold } from '../lib/formbold';

export default function GoldLeadModal({ isOpen, onClose, onSubmitInquiry }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('pledged_release'); // 'pledged_release' | 'sell_gold' | 'xrf_assay'
  const [selectedWeight, setSelectedWeight] = useState('25g');
  const [customWeight, setCustomWeight] = useState('');
  const [selectedLender, setSelectedLender] = useState('Muthoot');
  const [loanAmount, setLoanAmount] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeWhatsappUrl, setActiveWhatsappUrl] = useState('');

  const nameInputRef = useRef(null);

  // Focus the first input gracefully when modal opens
  useEffect(() => {
    if (isOpen && !isSuccess) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSuccess]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile or WhatsApp number');
      return;
    }

    setIsSubmitting(true);

    const finalWeight = selectedWeight === 'Custom' ? (customWeight ? `${customWeight}g` : 'Unspecified') : selectedWeight;
    
    let constructedMessage = `[Instant Lead Form] Service: ${
      serviceType === 'pledged_release' 
        ? 'Pledged Gold Loan Settlement & Bank Release' 
        : serviceType === 'sell_gold' 
        ? 'Sell Physical Gold Ornaments for Instant Cash' 
        : 'Free German XRF Spectrometer Purity Assay'
    }. `;
    constructedMessage += `Est. Weight: ${finalWeight}. `;
    if (serviceType === 'pledged_release') {
      constructedMessage += `Lender: ${selectedLender}. `;
      if (loanAmount) constructedMessage += `Approx Loan Due: ₹${loanAmount}. `;
    }
    constructedMessage += `Preferred Location: ${city}. `;
    if (notes.trim()) {
      constructedMessage += `Customer Note: "${notes.trim()}".`;
    }

    // Format structured lead details for FormBold & SGC Systems
    const leadPayload = {
      name: name.trim(),
      phone: cleanPhone,
      email: 'Direct Lead Form (SGC Gold)',
      businessSection: 'gold',
      service: serviceType === 'pledged_release' 
        ? 'Pledged Gold Loan Settlement & Bank Release' 
        : serviceType === 'sell_gold' 
        ? 'Sell Physical Gold Ornaments for Instant Cash' 
        : 'Free German XRF Spectrometer Purity Assay',
      source: 'Instant Gold Lead Modal',
      goldWeight: finalWeight,
      lender: serviceType === 'pledged_release' ? selectedLender : undefined,
      loanAmount: serviceType === 'pledged_release' && loanAmount ? `₹${loanAmount}` : undefined,
      city: city,
      location: city,
      message: constructedMessage
    };

    // 1. Direct FormBold transmission
    submitToFormBold(leadPayload).catch((e) => {
      console.warn('[GoldLeadModal] FormBold direct transmission note:', e);
    });

    // 2. Generate customized WhatsApp link for this inquiry
    const waText = encodeURIComponent(
      `*SGC GOLD CONSULTATION REQUEST*\n\n` +
      `*Name:* ${name.trim()}\n` +
      `*Phone:* ${cleanPhone}\n` +
      `*Service:* ${leadPayload.service}\n` +
      `*Gold Weight:* ${finalWeight}\n` +
      (serviceType === 'pledged_release' && selectedLender ? `*Pledged Bank / NBFC:* ${selectedLender}\n` : '') +
      (serviceType === 'pledged_release' && loanAmount ? `*Loan Balance Due:* ₹${loanAmount}\n` : '') +
      `*Preferred Branch:* ${city}\n` +
      (notes.trim() ? `*Customer Note:* "${notes.trim()}"\n` : '') +
      `\n_Hello SGC Gold Desk, I just submitted an appraisal request and would like to chat with an appraiser on WhatsApp._`
    );
    const waUrl = `https://wa.me/919186376081?text=${waText}`;
    setActiveWhatsappUrl(waUrl);

    // 3. Centralized app submission (stores to local cache, Firestore, Supabase, Formspree & WhatsApp)
    onSubmitInquiry(leadPayload);
    setIsSubmitting(false);
    setIsSuccess(true);

    // 4. Trigger direct WhatsApp redirection
    setTimeout(() => {
      try {
        const opened = window.open(waUrl, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          window.location.href = waUrl;
        }
      } catch (err) {
        window.location.href = waUrl;
      }
    }, 800);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setName('');
    setPhone('');
    setNotes('');
    setLoanAmount('');
    setCustomWeight('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            id="gold-lead-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-[#090b11] border border-yellow-500/25 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 my-auto text-left"
            id="gold-lead-modal-container"
          >
            {/* Golden top decorative highlight line */}
            <div className="h-1 w-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-amber-600"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-20 border border-white/10"
              title="Close form and explore site"
              id="gold-lead-modal-close-btn"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              /* Success Screen with Direct WhatsApp Redirection CTA */
              <div className="p-6 sm:p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center mx-auto text-yellow-500">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Opening WhatsApp (+91 91863 76081)...
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
                    Inquiry Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{name}</strong>. We are connecting you directly to our Senior Precious Metals Appraiser on WhatsApp so you can chat with us immediately.
                  </p>
                </div>

                {/* Instant Action CTAs */}
                <div className="bg-[#0f121d] border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-3 max-w-md mx-auto text-left">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Chat Directly With SGC Appraiser
                  </span>
                  
                  <a
                    href={activeWhatsappUrl || "https://wa.me/919186376081"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(37,211,102,0.3)] cursor-pointer"
                    id="gold-lead-whatsapp-primary"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Open WhatsApp Chat Now &rarr;</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="tel:9186376081"
                      className="flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 px-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all"
                      id="gold-lead-call-now"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/15 text-gray-300 py-2.5 px-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                    >
                      <span>Close</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleResetAndClose}
                    className="text-xs text-gray-400 hover:text-yellow-500 underline font-medium cursor-pointer transition-colors"
                    id="gold-lead-continue-browsing"
                  >
                    Continue exploring SGC Gold Live Rates &amp; Calculator →
                  </button>
                </div>
              </div>
            ) : (
              /* Lead Submission Form */
              <div className="p-5 sm:p-7 space-y-5">
                
                {/* Header Badge & Title */}
                <div className="space-y-1.5 pr-8">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                      <img 
                        src={sgcLogo} 
                        alt="SGC" 
                        className="w-6 h-6 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-500 uppercase">
                      SGC GOLD BUYERS • INSTANT LEAD FORM
                    </span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-white leading-tight">
                    Get Instant Gold Valuation &amp; Pledged Loan Clearance Quote
                  </h2>
                  <p className="text-xs text-gray-300 font-light leading-relaxed">
                    Clear bank dues at Muthoot, Manappuram, IIFL or commercial banks. 100% transparent assay, 1.5% flat handling fee, zero weight melting loss.
                  </p>
                </div>

                {/* Error Banner if any */}
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Service Selection Pills */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Select Service Needed *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceType('pledged_release')}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          serviceType === 'pledged_release'
                            ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400 shadow-sm'
                            : 'bg-[#10121d] border-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Building2 className="w-3.5 h-3.5" />
                          {serviceType === 'pledged_release' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                        </div>
                        <span className="text-xs font-bold mt-1.5 block leading-tight">Release Pledged Loan</span>
                        <span className="text-[9px] text-gray-400 font-normal leading-none mt-0.5">Muthoot, NBFC, Banks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceType('sell_gold')}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          serviceType === 'sell_gold'
                            ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400 shadow-sm'
                            : 'bg-[#10121d] border-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Scale className="w-3.5 h-3.5" />
                          {serviceType === 'sell_gold' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                        </div>
                        <span className="text-xs font-bold mt-1.5 block leading-tight">Sell Old Gold</span>
                        <span className="text-[9px] text-gray-400 font-normal leading-none mt-0.5">Spot cash on live rate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceType('xrf_assay')}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          serviceType === 'xrf_assay'
                            ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400 shadow-sm'
                            : 'bg-[#10121d] border-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Sparkles className="w-3.5 h-3.5" />
                          {serviceType === 'xrf_assay' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                        </div>
                        <span className="text-xs font-bold mt-1.5 block leading-tight">XRF Purity Assay</span>
                        <span className="text-[9px] text-gray-400 font-normal leading-none mt-0.5">Zero melting inspection</span>
                      </button>
                    </div>
                  </div>

                  {/* Name and Mobile Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                        Full Name *
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#121524] border border-white/10 focus:border-yellow-500/70 rounded-lg p-3 text-xs outline-none text-white transition-all placeholder:text-gray-500"
                        id="gold-lead-input-name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                        Mobile / WhatsApp No. *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-xs font-mono text-gray-400 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#121524] border border-white/10 focus:border-yellow-500/70 rounded-lg p-3 pl-11 text-xs outline-none text-white font-mono transition-all placeholder:text-gray-500"
                          id="gold-lead-input-phone"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estimated Gold Weight Chips */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Approximate Gold Weight
                      </label>
                      <span className="text-[10px] text-yellow-500 font-mono">Selected: {selectedWeight === 'Custom' ? (customWeight ? `${customWeight}g` : 'Custom') : selectedWeight}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['10-20g', '25g', '50g', '100g+', 'Custom'].map((weight) => (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => setSelectedWeight(weight)}
                          className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                            selectedWeight === weight
                              ? 'bg-yellow-500 text-black border-yellow-400'
                              : 'bg-[#10121d] text-gray-300 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {weight}
                        </button>
                      ))}
                    </div>
                    {selectedWeight === 'Custom' && (
                      <input
                        type="number"
                        placeholder="Enter weight in grams (e.g. 35)"
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        className="w-full mt-1.5 bg-[#121524] border border-white/10 focus:border-yellow-500/70 rounded-lg p-2.5 text-xs outline-none text-white font-mono"
                      />
                    )}
                  </div>

                  {/* Conditional: Lender & Loan details if pledged gold */}
                  {serviceType === 'pledged_release' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/15">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-yellow-400 tracking-wider block">
                          Pledged At (Lender / Bank)
                        </label>
                        <select
                          value={selectedLender}
                          onChange={(e) => setSelectedLender(e.target.value)}
                          className="w-full bg-[#121524] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Muthoot Finance">Muthoot Finance</option>
                          <option value="Manappuram Finance">Manappuram Finance</option>
                          <option value="IIFL Finance">IIFL Gold Loan</option>
                          <option value="Commercial Bank">SBI / HDFC / ICICI / PNB</option>
                          <option value="Local Jeweler / Pawn">Local Jeweler / Pawn Broker</option>
                          <option value="Other Institution">Other Institution</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-yellow-400 tracking-wider block">
                          Approx Loan Due (₹ Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹1,50,000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="w-full bg-[#121524] border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Location Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Preferred Branch / Area
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'Chandigarh', name: 'Chandigarh' },
                        { id: 'Mohali', name: 'Mohali' },
                        { id: 'Panchkula', name: 'Panchkula' },
                        { id: 'Srinagar', name: 'Srinagar (Lal Chowk)' },
                      ].map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setCity(loc.id)}
                          className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer text-center truncate ${
                            city === loc.id
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/60'
                              : 'bg-[#10121d] text-gray-400 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {loc.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-yellow-300 disabled:opacity-50 text-black py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_4px_25px_rgba(234,179,8,0.25)] flex items-center justify-center gap-2 cursor-pointer font-serif border border-yellow-300/40"
                      id="gold-lead-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>CONNECTING WITH VAULT SPECIALIST...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>GET FREE VALUATION &amp; CALL BACK</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Trust badges footer */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 px-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Zero Melting Loss</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-yellow-500" />
                        <span>10-Min Bank Clearance</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>100% Confidential</span>
                      </span>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                        id="gold-lead-dismiss-subtext"
                      >
                        I'd like to explore the full website first →
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
