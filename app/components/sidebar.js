"use client";

import { useState, useEffect } from 'react';
import { 
  FaProjectDiagram, 
  FaClipboardList, 
  FaCheckCircle, 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaBars, 
  FaUserFriends, 
  FaSitemap,
  FaUsersCog 
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const Sidebar = ({ children }) => {
  const [isCoordinationOpen, setCoordinationOpen] = useState(false);
  const [isRepartitionOpen, setRepartitionOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const getUserInfo = () => {
      const token = cookies.get('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUserRole(decoded.role);
          if (decoded.user_id) {
            setUserId(decoded.user_id);
          } else if (decoded.userId) {
            setUserId(decoded.userId);
          }
        } catch (error) {
          console.error('Erreur lors du décodage du token:', error);
        }
      }
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    getUserInfo();
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCoordination = () => setCoordinationOpen(!isCoordinationOpen);
  const toggleRepartition = () => setRepartitionOpen(!isRepartitionOpen);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const isCoordinationAllowed = userRole === 'responsableFiliere';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white text-black transition-all duration-300 shadow-lg flex flex-col z-10`}
      >
        <div className="flex items-center justify-between p-4 mb-6">
          <div className="flex items-center">
            {isSidebarOpen ? (
              <Image
                src="/ESTSLOGO24.png"
                alt="School Logo"
                width={180}
                height={80}
                className="object-contain"
              />
            ) : (
              <Image
                src="/ESTSLOGO24.png"
                alt="School Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            )}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-gray-700" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className={`flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                <FaTachometerAlt className="text-gray-700" />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>

            {isCoordinationAllowed && (
              <>
                <li>
                  <button 
                    onClick={toggleCoordination}
                    className={`w-full flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}
                  >
                    <FaClipboardList className="text-gray-700" />
                    {isSidebarOpen && (
                      <>
                        <span className="ml-3 flex-1 text-left">Coordination</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${isCoordinationOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {isCoordinationOpen && isSidebarOpen && (
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>
                        <button 
                          onClick={toggleRepartition}
                          className="w-full flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors"
                        >
                          <FaSitemap className="text-gray-700" />
                          <span className="ml-3 flex-1 text-left">Répartition</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${isRepartitionOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isRepartitionOpen && (
                          <ul className="ml-6 mt-1 space-y-1">
                            <li>
                              <Link href="/users/readEtu" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                                <FaProjectDiagram className="text-gray-700" />
                                <span className="ml-3">Gestion Étudiants</span>
                              </Link>
                            </li>
                            <li>
                              <Link href="/users/readEnca" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                                <FaProjectDiagram className="text-gray-700" />
                                <span className="ml-3">Gestion Encadrants</span>
                              </Link>
                            </li>
                            <li>
                              <Link href="/users/readTute" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                                <FaProjectDiagram className="text-gray-700" />
                                <span className="ml-3">Gestion Tuteur</span>
                              </Link>
                            </li>
                            <li>
                              <Link href="/users/readSuj" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                                <FaProjectDiagram className="text-gray-700" />
                                <span className="ml-3">Gestion Sujet</span>
                              </Link>
                            </li>
                            <li>
                              <Link href="/users/readgenerer" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                                <FaProjectDiagram className="text-gray-700" />
                                <span className="ml-3">Gestion des groupes</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>

                      <li>
                        <Link href="/users/readaffec" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                          <FaUserFriends className="text-gray-700" />
                          <span className="ml-3">Affectation</span>
                        </Link>
                      </li>

                      <li>
                        <Link href="/users/compte" className="flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors">
                          <FaUsersCog className="text-gray-700" />
                          <span className="ml-3">Gestion des comptes</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}

            {userRole === 'tuteur' && userId && (
              <li>
                <Link href={`/users/Tutinterface/${userId}`} className={`flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <FaCheckCircle className="text-gray-700" />
                  {isSidebarOpen && <span className="ml-3">Consultation</span>}
                </Link>
              </li>
            )}

            {userRole === 'encadrant' && userId && (
              <li>
                <Link href={`/users/EncadrantInterface/${userId}`} className={`flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <FaCheckCircle className="text-gray-700" />
                  {isSidebarOpen && <span className="ml-3">Consultation</span>}
                </Link>
              </li>
            )}

            {userRole === 'etudiant' && userId && (
              <li>
                <Link href={`/users/Etinterface/${userId}`} className={`flex items-center p-3 rounded-lg hover:bg-[#1a4edbb2] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <FaCheckCircle className="text-gray-700" />
                  {isSidebarOpen && <span className="ml-3">Consultation</span>}
                </Link>
              </li>
            )}

            <li>
              <div className={`flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                <FaCheckCircle className="text-gray-700" />
                {isSidebarOpen && <span className="ml-3">Suivi</span>}
              </div>
            </li>

            <li>
              <div className={`flex items-center p-3 rounded-lg hover:bg-[#1a4edbb2] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
                <FaCheckCircle className="text-gray-700" />
                {isSidebarOpen && <span className="ml-3">Soutenance</span>}
              </div>
            </li>
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <Link href="/" className={`flex items-center p-3 rounded-lg hover:bg-[#D2B48C] transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <FaSignOutAlt className="text-gray-700" />
            {isSidebarOpen && <span className="ml-3">Déconnexion</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml' : 'ml'}`}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;