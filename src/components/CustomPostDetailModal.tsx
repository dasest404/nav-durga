import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Users,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { CustomWhatsAppPost } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface CustomPostDetailModalProps {
  post: CustomWhatsAppPost | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const CustomPostDetailModal: React.FC<CustomPostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const handleCopyMessage = async () => {
    const success = await WhatsAppService.copyMessage(
      post.message,
      post.recipients[0]?.customerName || 'Customer',
      post.recipients[0]?.phoneNumber || ''
    );
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = post.imageUrl;
    link.download = post.imageName || 'navdurga_custom_post.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    WhatsAppService.logActivity({
      customerName: post.recipients[0]?.customerName || 'Test Customer',
      phoneNumber: post.recipients[0]?.phoneNumber || '+91 97521 83053',
      action: 'Image Downloaded',
      details: `Downloaded history creative: ${post.imageName}`,
    });
  };

  const handleOpenWhatsApp = (phoneNumber: string, customerName: string) => {
    WhatsAppService.openChat(phoneNumber, post.message, customerName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Custom Post Details</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {post.status}
                </span>
                {post.category && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {post.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {post.imageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this custom post from history?')) {
                    onDelete(post.id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Created On</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(post.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Post Type</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                {post.type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Recipients</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                {post.recipients.length} customer(s)
              </span>
            </div>
          </div>

          {/* Grid Layout: Image Preview and Message Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Image Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Attached Creative
              </span>
              <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={post.imageUrl}
                  alt={post.imageName}
                  className="max-h-72 w-auto max-w-full object-contain rounded-xl shadow-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {post.imageSize ? `${(post.imageSize / 1024).toFixed(1)} KB` : 'Original File'}
                </span>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>

            {/* Right: Message & Recipients */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp Message
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Message'}</span>
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                  {post.message}
                </div>
              </div>

              {/* Recipients list */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Target Recipients ({post.recipients.length})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {post.recipients.map((rec, i) => (
                    <div
                      key={`${rec.phoneNumber}-${i}`}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{rec.customerName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{rec.phoneNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(rec.phoneNumber, rec.customerName)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open WhatsApp</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900 block">Manual WhatsApp Mode Notice:</strong>
              Image attachment must be added manually inside WhatsApp. Automatic image sending will be available after WhatsApp Business API integration.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            Clicking Open WhatsApp opens chat with pre-filled text. Attach the downloaded image.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
