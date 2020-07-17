const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello World");
});

exports.getYelps = functions.https.onRequest((req, res) => {
    admin.firestore().collection('Yelps').get()
        .then(data => {
            let yelps = [];
            data.forEach(doc => {
                yelps.push(doc.data());
            });
            return res.json(yelps);
        })
        .catch(err => console.error(err));
});

exports.createYelps = functions.https.onRequest((req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed' });
    }
    const newYelp = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin.firestore()
        .collection('Yelps')
        .add(newYelp)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.srror(err);
        })
});