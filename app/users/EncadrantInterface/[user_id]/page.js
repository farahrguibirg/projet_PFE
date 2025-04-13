/*'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import cookies from 'js-cookie';
import Layout from "../../../components/Layout";

export default function EncadrantProfile() {
  const { user_id } = useParams();
  const [encadrant, setEncadrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSujet, setNewSujet] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    const fetchEncadrantData = async () => {
      try {
        const token = cookies.get("token");
        if (!token) {
          throw new Error("Non autorisé. Veuillez vous connecter.");
        }

        const response = await axios.get(
          `http://localhost:5000/api/Encadrants/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data) {
          throw new Error("Aucune donnée reçue");
        }

        setEncadrant(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchEncadrantData();
    }
  }, [user_id]);

  const handleSubmitSujet = async () => {
    if (!newSujet.trim()) {
      setSubmitMessage({ type: 'error', text: 'Veuillez entrer un titre pour le sujet' });
      return;
    }

    try {
      const token = cookies.get("token");
      const response = await axios.post(
        'http://localhost:5000/api/addSujet',
        { titre: newSujet, idEncadrant: user_id 
          ,isAdmin: true 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitMessage({ type: 'success', text: 'Sujet proposé avec succès! En attente de validation.' });
      setNewSujet('');
      
      // Recharger les données
      const updatedResponse = await axios.get(
        `http://localhost:5000/api/Encadrants/${user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEncadrant(updatedResponse.data);
    } catch (err) {
      setSubmitMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message 
      });
    }
  };

  if (loading) return <p className="text-center mt-10 text-[#6e4c34]">Chargement...</p>;
  if (error) return <p className="text-red-600 text-center mt-10 bg-red-50 p-3 rounded-lg">{error}</p>;
  if (!encadrant) return <p className="text-center mt-10 text-[#6e4c34]">Aucune information trouvée.</p>;

  // Tous les sujets sont dans encadrant.sujets (pas de séparation par statut dans la réponse API)
  const sujets = encadrant.sujets || [];

  // Trier les sujets : ceux avec des groupes en premier
  const sujetsAvecGroupes = sujets.filter((sujet) => sujet.groupes && sujet.groupes.length > 0);
  const sujetsSansGroupes = sujets.filter((sujet) => !sujet.groupes || sujet.groupes.length === 0);
  const sujetsTries = [...sujetsAvecGroupes, ...sujetsSansGroupes];

  return (
    <Layout>
      <div className="max-w-full mx-auto space-y-8">
        {/* Informations personnelles */   
      /*}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#d4b9a1]">
          <h1 className="text-3xl font-bold text-[#b17a56] mb-6 border-b border-[#d4b9a1] pb-2">
            Profil Encadrant
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#6e4c34]">
            <p><span className="font-medium text-[#b17a56]">Nom :</span> {encadrant.nom}</p>
            <p><span className="font-medium text-[#b17a56]">Prénom :</span> {encadrant.prenom}</p>
            <p><span className="font-medium text-[#b17a56]">Email :</span> {encadrant.email}</p>
            <p><span className="font-medium text-[#b17a56]">Année :</span> {encadrant.annee}</p>
          </div>
        </div>

        {/* Formulaire pour proposer un nouveau sujet */
      /*}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#d4b9a1]">
          <h2 className="text-xl font-bold text-[#b17a56] mb-4 border-b border-[#d4b9a1] pb-2">
            Proposer un nouveau sujet
          </h2>
          <div className="flex flex-col space-y-3">
            <input
              type="text"
              value={newSujet}
              onChange={(e) => setNewSujet(e.target.value)}
              placeholder="Titre du sujet"
              className="p-2 border border-[#d4b9a1] rounded-md"
            />
            <button
              onClick={handleSubmitSujet}
              className="bg-[#b17a56] hover:bg-[#8c6244] text-white py-2 px-4 rounded-md transition-colors"
            >
              Proposer le sujet
            </button>
          </div>
          {submitMessage && (
            <div className={`mt-3 p-2 rounded-md ${
              submitMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {submitMessage.text}
            </div>
          )}
        </div>

        {/* Sujets */
      /*}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#b17a56] mb-6 border-b border-[#d4b9a1] pb-2">
            Sujets et Groupes
          </h2>
          
          {sujetsTries.length > 0 ? (
            sujetsTries.map((sujet) => (
              <div key={sujet.idSujet} className="bg-[#f8f1ea] p-6 rounded-2xl shadow-md border border-[#d4b9a1]">
                <h3 className="text-xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
                  Sujet : {sujet.titre}
                </h3>
                
                {sujet.groupes && sujet.groupes.length > 0 ? (
                  <div className="space-y-6">
                    {sujet.groupes.map((groupe) => (
                      <div key={groupe.idGroupe} className="bg-white p-4 rounded-lg shadow-sm border border-[#d4b9a1]">
                        <h4 className="text-lg font-semibold text-[#b17a56] mb-2">
                          Groupe : {groupe.nomGroupe}
                        </h4>
                        
                        <p className="text-[#6e4c34]">
                          <span className="font-medium text-[#b17a56]">Tuteur :</span>{" "}
                          {groupe.tuteur ? `${groupe.tuteur.nom} ${groupe.tuteur.prenom}` : "Aucun tuteur assigné"}
                        </p>
                        
                        <div className="mt-3">
                          <h5 className="font-semibold text-[#b17a56]">Étudiants :</h5>
                          {groupe.etudiants && groupe.etudiants.length > 0 ? (
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#6e4c34]">
                              {groupe.etudiants.map((etudiant, index) => (
                                <li key={index}>
                                  {etudiant.nom} {etudiant.prenom}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#6e4c34]">Aucun étudiant dans ce groupe.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6e4c34]">Aucun groupe assigné à ce sujet.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-[#6e4c34]">Aucun sujet trouvé.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}*/'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import cookies from 'js-cookie';
