'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';

import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import FileUpload from "../../components/FileUpload";

export default function ListUser() {
  const [etudiants, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/etudiants');
      setUsers(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/deleteetudiant/${id}`);
      getUsers();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur :", err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:5000/api/import-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      getUsers();
      setUploadMessage({ type: 'success', text: response.data?.message || "Données importées avec succès!" });
      setShowUpload(false);
      setTimeout(() => setUploadMessage(null), 5000);
      return { success: true, message: response.data?.message || "Données importées avec succès!" };
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      setUploadMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || "Erreur lors de l'importation"
      });
      return { 
        success: false, 
        message: error instanceof Error ? `Erreur: ${error.message}` : "Erreur inconnue" 
      };
    } finally {
      setLoading(false);
    }
  };

  const isCurrentYear = (studentYear) => {
    // Parse the year to number if it's a string
    const yearNum = parseInt(studentYear, 10);
    return !isNaN(yearNum) && yearNum === currentYear;
  };

  if (loading) return <Layout title="Liste des étudiants"><p>Chargement...</p></Layout>;

  return (
    <Layout title="Liste des étudiants">
      <div className="ml-4 mr-4 mt-4 mb-4"> {/* Add margin on all sides */}
        <div className="flex flex-col items-end mb-10">
          <div className="flex space-x-3 mb-10">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="btn-secondary flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors"
              style={{ backgroundColor: '#3B82F6', hover: { backgroundColor: '#2563EB' } }}
            >
              <UploadIcon className="mr-2" />
              {showUpload ? 'Annuler' : 'Importer'}
            </button>

            <Link
              href="/users/createEtu"
              className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
            >
              <AddIcon className="mr-2" />
              Ajouter un étudiant
            </Link>
          </div>

          {showUpload && (
            <FileUpload 
              onUpload={handleUpload}
              title="Importer les informations des étudiants"
              accept=".xlsx, .xls"
            />
          )}

          {uploadMessage && (
            <div className={`mt-2 p-3 rounded-lg text-sm w-full ${
              uploadMessage.type === 'success' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {uploadMessage.text}
            </div>
          )}
        </div>

        <DataTable
          headers={["ID", "Nom", "Prénom", "Email", "Mot de Passe", "Année", "Classe", "Filière", "Actions"]}
          data={etudiants}
          searchPlaceholder="Rechercher par nom, prénom ou email"
          searchKeys={["nom", "prenom", "email"]}
          renderRow={(etudiant, index) => {
            const isAllowed = isCurrentYear(etudiant.annee);
            
            return (
              <tr
                key={etudiant.idEtudiant}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4 text-gray-800">{etudiant.idEtudiant}</td>
                <td className="p-4 text-gray-800">{etudiant.nom}</td>
                <td className="p-4 text-gray-800">{etudiant.prenom}</td>
                <td className="p-4 text-gray-600">{etudiant.email}</td>
                <td className="p-4 text-gray-600">{etudiant.motDePasse}</td>
                <td className="p-4 text-gray-600">
                  <span className={isAllowed ? 'font-medium' : 'text-gray-600'}>
                    {etudiant.annee}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{etudiant.classe}</td>
                <td className="p-4 text-gray-600">{etudiant.filiere}</td>
                <td className="p-4 text-center flex justify-center space-x-3">
                  {isAllowed ? (
                    <>
                      <Link href={`/users/edit/${etudiant.idEtudiant}`}>
                        <button className="text-blue-500 hover:text-blue-700 transition duration-200">
                          <EditIcon />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteUser(etudiant.idEtudiant)}
                        className="text-red-500 hover:text-red-700 transition duration-200"
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled
                        className="text-gray-300 cursor-not-allowed"
                        title="Modification bloquée - année différente de l'année actuelle"
                      >
                        <EditIcon />
                      </button>
                      <button
                        disabled
                        className="text-gray-300 cursor-not-allowed"
                        title="Suppression bloquée - année différente de l'année actuelle"
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>
    </Layout>
  );
}