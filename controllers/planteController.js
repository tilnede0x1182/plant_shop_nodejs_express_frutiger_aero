const model = require("../models/planteModel")

/**
 * Récupère toutes les plantes de la base de données.
 *
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
function getAll(req, res) {
  model.getAll(function(err, plantes) {
    if (err) return res.status(500).json({ message: "Erreur lecture BDD" })
    res.json(plantes)
  })
}

/**
 * Récupère une plante par son identifiant.
 *
 * @param {Object} req - Requête Express avec req.params.id
 * @param {Object} res - Réponse Express
 */
function getById(req, res) {
  model.getById(req.params.id, function(err, plante) {
    if (err) return res.status(500).json({ message: "Erreur BDD" })
    if (!plante) return res.status(404).json({ message: "Plante non trouvée" })
    res.json(plante)
  })
}

/**
 * Crée une nouvelle plante en base de données.
 *
 * @param {Object} req - Requête Express avec req.body contenant les données
 * @param {Object} res - Réponse Express
 */
function create(req, res) {
  const plante = req.body

  if (!plante.nom || !plante.prix || !plante.stock) {
    return res.status(400).json({ message: "Champs requis manquants." })
  }

  model.create(plante, function(err, newPlante) {
    if (err) return res.status(500).json({ message: "Erreur insertion" })
    res.status(201).json(newPlante)
  })
}

/**
 * Met à jour une plante existante.
 *
 * @param {Object} req - Requête Express avec req.params.id et req.body
 * @param {Object} res - Réponse Express
 */
function update(req, res) {
  const plante = req.body
  model.update(req.params.id, plante, function(err) {
    if (err) return res.status(500).json({ message: "Erreur modification" })
    res.json(plante)
  })
}

/**
 * Supprime une plante de la base de données.
 *
 * @param {Object} req - Requête Express avec req.params.id
 * @param {Object} res - Réponse Express
 */
function remove(req, res) {
  model.remove(req.params.id, function(err) {
    if (err) return res.status(500).json({ message: "Erreur suppression" })
    res.status(204).send()
  })
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}
