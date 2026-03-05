const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../db/plantes.db");
const db = new sqlite3.Database(dbPath);

/**
 * Cree une nouvelle commande en base de donnees.
 *
 * @param userId number Identifiant de utilisateur
 * @param items Array Liste des items de la commande
 * @param totalPrice number Prix total de la commande
 * @param status string Statut de la commande
 * @param callback Function Callback(err, orderId)
 * @return void
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
 *
 * @param orderId number Identifiant de la commande
 * @param items Array Liste des items a inserer
 * @param callback Function Callback(err, orderId)
 * @return void
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
 *
 * @param planteId number Identifiant de la plante
 * @param quantite number Quantite a decrementer
 * @param callback Function Callback(err)
 * @return void
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
 *
 * @param userId number Identifiant utilisateur
 * @param isAdmin boolean True si administrateur
 * @param callback Function Callback(err, orders)
 * @return void
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
 *
 * @param orderId number Identifiant de la commande
 * @param callback Function Callback(err, items)
 * @return void
 */
function getOrderItems(orderId, callback) {
  db.all("SELECT * FROM order_items WHERE order_id = ?", [orderId], callback);
}

module.exports = {
  createOrder,
  getOrdersForUser,
  getOrderItems
};
