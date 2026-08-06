import React from "react";
import { Award, Clock, Users, ArrowRight, ShieldCheck, Trophy, Crown } from "lucide-react";
import { getTranslator } from "../locales";

export default function Leaderboard({ user, lang = "en" }) {
  const t = getTranslator(lang);
  const leaders = [
    { rank: 1, name: "Rajesh Kumar", points: 250, badge: "Super Citizen", badgesCount: 5, avatar: "R", isCurrentUser: user.name === "Rajesh Kumar" },
    { rank: 2, name: "Sunita Patel", points: 180, badge: "Community Hero", badgesCount: 4, avatar: "S", isCurrentUser: user.name === "Sunita Patel" },
    { rank: 3, name: "Vikram Rao", points: 140, badge: "Active Volunteer", badgesCount: 3, avatar: "V", isCurrentUser: user.name === "Vikram Rao" },
    { rank: 4, name: "Arjun Mehta", points: 90, badge: "Rising Contributor", badgesCount: 2, avatar: "A", isCurrentUser: user.name === "Arjun Mehta" },
    { rank: 5, name: "Meera Iyer", points: 75, badge: "Helper Citizen", badgesCount: 2, avatar: "M", isCurrentUser: user.name === "Meera Iyer" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-float-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("leaderboardTitle")}</h1>
        <p className="text-dark-500 font-medium mt-1">{t("leaderboardSubtitle")}</p>
        <div className="flex items-center mt-3 gap-1.5">
          <div className="h-0.5 w-16 bg-gradient-to-r from-theme-400 to-theme-200 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
          <div className="w-1 h-1 rounded-full bg-theme-300" />
          <div className="h-0.5 w-8 bg-gradient-to-r from-theme-300 to-transparent rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-dark-900 via-dark-800 to-theme-900/20 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden border border-theme-700/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-theme-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-peacock-500/8 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="p-3 bg-theme-500/15 rounded-2xl w-fit mb-4">
              <Trophy className="h-6 w-6 text-theme-400" />
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{t("becomeHero")}</h2>
            <p className="text-white/50 text-xs mt-2 leading-relaxed">{t("becomeHeroDesc")}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-4 relative">
            <div className="flex justify-between items-center text-xs font-semibold text-white/40">
              <span>{t("yourXP")}</span>
              <span className="text-theme-400">{user.role === "citizen" ? "250 XP" : "N/A (Officer Mode)"}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-white/40">
              <span>{t("yourRank")}</span>
              <span className="text-theme-400">{user.role === "citizen" ? "Rank #1" : "Officer"}</span>
            </div>
          </div>
        </div>

        {/* Leaders Table */}
        <div className="lg:col-span-2 card-premium rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-theme-100/20 bg-theme-50/20 flex justify-between items-center">
            <h3 className="font-bold text-dark-800 text-sm">{t("topContributors")}</h3>
            <span className="text-xs text-dark-500/50 font-bold uppercase tracking-wider">Jharkhand Division</span>
          </div>

          <div className="divide-y divide-theme-50/30 flex-1 overflow-y-auto max-h-[450px]">
            {leaders.map((leader) => {
              const isFirst = leader.rank === 1;
              const isSecond = leader.rank === 2;
              const isThird = leader.rank === 3;

              const avatarGradient = isFirst
                ? "gradient-theme text-white"
                : isSecond
                  ? "bg-gradient-to-br from-peacock-400 to-peacock-600 text-white"
                  : isThird
                    ? "bg-gradient-to-br from-jewel-400 to-jewel-600 text-white"
                    : "bg-theme-50 text-dark-700 border border-theme-100/30";

              return (
                <div
                  key={leader.rank}
                  className={`p-4 flex items-center justify-between transition-all duration-300 ${
                    leader.isCurrentUser ? "bg-theme-50/30" : "hover:bg-theme-50/20"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 shrink-0 flex items-center justify-center">
                      {isFirst ? (
                        <Crown className="h-5.5 w-5.5 text-theme-500 fill-theme-400" />
                      ) : isSecond ? (
                        <span className="text-sm font-bold text-peacock-500">#2</span>
                      ) : isThird ? (
                        <span className="text-sm font-bold text-jewel-500">#3</span>
                      ) : (
                        <span className="text-xs font-semibold text-dark-500/40">#{leader.rank}</span>
                      )}
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${avatarGradient}`}>
                      {leader.avatar}
                    </div>

                    <div>
                      <p className="font-bold text-dark-800 text-sm flex items-center">
                        <span>{leader.name}</span>
                        {leader.isCurrentUser && (
                          <span className="ml-1.5 px-2 py-0.5 bg-theme-100 text-theme-700 rounded text-[9px] font-extrabold uppercase tracking-wide">YOU</span>
                        )}
                      </p>
                      <span className="text-[10px] text-dark-500/50 font-semibold uppercase">{leader.badge}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-dark-600">{leader.badgesCount} Badges</p>
                      <span className="text-[9px] text-dark-500/40 block font-mono">earned</span>
                    </div>
                    <div className="bg-gradient-to-r from-theme-50 to-theme-100/50 px-3 py-1.5 rounded-xl shrink-0 font-bold text-xs text-theme-700 border border-theme-200/30">
                      {leader.points} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
