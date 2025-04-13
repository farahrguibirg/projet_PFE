'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import FileUpload from "../../components/FileUpload";
import cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/navigation';

export default function ListEncadrant() {
  const [encadrants, setEncadrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const router = useRouter();
  const currentYear = new Date().getFullYear().toString(); // Added currentYear definition

  useEffect(() => {
    const token = cookies.get("token");

    if (!token || token === "undefined" || token === "null") {
      console.log("Aucun token trouvé ou token invalide.");
      cookies.remove("token");
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Token décodé :", decodedToken);

      if (decodedToken.role !== "responsableFiliere") {
        console.log("Accès refusé : rôle non autorisé.");
        cookies.remove("token");
        router.push("/");
        return;
      }

      console.log("Accès autorisé : utilisateur responsableFiliere.");
      getEncadrants();
    } catch (error) {
      console.log("Erreur lors du décodage du token :", error);
      cookies.remove("token");
      router.push("/");
    }
  }, [router]);

  const getEncadrants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/Encadrants');
      setEncadrants(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des encadrants :", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEncadrant = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet encadrant ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/deleteEncadrant/${id}`);
      getEncadrants();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'encadrant :", err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:5000/api/import-Encadrant', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      getEncadrants();
      setUploadMessage({ 
        type: 'success', 
        text: response.data?.message || "Données importées avec succès!" 
      });
      setShowUpload(false);
      setTimeout(() => setUploadMessage(null), 5000);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      const errorMsg = error.response?.data?.message || error.message || "Erreur lors de l'importation";
      setUploadMessage({ type: 'error', text: errorMsg });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const isCurrentYear = (encadrantYear) => {
    const yearNum = parseInt(encadrantYear, 10);
    return !isNaN(yearNum) && yearNum === parseInt(currentYear, 10);
  };

  if (loading) return <Layout title="Liste des encadrants"><p>Chargement...</p></Layout>;

  return (
    <Layout title="Liste des encadrants">
      <div className="ml-4 mr-4 mt-4 mb-4"> 
        <div className="flex justify-end items-center mb-6 space-x-3">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="btn-secondary flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <UploadIcon className="mr-2" />
            {showUpload ? 'Annuler' : 'Importer'}
          </button>

          <Link 
            href="/users/createEnca" 
            className="btn-flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
          >
            <AddIcon className="mr-2" />
            Ajouter un encadrant
          </Link>
        </div>

        {showUpload && (
          <div className="flex justify-end mb-6">
            <FileUpload 
              onUpload={handleUpload}
              title="Importer les informations des encadrants"
              accept=".xlsx, .xls"
              compact={true}
            />
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
          headers={["CIN", "Nom", "Prénom", "Email", "Mot de Passe", "Année", "Actions"]}
          data={encadrants}
          searchPlaceholder="Rechercher par nom, prénom ou email"
          searchKeys={["nom", "prenom", "email"]}
          renderRow={(encadrant, index) => {
            const isAllowed = isCurrentYear(encadrant.annee);
            
            return (
              <tr
                key={encadrant.idEncadrant}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4 text-gray-800">{encadrant.idEncadrant}</td>
                <td className="p-4 text-gray-800">{encadrant.nom}</td>
                <td className="p-4 text-gray-800">{encadrant.prenom}</td>
                <td className="p-4 text-gray-600">{encadrant.email}</td>
                <td className="p-4 text-gray-600">{encadrant.motDePasse}</td>
                <td className="p-4 text-gray-600">
                  <span className={isAllowed ? 'font-medium' : 'text-gray-600'}>
                    {encadrant.annee}
                  </span>
                </td>
                <td className="p-4 text-center flex justify-center space-x-3">
                  {isAllowed ? (
                    <>
                      <Link href={`/users/EditEncadrant/${encadrant.idEncadrant}`}>
                        <button className="text-blue-500 hover:text-blue-700 transition duration-200">
                          <EditIcon />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteEncadrant(encadrant.idEncadrant)}
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