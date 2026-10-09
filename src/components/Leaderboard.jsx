import React, { useMemo } from "react";
import { Trophy, Crown, Star, Zap, CheckCircle, TrendingUp, Users, Award, Shield } from "lucide-react";
import { getTranslator } from "../locales";
import TiltCard from "./TiltCard";
import FloatingParticles from "./FloatingParticles";

const XP_REPORT = 50;
const XP_VERIFIED = 15;
const XP_RESOLVED = 100;

function getBadge(xp) {
  if (xp >= 500) return { label: "Super Citizen", color: "bg-[#D4AF37] text-[#0A0A0A] font-bold border border-[#D4AF37]", count: 5 };
  if (xp >= 300) return { label: "Community Hero", color: "bg-[#0A0A0A] text-[#D4AF37] font-bold border border-[#D4AF37]/40", count: 4 };
  if (xp >= 200) return { label: "Active Volunteer", color: "bg-[#141414] text-[#F2F0E4] font-bold border border-[#D4AF37]/30", count: 3 };
  if (xp >= 100) return { label: "Rising Contributor", color: "bg-[#16845B]/20 text-[#16845B] font-bold border border-[#16845B]/40", count: 2 };
  if (xp >= 50) return { label: "Helper Citizen", color: "bg-[#888888]/20 text-[#888888] font-bold border border-[#888888]/30", count: 1 };
  return { label: "New Member", color: "bg-[#0A0A0A] text-[#888888] border border-[#888888]/20", count: 0 };
}

function buildLeaderboard(issues, currentUserEmail) {
  const map = {};

  for (const issue of issues) {
    const reporterEmail = issue.reportedBy?.email;
    const reporterName = issue.reportedBy?.name || "Anonymous Citizen";
    if (!reporterEmail) continue;

    if (!map[reporterEmail]) {
      map[reporterEmail] = { name: reporterName, email: reporterEmail, xp: 0, reports: 0, verified: 0, resolved: 0 };
    }

    map[reporterEmail].xp += XP_REPORT;
    map[reporterEmail].reports += 1;

    if (issue.status === "verified" || issue.status === "in-progress" || issue.status === "resolved") {
      map[reporterEmail].xp += XP_VERIFIED;
      map[reporterEmail].verified += 1;
    }
    if (issue.status === "resolved") {
      map[reporterEmail].xp += XP_RESOLVED;
      map[reporterEmail].resolved += 1;
    }
    map[reporterEmail].xp += (issue.upvotes || 0);
  }

  const ranked = Object.values(map)
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isCurrentUser: entry.email === currentUserEmail,
      avatar: entry.name.charAt(0).toUpperCase(),
      ...getBadge(entry.xp),
    }));

  return ranked;
}

const avatarGradient = (rank) => {
  if (rank === 1) return "bg-[#D4AF37] text-[#0A0A0A] font-bold border border-[#D4AF37]";
  if (rank === 2) return "bg-[#141414] text-[#F2F0E4] font-bold border border-[#D4AF37]/50";
  if (rank === 3) return "bg-[#0A0A0A] text-[#C58A18] font-bold border border-[#C58A18]/50";
  return "bg-[#0A0A0A] text-[#888888] border border-[#D4AF37]/30 font-bold";
};

