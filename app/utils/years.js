// utils/years.js
export const getYearOptions = (yearsBack = 20, includeEmpty = true) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: yearsBack }, (_, i) => {
      const year = currentYear - i;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    });
  
    if (includeEmpty) {
      return [
        <option key="empty" value="" disabled>
          Sélectionnez une année
        </option>,
        ...years
      ];
    }
    return years;
  };