import { readSheet } from 'read-excel-file/browser';

/**
 * Compatibility adapter for the customer Quick Order importer.
 * The application consumes one worksheet as row arrays; keeping the
 * package's named readSheet API behind this adapter avoids coupling the UI
 * to the package's multi-sheet default export.
 */
export default readSheet;
