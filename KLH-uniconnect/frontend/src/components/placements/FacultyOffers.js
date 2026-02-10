import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Upload, CheckCircle, X, Award, Calendar,
  Loader2, Building, Users, TrendingUp, BarChart3, DollarSign,
  Eye, Search, Filter, PieChart
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyOffers = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers');
  const [offers, setOffers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setOffers([
        { id: '1', studentName: 'John Doe', rollNo: '21BCS001', company: 'TCS', role: 'Software Engineer', ctc: '7.0 LPA', status: 'accepted', offerDate: '2026-01-20' },
        { id: '2', studentName: 'Jane Smith', rollNo: '21BCS002', company: 'Infosys', role: 'Systems Engineer', ctc: '6.5 LPA', status: 'pending', offerDate: '2026-01-22' },
        { id: '3', studentName: 'Mike Johnson', rollNo: '21BCS003', company: 'Wipro', role: 'Project Engineer', ctc: '5.5 LPA', status: 'accepted', offerDate: '2026-01-18' },
        { id: '4', studentName: 'Sarah Williams', rollNo: '21BCS004', company: 'TCS', role: 'Software Engineer', ctc: '7.0 LPA', status: 'declined', offerDate: '2026-01-19' },
        { id: '5', studentName: 'David Brown', rollNo: '21BCS005', company: 'Accenture', role: 'Associate Developer', ctc: '4.5 LPA', status: 'pending', offerDate: '2026-01-23' }
      ]);

      setAnalytics({
        totalPlaced: 185,
        totalEligible: 250,
        placementPercentage: 74,
        avgCTC: '6.2 LPA',
        maxCTC: '24 LPA',
        minCTC: '4 LPA',
        totalOffers: 210,
        multipleOffers: 25,
        companiesVisited: 45,
        companyWise: [
          { company: 'TCS', offers: 45, accepted: 40 },
          { company: 'Infosys', offers: 35, accepted: 30 },
          { company: 'Wipro', offers: 28, accepted: 25 },
          { company: 'Accenture', offers: 22, accepted: 18 },
          { company: 'Others', offers: 80, accepted: 72 }
        ],
        branchWise: [
          { branch: 'CSE', total: 120, placed: 100, percentage: 83 },
          { branch: 'ECE', total: 80, placed: 55, percentage: 69 },
          { branch: 'ME', total: 50, placed: 30, percentage: 60 }
        ]
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || offer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading offers data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <p className="text-sm font-medium text-green-600">Total Placed</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{analytics?.totalPlaced}</p>
          <p className="text-xs text-green-500 mt-1">{analytics?.placementPercentage}% placement</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-600">Total Offers</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{analytics?.totalOffers}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Avg CTC</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{analytics?.avgCTC}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Max CTC</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{analytics?.maxCTC}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Companies</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{analytics?.companiesVisited}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'offers', label: 'Manage Offers', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'reports', label: 'Reports (NAAC/NBA)', icon: Download }
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload Offer Letter
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">CTC</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{offer.studentName}</p>
                        <p className="text-xs text-slate-500">{offer.rollNo}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{offer.company}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{offer.role}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">{offer.ctc}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-slate-100" title="View">
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100" title="Download">
                          <Download className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Company-wise breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-slate-900 mb-4">Company-wise Placements</h3>
            <div className="space-y-3">
              {analytics?.companyWise.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-slate-700">{item.company}</div>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                    <div 
                      className="h-full bg-green-500 flex items-center justify-end pr-2"
                      style={{ width: `${(item.accepted / analytics.totalPlaced) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">{item.accepted}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 w-20 text-right">
                    {item.offers} offers
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch-wise breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-slate-900 mb-4">Branch-wise Placements</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {analytics?.branchWise.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{item.branch}</span>
                    <span className={`text-lg font-bold ${
                      item.percentage >= 80 ? 'text-green-600' :
                      item.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{item.placed} / {item.total} students placed</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div 
                      className={`h-full rounded-full ${
                        item.percentage >= 80 ? 'bg-green-500' :
                        item.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Multiple Offers</p>
                  <p className="text-2xl font-bold text-blue-700">{analytics?.multipleOffers}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-blue-600">Students with 2+ offers</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">CTC Range</p>
                  <p className="text-2xl font-bold text-green-700">{analytics?.minCTC} - {analytics?.maxCTC}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Avg Offers/Company</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {Math.round(analytics?.totalOffers / analytics?.companiesVisited)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              <strong>Note:</strong> These reports are formatted as per NAAC/NBA accreditation requirements.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Placement Summary Report</h3>
                  <p className="text-sm text-slate-500">Overall placement statistics</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Student-wise Report</h3>
                  <p className="text-sm text-slate-500">Individual placement details</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Company-wise Report</h3>
                  <p className="text-sm text-slate-500">Companies visited & selections</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-semibold hover:text-purple-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <PieChart className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">NAAC/NBA Format Report</h3>
                  <p className="text-sm text-slate-500">Accreditation compliant format</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-amber-600 text-sm font-semibold hover:text-amber-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">CTC Analysis Report</h3>
                  <p className="text-sm text-slate-500">Salary statistics & trends</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-teal-600 text-sm font-semibold hover:text-teal-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Year-on-Year Comparison</h3>
                  <p className="text-sm text-slate-500">Historical placement trends</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-red-600 text-sm font-semibold hover:text-red-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Offer Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg m-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">Upload Offer Letter</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Student</label>
                <select className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose student...</option>
                  <option value="1">John Doe (21BCS001)</option>
                  <option value="2">Jane Smith (21BCS002)</option>
                  <option value="3">Mike Johnson (21BCS003)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TCS"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CTC</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 7.0 LPA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Offer Letter (PDF)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF up to 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                Upload Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyOffers;
