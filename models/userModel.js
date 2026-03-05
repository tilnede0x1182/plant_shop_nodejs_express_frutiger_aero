const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

/**
 * Recherche un utilisateur par son email.
 *
 * @param email string Email de l'utilisateur
 * @param callback Function Callback(err, user)
 * @return void
 */
function findByEmail(email, callback) {
  db.get("SELECT * FROM utilisateurs WHERE email = ?", [email], (err, row) => {
    callback(err, row || null)
  })
}

/**
 * Cree un nouvel utilisateur en base.
 *
 * @param data Object Donnees utilisateur (prenom, nom, email, etc.)
 * @param callback Function Callback(err)
 * @return void
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
 * Recupere tous les utilisateurs.
 *
 * @param callback Function Callback(err, users)
 * @return void
 */
function findAll(callback) {
  db.all("SELECT * FROM utilisateurs ORDER BY role ASC, nom ASC, prenom ASC", [], (err, rows) => callback(err, rows))
}

/**
 * Met a jour un utilisateur.
 *
 * @param id number Identifiant utilisateur
 * @param data Object Nouvelles donnees
 * @param callback Function Callback(err)
 * @return void
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
 *
 * @param id number Identifiant utilisateur
 * @param callback Function Callback(err)
 * @return void
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
