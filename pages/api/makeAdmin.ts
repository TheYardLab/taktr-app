// makeAdmin.js (Node.js example)
const admin = require("firebase-admin");

// Initialize with service account JSON
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const email = "mfurry@theyardlab.com";

admin.auth().getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`Admin role set for ${email}`);
  })
  .catch((error) => {
    console.error("Error setting admin claim:", error);
  });