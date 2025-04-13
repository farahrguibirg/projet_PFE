/*'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FileDownload as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import FileUpload from "../../components/FileUpload";

export default function ListSujet() {
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const currentYear = new Date().getFullYear(); // Année actuelle

  useEffect(() => {
    getSujets();
  }, []);

  const getSujets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sujets');
      setSujets(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des sujets :", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSujet = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce sujet ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/deleteSujet/${id}`);
      setSujets(sujets.filter((sujet) => sujet.idSujet !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression du sujet :", err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:5000/api/import-Sujet', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      getSujets();
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
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/export', {
        responseType: 'blob',
      });

      if (response.headers['content-type'] !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        throw new Error('Le fichier n\'est pas un fichier Excel');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sujets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'exportation des sujets :", error);
      setUploadMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de l\'exportation.' 
      });
    }
  };

  if (loading) return <Layout title="Liste des sujets"><p>Chargement...</p></Layout>;

  return (
    <Layout title="Liste des sujets">
      <div className="ml-4 mr-4 mt-4 mb-4">
        <div className="flex flex-col items-end mb-6">
          <div className="flex justify-end w-full mb-3">
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors"
              >
                <DownloadIcon className="mr-2" />
                Exporter
              </button>
              <button 
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors"
              >
                <UploadIcon className="mr-2" />
                {showUpload ? 'Annuler' : 'Importer'}
              </button>
              <Link
                href="/users/createSuj"
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
              >
                <AddIcon className="mr-2" />
                Ajouter un sujet
              </Link>
            </div>
          </div>

          {showUpload && (
            <div className="flex justify-end w-full">
              <FileUpload 
                onUpload={handleUpload}
                title="Importer les informations des sujets"
                accept=".xlsx, .xls"
                compact={true}
              />
            </div>
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
          headers={["ID", "Titre", "Année", "Actions"]}
          data={sujets}
          searchPlaceholder="Rechercher un sujet..."
          searchKeys={["titre"]}
          renderRow={(sujet, index) => {
            const isDisabled = sujet.annee !== currentYear;
            return (
              <tr
                key={sujet.idSujet}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4 text-gray-800">{sujet.idSujet}</td>
                <td className="p-4 text-gray-800">{sujet.titre}</td>
                <td className="p-4 text-gray-800">{sujet.annee}</td>
                <td className="p-4 text-center flex justify-center space-x-3">
                  <Link href={`/users/editSuj/${sujet.idSujet}`}>
                    <button 
                      className={`text-blue-500 transition duration-200 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700'
                      }`}
                      disabled={isDisabled}
                    >
                      <EditIcon />
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteSujet(sujet.idSujet)}
                    className={`text-red-500 transition duration-200 ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'
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
*/'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FileDownload as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import { Tab, Tabs, Box } from '@mui/material';
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import FileUpload from "../../components/FileUpload";
import cookies from 'js-cookie';

