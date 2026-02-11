import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, CheckCircle, X, Award, Clock, Calendar,
  Loader2, Building, DollarSign, Briefcase, TrendingUp, Eye
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentOffers = ({ studentId, email }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers');
  const [offers, setOffers] = useState([]);
  const [placementHistory, setPlacementHistory] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setOffers([
        { 
          id: '1', 
          company: 'TCS', 
          role: 'Software Engineer',
          ctc: '7.0 LPA',
          location: 'Hyderabad',
          joiningDate: '2026-07-01',
          status: 'pending',
          offerLetter: '/offers/tcs-offer.pdf',
          deadline: '2026-02-01'
        },
        { 
          id: '2', 
          company: 'Infosys', 
          role: 'Systems Engineer',
          ctc: '6.5 LPA',
          location: 'Bangalore',
          joiningDate: '2026-08-01',
          status: 'accepted',
          offerLetter: '/offers/infosys-offer.pdf',
          acceptedOn: '2026-01-15'
        }
      ]);

      setPlacementHistory([
        { id: '1', company: 'TCS', drive: 'TCS Campus 2026', applied: '2026-01-05', status: 'Selected', rounds: 3 },
        { id: '2', company: 'Infosys', drive: 'Infosys Campus Drive', applied: '2026-01-08', status: 'Selected', rounds: 2 },
        { id: '3', company: 'Wipro', drive: 'Wipro Elite 2026', applied: '2026-01-02', status: 'Rejected at Technical', rounds: 2 },
        { id: '4', company: 'Accenture', drive: 'Accenture Hiring', applied: '2025-12-20', status: 'In Progress', rounds: 1 }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = (offerId) => {
    // API call to accept
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o));
    setShowOfferModal(false);
  };

  const handleDeclineOffer = (offerId) => {
    // API call to decline
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'declined' } : o));
    setShowOfferModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading offers...</span>
      </div>
    );
  }

  const acceptedOffer = offers.find(o => o.status === 'accepted');
  const pendingOffers = offers.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Placement Status Banner */}
      {acceptedOffer && (
        <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900">🎉 Congratulations! You are Placed!</h3>
              <p className="text-green-700">
                {acceptedOffer.company} - {acceptedOffer.role} @ {acceptedOffer.ctc}
              </p>
              <p className="text-sm text-green-600 mt-1">Joining: {acceptedOffer.joiningDate}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
              <Download className="h-4 w-4" />
              Download Offer
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-600">Total Offers</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{offers.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Accepted</p>
          <p className="mt-1 text-3xl font-bold text-green-700">
            {offers.filter(o => o.status === 'accepted').length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Pending</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{pendingOffers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Companies Applied</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{placementHistory.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'offers', label: 'My Offers', icon: FileText },
          { id: 'history', label: 'Placement History', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No offers yet. Keep applying!</p>
            </div>
          ) : (
            offers.map(offer => (
              <div 
                key={offer.id} 
                className={`rounded-xl border p-6 ${
                  offer.status === 'accepted' 
                    ? 'border-green-200 bg-green-50/50' 
                    : offer.status === 'pending'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      offer.status === 'accepted' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Building className={`h-7 w-7 ${
                        offer.status === 'accepted' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{offer.company}</h3>
                      <p className="text-slate-600">{offer.role}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          {offer.ctc}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Briefcase className="h-4 w-4" />
                          {offer.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-4 w-4" />
                          Joining: {offer.joiningDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {offer.status === 'accepted' ? 'Accepted' :
                     offer.status === 'pending' ? 'Pending' : 'Declined'}
                  </span>
                </div>

                {offer.status === 'pending' && (
                  <div className="mt-4 flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Response Required</p>
                      <p className="text-xs text-amber-600">Deadline: {offer.deadline}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedOffer(offer); setShowOfferModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineOffer(offer.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700">
                    <Eye className="h-4 w-4" />
                    View Offer Letter
                  </button>
                  <button className="flex items-center gap-2 text-slate-600 text-sm font-semibold hover:text-slate-700">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Placement History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Drive</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Applied On</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rounds</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {placementHistory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.company}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.drive}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.applied}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.rounds}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Selected' ? 'bg-green-100 text-green-700' :
                      item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Accept Offer Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md m-4 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Accept Offer?</h2>
              <p className="text-slate-600 mb-4">
                You are about to accept the offer from <strong>{selectedOffer.company}</strong> for the role of <strong>{selectedOffer.role}</strong> with a CTC of <strong>{selectedOffer.ctc}</strong>.
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                ⚠️ Once accepted, you may not be eligible for other placement drives as per college policy.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptOffer(selectedOffer.id)}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOffers;