import Layout from "../../../components/Layout";
import Link from 'next/link';

export default function EncadrantProfile() {
  const { user_id } = useParams();
  const [encadrant, setEncadrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEncadrantData = async () => {
      try {
        const token = cookies.get("token");
        if (!token) {
          throw new Error("Non autorisé. Veuillez vous connecter.");
        }

        const response = await axios.get(
          `http://localhost:5000/api/Encadrants/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data) {
          throw new Error("Aucune donnée reçue");
        }

        setEncadrant(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchEncadrantData();
    }
  }, [user_id]);

  if (loading) return <p className="text-center mt-10 text-[#6e4c34]">Chargement...</p>;
  if (error) return <p className="text-red-600 text-center mt-10 bg-red-50 p-3 rounded-lg">{error}</p>;
  if (!encadrant) return <p className="text-center mt-10 text-[#6e4c34]">Aucune information trouvée.</p>;

  const sujets = encadrant.sujets || [];
  const sujetsAvecGroupes = sujets.filter((sujet) => sujet.groupes && sujet.groupes.length > 0);
  const sujetsSansGroupes = sujets.filter((sujet) => !sujet.groupes || sujet.groupes.length === 0);
  const sujetsTries = [...sujetsAvecGroupes, ...sujetsSansGroupes];

  return (
    <Layout>
      <div className="max-w-full mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex justify-end">
          <Link 
            href={`/sujetSuggest/${user_id}`}
            className="bg-[#b17a56] hover:bg-[#8c6244] text-white py-2 px-4 rounded-md transition-colors"
          >
            Proposer un nouveau sujet
          </Link>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#d4b9a1]">
          <h1 className="text-3xl font-bold text-[#b17a56] mb-6 border-b border-[#d4b9a1] pb-2">
            Profil Encadrant
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#6e4c34]">
            <p><span className="font-medium text-[#b17a56]">Nom :</span> {encadrant.nom}</p>
            <p><span className="font-medium text-[#b17a56]">Prénom :</span> {encadrant.prenom}</p>
            <p><span className="font-medium text-[#b17a56]">Email :</span> {encadrant.email}</p>
            <p><span className="font-medium text-[#b17a56]">Année :</span> {encadrant.annee}</p>
          </div>
        </div>

        {/* Sujets existants */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#b17a56] mb-6 border-b border-[#d4b9a1] pb-2">
            Mes Sujets
          </h2>
          
          {sujetsTries.length > 0 ? (
            sujetsTries.map((sujet) => (
              <div key={sujet.idSujet} className="bg-[#f8f1ea] p-6 rounded-2xl shadow-md border border-[#d4b9a1]">
                <h3 className="text-xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
                  Sujet : {sujet.titre}
                </h3>
                
                {sujet.groupes && sujet.groupes.length > 0 ? (
                  <div className="space-y-6">
                    {sujet.groupes.map((groupe) => (
                      <div key={groupe.idGroupe} className="bg-white p-4 rounded-lg shadow-sm border border-[#d4b9a1]">
                        <h4 className="text-lg font-semibold text-[#b17a56] mb-2">
                          Groupe : {groupe.nomGroupe}
                        </h4>
                        
                        <p className="text-[#6e4c34]">
                          <span className="font-medium text-[#b17a56]">Tuteur :</span>{" "}
                          {groupe.tuteur ? `${groupe.tuteur.nom} ${groupe.tuteur.prenom}` : "Aucun tuteur assigné"}
                        </p>
                        
                        <div className="mt-3">
                          <h5 className="font-semibold text-[#b17a56]">Étudiants :</h5>
                          {groupe.etudiants && groupe.etudiants.length > 0 ? (
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#6e4c34]">
                              {groupe.etudiants.map((etudiant, index) => (
                                <li key={index}>
                                  {etudiant.nom} {etudiant.prenom}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#6e4c34]">Aucun étudiant dans ce groupe.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6e4c34]">Aucun groupe assigné à ce sujet.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-[#6e4c34]">Aucun sujet trouvé.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}