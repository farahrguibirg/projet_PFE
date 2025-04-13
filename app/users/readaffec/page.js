'use client';

import Link from 'next/link';
import { AssignmentInd as AssignmentIndIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import Layout from "../../components/Layout";

export default function ListGroupe() {
  return (
    <Layout>
      {/* Titre de la page - couleur modifiée en #b17a56 */}
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-[#b17a56]
        underline ">Affectation tuteur et sujet</h1>
      </div>

      {/* Section des cartes avec couleurs ajustées */}
      <div className="flex-1 flex flex-col items-center justify-center p-40">
        <div className="flex space-x-14">
          {/* Carte affectation manuelle */}
          <Link href="/affectation">
            <div className="flex flex-col items-center justify-center bg-white border border-[#d4b9a1] rounded-2xl p-12 hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer w-96 h-96">
              <div className="bg-[#f0e4d8] p-8 rounded-full">
                <AssignmentIndIcon className="text-[#b17a56] text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-[#6e4c34] mt-8">Affectation manuelle</h2>
            </div>
          </Link>

          {/* Carte affectation automatique */}
          <Link href="/affectationauto">
            <div className="flex flex-col items-center justify-center bg-white border border-[#d4b9a1] rounded-2xl p-12 hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer w-96 h-96">
              <div className="bg-[#f0e4d8] p-8 rounded-full">
                <AutoAwesomeIcon className="text-[#b17a56] text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-[#6e4c34] mt-8">Affectation automatique</h2>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}