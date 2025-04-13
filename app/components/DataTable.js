// components/DataTable.js
'use client';

import { useState, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  ChevronLeft, 
  ChevronRight,
  FilterList,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

export default function DataTable({
  headers,
  data,
  renderRow,
  searchPlaceholder = "Search...",
  searchKeys = [],
  sortable = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const currentYear = new Date().getFullYear().toString();
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [showFilter, setShowFilter] = useState(false);

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filtrage des données (identique à l'original)
  const filteredData = useMemo(() => {
    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
      && (item.annee ? item.annee.toString() === yearFilter : true)
    ));
  }, [data, searchQuery, yearFilter, searchKeys]);

  // Tri des données - version identique à l'original
  const sortedData = useMemo(() => {
    const sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        // Version simplifiée comme dans l'original
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Pagination (identique à l'original)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Fonction de tri - version identique à l'original
  const requestSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset à la première page comme dans l'original
  };

  // Icônes de tri - version identique à l'original
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FilterList className="ml-1 text-[#d4b9a1]" fontSize="small" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpward className="ml-1 text-[#dfe1e2]" fontSize="small" /> 
      : <ArrowDownward className="ml-1 text-[#dfe1e2]" fontSize="small" />;
  };

  // Pagination - version identique à l'original
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 text-sm rounded-lg border transition-all ${
              currentPage === i
                ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Première page
      pageNumbers.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 text-sm rounded-lg border ${
            currentPage === 1
              ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
              : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
          }`}
        >
          1
        </button>
      );

      // Points de suspension ou pages intermédiaires
      if (currentPage > 3) {
        pageNumbers.push(<span key="left-ellipsis" className="px-1 text-[#6e4c34]">...</span>);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 text-sm rounded-lg border ${
              currentPage === i
                ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="right-ellipsis" className="px-1 text-[#6e4c34]">...</span>);
      }

      // Dernière page
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 text-sm rounded-lg border ${
            currentPage === totalPages
              ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
              : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };

  // Le reste du code reste exactement identique à votre version originale
  return (
    <div className="space-y-4">
      {/* Contrôles de recherche et pagination - identique à l'original */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-[#dfe1e2]" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-[#d4b9a1] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#dfe1e2] focus:border-[#dfe1e2] transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center bg-white border border-[#b17a56] px-4 py-2 rounded-lg hover:bg-[#ffffff] transition shadow-md text-[#b17a56]"
            >
              <FilterList className="mr-2 text-[#b17a56]" /> Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg p-4 rounded-lg border border-[#b17a56] z-50 w-48">
                <label className="block text-gray-700 mb-2">Select year:</label>
                <select
                  value={yearFilter}
                  onChange={handleYearChange}
                  className="border border-[#b17a56] p-2 rounded-lg w-full"
                >
                  {[...new Set(data.map((item) => item.annee?.toString()))]
                    .filter(year => year)
                    .map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#6e4c34]">Afficher:</span>
            <select
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              value={itemsPerPage}
              className="border border-[#d4b9a1] rounded-lg px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-[#b17a56] transition-all duration-200"
            >
              {[5, 10, 15, 20, 25].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span className="text-sm text-[#6e4c34]">entrées</span>
          </div>
        </div>
      </div>

      {/* Tableau - identique à l'original */}
      <div className="bg-white rounded-xl shadow-md border border-[#dfe1e2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#b17a56] text-[#dfe1e2]">
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    onClick={() => sortable && requestSort(searchKeys[index])}
                    className={`px-6 py-3 text-left text-sm font-medium uppercase tracking-wider ${
                      sortable ? 'cursor-pointer hover:bg-[#8c6244]' : ''
                    } transition-colors duration-150`}
                  >
                    <div className="flex items-center">
                      {header}
                      {sortable && getSortIcon(searchKeys[index])}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8d5c5]">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => renderRow(item, index))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-16 h-16 text-[#d4b9a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#6e4c34]">No data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - identique à l'original */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-[#f8f1ea] border-t border-[#d4b9a1]">
          <div className="mb-4 sm:mb-0 text-sm text-[#6e4c34]">
            Affichage de{indexOfFirstItem + 1}  à{Math.min(indexOfLastItem, sortedData.length)} sur  {sortedData.length} entrées
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-[#6e4c34]" />
            </button>
            
            {renderPageNumbers()}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-[#6e4c34]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}