const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

/**
 * Recherche un utilisateur par son email.
 * @param {string} email - Email de l'utilisateur
 * @param {Function} callback - Callback(err, user)
 * @return {void}
 */
function findByEmail(email, callback) {
  db.get("SELECT * FROM utilisateurs WHERE email = ?", [email], (err, row) => {
    callback(err, row || null)
  })
}

/**
 * Crée un nouvel utilisateur en base.
 * @param {Object} data - Données utilisateur (prenom, nom, email, etc.)
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function createUser(data, callback) {
  const {
    prenom,
    nom,
    email,
    mot_de_passe,
    role,
    adresse,
    telephone
  } = data

  const date_inscription = new Date().toISOString()
  const actif = 1

  db.run(
    `INSERT INTO utilisateurs
    (prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif],
    (err) => callback(err)
  )
}

/**
 * Récupère tous les utilisateurs.
 * @param {Function} callback - Callback(err, users)
 * @return {void}
 */
function findAll(callback) {
  db.all("SELECT * FROM utilisateurs ORDER BY role ASC, nom ASC, prenom ASC", [], (err, rows) => callback(err, rows))
}

/**
 * Met à jour un utilisateur.
 * @param {number} id - Identifiant utilisateur
 * @param {Object} data - Nouvelles données
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function update(id, data, callback) {
  const { prenom, nom, email, adresse, telephone } = data
  db.run(
    `UPDATE utilisateurs SET prenom = ?, nom = ?, email = ?, adresse = ?, telephone = ? WHERE id = ?`,
    [prenom, nom, email, adresse, telephone, id],
    callback
  )
}

/**
 * Supprime un utilisateur de la base.
 * @param {number} id - Identifiant utilisateur
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function remove(id, callback) {
  db.run("DELETE FROM utilisateurs WHERE id = ?", [id], (err) => callback(err))
}

module.exports = {
  findByEmail,
  createUser,
  findAll,
  remove,
  update
}
