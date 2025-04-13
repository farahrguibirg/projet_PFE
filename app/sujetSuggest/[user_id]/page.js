'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import cookies from 'js-cookie';
import Layout from "../../components/Layout";

export default function ProposerSujet() {
  const { user_id } = useParams();
  const router = useRouter();
  const [newSujet, setNewSujet] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitSujet = async () => {
    if (!newSujet.trim()) {
      setSubmitMessage({ type: 'error', text: 'Veuillez entrer un titre pour le sujet' });
      return;
    }

    setLoading(true);
    try {
      const token = cookies.get("token");
      await axios.post(
        'http://localhost:5000/api/addSujet',
        { titre: newSujet, idEncadrant: user_id, isAdmin: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitMessage({ 
        type: 'success', 
        text: 'Sujet proposé avec succès! En attente de validation.' 
      });
      setNewSujet('');
      
      // Rediriger après un délai
      setTimeout(() => {
        router.push(`/users/EncadrantInterface/${user_id}`);
      }, 1500);
    } catch (err) {
      setSubmitMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md border border-[#d4b9a1]">
        <h1 className="text-2xl font-bold text-[#b17a56] mb-6 text-center">
          Proposer un Nouveau Sujet
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="sujet" className="block text-sm font-medium text-[#6e4c34] mb-1">
              Titre du sujet
            </label>
            <input
              id="sujet"
              type="text"
              value={newSujet}
              onChange={(e) => setNewSujet(e.target.value)}
              placeholder="Entrez le titre de votre sujet"
              className="w-full p-2 border border-[#d4b9a1] rounded-md focus:ring-[#b17a56] focus:border-[#b17a56]"
            />
          </div>
          
          <button
            onClick={handleSubmitSujet}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? 'bg-[#d4b9a1]' : 'bg-[#b17a56] hover:bg-[#8c6244]'
            } transition-colors`}
          >
            {loading ? 'Envoi en cours...' : 'Proposer le sujet'}
          </button>
          
          {submitMessage && (
            <div className={`mt-4 p-3 rounded-md ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {submitMessage.text}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}