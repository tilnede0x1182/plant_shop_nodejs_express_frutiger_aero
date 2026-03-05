const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

/**
 * Recupere toutes les plantes de la base.
 *
 * @param callback Function Callback(err, rows)
 * @return void
 */
function getAll(callback) {
  db.all("SELECT * FROM plantes", [], function(err, rows) {
    callback(err, rows)
  })
}

/**
 * Recupere une plante par son identifiant.
 *
 * @param id number Identifiant de la plante
 * @param callback Function Callback(err, row)
 * @return void
 */
function getById(id, callback) {
  db.get("SELECT * FROM plantes WHERE id = ?", [id], function(err, row) {
    callback(err, row)
  })
}

/**
 * Cree une nouvelle plante en base.
 *
 * @param plante Object Donnees de la plante
 * @param callback Function Callback(err, plante)
 * @return void
 */
function create(plante, callback) {
  const stmt = "INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?, ?)"
  const params = [plante.id, plante.nom, plante.description, plante.prix, plante.categorie, plante.stock]
  db.run(stmt, params, function(err) {
    callback(err, plante)
  })
}

/**
 * Met a jour une plante existante.
 *
 * @param id number Identifiant de la plante
 * @param plante Object Nouvelles donnees
 * @param callback Function Callback(err)
 * @return void
 */
function update(id, plante, callback) {
  const stmt = "UPDATE plantes SET nom = ?, description = ?, prix = ?, categorie = ?, stock = ? WHERE id = ?"
  const params = [plante.nom, plante.description, plante.prix, plante.categorie, plante.stock, id]
  db.run(stmt, params, function(err) {
    callback(err)
  })
}

/**
 * Supprime une plante de la base de donnees.
 *
 * @param id number Identifiant de la plante
 * @param callback Function Callback(err)
 * @return void
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
