import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, MapPin, GraduationCap, Award, Briefcase, Github, Globe, Linkedin,
  Twitter, Mail, ExternalLink, MessageCircle, UserPlus, Clock, CheckCircle2,
  Star, BookOpen, Trophy, Code2, Users, Heart, ChevronRight, Loader2,
  UserCheck, UserX, Send
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const SOCIAL_ICONS = {
  github: Github, linkedin: Linkedin, twitter: Twitter,
  website: Globe, portfolio: Globe, mail: Mail, email: Mail,
};

const SKILL_COLORS = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
];

/**
 * ProfileModal – full-profile overlay opened from Discover cards.
 *
 * Props
 * ─────
 *  personEmail   : string   – email of the profile to show
 *  personType    : 'student' | 'faculty'
 *  currentEmail  : string   – the logged-in user's email
 *  onClose       : () => void
 *  onChat        : () => void   – call when user clicks "Chat"
 *  followStatus  : 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED'
 *  onFollowAction: (action: 'follow' | 'unfollow' | 'accept' | 'reject') => Promise<void>
 */
export default function ProfileModal({
  personEmail, personType, currentEmail,
  onClose, onChat,
  followStatus = 'NONE', onFollowAction,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);

  /* ─── Load full profile ─── */
  useEffect(() => {
    if (!personEmail) return;
    setLoading(true);
    const endpoint = personType === 'faculty'
      ? `${API}/api/discover/profile/faculty`
      : `${API}/api/discover/profile/student`;

    axios.get(endpoint, { params: { email: personEmail } })
      .then(r => setProfile(r.data))
      .catch(err => console.error('Failed to load profile', err))
      .finally(() => setLoading(false));
  }, [personEmail, personType]);

  /* ─── Load connection count ─── */
  useEffect(() => {
    if (!personEmail) return;
    axios.get(`${API}/api/follow/connections`, { params: { email: personEmail } })
      .then(r => setConnectionCount(r.data?.length ?? 0))
      .catch(() => {});
  }, [personEmail]);

  /* ─── Follow / Unfollow / Accept / Reject ─── */
  const handleAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(true);
    try { await onFollowAction(action); } catch {}
    setActionLoading(false);
  };

  /* ─── Helpers ─── */
  const renderAvatar = (url, name, size = 'h-28 w-28') => (
    url
      ? <img src={`${API}${url}`} alt={name} className={`${size} rounded-full object-cover ring-4 ring-white shadow-xl`} />
      : <div className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-4xl font-bold text-white ring-4 ring-white shadow-xl`}>
          {(name || '?').charAt(0).toUpperCase()}
        </div>
  );

  const renderFollowButton = () => {
    if (followStatus === 'ACCEPTED') {
      return (
        <div className="flex gap-3 w-full">
          <button onClick={onChat} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95">
            <MessageCircle size={16} /> Chat
          </button>
          <button onClick={() => handleAction('unfollow')} disabled={actionLoading}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-500 active:scale-95">
            <UserX size={16} /> Unfollow
          </button>
        </div>
      );
    }
    if (followStatus === 'PENDING_SENT') {
      return (
        <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
          <Clock size={16} /> Request Sent
        </button>
      );
    }
    if (followStatus === 'PENDING_RECEIVED') {
      return (
        <div className="flex gap-3 w-full">
          <button onClick={() => handleAction('accept')} disabled={actionLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95">
            <CheckCircle2 size={16} /> Accept
          </button>
          <button onClick={() => handleAction('reject')} disabled={actionLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-95">
            <X size={16} /> Decline
          </button>
        </div>
      );
    }
    /* NONE */
    return (
      <button onClick={() => handleAction('follow')} disabled={actionLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95">
        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        Follow
      </button>
    );
  };

  /* ════════════ UI ════════════ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-800">
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={36} className="animate-spin text-indigo-500 mb-4" />
            <p className="text-sm text-slate-500">Loading profile…</p>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-sm text-slate-500">Profile not found</p>
          </div>
        ) : (
          <>
            {/* ─── Cover + Avatar ─── */}
            <div className="relative">
              <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                {renderAvatar(profile.avatarUrl, profile.name)}
              </div>
            </div>

            {/* ─── Header ─── */}
            <div className="px-8 pt-18 pb-2 text-center" style={{ paddingTop: '4.5rem' }}>
              <h2 className="text-2xl font-extrabold text-slate-900">{profile.name}</h2>

              {profile.type === 'student' ? (
                <p className="mt-1 text-sm font-medium text-indigo-600">
                  {[profile.branch, profile.year && `Year ${profile.year}`, profile.semester && `Sem ${profile.semester}`].filter(Boolean).join(' · ')}
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-teal-600">
                  {[profile.designation, profile.department].filter(Boolean).join(' @ ')}
                </p>
              )}

              {/* Location / CGPA row */}
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>}
                {profile.type === 'student' && profile.cgpa && (
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" />CGPA: {profile.cgpa}</span>
                )}
                {profile.type === 'faculty' && profile.experienceYears && (
                  <span className="flex items-center gap-1"><Briefcase size={12} />{profile.experienceYears}+ years exp.</span>
                )}
              </div>

              {/* Connection stats */}
              <div className="mt-4 flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-slate-800">{connectionCount}</p>
                  <p className="text-xs text-slate-400">Connections</p>
                </div>
                {profile.type === 'student' && (
                  <>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-slate-800">{profile.projects?.length ?? 0}</p>
                      <p className="text-xs text-slate-400">Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-slate-800">{profile.certificates?.length ?? 0}</p>
                      <p className="text-xs text-slate-400">Certificates</p>
                    </div>
                  </>
                )}
                {profile.type === 'faculty' && (
                  <>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-slate-800">{profile.publications?.length ?? 0}</p>
                      <p className="text-xs text-slate-400">Publications</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-slate-800">{profile.researchProjects?.length ?? 0}</p>
                      <p className="text-xs text-slate-400">Research</p>
                    </div>
                  </>
                )}
              </div>

              {/* Follow / Chat button */}
              <div className="mt-5 px-8">
                {renderFollowButton()}
              </div>
            </div>

            {/* ─── Content Sections ─── */}
            <div className="px-8 pb-8 pt-6 space-y-6">

              {/* About / Bio */}
              {profile.bio && (
                <section>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><BookOpen size={15} /> About</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{profile.bio}</p>
                </section>
              )}

              {/* ── Student sections ── */}
              {profile.type === 'student' && (
                <>
                  {/* Technical Skills with progress bars */}
                  {profile.skills?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Code2 size={15} /> Technical Skills</h3>
                      <div className="space-y-3">
                        {profile.skills.map((sk, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-700">{sk.name}</span>
                              <span className="text-[10px] font-bold text-slate-400">{sk.level ?? `${sk.progress ?? 0}%`}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${SKILL_COLORS[i % SKILL_COLORS.length]} transition-all duration-700`}
                                style={{ width: `${sk.progress ?? 50}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Projects */}
                  {profile.projects?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Code2 size={15} /> Projects</h3>
                      <div className="space-y-3">
                        {profile.projects.map((pr, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-bold text-slate-800">{pr.name}</h4>
                              {pr.href && (
                                <a href={pr.href} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                  <Github size={13} /> View
                                </a>
                              )}
                            </div>
                            {pr.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{pr.description}</p>}
                            {pr.tags?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {pr.tags.map((t, j) => <span key={j} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">{t}</span>)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Certificates */}
                  {profile.certificates?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Award size={15} /> Certificates</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {profile.certificates.map((c, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-500">{c.issuer}{c.issued ? ` · ${c.issued}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Awards */}
                  {profile.awards?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Trophy size={15} /> Achievements</h3>
                      <div className="space-y-2">
                        {profile.awards.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                            <Trophy size={16} className="mt-0.5 text-amber-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{a.title}</p>
                              {a.description && <p className="text-[10px] text-slate-500">{a.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Internships */}
                  {profile.internships?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Briefcase size={15} /> Internships</h3>
                      <div className="space-y-2">
                        {profile.internships.map((intl, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-800">{intl.role} <span className="font-normal text-slate-500">@ {intl.company}</span></p>
                            {intl.duration && <p className="text-[10px] text-slate-400">{intl.duration}</p>}
                            {intl.description && <p className="mt-1 text-[10px] text-slate-500">{intl.description}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* ── Faculty sections ── */}
              {profile.type === 'faculty' && (
                <>
                  {/* Subjects */}
                  {profile.subjectsHandled?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={15} /> Subjects Handled</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjectsHandled.map((s, i) => (
                          <span key={i} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{s}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Research Interests */}
                  {profile.researchInterests?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Star size={15} /> Research Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.researchInterests) ? profile.researchInterests : [profile.researchInterests]).map((r, i) => (
                          <span key={i} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">{r}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Publications */}
                  {profile.publications?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={15} /> Publications</h3>
                      <div className="space-y-2">
                        {profile.publications.map((pub, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-800">{pub.title}</p>
                            <p className="text-[10px] text-slate-500">
                              {pub.journal}{pub.year ? ` · ${pub.year}` : ''}
                            </p>
                            {pub.doi && (
                              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">
                                <ExternalLink size={10} /> DOI
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Research Projects */}
                  {profile.researchProjects?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Code2 size={15} /> Research Projects</h3>
                      <div className="space-y-2">
                        {profile.researchProjects.map((rp, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-800">{rp.title}</p>
                              {rp.status && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${rp.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{rp.status}</span>}
                            </div>
                            {rp.description && <p className="mt-1 text-[10px] text-slate-500">{rp.description}</p>}
                            {rp.funding && <p className="mt-1 text-[10px] font-semibold text-amber-600">Funding: {rp.funding}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Awards */}
                  {profile.awards?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Trophy size={15} /> Awards</h3>
                      <div className="space-y-2">
                        {profile.awards.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                            <Trophy size={16} className="mt-0.5 text-amber-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{a.title}</p>
                              {a.description && <p className="text-[10px] text-slate-500">{a.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Social Links */}
              {profile.socials?.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Globe size={15} /> Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.socials.map((so, i) => {
                      const Icon = SOCIAL_ICONS[so.label?.toLowerCase()] || Globe;
                      return (
                        <a key={i} href={so.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
                          <Icon size={14} /> {so.label}
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