export default function Leaderboard({ user, issues = [], lang = "en" }) {
  const t = getTranslator(lang);

  const leaders = useMemo(() => buildLeaderboard(issues, user?.email), [issues, user?.email]);

  const me = leaders.find((l) => l.isCurrentUser);
  const myXP = me?.xp ?? 0;
  const myRank = me?.rank ?? "—";
  const myReports = me?.reports ?? 0;
  const myResolved = me?.resolved ?? 0;

  return (
    <div className="space-y-6 animate-float-in">
      {/* Official Banner Header */}
      <div className="bg-[#141414] border border-[#D4AF37]/40 text-[#F2F0E4] p-6 md:p-8 relative overflow-hidden">
        <FloatingParticles count={10} />
        <div className="hero-radial-glow absolute inset-0 pointer-events-none z-0" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#0A0A0A] px-3 py-1 text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2.5 border border-[#D4AF37]/40">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Civic Recognition &amp; Community Rewards</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-artdeco-heading text-[#F2F0E4] tracking-wider">
            {t("leaderboardTitle") || "Community Leaderboard & Honor Roll"}
          </h1>
          <p className="text-[#888888] text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
            {t("leaderboardSubtitle") || "Ranking community heroes earning points by reporting verified issues and assisting municipality teams."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <TiltCard maxTilt={2} className="lg:col-span-1">
          <div className="bg-[#141414] text-[#F2F0E4] p-6 shadow-lg flex flex-col justify-between h-full border border-[#D4AF37]/50 relative overflow-hidden">
            <div>
              <div className="p-3 bg-[#0A0A0A] border border-[#D4AF37]/40 w-fit mb-4">
                <Trophy className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-xl font-artdeco-heading text-[#F2F0E4] uppercase tracking-wider">{t("becomeHero") || "Become a Community Hero!"}</h2>
              <p className="text-[#888888] text-xs mt-2 leading-relaxed">
                {t("becomeHeroDesc") || "Earn 50 XP for reporting problems, 15 XP for verified state logs, and 100 XP upon issue resolutions!"}
              </p>
            </div>

            <div className="mt-6 space-y-2.5 text-xs text-[#888888]">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>+{XP_REPORT} XP per reported ticket</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-[#16845B]" />
                <span>+{XP_VERIFIED} XP when verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>+{XP_RESOLVED} XP on issue resolution</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#D4AF37]/30 space-y-3">
              {user?.role === "citizen" ? (
                <>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#888888]">{t("yourXP") || "Your XP Points"}</span>
                    <span className="text-[#D4AF37] font-artdeco-heading text-sm">{myXP} XP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#888888]">{t("yourRank") || "Current Rank"}</span>
                    <span className="text-[#F2F0E4] font-bold">
                      {myRank === "—" ? "Unranked" : `Rank #${myRank}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#888888]">Reports Submitted</span>
                    <span className="text-[#F2F0E4] font-bold">{myReports}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#888888]">Issues Resolved</span>
                    <span className="text-[#F2F0E4] font-bold">{myResolved}</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-[#888888] font-semibold text-center py-2">
                  XP tracking is reserved for Citizens
                </div>
              )}
            </div>
          </div>
        </TiltCard>

        {/* Rankings Table */}
        <div className="lg:col-span-2 card-art-deco bg-[#141414] border border-[#D4AF37]/30 overflow-hidden flex flex-col">
          <div className="p-4 bg-[#0A0A0A] border-b border-[#D4AF37]/30 flex justify-between items-center">
            <h3 className="font-artdeco-heading text-[#F2F0E4] text-sm flex items-center gap-2 uppercase tracking-wider">
              <Users className="h-4 w-4 text-[#D4AF37]" />
              {t("topContributors") || "Top Contributors Rankings"}
            </h3>
            <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">Jharkhand State</span>
          </div>

          <div className="divide-y divide-[#D4AF37]/20 flex-1 overflow-y-auto max-h-[450px]">
            {leaders.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="h-10 w-10 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-[#F2F0E4] font-bold text-sm">No contributors yet</p>
                <p className="text-[#888888] text-xs mt-1">Be the first — report a civic issue to earn XP!</p>
              </div>
            ) : (
              leaders.map((leader) => {
                const isFirst = leader.rank === 1;
                const isSecond = leader.rank === 2;
                const isThird = leader.rank === 3;

                return (
                  <div
                    key={leader.email}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      leader.isCurrentUser
                        ? "bg-[#0A0A0A] border-l-4 border-[#D4AF37]"
                        : "hover:bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 shrink-0 flex items-center justify-center">
                        {isFirst ? (
                          <Crown className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
                        ) : isSecond ? (
                          <span className="text-sm font-bold text-[#F2F0E4]">#2</span>
                        ) : isThird ? (
                          <span className="text-sm font-bold text-[#C58A18]">#3</span>
                        ) : (
                          <span className="text-xs font-semibold text-[#888888]">#{leader.rank}</span>
                        )}
                      </div>

                      <div className={`w-10 h-10 flex items-center justify-center font-artdeco-heading text-sm shrink-0 ${avatarGradient(leader.rank)}`}>
                        {leader.avatar}
                      </div>

                      <div>
                        <p className="font-artdeco-heading text-[#F2F0E4] text-sm flex items-center gap-2 flex-wrap tracking-wider">
                          <span>{leader.name}</span>
                          {leader.isCurrentUser && (
                            <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest">YOU</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${leader.color}`}>
                            {leader.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-[#F2F0E4]">{leader.count} Badges</p>
                        <span className="text-[11px] text-[#888888] block font-mono">{leader.reports} reports</span>
                      </div>
                      <div className="bg-[#0A0A0A] px-3.5 py-1.5 border border-[#D4AF37]/30 font-artdeco-heading text-xs text-[#D4AF37] min-w-[75px] text-center">
                        {leader.xp} XP
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-[#D4AF37]/30 bg-[#0A0A0A]">
            <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#D4AF37]" /> +{XP_REPORT} report</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-[#16845B]" /> +{XP_VERIFIED} verified</span>
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#D4AF37]" /> +{XP_RESOLVED} resolved</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" /> +1 per upvote</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
