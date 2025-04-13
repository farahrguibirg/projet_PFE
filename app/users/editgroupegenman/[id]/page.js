'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  Save as SaveIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import Layout from "../../../components/Layout";

export default function EditGroupe({ params }) {
  const { id } = useParams();
  const [groupe, setGroupe] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  // Obtenir l'année actuelle dynamiquement
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchGroupeData();
  }, [id]);

  const fetchGroupeData = async () => {
    try {
      setLoading(true);
      const [groupeResponse, etudiantsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/getgroupe/${id}`),
        axios.get('http://localhost:5000/api/etudiants')
      ]);

      setGroupe(groupeResponse.data);
      
      // Définir les membres actuels du groupe
      setSelectedStudents(groupeResponse.data.etudiants || []);
      
      // Filtrer les étudiants - seulement ceux de l'année actuelle qui :
      // 1. Ne sont dans aucun groupe, ou 
      // 2. Sont déjà dans ce groupe (pour permettre leur suppression)
      const allStudents = etudiantsResponse.data.map(etudiant => ({
        ...etudiant,
        annee: Number(etudiant.annee) || currentYear
      }));

      const available = allStudents.filter(etudiant => 
        etudiant.annee === currentYear && 
        (!etudiant.idGroupe || etudiant.idGroupe === id)
      );
      
      setEtudiants(allStudents);
      setAvailableStudents(available);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      alert("Erreur lors du chargement des données du groupe");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = (etudiant) => {
    if (!selectedStudents.some(s => s.idEtudiant === etudiant.idEtudiant)) {
      setSelectedStudents([...selectedStudents, etudiant]);
    }
  };

  const handleRemoveStudent = (idEtudiant) => {
    setSelectedStudents(selectedStudents.filter(s => s.idEtudiant !== idEtudiant));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/groupes/${id}/students`, {
        studentIds: selectedStudents.map(s => s.idEtudiant)
      });
      alert("Groupe mis à jour avec succès");
      fetchGroupeData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe:", error);
      alert("Erreur lors de la mise à jour du groupe");
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return availableStudents;
    return availableStudents.filter(etudiant => 
      `${etudiant.nom} ${etudiant.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableStudents, searchTerm]);

  if (loading) {
    return (
      <Layout title="Édition du groupe">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Chargement des données du groupe...</p>
        </div>
      </Layout>
    );
  }

  if (!groupe) {
    return (
      <Layout title="Groupe introuvable">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Groupe non trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Édition ${groupe.nomGroupe}`}>
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <GroupIcon className="mr-2" /> Édition du groupe: {groupe.nomGroupe}
          <span className="ml-auto text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Année en cours: {currentYear}
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Étudiants disponibles */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Étudiants disponibles ({availableStudents.length})
              <span className="text-sm text-gray-500 ml-2">
                (Année en cours uniquement)
              </span>
            </h2>
            
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher des étudiants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <ClearIcon />
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-96 border rounded">
              {filteredStudents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredStudents.map(etudiant => (
                    <li 
                      key={etudiant.idEtudiant}
                      className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddStudent(etudiant)}
                    >
                      <div className="flex items-center">
                        <PersonIcon className="text-gray-400 mr-2" />
                        <span>
                          {etudiant.nom} {etudiant.prenom}
                          <span className="text-xs text-gray-500 ml-2">
                            ({etudiant.annee})
                          </span>
                        </span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 text-sm">
                        Ajouter
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Aucun étudiant disponible trouvé
                </div>
              )}
            </div>
          </div>

          {/* Membres du groupe */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Membres du groupe ({selectedStudents.length})
            </h2>
            
            <div className="overflow-y-auto max-h-96 border rounded">
              {selectedStudents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selectedStudents.map(etudiant => (
                    <li 
                      key={etudiant.idEtudiant}
                      className="p-3 hover:bg-red-50 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <PersonIcon className="text-blue-400 mr-2" />
                        <span>
                          {etudiant.nom} {etudiant.prenom}
                          <span className="text-xs text-gray-500 ml-2">
                            ({etudiant.annee})
                          </span>
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemoveStudent(etudiant.idEtudiant)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Aucun étudiant dans ce groupe pour le moment
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleSave}
                disabled={selectedStudents.length === 0}
                className={`px-4 py-2 rounded flex items-center ${
                  selectedStudents.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <SaveIcon className="mr-2" /> Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}