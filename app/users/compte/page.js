"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTableCompte";

export default function Comptes() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:5000/api/loginc")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur de chargement");
        setLoading(false);
      });
  }, []);

  const filteredUsers = () => {
    return activeTab === "all" 
      ? users 
      : users.filter(user => user.role === activeTab);
  };

  const sendEmail = async (email, user_id) => {
    try {
      await axios.post("http://localhost:5000/api/send-email", { email, user_id });
      alert(`Email envoyé à ${email}`);
    } catch (error) {
      alert(`Échec pour ${email}`);
      console.error(error);
    }
  };

  const sendBulkEmails = async () => {
    if (selectedUsers.length === 0) {
      alert("Sélectionnez au moins un utilisateur");
      return;
    }

    if (!window.confirm(`Envoyer à ${selectedUsers.length} utilisateurs ?`)) return;

    for (const userId of selectedUsers) {
      const user = users.find(u => u.id === userId);
      if (user) {
        await sendEmail(user.email, user.user_id);
        await new Promise(resolve => setTimeout(resolve, 500)); // Anti-spam
      }
    }
    alert("Envoi terminé !");
  };

  const toggleSelectAll = (e) => {
    const currentUsers = filteredUsers();
    if (e.target.checked) {
      const newSelectedUsers = Array.from(new Set([...selectedUsers, ...currentUsers.map(user => user.id)]));
      setSelectedUsers(newSelectedUsers);
    } else {
      const currentUserIds = currentUsers.map(user => user.id);
      const newSelectedUsers = selectedUsers.filter(id => !currentUserIds.includes(id));
      setSelectedUsers(newSelectedUsers);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const isAllSelected = () => {
    const currentUsers = filteredUsers();
    return currentUsers.length > 0 && currentUsers.every(user => selectedUsers.includes(user.id));
  };

  const columns = [
    {
      header: (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected()}
            onChange={toggleSelectAll}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Tous</span>
        </div>
      ),
      accessor: "select",
      render: (user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => toggleUserSelection(user.id)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
      ),
    },
    { header: "ID", accessor: "id" },
    { header: "User ID", accessor: "user_id" },
    { header: "Email", accessor: "email" },
    { header: "Rôle", accessor: "role" },
    {
      header: "Actions",
      accessor: "actions",
      render: (user) => (
        <button
          onClick={() => sendEmail(user.email, user.user_id)}
          className="text-blue-600 hover:underline"
        >
          Envoyer
        </button>
      ),
    },
  ];

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <Layout  title="Gestion des comptes"   >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
        
          <button
            onClick={sendBulkEmails}
            disabled={!selectedUsers.length}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${!selectedUsers.length ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
          >
            Envoyer ({selectedUsers.length})
          </button>
        </div>

        <div className="flex border-b mb-6">
          {["all", "etudiant", "encadrant", "tuteur"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers()}
          itemsPerPage={10}
        />
      </div>
    </Layout>
  );
}