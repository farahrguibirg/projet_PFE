"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import FormField from "../../../components/FormFieldEdit";
import { HiArrowNarrowLeft } from "react-icons/hi";

export default function EditGroupe() {
  const router = useRouter();
  const { id } = useParams();
  const [groupe, setGroupe] = useState(null);
  const [tuteurs, setTuteurs] = useState([]);
  const [sujets, setSujets] = useState([]);
  const [tuteursDisponibles, setTuteursDisponibles] = useState([]);
  const [sujetsDisponibles, setSujetsDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTuteur, setSelectedTuteur] = useState("");
  const [selectedSujet, setSelectedSujet] = useState("");
  const [etudiants, setEtudiants] = useState([]);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    if (id) {
      loadAllData();
    } else {
      setLoading(false);
      setError("ID du groupe introuvable.");
    }
  }, [id]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [groupeRes, tuteursRes, sujetsRes, groupesRes, etudiantsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/getgroupe/${id}`),
        axios.get("http://localhost:5000/api/tuteurs"),
        axios.get("http://localhost:5000/api/approved-sujets"), // Using approved-sujets endpoint
        axios.get("http://localhost:5000/api/groupes"),
        axios.get("http://localhost:5000/api/etudiants"),
      ]);

      const currentGroupe = groupeRes.data;
      setGroupe(currentGroupe);
      
      // Filter tutors by current year
      const tuteursCurrentYear = tuteursRes.data.filter(tuteur => 
        tuteur.annee?.toString() === currentYear
      );
      
      // Subjects are already approved (from approved-sujets endpoint), just filter by year
      const sujetsCurrentYear = sujetsRes.data.filter(sujet => 
        sujet.annee?.toString() === currentYear
      );

      // Filter tutors already assigned to other groups
      const tuteursDejaAffectes = groupesRes.data
        .filter(g => g.idGroupe !== Number(id) && g.idTuteur)
        .map(g => g.idTuteur);
      
      const tuteursFiltered = tuteursCurrentYear.filter(
        tuteur => !tuteursDejaAffectes.includes(tuteur.idTuteur)
      );
      
      // Add current tutor if exists
      if (currentGroupe.idTuteur) {
        const tuteurActuel = tuteursCurrentYear.find(t => t.idTuteur === currentGroupe.idTuteur);
        if (tuteurActuel && !tuteursFiltered.some(t => t.idTuteur === tuteurActuel.idTuteur)) {
          tuteursFiltered.push(tuteurActuel);
        }
      }
      
      // Filter subjects already assigned to 3 groups maximum
      const sujetsCounts = {};
      groupesRes.data.forEach(g => {
        if (g.idSujet) {
          sujetsCounts[g.idSujet] = (sujetsCounts[g.idSujet] || 0) + 1;
        }
      });
      
      const sujetsFiltered = sujetsCurrentYear.filter(sujet => {
        if (currentGroupe.idSujet === sujet.idSujet) {
          return true;
        }
        return !sujetsCounts[sujet.idSujet] || sujetsCounts[sujet.idSujet] < 3;
      });
      
      // Get students assigned to group
      const etudiantsAffectes = etudiantsRes.data.filter(etudiant => etudiant.idGroupe === currentGroupe.idGroupe);
      setEtudiants(etudiantsAffectes);

      setTuteurs(tuteursCurrentYear);
      setSujets(sujetsCurrentYear);
      setTuteursDisponibles(tuteursFiltered);
      setSujetsDisponibles(sujetsFiltered);
      
      setSelectedTuteur(currentGroupe.idTuteur || "");
      setSelectedSujet(currentGroupe.idSujet || "");
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      const errorMessage = err.response
        ? err.response.status === 404
          ? "Groupe non trouvé. Vérifiez l'identifiant fourni."
          : `Erreur serveur: ${err.response.status}`
        : "Erreur lors du chargement des données. Veuillez réessayer.";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/modifierSujetsAuGroupe/${groupe.idGroupe}`, {
        idTuteur: selectedTuteur,
        idSujet: selectedSujet,
      });
      alert("Modifications enregistrées avec succès!");
      router.push("/affectation");
    } catch (err) {
      let errorMessage = "Erreur lors de la modification. Veuillez réessayer.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!groupe) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Groupe non trouvé
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-1 justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
          
          <button
            onClick={() => router.push("/users/readgenerer")}
            className="back-button"
          >
            <HiArrowNarrowLeft className="mr-2 text-2xl" />
          </button>
   
          <h1 className="form-title text-2xl font-bold text-gray-800 text-center mb-6">
            Modifier le groupe {groupe.idGroupe}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Groupe"
              name="groupe"
              value={groupe.idGroupe || ""}
              readOnly
            />
            
            <FormField
              label={`Tuteur (${currentYear})`}
              name="tuteur"
              type="select"
              value={selectedTuteur}
              onChange={(e) => setSelectedTuteur(e.target.value)}
              options={
                <>
                  <option value="">Sélectionner un tuteur</option>
                  {tuteursDisponibles.map((tuteur) => (
                    <option key={tuteur.idTuteur} value={tuteur.idTuteur}>
                      {tuteur.nom} {tuteur.prenom} ({tuteur.annee})
                    </option>
                  ))}
                </>
              }
            />
            {tuteurs.length !== tuteursDisponibles.length && (
              <p className="text-xs text-orange-600 mt-1">
                Certains tuteurs ne sont pas affichés car ils sont déjà affectés à d'autres groupes.
              </p>
            )}
            
            <FormField
              label={`Sujet (${currentYear} - Approuvés)`}
              name="sujet"
              type="select"
              value={selectedSujet}
              onChange={(e) => setSelectedSujet(e.target.value)}
              options={
                <>
                  <option value="">Sélectionner un sujet approuvé</option>
                  {sujetsDisponibles.map((sujet) => (
                    <option key={sujet.idSujet} value={sujet.idSujet}>
                      {sujet.titre} ({sujet.annee}) ✓
                    </option>
                  ))}
                </>
              }
            />
            {sujets.length !== sujetsDisponibles.length && (
              <p className="text-xs text-orange-600 mt-1">
                Certains sujets ne sont pas affichés car ils sont déjà affectés à 3 groupes.
              </p>
            )}
            
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">Étudiants affectés :</h2>
              <ul className="list-disc pl-5">
                {etudiants.map((etudiant) => (
                  <li key={etudiant.idEtudiant}>
                    {etudiant.nom} {etudiant.prenom}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mt-4"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}