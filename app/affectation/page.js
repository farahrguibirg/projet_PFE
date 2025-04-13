"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, FileDownload as FileDownloadIcon } from "@mui/icons-material";
import Layout from "../components/Layout";
import DataTable from "../components/DataTableAffect";

export default function GestionGroupes() {
  const [groupes, setGroupes] = useState([]);
  const [tuteurs, setTuteurs] = useState([]);
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupesResponse, etudiantsResponse, tuteursResponse, sujetsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/groupes"),
        axios.get("http://localhost:5000/api/etudiants"),
        axios.get("http://localhost:5000/api/tuteurs"),
        axios.get("http://localhost:5000/api/sujets?status=approved"), // Only approved subjects
      ]);

      if (!groupesResponse.data || !Array.isArray(groupesResponse.data)) {
        throw new Error("Format de données des groupes invalide");
      }

      // Filter tutors and subjects by current year
      const filteredTuteurs = tuteursResponse.data.filter(tuteur => 
        tuteur.annee?.toString() === currentYear
      );
      
      const filteredSujets = sujetsResponse.data.filter(sujet => 
        sujet.annee?.toString() === currentYear && sujet.status === 'approved' // Double check status
      );

      // Create map of students by group
      const etudiantsMap = new Map();
      if (etudiantsResponse.data && Array.isArray(etudiantsResponse.data)) {
        etudiantsResponse.data.forEach((etudiant) => {
          if (etudiant && etudiant.idGroupe) {
            if (!etudiantsMap.has(etudiant.idGroupe)) {
              etudiantsMap.set(etudiant.idGroupe, []);
            }
            etudiantsMap.get(etudiant.idGroupe).push(`${etudiant.nom || ""} ${etudiant.prenom || ""}`);
          }
        });
      }

      // Process groups data
      const groupesData = groupesResponse.data.map((groupe) => {
        const tuteur = filteredTuteurs.find((t) => t.idTuteur === groupe.idTuteur);
        const sujet = filteredSujets.find((s) => s.idSujet === groupe.idSujet);
        
        // Determine if group is properly assigned
        const isAffected = groupe.idTuteur !== null && groupe.idTuteur !== undefined && 
                          groupe.idSujet !== null && groupe.idSujet !== undefined &&
                          tuteur && sujet;

        return {
          ...groupe,
          etudiants: etudiantsMap.get(groupe.idGroupe) || [],
          tuteur: tuteur || null,
          sujet: sujet || null,
          isAffected: isAffected,
        };
      });

      setGroupes(groupesData);
      setTuteurs(filteredTuteurs);
      setSujets(filteredSujets);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      alert("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleTuteurChange = (groupe, tuteurId) => {
    if (!tuteurId) return;
    const selectedTuteur = tuteurs.find((t) => t.idTuteur === tuteurId);
    if (!selectedTuteur) return;
    setGroupes((prevGroupes) =>
      prevGroupes.map((g) => {
        if (g.idGroupe === groupe.idGroupe) {
          return {
            ...g,
            tuteur: selectedTuteur,
            isAffected: false,
          };
        }
        return g;
      })
    );
  };

  const handleSujetChange = (groupe, sujetId) => {
    if (!sujetId) return;
    const selectedSujet = sujets.find((s) => s.idSujet === parseInt(sujetId));
    if (!selectedSujet) return;
    setGroupes((prevGroupes) =>
      prevGroupes.map((g) => {
        if (g.idGroupe === groupe.idGroupe) {
          return {
            ...g,
            sujet: selectedSujet,
            isAffected: false,
          };
        }
        return g;
      })
    );
  };

  const affecterGroupe = async () => {
    const groupesAAffecter = groupes.filter((groupe) => groupe.tuteur && groupe.sujet && !groupe.isAffected);
    if (groupesAAffecter.length === 0) {
      alert("Veuillez sélectionner un tuteur et un sujet pour au moins un groupe non affecté.");
      return;
    }
    try {
      for (const groupe of groupesAAffecter) {
        const response = await axios.post(
          `http://localhost:5000/api/affecterSujetsAuGroupe/${groupe.idGroupe}`,
          {
            idTuteur: groupe.tuteur.idTuteur,
            idSujet: groupe.sujet.idSujet,
          }
        );
        if (response.data && response.data.groupe) {
          setGroupes((prevGroupes) =>
            prevGroupes.map((g) =>
              g.idGroupe === groupe.idGroupe ? { ...g, isAffected: true } : g
            )
          );
        }
      }
      alert("Affectation réussie !");
      await fetchData();
    } catch (error) {
      console.error("Erreur détaillée:", error.response?.data || error.message);
      alert(`Erreur lors de l'affectation: ${error.response?.data?.message || "Erreur inconnue"}`);
    }
  };

  const deleteGroupe = async (idGroupe) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette affectation ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/supprimerAffectationsGroupe/${idGroupe}`);
      alert("Affectation supprimée avec succès");
      await fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression du groupe :", error);
      alert("Erreur lors de la suppression du groupe");
    }
  };

  const handleExport = (type) => {
    const exportUrl =
      type === "excel"
        ? "http://localhost:5000/api/excel"
        : "http://localhost:5000/api/word";

    window.open(exportUrl, "_blank");
    setShowExportOptions(false);
  };

  const tableColumns = [
    {
      id: "groupe",
      header: "Nom du Groupe et Étudiants",
      cell: (groupe) => (
        <div>
          <strong>{groupe.nomGroupe}</strong>
          <ul className="ml-4 list-disc">
            {groupe.etudiants.map((etudiant, index) => (
              <li key={index}>{etudiant}</li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "tuteur",
      header: "Tuteur",
      cell: (groupe) => (
        groupe.isAffected ? (
          <span>{groupe.tuteur ? `${groupe.tuteur.nom} ${groupe.tuteur.prenom} (${groupe.tuteur.annee})` : "Non assigné"}</span>
        ) : (
          <select
            value={groupe.tuteur?.idTuteur || ""}
            onChange={(e) => handleTuteurChange(groupe, e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un tuteur</option>
            {tuteurs
              .filter(
                (tuteur) =>
                  !groupes.some(
                    (g) =>
                      g.idGroupe !== groupe.idGroupe &&
                      g.tuteur?.idTuteur === tuteur.idTuteur &&
                      g.isAffected
                  )
              )
              .map((tuteur) => (
                <option key={tuteur.idTuteur} value={tuteur.idTuteur}>
                  {tuteur.nom} {tuteur.prenom} ({tuteur.annee})
                </option>
              ))}
          </select>
        )
      )
    },
    {
      id: "sujet",
      header: "Sujet (Approuvés seulement)",
      cell: (groupe) => (
        groupe.isAffected ? (
          <div>
            <span>{groupe.sujet ? `${groupe.sujet.titre} (${groupe.sujet.annee})` : "Non assigné"}</span>
            {groupe.sujet && <span className="ml-2 text-green-600 text-xs">✓ Approuvé</span>}
          </div>
        ) : (
          <select
            value={groupe.sujet?.idSujet || ""}
            onChange={(e) => handleSujetChange(groupe, e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un sujet approuvé</option>
            {sujets
              .filter((sujet) => {
                const count = groupes.filter(
                  (g) =>
                    g.idGroupe !== groupe.idGroupe &&
                    g.sujet?.idSujet === sujet.idSujet &&
                    g.isAffected
                ).length;
                return count < 3;
              })
              .map((sujet) => (
                <option key={sujet.idSujet} value={sujet.idSujet}>
                  {sujet.titre} ({sujet.annee}) ✓
                </option>
              ))}
          </select>
        )
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: (groupe) => (
        <div className="flex justify-center space-x-3">
          <Link href={`/users/editgrp/${groupe.idGroupe}`} passHref>
            <IconButton color="primary" title="Éditer">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            color="error"
            onClick={() => deleteGroupe(groupe.idGroupe)}
            title="Supprimer"
            disabled={groupe.annee?.toString() !== currentYear}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )
    }
  ];

  const renderCardView = () => (
    <div className="ml-4 mr-4 mt-4 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groupes.map((groupe) => (
        <div
          key={groupe.idGroupe}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-blue-600 mb-4">
            Groupe : {groupe.nomGroupe}
          </h3>

          <div className="mb-4">
            <p className="text-sm text-gray-500 font-medium">Tuteur</p>
            <p className="text-lg text-gray-800">
              {groupe.tuteur ? `${groupe.tuteur.nom} ${groupe.tuteur.prenom} (${groupe.tuteur.annee})` : "Non assigné"}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 font-medium">Sujet</p>
            <p className="text-lg text-gray-800">
              {groupe.sujet ? `${groupe.sujet.titre} (${groupe.sujet.annee})` : "Non assigné"}
              {groupe.sujet && <span className="ml-2 text-green-600 text-xs">✓ Approuvé</span>}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">Étudiants</p>
            <ul className="mt-2 space-y-2">
              {groupe.etudiants.map((etudiant, index) => (
                <li key={index} className="text-gray-700">
                  <span className="text-blue-500 mr-2">•</span>
                  {etudiant}
                </li>
              ))}
            </ul>
          </div>

          {groupe.isAffected && (
            <p className="text-green-600 font-semibold mt-4">✓ Affecté</p>
          )}
        </div>
      ))}
    </div>
  );

  const pageContent = (
    <div className="ml-4 mr-4 mt-4 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="form-title text-3xl font-semibold text-gray-800 underline">
          Affectation
        </h2>
       
        <div className="flex space-x-4">
          <button
            onClick={affecterGroupe}
            className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
          >
            Affecter
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all"
          >
            {viewMode === "table" ? "Vue Cartes" : "Vue Tableau"}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="bg-teal-500 text-white px-4 py-2 rounded flex items-center hover:bg-teal-600 transition-all"
            >
              <FileDownloadIcon className="mr-1" />
              Exporter
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10">
              
                <button
                  onClick={() => handleExport("word")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Exporter en Word
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-500">Chargement des données...</div>
        </div>
      ) : viewMode === "table" ? (
        <DataTable
          columns={tableColumns}
          data={groupes}
          searchable={true}
          searchPlaceholder="Rechercher un groupe..."
          className="bg-white rounded-xl shadow-lg"
          emptyMessage="Aucun groupe disponible"
        />
      ) : (
        renderCardView()
      )}
    </div>
  );

  return <Layout>{pageContent}</Layout>;
}