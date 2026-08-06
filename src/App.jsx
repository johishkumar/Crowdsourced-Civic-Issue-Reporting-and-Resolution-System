import React, { useState, useEffect } from "react";
import Login from "./Login";
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
  const [theme, setTheme] = useState(() => localStorage.getItem("civic_pref_theme") || "citizen");
  const [mode, setMode] = useState(() => localStorage.getItem("civic_pref_mode") || "light");

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
    
    // Automatically pick the theme matching the user's role:
    const roleTheme = authenticatedUser.role === "admin" ? "admin" : authenticatedUser.role === "ngo" ? "ngo" : "citizen";
    setTheme(roleTheme);
    localStorage.setItem("civic_pref_theme", roleTheme);

    setActiveTab("dashboard");
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("civic_pref_lang", newLang);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("civic_pref_theme", newTheme);
  };

  const handleModeToggle = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("civic_pref_mode", newMode);
  };

  // Upvote Event Action
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

  // Register New Issues ticket
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

      // Insert System notification alert
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

  // Append user activity comments logging
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

  // Modify incident status (Admin / NGO action)
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

      // Alert triggering notification
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

  // Ticket department allocation (Admin Actions)
  const handleAssignTicket = async (issueId, department, etaDate) => {
    const updateObj = {
      assignedTo: {
        id: Math.random().toString(),
        name: `Official Assignee`,
        department,
      },
      estimatedResolution: etaDate ? new Date(etaDate) : null,
    };

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
      console.error("Error assigning ticket:", err);
    }
  };

  // Citizen Rating and Feedback evaluations submission
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

  // Urgent Emergency Alert Submissions triggers
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
        theme={theme}
        onThemeChange={handleThemeChange}
        mode={mode}
        onModeToggle={handleModeToggle}
      />
    );
  }

  // Filter issues based on department-level administrator permissions
  const getDeptCategory = (department) => {
    if (!department) return null;
    const mapping = {
      "Road Maintenance": "road",
      "Garbage & Sanitation": "garbage",
      "Water Supply": "water",
      "Electricity Dept": "electricity",
      "Streetlight Dept": "streetlight",
      "Public Safety": "public-safety",
      "Forestry Dept": "parks",
      "Drainage Dept": "drainage",
      "Environment Dept": "noise"
    };
    return mapping[department] || null;
  };

  const adminCategory = user && user.role === "admin" ? getDeptCategory(user.department) : null;
  
  const viewableIssues = issues.filter(issue => {
    if (adminCategory) {
      return issue.category === adminCategory;
    }
    return true;
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
    <div data-theme={theme} data-mode={mode} className="flex gradient-theme-light pattern-professional min-h-screen text-dark-800 antialiased font-sans relative overflow-hidden">
      {/* Decorative floating background blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-theme-200/25 rounded-full blur-3xl animate-blob-1 pointer-events-none z-0" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-theme-100/20 rounded-full blur-3xl animate-blob-2 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-2/3 w-60 h-60 bg-theme-300/15 rounded-full blur-3xl animate-blob-3 pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        lang={lang}
      />

      {/* Main Container Layout */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
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
          theme={theme}
          onThemeChange={handleThemeChange}
          mode={mode}
          onModeToggle={handleModeToggle}
        />

        {/* Tab content view routes */}
        <main className="flex-1 pt-24 px-8 pb-12 overflow-y-auto">
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
              <div>
                <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("myReports")}</h1>
                <p className="text-dark-500 font-medium mt-1">{t("myReportsSubtitle")}</p>
                <div className="flex items-center mt-3 gap-1.5">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-theme-400 to-theme-200 rounded-full" />
                  <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
                  <div className="w-1 h-1 rounded-full bg-theme-300" />
                  <div className="h-0.5 w-8 bg-gradient-to-r from-theme-300 to-transparent rounded-full" />
                </div>
              </div>

              {filteredMyIssues.length === 0 ? (
                <div className="card-premium p-12 text-center rounded-2xl border-2 border-dashed border-theme-200/30">
                  <p className="text-dark-500 text-sm font-bold mb-1">{t("noReportsYet")}</p>
                  <p className="text-dark-500/50 text-xs">{t("getStartedReport")}</p>
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
              <div>
                <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("allIssues")}</h1>
                <p className="text-dark-500 font-medium mt-1">{t("allIssuesSubtitle")}</p>
                <div className="flex items-center mt-3 gap-1.5">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-theme-400 to-theme-200 rounded-full" />
                  <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
                  <div className="w-1 h-1 rounded-full bg-theme-300" />
                  <div className="h-0.5 w-8 bg-gradient-to-r from-theme-300 to-transparent rounded-full" />
                </div>
              </div>

              {matchedSearchAllIssues.length === 0 ? (
                <div className="card-premium p-12 text-center rounded-2xl border-2 border-dashed border-theme-200/30">
                  <p className="text-dark-500 text-sm font-bold">{t("noIssuesDiscovered")}</p>
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

          {activeTab === "analytics" && <Analytics analyticsState={analytics} lang={lang} />}

          {activeTab === "leaderboard" && <Leaderboard user={user} lang={lang} />}
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

      {/* Municipal Red Line Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onSubmitEmergency={handleAddEmergency}
        lang={lang}
      />
    </div>
  );
}
