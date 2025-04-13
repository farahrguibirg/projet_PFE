'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import FileUpload from "../../components/FileUpload";

export default function ListTuteur() {
  const [tuteurs, setTuteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  useEffect(() => {
    getTuteurs();
  }, []);

  const getTuteurs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tuteurs');
      setTuteurs(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des tuteurs :", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTuteur = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce tuteur ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/deletetuteur/${id}`);
      getTuteurs();
    } catch (err) {
      console.error("Erreur lors de la suppression du tuteur :", err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/import-tuteurs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      getTuteurs();
      setUploadMessage({ type: 'success', text: response.data?.message || "Données importées avec succès!" });
      setShowUpload(false);
      setTimeout(() => setUploadMessage(null), 5000);
      return { 
        success: true, 
        message: response.data?.message || "Données importées avec succès!" 
      };
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      let errorMsg = "Erreur lors de l'importation";
      if (error.response) {
        errorMsg = error.response.data.message || error.response.statusText;
      } else if (error.request) {
        errorMsg = "Aucune réponse du serveur";
      }
      setUploadMessage({ type: 'error', text: errorMsg });
      return { 
        success: false, 
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout title="Liste des tuteurs"><p>Chargement...</p></Layout>;

  const currentYear = new Date().getFullYear(); // Récupération de l'année actuelle

  return (
    <Layout title="Liste des tuteurs">
      <div className="ml-4 mr-4 mt-4 mb-4">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors"
            >
              <UploadIcon className="mr-2" />
              {showUpload ? 'Annuler' : 'Importer'}
            </button>

            <Link
              href="/users/createTute"
              className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
            >
              <AddIcon className="mr-2" />
              Ajouter un tuteur
            </Link>
          </div>
        </div>

        {showUpload && (
          <div className="flex justify-end mb-6"> {/* Ajout de flex justify-end ici */}
            <div className="w-full max-w-md"> {/* Contrôle de la largeur */}
              <FileUpload 
                onUpload={handleUpload}
                title="Importer les informations des tuteurs"
                accept=".xlsx, .xls"
                compact={true}
              />
            </div>
          </div>
        )}

        {uploadMessage && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            uploadMessage.type === 'success' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {uploadMessage.text}
          </div>
        )}

        <DataTable
          headers={["ID", "Nom", "Prénom", "Email", "Mot de Passe", "Année", "Classe", "Filière", "Actions"]}
          data={tuteurs}
          searchPlaceholder="Rechercher par nom, prénom ou email"
          searchKeys={["nom", "prenom", "email"]}
          renderRow={(tuteur, index) => {
            const isDisabled = tuteur.annee !== currentYear.toString(); // Désactiver si l'année est différente

            return (
              <tr
                key={tuteur.idTuteur}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4 text-gray-800">{tuteur.idTuteur}</td>
                <td className="p-4 text-gray-800">{tuteur.nom}</td>
                <td className="p-4 text-gray-800">{tuteur.prenom}</td>
                <td className="p-4 text-gray-600">{tuteur.email}</td>
                <td className="p-4 text-gray-600">{tuteur.motDePasse}</td>
                <td className="p-4 text-gray-600">{tuteur.annee}</td>
                <td className="p-4 text-gray-600">{tuteur.classe}</td>
                <td className="p-4 text-gray-600">{tuteur.filiere}</td>
                <td className="p-4 text-center flex justify-center space-x-3">
                  <Link href={`/users/editTute/${tuteur.idTuteur}`}>
                    <button 
                      className={`text-blue-500 hover:text-blue-700 transition duration-200 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isDisabled}
                    >
                      <EditIcon />
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteTuteur(tuteur.idTuteur)}
                    className={`text-red-500 hover:text-red-700 transition duration-200 ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isDisabled}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </Layout>
  );
}