export default function ListSujet() {
  const [sujets, setSujets] = useState([]);
  const [pendingSujets, setPendingSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [tabValue, setTabValue] = useState('approved');

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    getApprovedSujets();
    getPendingSujets();
  }, []);

  const getApprovedSujets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/approved-sujets');
      setSujets(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des sujets approuvés :", err);
    } finally {
      setLoading(false);
    }
  };

  const getPendingSujets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pending-sujets');
      setPendingSujets(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des sujets en attente :", err);
    }
  };

  const deleteSujet = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce sujet ?")) return;
    try {
      const token = cookies.get("token");
      await axios.delete(`http://localhost:5000/api/deleteSujet/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSujets(sujets.filter((sujet) => sujet.idSujet !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression du sujet :", err);
    }
  };

  const deleteRejectedSujets = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer tous les sujets rejetés ?")) return;
    
    try {
      const token = cookies.get("token");
      const response = await axios.delete(
        "http://localhost:5000/api/delete-rejected",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setUploadMessage({
        type: 'success',
        text: response.data.message
      });
      
      // Recharger les listes
      getPendingSujets();
      getApprovedSujets();
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: err.response?.data?.message || "Erreur lors de la suppression"
      });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = cookies.get("token");
      await axios.put(
        `http://localhost:5000/api/update-status/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getPendingSujets();
      getApprovedSujets();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = cookies.get("token");
      const response = await axios.post(
        'http://localhost:5000/api/import-Sujet', 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      getApprovedSujets();
      setUploadMessage({ 
        type: 'success', 
        text: response.data?.message || "Données importées avec succès!" 
      });
      setShowUpload(false);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      let errorMsg = "Erreur lors de l'importation";
      if (error.response) {
        errorMsg = error.response.data.message || error.response.statusText;
      } else if (error.request) {
        errorMsg = "Aucune réponse du serveur";
      }
      setUploadMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = cookies.get("token");
      const response = await axios.get('http://localhost:5000/api/export', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.headers['content-type'] !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        throw new Error('Le fichier n\'est pas un fichier Excel');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sujets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'exportation des sujets :", error);
      setUploadMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de l\'exportation.' 
      });
    }
  };

  if (loading) return <Layout title="Liste des sujets"><p>Chargement...</p></Layout>;

  return (
    <Layout title="Gestion des sujets">
      <div className="ml-4 mr-4 mt-4 mb-4">
        <div className="flex flex-col items-end mb-6">
          <div className="flex justify-end w-full mb-3">
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors"
              >
                <DownloadIcon className="mr-2" />
                Exporter
              </button>
              <button 
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors"
              >
                <UploadIcon className="mr-2" />
                {showUpload ? 'Annuler' : 'Importer'}
              </button>
              <Link
                href="/users/createSuj"
                className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
              >
                <AddIcon className="mr-2" />
                Ajouter un sujet
              </Link>
              <button
  onClick={deleteRejectedSujets}
  className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-red-600 hover:bg-red-700 transition-colors ml-4"
>
  <DeleteIcon className="mr-2" />
  Supprimer les sujets rejetés
</button>
            </div>
          </div>

          {showUpload && (
            <div className="flex justify-end w-full">
              <FileUpload 
                onUpload={handleUpload}
                title="Importer les informations des sujets"
                accept=".xlsx, .xls"
                compact={true}
              />
            </div>
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Sujets approuvés" value="approved" />
            <Tab label="Sujets en attente" value="pending" />
          </Tabs>
        </Box>

        {tabValue === 'approved' ? (
          <DataTable
            headers={["ID", "Titre", "Année", "Actions"]}
            data={sujets}
            searchPlaceholder="Rechercher un sujet..."
            searchKeys={["titre", "annee"]}
            renderRow={(sujet, index) => {
              const isDisabled = sujet.annee !== currentYear;
              return (
                <tr
                  key={sujet.idSujet}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="p-4 text-gray-800">{sujet.idSujet}</td>
                  <td className="p-4 text-gray-800">{sujet.titre}</td>
                  <td className="p-4 text-gray-800">{sujet.annee}</td>
                  <td className="p-4 text-center flex justify-center space-x-3">
                    <Link href={`/users/editSuj/${sujet.idSujet}`}>
                      <button 
                        className={`text-blue-500 transition duration-200 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700'
                        }`}
                        disabled={isDisabled}
                      >
                        <EditIcon />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteSujet(sujet.idSujet)}
                      className={`text-red-500 transition duration-200 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'
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
        ) : (
          <DataTable
            headers={["ID", "Titre", "Année", "Actions"]}
            data={pendingSujets}
            searchPlaceholder="Rechercher un sujet en attente..."
            searchKeys={["titre", "annee"]}
            renderRow={(sujet, index) => (
              <tr key={sujet.idSujet} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="p-4">{sujet.idSujet}</td>
                <td className="p-4">{sujet.titre}</td>
                <td className="p-4">{sujet.annee}</td>
                <td className="p-4 flex justify-center space-x-3">
                  <button 
                    onClick={() => handleStatusUpdate(sujet.idSujet, 'approved')}
                    className="text-green-500 hover:text-green-700"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(sujet.idSujet, 'rejected')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Rejeter
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </Layout>
  );
}