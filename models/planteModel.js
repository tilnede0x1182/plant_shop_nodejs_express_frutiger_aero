const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

/**
 * Récupère toutes les plantes de la base.
 * @param {Function} callback - Callback(err, rows)
 * @return {void}
 */
function getAll(callback) {
  db.all("SELECT * FROM plantes", [], function(err, rows) {
    callback(err, rows)
  })
}

/**
 * Récupère une plante par son identifiant.
 * @param {number} id - Identifiant de la plante
 * @param {Function} callback - Callback(err, row)
 * @return {void}
 */
function getById(id, callback) {
  db.get("SELECT * FROM plantes WHERE id = ?", [id], function(err, row) {
    callback(err, row)
  })
}

/**
 * Crée une nouvelle plante en base.
 * @param {Object} plante - Données de la plante
 * @param {Function} callback - Callback(err, plante)
 * @return {void}
 */
function create(plante, callback) {
  const stmt = "INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?, ?)"
  const params = [plante.id, plante.nom, plante.description, plante.prix, plante.categorie, plante.stock]
  db.run(stmt, params, function(err) {
    callback(err, plante)
  })
}

/**
 * Met à jour une plante existante.
 * @param {number} id - Identifiant de la plante
 * @param {Object} plante - Nouvelles données
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function update(id, plante, callback) {
  const stmt = "UPDATE plantes SET nom = ?, description = ?, prix = ?, categorie = ?, stock = ? WHERE id = ?"
  const params = [plante.nom, plante.description, plante.prix, plante.categorie, plante.stock, id]
  db.run(stmt, params, function(err) {
    callback(err)
  })
}

/**
 * Supprime une plante de la base de données.
 * @param {number} id - Identifiant de la plante
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function remove(id, callback) {
  db.run("DELETE FROM plantes WHERE id = ?", [id], function(err) {
    callback(err)
  })
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}
