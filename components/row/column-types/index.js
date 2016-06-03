/**
 * This file exports templates for each of the column types
 * on the row creation forms. These components are called
 * as follows
 *
 * @example
 * <Component key={...} index={...} onColumnValueChange={...} column={...} />
 *
 * When you implement a new type of column, export it here
 * before you use it on the row create page.
 */
 
exports.string = require('./string.jsx');
exports.file   = require('./file.jsx');
