import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, Calendar, User, Building2, Shield, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:8085';

const PublicCertificateView = ({ shareLink }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [shareLink]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/certificates/shared/${shareLink}`);
      if (response.ok) {
        const data = await response.json();
        setCertificate(data);
      } else {
        setError('Certificate not found');
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificate.fileUrl) return;
    const fullUrl = certificate.fileUrl.startsWith('http') ? certificate.fileUrl : `${API_BASE}${certificate.fileUrl}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = certificate.title.replace(/[^a-z0-9]/gi, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <Award size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Certificate Not Found</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4 shadow-lg">
            <Award size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Certificate Verification</h1>
          <p className="text-lg text-slate-600">Authenticated credential shared with you</p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-100">
          {/* Status Banner */}
          {certificate.status === 'verified' && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              <span className="font-semibold">✓ VERIFIED CERTIFICATE</span>
            </div>
          )}
          
          {certificate.status === 'pending' && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 flex items-center justify-center gap-2">
              <Shield size={20} />
              <span className="font-semibold">⏳ VERIFICATION PENDING</span>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Certificate Title */}
            <div className="text-center mb-8 pb-8 border-b-2 border-slate-100">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">{certificate.title}</h2>
              <p className="text-lg text-slate-600 font-medium">Category: {certificate.category}</p>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Issued By</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{certificate.issuer}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Issue Date</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>

              {certificate.description && (
                <div className="md:col-span-2 flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 flex-shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Description</p>
                    <p className="text-slate-900 mt-1">{certificate.description}</p>
                  </div>
                </div>
              )}

              {certificate.credentialId && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Credential ID</p>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-1">{certificate.credentialId}</p>
                  </div>
                </div>
              )}

              {certificate.verificationCode && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 flex-shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Verification Code</p>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-1">{certificate.verificationCode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t-2 border-slate-100">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 px-6 font-bold text-white hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download size={20} />
                Download Certificate
              </button>
              
              {certificate.credentialUrl && (
                <a
                  href={certificate.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white border-2 border-slate-300 py-4 px-6 font-bold text-slate-900 hover:bg-slate-50 transition shadow hover:shadow-md"
                >
                  <ExternalLink size={20} />
                  Verify Online
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            This certificate was uploaded on {formatDate(certificate.uploadDate)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            UniConnect Certificate Verification System
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCertificateView;
