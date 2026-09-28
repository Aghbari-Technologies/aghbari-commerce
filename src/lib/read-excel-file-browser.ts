import { readSheet } from 'read-excel-file/universal';

/**
 * Compatibility adapter for the customer Quick Order importer.
 * read-excel-file v9 exposes `readSheet` as a named export; the Vite alias
 * keeps the existing application imports stable while this adapter provides
 * the row-array contract expected by the customer portal.
 */
export default readSheet;
