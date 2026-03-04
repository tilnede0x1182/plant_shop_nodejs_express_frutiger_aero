// # Importations
const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()
const { faker } = require("@faker-js/faker")
const bcrypt = require("bcryptjs")
const path = require("path")

const db = new sqlite3.Database(path.join(__dirname, "plantes.db"))

// # Variables globales
const NB_ADMINS = 3
const NB_USERS = 20
const NB_PLANTES = 30

const NOMS_PLANTES = [
	"Rose", "Tulipe", "Lavande", "Orchidée", "Basilic", "Menthe", "Pivoine", "Tournesol",
	"Cactus (Echinopsis)", "Bambou", "Camomille (Matricaria recutita)", "Sauge (Salvia officinalis)",
	"Romarin (Rosmarinus officinalis)", "Thym (Thymus vulgaris)", "Laurier-rose (Nerium oleander)",
	"Aloe vera", "Jasmin (Jasminum officinale)", "Hortensia (Hydrangea macrophylla)",
	"Marguerite (Leucanthemum vulgare)", "Géranium (Pelargonium graveolens)", "Fuchsia (Fuchsia magellanica)",
	"Anémone (Anemone coronaria)", "Azalée (Rhododendron simsii)", "Chrysanthème (Chrysanthemum morifolium)",
	"Digitale pourpre (Digitalis purpurea)", "Glaïeul (Gladiolus hortulanus)", "Lys (Lilium candidum)",
	"Violette (Viola odorata)", "Muguet (Convallaria majalis)", "Iris (Iris germanica)",
	"Lavandin (Lavandula intermedia)", "Érable du Japon (Acer palmatum)", "Citronnelle (Cymbopogon citratus)",
	"Pin parasol (Pinus pinea)", "Cyprès (Cupressus sempervirens)", "Olivier (Olea europaea)",
	"Papyrus (Cyperus papyrus)", "Figuier (Ficus carica)", "Eucalyptus (Eucalyptus globulus)",
	"Acacia (Acacia dealbata)", "Bégonia (Begonia semperflorens)", "Calathea (Calathea ornata)",
	"Dieffenbachia (Dieffenbachia seguine)", "Ficus elastica", "Sansevieria (Sansevieria trifasciata)",
	"Philodendron (Philodendron scandens)", "Yucca (Yucca elephantipes)", "Zamioculcas zamiifolia",
	"Monstera deliciosa", "Pothos (Epipremnum aureum)", "Agave (Agave americana)", "Cactus raquette (Opuntia ficus-indica)",
	"Palmier-dattier (Phoenix dactylifera)", "Amaryllis (Hippeastrum hybridum)", "Bleuet (Centaurea cyanus)",
	"Cœur-de-Marie (Lamprocapnos spectabilis)", "Croton (Codiaeum variegatum)", "Dracaena (Dracaena marginata)",
	"Hosta (Hosta plantaginea)", "Lierre (Hedera helix)", "Mimosa (Acacia dealbata)"
]

// # Fonctions utilitaires
/**
	Retourne le nom de la plante selon la logique globale
	@index : numéro de création
*/
function getNomPlante(index) {
	const taille = NOMS_PLANTES.length
	if (NB_PLANTES > taille) {
		return NOMS_PLANTES[index % taille] + " " + (Math.floor(index / taille) + 1)
	}
	return NOMS_PLANTES[index % taille]
}

/**
	Génère une plante à partir d'un index
	@index : numéro de création
*/
function generatePlante(index) {
	return {
		nom: getNomPlante(index),
		description: faker.lorem.sentence(),
		prix: faker.number.int({ min: 5, max: 50 }),
		categorie: faker.helpers.arrayElement(["intérieur", "extérieur"]),
		stock: faker.number.int({ min: 1, max: 30 })
	}
}

/**
	Insère un utilisateur en base
	@utilisateur : objet utilisateur
*/
function insertUtilisateur(utilisateur) {
	return new Promise((resolve, reject) => {
		db.run(
			"INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				utilisateur.prenom,
				utilisateur.nom,
				utilisateur.email,
				utilisateur.mot_de_passe,
				utilisateur.role,
				utilisateur.adresse,
				utilisateur.telephone,
				utilisateur.date_inscription,
				utilisateur.actif
			],
			err => (err ? reject(err) : resolve())
		)
	})
}

/**
	Insère une plante en base
	@plante : objet plante
*/
function insertPlante(plante) {
	return new Promise((resolve, reject) => {
		const stmt = db.prepare(
			"INSERT INTO plantes (nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?)"
		)
		stmt.run(
			[plante.nom, plante.description, plante.prix, plante.categorie, plante.stock],
			err => (err ? reject(err) : resolve())
		)
		stmt.finalize()
	})
}

/**
	Insère les administrateurs fixes
	@utilisateurs : tableau credentials pour le fichier
*/
async function insertFixedAdmins(utilisateurs) {
	for (let iterator = 1; iterator <= NB_ADMINS; iterator++) {
		const mot_de_passe = await bcrypt.hash("password", 10)
		const admin = {
			prenom: "Admin",
			nom: "Fixe" + iterator,
			email: `admin${iterator}@planteshop.com`,
			mot_de_passe,
			role: "admin",
			adresse: "1 rue des Admins",
			telephone: "0102030405",
			date_inscription: new Date().toISOString(),
			actif: 1
		}
		await insertUtilisateur(admin)
		utilisateurs.push({ role: "admin", username: admin.email, password: "password" })
	}
}

// # Main
async function main() {
	const utilisateurs = []

	// ## Nettoyage des tables
	await new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run("DELETE FROM plantes")
			db.run("DELETE FROM utilisateurs", err => (err ? reject(err) : resolve()))
		})
	})

	// ## Création administrateurs fixes
	await insertFixedAdmins(utilisateurs)

	// ## Création utilisateurs simples
	for (let iterator = 0; iterator < NB_USERS; iterator++) {
		const prenom = faker.person.firstName()
		const nom = faker.person.lastName()
		const email = faker.internet.email()
		const passwordClair = faker.internet.password()
		const mot_de_passe = await bcrypt.hash(passwordClair, 10)
		const adresse = faker.location.streetAddress() + ", " + faker.location.city()
		const telephone = faker.phone.number()
		const date_inscription = new Date().toISOString()
		const actif = 1
		const utilisateur = {
			prenom,
			nom,
			email,
			mot_de_passe,
			role: "user",
			adresse,
			telephone,
			date_inscription,
			actif
		}
		await insertUtilisateur(utilisateur)
		utilisateurs.push({ role: "user", username: email, password: passwordClair })
	}

	// ## Génération fichier credentials
	let contenu = "Administrateurs :\n\n"
	contenu += utilisateurs.filter(u => u.role === "admin").map(u => u.username + " " + u.password).join("\n")
	contenu += "\n\nUsers :\n\n"
	contenu += utilisateurs.filter(u => u.role === "user").map(u => u.username + " " + u.password).join("\n")
	fs.writeFileSync(path.join(__dirname, "../users.txt"), contenu)

	// ## Ajout des plantes
	for (let iterator = 0; iterator < NB_PLANTES; iterator++) {
		const plante = generatePlante(iterator)
		await insertPlante(plante)
	}

	console.log("Données initiales générées avec succès.")
	console.log(NB_PLANTES + " plantes, " + NB_USERS + " users et " + NB_ADMINS + " admins insérés.")
	db.close()
}

// # Lancement
main()
