const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../db/plantes.db");
const db = new sqlite3.Database(dbPath);

/**
 * Cree une nouvelle commande en base de donnees.
 * @param {number} userId - Identifiant de utilisateur
 * @param {Array} items - Liste des items de la commande
 * @param {number} totalPrice - Prix total de la commande
 * @param {string} status - Statut de la commande
 * @param {Function} callback - Callback(err, orderId)
 * @return {void}
 */
function createOrder(userId, items, totalPrice, status, callback) {
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [userId, totalPrice, status, now, now],
    function(err) {
      if (err) {
        callback(err);
      } else {
        const orderId = this.lastID;
        insertOrderItems(orderId, items, callback);
      }
    }
  );
}

/**
 * Insere les items une commande en base.
 * @param {number} orderId - Identifiant de la commande
 * @param {Array} items - Liste des items a inserer
 * @param {Function} callback - Callback(err, orderId)
 * @return {void}
 */
function insertOrderItems(orderId, items, callback) {
  const now = new Date().toISOString();
  let remaining = items.length;
  let errorOccurred = false;

  if (remaining === 0) {
    return callback(null, orderId);
  }

  items.forEach(function(item) {
    const stmt = `
      INSERT INTO order_items (order_id, plante_id, quantite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(
      stmt,
      [orderId, item.id, item.quantite, now, now],
      function(err) {
        if (errorOccurred) return;
        if (err) {
          errorOccurred = true;
          return callback(err);
        } else {
          decrementPlanteStock(item.id, item.quantite, function(err2) {
            if (errorOccurred) return;
            if (err2) {
              errorOccurred = true;
              return callback(err2);
            }
            remaining -= 1;
            if (remaining === 0) {
              callback(null, orderId);
            }
          });
        }
      }
    );
  });
}

/**
 * Decremente le stock une plante apres commande.
 * @param {number} planteId - Identifiant de la plante
 * @param {number} quantite - Quantite a decrementer
 * @param {Function} callback - Callback(err)
 * @return {void}
 */
function decrementPlanteStock(planteId, quantite, callback) {
  const stmt = "UPDATE plantes SET stock = stock - ? WHERE id = ?";
  db.run(stmt, [quantite, planteId], function(err) {
    if (err) {
      return callback(err);
    }
    if (this.changes === 0) {
      return callback(null);
    }
    callback(null);
  });
}

/**
 * Recupere les commandes un utilisateur ou toutes si admin.
 * @param {number} userId - Identifiant utilisateur
 * @param {boolean} isAdmin - True si administrateur
 * @param {Function} callback - Callback(err, orders)
 * @return {void}
 */
function getOrdersForUser(userId, isAdmin, callback) {
  if (isAdmin) {
    db.all("SELECT * FROM orders ORDER BY created_at DESC", [], callback);
  } else {
    db.all("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId], callback);
  }
}

/**
 * Recupere les items une commande specifique.
 * @param {number} orderId - Identifiant de la commande
 * @param {Function} callback - Callback(err, items)
 * @return {void}
 */
function getOrderItems(orderId, callback) {
  db.all("SELECT * FROM order_items WHERE order_id = ?", [orderId], callback);
}

module.exports = {
  createOrder,
  getOrdersForUser,
  getOrderItems
};
