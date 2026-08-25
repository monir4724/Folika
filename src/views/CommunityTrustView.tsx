import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile } from '../types';
import { isLiteMode, setLiteMode } from '../utils/storage';
import {
  Users,
  QrCode,
  MessageSquare,
  Wifi,
  WifiOff,
  Share2,
  CheckCircle,
  Download,
  Database,
  Sparkles,
  Printer,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface CommunityTrustViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
}

export const CommunityTrustView: React.FC<CommunityTrustViewProps> = ({ profile, lang }) => {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'official' | 'qr' | 'coop' | 'forum' | 'sync'>('official');

  // Official Trust QR Encoding Data
  const [qrMode, setQrMode] = useState<'url' | 'vcard' | 'bkash'>('url');

  // Traceability QR Generator State
  const [batchId, setBatchId] = useState('AMN-2026-PAB-01');
  const [cropType, setCropType] = useState('Sugandhi BRRI Dhan-34 (Organic Aman)');
  const [harvestDate, setHarvestDate] = useState('2026-11-15');
  const [qrGenerated, setQrGenerated] = useState(true);

  // Lite Mode State
  const [liteActive, setLiteActive] = useState<boolean>(isLiteMode());

  // Community Posts Mock State
  const [forumPosts, setForumPosts] = useState([
    {
      id: 'p1',
      author: 'Kazi Matiur Rahman',
      district: 'Pabna Sadar',
      title: 'What is the organic treatment for open tip rot in Aman rice?',
      repliesCount: 4,
      expertAnswered: true,
      expertName: 'Dr. Md. Rafiqul Islam (Agriculture Officer)',
      expertReply: 'Apply Trichoderma powder at 20 grams per decimal. Temporarily drain the irrigation water.',
    },
    {
      id: 'p2',
      author: 'Alamgir Hossain',
      district: 'Ishwardi',
      title: 'What is the correct ratio for co-culturing Tilapia and Rui in one pond?',
      repliesCount: 2,
      expertAnswered: false,
    },
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [coopJoinMessage, setCoopJoinMessage] = useState('');

  const handleCreatePost = () => {
    if (!newQuestion.trim()) return;
    const post = {
      id: 'p_' + Date.now(),
      author: profile?.name || 'Farmer Bhai',
      district: profile?.district || 'Pabna',
      title: newQuestion,
      repliesCount: 0,
      expertAnswered: false,
    };
    setForumPosts([post, ...forumPosts]);
    setNewQuestion('');
  };

  const handleJoinCoop = () => {
    setCoopJoinMessage('You have successfully joined the cooperative pool! A local coordinator will contact you shortly.');
  };

  const handleToggleLite = () => {
    const next = !liteActive;
    setLiteActive(next);
    setLiteMode(next);
  };

  // Compute Official QR Value based on Mode
  const getOfficialQrString = () => {
    if (qrMode === 'url') {
      return `https://krishoktrust.org?org=${encodeURIComponent('Krishok Cooperative & Trust Service')}&service=${encodeURIComponent('Agricultural Loan & Trust Fund')}&merchant=01700000000`;
    }
    if (qrMode === 'bkash') {
      return `01700000000`;
    }
    return `BEGIN:VCARD
VERSION:3.0
FN:Krishok Cooperative & Trust Service
ORG:Krishok Cooperative & Trust Service
TITLE:Agricultural Loan & Trust Fund Management
TEL:+8801700000000
EMAIL:support@krishoktrust.org
URL:https://krishoktrust.org
ADR:;;Khamarbari, Farmgate;Dhaka;1215;Bangladesh
NOTE:bKash Merchant: 01700000000
END:VCARD`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Community & Trust Hub</h2>
            <p className="text-xs text-slate-500">Official Trust QR, Traceability, Group selling & Offline Sync</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'official', label: 'Trust QR Service', icon: ShieldCheck },
            { id: 'qr', label: 'Traceability QR', icon: QrCode },
            { id: 'coop', label: 'Group Selling', icon: Users },
            { id: 'forum', label: 'Farmer Forum', icon: MessageSquare },
            { id: 'sync', label: 'Offline Data', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-800 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 0: OFFICIAL TRUST QR CODE (REAL & SCANNABLE) */}
      {activeTab === 'official' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    Government & Trust Registered
                  </span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-xs font-bold rounded-full border border-purple-200">
                    Scannable Official QR
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Krishok Cooperative & Trust Service — Digital QR Passport</h3>
                <p className="text-xs text-slate-500 mt-0.5">A verified portal for agricultural loans, trust fund management, cooperative services, and membership verification.</p>
              </div>

              <div className="flex items-center space-x-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* QR Code Card (Real SVG) */}
              <div className="md:col-span-5 bg-linear-to-b from-emerald-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-4 text-center relative overflow-hidden print-area">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/80 inline-block relative">
                  <QRCodeSVG
                    value={getOfficialQrString()}
                    size={180}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: 'https://cdn-icons-png.flaticon.com/512/609/609803.png',
                      x: undefined,
                      y: undefined,
                      height: 28,
                      width: 28,
                      excavate: true,
                    }}
                  />
                  <div className="mt-1 text-[9px] font-black text-emerald-950 tracking-wider uppercase text-center bg-emerald-100 py-0.5 rounded">
                    Scannable Official QR
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-amber-300">Krishok Cooperative & Trust Service</h4>
                  <p className="text-xs text-emerald-200 font-medium">Agricultural Loan & Trust Fund Management</p>
                  <a
                    href="https://krishoktrust.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] text-emerald-300 hover:underline font-mono pt-1"
                  >
                    <span>https://krishoktrust.org</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                {/* QR Output Mode Selection */}
                <div className="w-full pt-2 border-t border-emerald-800/80 space-y-2 no-print">
                  <span className="text-[10px] text-emerald-200 font-bold block">Select QR type:</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl text-[10px]">
                    <button
                      onClick={() => setQrMode('url')}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        qrMode === 'url' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Website link
                    </button>
                    <button
                      onClick={() => setQrMode('bkash')}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        qrMode === 'bkash' ? 'bg-pink-600 text-white shadow' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      bKash payment
                    </button>
                    <button
                      onClick={() => setQrMode('vcard')}
                      className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        qrMode === 'vcard' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      vCard info
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization Info Checklist */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center">
                    <Building2 className="w-4 h-4 mr-1.5 text-emerald-700" />
                    Official organization and contact details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Organization name</span>
                      <span className="font-bold text-slate-900 text-xs block">Krishok Cooperative & Trust Service</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Service type</span>
                      <span className="font-bold text-slate-900 text-xs block">Agricultural Loan & Trust Fund Management</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-slate-500" /> Email address
                      </span>
                      <a href="mailto:support@krishoktrust.org" className="font-bold text-emerald-800 hover:underline text-xs block">
                        support@krishoktrust.org
                      </a>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-slate-500" /> Hotline & phone
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">+8801700000000 / 16123</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 col-span-1 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" /> Office address
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">Khamarbari, Farmgate, Dhaka-1215, Bangladesh</span>
                    </div>

                    <div className="p-3.5 bg-pink-50 border border-pink-200 rounded-2xl space-y-1 col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-pink-950 flex items-center">
                          <CreditCard className="w-4 h-4 mr-1.5 text-pink-700" />
                          bKash Merchant Payment Gateway
                        </span>
                        <span className="px-2 py-0.5 bg-pink-200 text-pink-900 font-extrabold text-[10px] rounded-md">
                          bKash Merchant
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-pink-900">
                        Merchant number: 01700000000 (scan in bKash app for payment)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                  <span className="font-bold text-emerald-950 block">💡 How it works with camera / bKash app:</span>
                  <p className="text-emerald-900 leading-relaxed">
                    1. Scan the QR code above with any smartphone camera to open <strong className="font-mono">https://krishoktrust.org</strong>.
                    <br />
                    2. Scan with the bKash app to pay loan installments and cooperative fees directly to the trust merchant account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Traceability QR Generator */}
      {activeTab === 'qr' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-emerald-700" />
                Digital Traceability QR Passport Generator
              </h3>
              <p className="text-xs text-slate-500">
                Generate a crop traceability passport for supermarkets or exporters to verify your production records and organic standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch ID:</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop variety:</label>
                  <input
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harvest date:</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setQrGenerated(true)}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate QR</span>
                </button>
              </div>

              {/* QR Output */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 print-area">
                {qrGenerated ? (
                  <>
                    <div className="p-3 bg-white rounded-2xl shadow border border-emerald-300 inline-block">
                      <QRCodeSVG
                        value={`https://krishoktrust.org/trace/${batchId}?crop=${encodeURIComponent(cropType)}&farmer=${encodeURIComponent(profile?.name || 'Rahim Mia')}`}
                        size={150}
                        level="M"
                        includeMargin={true}
                      />
                    </div>

                    <div className="text-xs text-slate-800 space-y-1">
                      <p className="font-extrabold text-emerald-900">{cropType}</p>
                      <p>Producer: {profile?.name || 'Rahim Mia'} ({profile?.district || 'Pabna'})</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {batchId}</p>
                    </div>

                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1 cursor-pointer no-print"
                    >
                      <Download className="w-4 h-4" />
                      <span>Print / save sticker</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 text-slate-500 py-8">
                    <QrCode className="w-12 h-12 mx-auto text-emerald-600 opacity-50" />
                    <p className="text-xs">Fill in the form above and click Generate QR</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cooperative Group Selling */}
      {activeTab === 'coop' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Seasonal Farmer Group Selling Portal (Cooperative Pooling)</h3>
            <p className="text-xs text-slate-500">
              10-15 farmers can combine harvests into 1-2 truckloads and sell directly to Dhaka supermarkets or mills, saving middleman commission.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-900 block">Active cooperative pool:</span>
              <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pabna Sadar Rice Growers Cooperative (Target: 20 tonnes)</h4>
                  <p className="text-xs text-slate-500">Collected so far: 14.5 tonnes (72%) | Joined: 9 farmers</p>
                </div>
                <button
                  onClick={handleJoinCoop}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Join pool
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Community Forum */}
      {activeTab === 'forum' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Open farmer and agriculture officer forum</h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your issue or question..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
              />
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Post
              </button>
            </div>

            <div className="space-y-3">
              {forumPosts.map((post) => (
                <div key={post.id} className="p-4 bg-slate-50 rounded-2xl border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{post.author} ({post.district})</span>
                    <span className="text-[10px] text-slate-500">Replies: {post.repliesCount}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">{post.title}</p>

                  {post.expertAnswered && (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        {post.expertName}
                      </span>
                      <p className="text-slate-800">{post.expertReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Offline Sync & Lite Mode */}
      {activeTab === 'sync' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                {liteActive ? <WifiOff className="w-6 h-6 text-amber-600" /> : <Wifi className="w-6 h-6 text-emerald-700" />}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Offline Lite Mode & Data Backup</h3>
                  <p className="text-xs text-slate-500">All records remain safe in local storage even without internet access.</p>
                </div>
              </div>

              <button
                onClick={handleToggleLite}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  liteActive
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {liteActive ? 'Offline mode active' : 'Switch to online mode'}
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Cache & data status:</span>
              <p className="text-slate-600">All crop rotation logs, vaccination history, and farm data are stored on the device.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
