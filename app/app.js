const { MongoClient } = require('mongodb');

// URL de connexion à la base de données MongoDB
const url = 'mongodb://euro2024:euro2024@localhost:27018/';

// Nom de la base de données
const dbName = 'euro2024'; 

// Créer un nouveau client MongoDB
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Fonction pour effectuer des opérations après la connexion
async function run() {
  try {
    // Se connecter au client MongoDB
    await client.connect();

    console.log(' ------------ Connecté avec succès au serveur MongoDB ---------- ');

    // Sélectionner la base de données
    const db = client.db(dbName);
    // Récupérer le nombre d'équipes dans la collection "equipes"
    const equipesCollection = db.collection("contries");
    const nbEquipes = await equipesCollection.countDocuments({});
    console.log(`Nombre d'équipes : ${nbEquipes}`);

    // Récuperer le nombre d'équipe qualifiées en phase finale
    const equipeQualif = await equipesCollection.countDocuments({Playoff:""});
    console.log(`Nombre d'équipes qualifiées : ${equipeQualif}`);

    // Récuperer le nombre d'équipes qui jouent les barrages
    const equipeBarrage = await equipesCollection.countDocuments({ Playoff: {
        $exists: true,
        $ne: ""
    }});
    console.log(`Nombre d'équipes qui jouent les barrages : ${equipeBarrage}`);

     // recuperer les equipes du playoff A
     const equipePlayOffA = await equipesCollection.find({Playoff:"A"})
     .sort({Rang:-1}).limit(5).toArray();
     console.log("\nÉquipes du playoff A:");
     equipePlayOffA.forEach((equipe) => {
        console.log(`${equipe.CountryName}`
        )})
     
      // recuperer les equipes du playoff B
      const equipePlayOffB = await equipesCollection.find({Playoff:"B"})
      .sort({Rang:-1}).toArray();
      console.log("\nÉquipes du playoff B:");
      equipePlayOffB.forEach((equipe) => {
         console.log(`${equipe.CountryName}`
         )})

     // recuperer les equipes du playoff C
     const equipePlayOffC = await equipesCollection.find({Playoff:"C"})
     .sort({Rang:-1}).toArray();
     console.log("\nÉquipes du playoff C:");
     equipePlayOffC.forEach((equipe) => {
        console.log(`${equipe.CountryName}`
        )})

        // recuperer 3 equipes des playoff A B et C
        let allTeams= [...equipePlayOffA , ...equipePlayOffB, ...equipePlayOffC]

        // Mélanger de manière aléatoire la liste des noms d'équipes
            const nomsMelanges = allTeams.sort(() => Math.random() - 0.5);
        // on choisit 3 equipes 
        let chosenOne = [];
        for (let i = 0; i < 3; i++) {
            let randomIndex = Math.floor(Math.random() * nomsMelanges.length);
            chosenOne.push(nomsMelanges[randomIndex]);
            nomsMelanges.splice(randomIndex, 1);
            };
    // on affiche les 3 équiptes
    console.log('\nLes Trois équipes qualifiées à la suite du play0ffl :');
    chosenOne.forEach((team)=>{console.log(team.CountryName)})

    // Sélection aléatoire d'une équipe de chaque chapeau
    const equipeChapeau1 = await db.collection('chapeau1').aggregate([{ $sample: { size: 1 } }]).toArray();
    const equipeChapeau2 = await db.collection('chapeau2').aggregate([{ $sample: { size: 1 } }]).toArray();
    const equipeChapeau3 = await db.collection('chapeau3').aggregate([{ $sample: { size: 1 } }]).toArray();

    // Sélection aléatoire des équipes issues des matchs de barrage
    const equipesBarrage = await db.collection('matchs_barrage').aggregate([{ $sample: { size: 3 } }]).toArray();

    // Création des 6 groupes
    const groupes = [
        { nom: 'A', equipes: [equipeChapeau1[0], equipeChapeau2[0], equipeChapeau3[0], ...equipesBarrage] },
        { nom: 'B', equipes: [equipeChapeau1[0], equipeChapeau2[0], equipeChapeau3[0], ...equipesBarrage] },
        // Répétez le processus pour les groupes B, C, D, E, F en utilisant des équipes différentes
      ];
      await db.collection('nouvelle_collection_groupes').insertMany(groupes);
      console.log('\n Groupes créés et insérés avec succès dans la nouvelle collection');
      // le nombre de groupes
      const nbGroupes = groupes.length;
      console.log(`Nombre de groupes : ${nbGroupes}`);
      // Afficher les détails du groupe A
      console.log('\nDétail du groupe A :\n', groupes[0]);
    //Récupérer le nombre d'eregistrement

    // Création d'une collection dans la base de données permettant de constituer les groupes
    async function selectRandomTeams(chapeau) {
        const teams = await db.collection(chapeau).aggregate([{ $sample: { size: 1 } }]).toArray();
        return teams[0];
      }
      
      async function selectRandomBarrageTeams() {
        const barrageTeams = await db.chapeau4.aggregate([{ $sample: { size: 3 } }]).toArray();
        return barrageTeams;
      }
    // Effectuer des opérations avec la base de données ici

  } finally {
    // Fermer la connexion à la base de données après les opérations
    await client.close();
  }
}

// Appel de la fonction pour établir la connexion et exécuter les opérations
run().catch(console.error);


