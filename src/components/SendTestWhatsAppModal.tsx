import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  Info,
  Building2,
  Phone,
  Tag,
  Sparkles,
} from 'lucide-react';
import { DailyUpdate, CompanySettings, Customer } from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { NAV_DURGA_TEST_CUSTOMER } from '../data/demoData';

interface SendTestWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  update: DailyUpdate;
  company: CompanySettings;
  testCustomer?: Customer;
}

export const SendTestWhatsAppModal: React.FC<SendTestWhatsAppModalProps> = ({
  isOpen,
  onClose,
  update,
  company,
  testCustomer = NAV_DURGA_TEST_CUSTOMER,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const formattedMessage = WhatsAppService.formatDailyUpdate(
    update,
    company,
    testCustomer.name
  );

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      WhatsAppService.renderPostToCanvas(
        canvasRef.current,
        update,
        company,
        'industrial-blue'
      );
      // Log test update prepared
      WhatsAppService.logActivity({
        customerName: testCustomer.name,
        phoneNumber: testCustomer.whatsapp || testCustomer.mobile,
        action: 'Test Update Prepared',
        details: `Daily update sheet for ${update.date} prepared for WhatsApp test.`,
      });
    }
  }, [isOpen, update, company, testCustomer]);

  if (!isOpen) return null;

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanDate = update.date.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `NavDurga_PriceUpdate_Test_${cleanDate}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded(true);
      WhatsAppService.logActivity({
        customerName: testCustomer.name,
        phoneNumber: testCustomer.whatsapp || testCustomer.mobile,
        action: 'Image Downloaded',
        details: `Downloaded 1080x1080 high-res price update graphic (${cleanDate}).`,
      });
      setFeedback('Image downloaded successfully! You can now attach it in WhatsApp.');
      setTimeout(() => setDownloaded(false), 3000);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyMessage = async () => {
    const success = await WhatsAppService.copyMessage(
      formattedMessage,
      testCustomer.name,
      testCustomer.whatsapp || testCustomer.mobile
    );
    if (success) {
      setCopied(true);
      setFeedback('Message copied to clipboard! Paste it directly into your WhatsApp chat.');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleOpenWhatsApp = () => {
    WhatsAppService.openChat(
      testCustomer.whatsapp || testCustomer.mobile,
      formattedMessage,
      testCustomer.name
    );
    setFeedback(`Opened WhatsApp Web / App pre-filled with the message for ${testCustomer.name}.`);
    setTimeout(() => setFeedback(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-300">
              <MessageSquare className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Send Test WhatsApp</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Manual Test Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Preview and test Daily Price Update broadcast with the dedicated test recipient.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Target Test Customer Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0">
                  {testCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-slate-900">
                      {testCustomer.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({testCustomer.companyName})
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {testCustomer.customerType}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      🏷️ {testCustomer.tag || 'WhatsApp Test'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-mono font-semibold text-emerald-800">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      WhatsApp: {testCustomer.whatsapp}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Status: <strong className="text-emerald-700">Active</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Location: {testCustomer.city}, {testCustomer.state}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Preview: Left (Image) & Right (Text) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Generated Canvas Image */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Selected Post Image (1080 × 1080)
                </span>
                <span className="text-[11px] text-slate-500">
                  {update.date}
                </span>
              </div>

              <div className="w-full aspect-square max-w-[340px] bg-slate-50 border border-slate-300 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center p-1">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="mt-3 w-full max-w-[340px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Image Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Action 1: Download Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Message Text Preview */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Message Text Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {formattedMessage}
                </div>
              </div>

              {/* Feedback toast banner */}
              {feedback && (
                <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Help note */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">Help Note:</strong>
                  This is a manual test using your browser or WhatsApp app. No automated messages are sent.
                </div>
              </div>
            </div>
          </div>

          {/* 3 Action Buttons Strip */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Recipient: <strong className="text-slate-800">{testCustomer.name}</strong> ({testCustomer.whatsapp})
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>1. Download Image</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>2. Copy Message</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>3. Open WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
