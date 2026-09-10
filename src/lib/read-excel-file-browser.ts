import readSheet from 'read-excel-file/browser';

/**
 * Compatibility adapter for the customer Quick Order importer.
 * The package exposes the browser worksheet reader as its default export.
 * Keeping it behind this adapter prevents the UI from coupling to the package API.
 */
export default readSheet;
