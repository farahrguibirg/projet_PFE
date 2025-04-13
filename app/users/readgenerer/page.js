'use client';

import Link from 'next/link';
import { Groups as GroupsIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import Layout from "../../components/Layout";

export default function ListGroupe() {
  return (
    <Layout>
      {/* Titre de la page - couleur modifiée en #b17a56 */}
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-[#b17a56] underline">Gestion des Groupes</h1>
      </div>

      {/* Conteneur principal pour le centrage */}
      <div className="flex-1 flex items-center justify-center p-40">
        {/* Conteneur des cartes avec espacement */}
        <div className="flex space-x-14">
          {/* Carte génération manuelle - couleurs ajustées */}
          <Link href="/geneman">
            <div className="flex flex-col items-center justify-center bg-white border border-[#d4b9a1] rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer w-96 h-96 text-center">
              <div className="bg-[#f0e4d8] p-6 rounded-full mb-6">
                <GroupsIcon className="text-[#b17a56] text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-[#6e4c34]">Générer manuellement</h2>
            </div>
          </Link>

          {/* Carte génération automatique - couleurs ajustées */}
          <Link href="/geneauto">
            <div className="flex flex-col items-center justify-center bg-white border border-[#d4b9a1] rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer w-96 h-96 text-center">
              <div className="bg-[#f0e4d8] p-6 rounded-full mb-6">
                <AutoAwesomeIcon className="text-[#b17a56] text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-[#6e4c34]">Générer automatiquement</h2>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}