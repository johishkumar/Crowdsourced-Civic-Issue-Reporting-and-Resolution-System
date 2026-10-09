import React, { useState, useEffect } from "react";
import Login from "./Login";
import { onAuthChange, signOutUser } from "./firebase/phoneAuthService";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ReportIssue from "./components/ReportIssue";
import IssueMap from "./components/IssueMap";
import Analytics from "./components/Analytics";
import Leaderboard from "./components/Leaderboard";
import IssueDetailsModal from "./components/IssueDetailsModal";
import EmergencyModal from "./components/EmergencyModal";
import IssueCard from "./components/IssueCard";
import { initialIssues, initialNotifications, initialAnalytics } from "./mockData";
import { getTranslator } from "./locales";

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem("civic_pref_lang") || "en");
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Restore Firebase Phone Auth session across page refreshes.
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser && firebaseUser.phoneNumber && !user) {
        const stored = localStorage.getItem("civic_firebase_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.firebaseUid === firebaseUser.uid) {
              setUser(parsed);
            }
          } catch (_) {
            localStorage.removeItem("civic_firebase_user");
          }
        }
      } else if (!firebaseUser) {
        localStorage.removeItem("civic_firebase_user");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load issues from MongoDB SIH database
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const data = await res.json();
        if (data && data.length > 0) {
          const mapped = data.map(item => ({ ...item, id: item._id }));
          setIssues(mapped);
        } else {
          console.log("MongoDB database is empty. Pre-populating seed issues...");
          const seeded = [];
          for (const item of initialIssues) {
            const seedRes = await fetch("/api/issues", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
            const saved = await seedRes.json();
            seeded.push({ ...saved, id: saved._id });
          }
          setIssues(seeded);
        }
      } catch (err) {
        console.error("Failed to load issues from MongoDB:", err);
      }
    };
    fetchIssues();
  }, []);

  const t = getTranslator(lang);

  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
    const initialLang = authenticatedUser.language || localStorage.getItem("civic_pref_lang") || "en";
    setLang(initialLang);
    localStorage.setItem("civic_pref_lang", initialLang);

    if (authenticatedUser.firebaseUid) {
      localStorage.setItem("civic_firebase_user", JSON.stringify(authenticatedUser));
    }

    setActiveTab("dashboard");
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("civic_pref_lang", newLang);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (_) {}
    localStorage.removeItem("civic_firebase_user");
    setUser(null);
  };

  const handleUpvoteIssue = async (id) => {
    try {
      const res = await fetch(`/api/issues/${id}/upvote`, {
        method: "PUT",
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) =>
        prev.map((issue) => (issue.id === id ? mappedSaved : issue))
      );
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(mappedSaved);
      }
    } catch (err) {
      console.error("Error upvoting issue:", err);
    }
  };

  const handleAddIssue = async (newTicket) => {
    const freshTicket = {
      ...newTicket,
      status: "submitted",
      upvotes: 0,
      comments: [],
    };

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshTicket),
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) => [mappedSaved, ...prev]);

      const newNotify = {
        id: (notifications.length + 1).toString(),
        userId: user.id,
        title: "Ticket Lodged Successfully",
        message: `Your report for "${mappedSaved.title}" was submitted as ticket #${mappedSaved.ticketId}.`,
        type: "status_update",
        issueId: mappedSaved.id,
        read: false,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotify, ...prev]);
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Error saving issue:", err);
      alert("Failed to submit ticket to database.");
    }
  };

  const handleAddComment = async (issueId, text) => {
    const freshComment = {
      id: Math.random().toString(),
      userId: user.id,
      userName: user.name,
      text,
      createdAt: new Date(),
    };

    const current = issues.find(i => i.id === issueId);
    if (!current) return;

    const updatedComments = [...(current.comments || []), freshComment];
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: updatedComments }),
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? mappedSaved : issue))
      );

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(mappedSaved);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleUpdateStatus = async (issueId, newStatus) => {
    const updateObj = { status: newStatus };
    if (newStatus === "resolved") {
      updateObj.resolvedAt = new Date();
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateObj),
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? mappedSaved : issue))
      );

      const notifyName = `Issue Status Updated`;
      const msg = `Ticket Reference ${mappedSaved.ticketId} status set to ${newStatus}.`;

      const newNotify = {
        id: Math.random().toString(),
        userId: "all",
        title: notifyName,
        message: msg,
        type: newStatus === "resolved" ? "resolution" : "status_update",
        issueId,
        read: false,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotify, ...prev]);

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(mappedSaved);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAssignTicket = async (issueId, department, etaDate, assignedByName, newStatus) => {
    const updateObj = {
      assignedTo: {
        id: Math.random().toString(),
        name: assignedByName || "Admin Officer",
        department,
      },
      estimatedResolution: etaDate ? new Date(etaDate) : null,
      status: newStatus || "verified",
    };
    if (newStatus === "resolved") {
      updateObj.resolvedAt = new Date();
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateObj),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? mappedSaved : issue))
      );

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(mappedSaved);
      }

      const newNotify = {
        id: Math.random().toString(),
        userId: "all",
        title: "Ticket Forwarded to Department",
        message: `Ticket #${mappedSaved.ticketId} was forwarded to "${department}" by ${assignedByName || "Admin"} — status: ${newStatus || "verified"}.`,
        type: "status_update",
        issueId,
        read: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotify, ...prev]);
    } catch (err) {
      console.error("Error assigning ticket:", err);
      throw err;
    }
  };

  const handleSubmitFeedback = async (issueId, rating, feedback) => {
    const updateObj = { rating, feedback };

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateObj),
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? mappedSaved : issue))
      );

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(mappedSaved);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  const handleMarkNotificationRead = (notifyId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifyId ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationIssueSelect = (issueId) => {
    const target = issues.find((i) => i.id === issueId);
    if (target) {
      setSelectedIssue(target);
    }
  };

  const handleAddEmergency = async (emergencyDetails) => {
    const ticketId = `EM${Math.floor(100 + Math.random() * 900)}`;
    const freshEmergency = {
      ...emergencyDetails,
      ticketId,
      status: "in-progress",
      upvotes: 1,
      comments: [
        {
          id: "syslog-1",
          userId: "sys",
          userName: "System Sentinel",
          text: "Critical dispatch unit activated. Emergency response team en route.",
          createdAt: new Date(),
        },
      ],
      location: {
        address: "Khunti Sadar Road, Jharkhand",
        coordinates: { lat: 23.0805, lng: 85.2821 },
      },
      images: ["https://static.vecteezy.com/system/resources/thumbnails/006/739/443/small_2x/corrosion-rusty-through-socket-tube-steam-gas-leak-pipeline-photo.jpg"],
      reportedBy: {
        name: user?.name || "Citizen Dispatcher",
        email: user?.email || "anonymous@dispatcher.com",
      },
    };

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshEmergency),
      });
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id };

      setIssues((prev) => [mappedSaved, ...prev]);

      const newNotify = {
        id: Math.random().toString(),
        userId: user?.id || "dispatcher",
        title: "Emergency Alert Transmitted",
        message: `Emergency dispatch #${ticketId} deployed to landmark point.`,
        type: "status_update",
        issueId: mappedSaved.id,
        read: false,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotify, ...prev]);
    } catch (err) {
      console.error("Error submitting emergency:", err);
    }
    alert("Emergency units notified! Dispatch team is heading to coordinates.");
  };

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  const getDeptCategory = (department) => {
    if (!department) return null;
    const mapping = {
      "Road Maintenance": "road",
      "Garbage & Sanitation": "garbage",
      "Garbage Disposal & Sanitation": "garbage",
      "Water Supply": "water",
      "Water Supply Department": "water",
      "Electricity Dept": "electricity",
      "Electricity Board": "electricity",
      "Streetlight Dept": "streetlight",
      "Street Light Commission": "streetlight",
      "Public Safety": "public-safety",
      "Public Works": "public-safety",
      "Forestry Dept": "parks",
      "Drainage Dept": "drainage",
      "Environment Dept": "noise",
      "Emergency Services": "emergency",
    };
    return mapping[department] || null;
  };

  const adminCategory = user && user.role === "admin" ? getDeptCategory(user.department) : null;

  const viewableIssues = issues.filter(issue => {
    if (!adminCategory) return true;

    if (issue.assignedTo?.department) {
      const forwardedCategory = getDeptCategory(issue.assignedTo.department);
      if (forwardedCategory === adminCategory) return true;
      if (issue.assignedTo.department === user.department) return true;
    }

    if (issue.category === adminCategory) return true;

    return false;
  });

  const filteredMyIssues = viewableIssues.filter(
    (i) => i.reportedBy?.email === user.email
  );

  const matchedSearchAllIssues = viewableIssues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-[#F5F7FA] min-h-screen text-[#172B4D] antialiased font-sans relative overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        lang={lang}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Container Layout */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Header toolbar */}
        <Header
          user={user}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNotificationClick={handleNotificationIssueSelect}
          onTriggerEmergency={() => setIsEmergencyOpen(true)}
          lang={lang}
          onLangChange={handleLangChange}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Tab content view routes */}
        <main className="flex-1 pt-28 md:pt-20 px-4 md:px-8 pb-12 overflow-y-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              user={user}
              issues={viewableIssues}
              onSelectIssue={setSelectedIssue}
              onUpvoteIssue={handleUpvoteIssue}
              searchTerm={searchTerm}
              analytics={analytics}
              lang={lang}
            />
          )}

          {activeTab === "report" && (
            <ReportIssue user={user} onAddIssue={handleAddIssue} lang={lang} />
          )}

          {activeTab === "my-reports" && (
            <div className="space-y-6 animate-float-in">
              <div className="border-b border-[#D4AF37]/30 pb-3">
                <h1 className="text-2xl font-artdeco-heading text-[#F2F0E4]">{t("myReports") || "My Submissions"}</h1>
                <p className="text-[#888888] text-xs mt-1">{t("myReportsSubtitle") || "Track status of civic tickets lodged by you"}</p>
              </div>

              {filteredMyIssues.length === 0 ? (
                <div className="card-art-deco p-10 text-center border border-[#D4AF37]/30">
                  <p className="text-[#F2F0E4] text-sm font-semibold mb-1">{t("noReportsYet") || "No reports submitted yet"}</p>
                  <p className="text-[#888888] text-xs">{t("getStartedReport") || "Click 'Report Issue' to lodge a new civic ticket."}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onSelect={setSelectedIssue}
                      onUpvote={handleUpvoteIssue}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "all-issues" && (
            <div className="space-y-6 animate-float-in">
              <div className="border-b border-[#D4AF37]/30 pb-3">
                <h1 className="text-2xl font-artdeco-heading text-[#F2F0E4]">{t("allIssues") || "Public Ticket Directory"}</h1>
                <p className="text-[#888888] text-xs mt-1">{t("allIssuesSubtitle") || "View and monitor reported municipal issues across departments"}</p>
              </div>

              {matchedSearchAllIssues.length === 0 ? (
                <div className="card-art-deco p-10 text-center border border-[#D4AF37]/30">
                  <p className="text-[#F2F0E4] text-sm font-semibold">{t("noIssuesDiscovered") || "No matching civic tickets found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedSearchAllIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onSelect={setSelectedIssue}
                      onUpvote={handleUpvoteIssue}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "map" && (
            <IssueMap issues={viewableIssues} onSelectIssue={setSelectedIssue} lang={lang} />
          )}

          {activeTab === "analytics" && <Analytics analyticsState={analytics} issues={issues} lang={lang} />}

          {activeTab === "leaderboard" && <Leaderboard user={user} issues={issues} lang={lang} />}
        </main>
      </div>

      {/* Ticket Details Modal Popup */}
      {selectedIssue && (
        <IssueDetailsModal
          user={user}
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpvote={handleUpvoteIssue}
          onAddComment={handleAddComment}
          onUpdateStatus={handleUpdateStatus}
          onAssignTicket={handleAssignTicket}
          onSubmitFeedback={handleSubmitFeedback}
          lang={lang}
        />
      )}

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onSubmitEmergency={handleAddEmergency}
        lang={lang}
      />
    </div>
  );
}
