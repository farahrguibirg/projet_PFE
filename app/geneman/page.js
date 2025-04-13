'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Save as SaveIcon, 
  Group as GroupIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import Layout from "../components/Layout";

export default function GestionGroupes() {
  const [etudiants, setEtudiants] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [nouveauGroupe, setNouveauGroupe] = useState({
    etudiants: []
  });
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupeType, setGroupeType] = useState('alphabet');

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  // Étudiants éligibles (année courante et sans groupe)
  const etudiantsEligibles = useMemo(() => {
    return etudiants
      .filter(e => e.annee === currentYear && !e.idGroupe)
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [etudiants, currentYear]);

  // Étudiants filtrés par recherche
  const etudiantsFiltres = useMemo(() => {
    if (!searchTerm.trim()) return etudiantsEligibles;
    return etudiantsEligibles.filter(e => 
      `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [etudiantsEligibles, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [etudiantsResponse, groupesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/etudiants'),
        axios.get('http://localhost:5000/api/groupes')
      ]);

      // Traitement des données d'étudiants
      const groupesMap = new Map(groupesResponse.data.map(g => [g.idGroupe, g]));
      
      const etudiantsAvecGroupes = etudiantsResponse.data.map(etudiant => ({
        ...etudiant,
        nomGroupe: groupesMap.get(etudiant.idGroupe)?.nomGroupe || null,
        annee: Number(etudiant.annee) || currentYear
      }));

      setEtudiants(etudiantsAvecGroupes);
      
      // Préparation des données de groupes avec leurs étudiants
      const groupesAvecEtudiants = groupesResponse.data.map(groupe => {
        const membresGroupe = etudiantsAvecGroupes.filter(e => e.idGroupe === groupe.idGroupe);
        return {
          ...groupe,
          etudiants: membresGroupe
        };
      });
      
      setGroupes(groupesAvecEtudiants);
    } catch (err) {
      console.error("Erreur lors de la récupération des données :", err);
      alert("Erreur lors du chargement des données.");
    } finally {
      setLoadingData(false);
    }
  };

  const ajouterEtudiantAuGroupe = (etudiant) => {
    if (nouveauGroupe.etudiants.some(e => e.idEtudiant === etudiant.idEtudiant)) {
      return;
    }
    
    setNouveauGroupe(prev => ({
      ...prev,
      etudiants: [...prev.etudiants, etudiant]
    }));
  };

  const retirerEtudiantDuGroupe = (idEtudiant) => {
    setNouveauGroupe(prev => ({
      ...prev,
      etudiants: prev.etudiants.filter(e => e.idEtudiant !== idEtudiant)
    }));
  };

  const sauvegarderGroupe = async () => {
    if (nouveauGroupe.etudiants.length === 0) {
      alert("Veuillez ajouter au moins un étudiant au groupe.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/ajouterGroupe', {
        etudiants: nouveauGroupe.etudiants.map(e => e.idEtudiant),
        groupeType: groupeType
      });

      alert("Groupe créé avec succès");
      setNouveauGroupe({ etudiants: [] });
      setShowAddGroup(false);
      fetchData();
    } catch (err) {
      console.error("Erreur lors de la création du groupe :", err);
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const supprimerGroupe = async (idGroupe) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/supprimerGroupe/${idGroupe}`);
      alert("Groupe supprimé avec succès");
      fetchData();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const resetNouveauGroupe = () => {
    setNouveauGroupe({ etudiants: [] });
    setSearchTerm('');
  };

  if (loadingData) {
    return (
      <Layout title="Gestion des groupes">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Chargement des données...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des groupes">
      <div className="p-4 max-w-7xl mx-auto">
        {/* En-tête avec boutons d'action */}
        <div className="flex flex-wrap justify-between items-center mb-6">
         
          <button
            onClick={() => setShowAddGroup(!showAddGroup)}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors flex items-center"
          >
            {showAddGroup ? (
              <>
                <ClearIcon className="mr-2" /> Annuler
              </>
            ) : (
              <>
                <AddIcon className="mr-2" /> Créer un nouveau groupe
              </>
            )}
          </button>
        </div>

        {/* Interface de création de groupe */}
        {showAddGroup && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#2563EB] flex items-center">
              <GroupIcon className="mr-2" /> Créer un nouveau groupe
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Configuration du groupe */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-700">Configuration</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Type de génération du nom</label>
                  <select
                    value={groupeType}
                    onChange={(e) => setGroupeType(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#b17a56] focus:outline-none"
                  >
                    <option value="alphabet">Groupe alphabétique</option>
                    <option value="numerique">Groupe numérique</option>
                 
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Le nom du groupe sera généré automatiquement selon le type sélectionné
                  </p>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={sauvegarderGroupe}
                    disabled={nouveauGroupe.etudiants.length === 0}
                    className={`w-full py-2 px-4 rounded flex items-center justify-center ${
                      nouveauGroupe.etudiants.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#b17a56] text-white hover:bg-[#8c6244]'
                    } transition-colors`}
                    >
                    <SaveIcon className="mr-2" /> Enregistrer le groupe
                  </button>
                </div>
                
                <button
                  onClick={resetNouveauGroupe}
                  className="w-full mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <ClearIcon className="mr-2" /> Réinitialiser
                </button>
              </div>
              
              {/* Colonne 2: Sélection des étudiants */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-700 flex justify-between items-center">
                  <span>Étudiants disponibles ({etudiantsEligibles.length})</span>
                  <span className="text-sm text-gray-500">Année {currentYear}</span>
                </h3>
                
                <div className="mb-3 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="text-gray-400" style={{ fontSize: '1.2rem' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-[#b17a56] focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <ClearIcon style={{ fontSize: '1.2rem' }} />
                    </button>
                  )}
                </div>
                
                <div className="overflow-y-auto max-h-64 border rounded bg-white">
                  {etudiantsFiltres.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {etudiantsFiltres.map(etudiant => (
                        <li 
                          key={etudiant.idEtudiant}
                          className="p-2 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
                          onClick={() => ajouterEtudiantAuGroupe(etudiant)}
                        >
                          <div className="flex items-center">
                            <PersonIcon className="text-gray-400 mr-2" style={{ fontSize: '1.2rem' }} />
                            <span>{etudiant.nom} {etudiant.prenom}</span>
                          </div>
                          <button className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                            + Ajouter
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? "Aucun étudiant trouvé" : "Aucun étudiant disponible"}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Colonne 3: Étudiants sélectionnés */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-700 flex justify-between items-center">
                  <span>Étudiants du groupe</span>
                  <span className="text-sm text-gray-500">{nouveauGroupe.etudiants.length} sélectionnés</span>
                </h3>
                
                <div className={`overflow-y-auto max-h-64 border rounded bg-white ${nouveauGroupe.etudiants.length > 0 ? '' : 'flex items-center justify-center'}`}>
                  {nouveauGroupe.etudiants.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {nouveauGroupe.etudiants.map(etudiant => (
                        <li 
                          key={etudiant.idEtudiant}
                          className="p-2 hover:bg-red-50 transition-colors flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <PersonIcon className="text-blue-400 mr-2" style={{ fontSize: '1.2rem' }} />
                            <span>{etudiant.nom} {etudiant.prenom}</span>
                          </div>
                          <button 
                            onClick={() => retirerEtudiantDuGroupe(etudiant.idEtudiant)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Cliquez sur des étudiants pour les ajouter au groupe
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section des groupes existants */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <GroupIcon className="mr-2" /> Groupes existants
        </h2>
        
        {groupes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Aucun groupe n'a encore été créé</p>
            <button 
              onClick={() => setShowAddGroup(true)}
              className="mt-4 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#8c6244] transition-colors"
            >
              Créer mon premier groupe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupes.map(groupe => (
              <div 
                key={groupe.idGroupe} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-[#2563EB]">{groupe.nomGroupe}</h3>
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/editgroupegenman/${groupe.idGroupe}`}>
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Modifier le groupe"
                      >
                        <EditIcon />
                      </button>
                    </Link>
                    <button
                      onClick={() => supprimerGroupe(groupe.idGroupe)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Supprimer le groupe"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      {groupe.etudiants?.length || 0} étudiant(s)
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Année {currentYear}
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto max-h-40">
                    {groupe.etudiants && groupe.etudiants.length > 0 ? (
                      <ul className="space-y-1">
                        {groupe.etudiants.map(etudiant => (
                          <li 
                            key={etudiant.idEtudiant}
                            className="text-sm py-1 px-2 rounded hover:bg-gray-100 flex items-center"
                          >
                            <PersonIcon className="text-gray-400 mr-2" style={{ fontSize: '1rem' }} />
                            {etudiant.nom} {etudiant.prenom}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucun étudiant dans ce groupe</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}