const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const config = {
    apiKey: "AIzaSyC4oyRWNQNjSGuQ5i5T4z7bG7mqHasZuQ0",
    authDomain: "petsbook-fc7cc.firebaseapp.com",
    databaseURL: "https://petsbook-fc7cc.firebaseio.com",
    projectId: "petsbook-fc7cc",
    storageBucket: "petsbook-fc7cc.appspot.com",
    messagingSenderId: "415177281792",
    appId: "1:415177281792:web:e17305295286b7af93a3e5",
    measurementId: "G-L3XRC77DWG"
};

const app = require('express')();

const firebase = require('firebase');
firebase.initializeApp(config);

app.get('/yelps', (req, res) => {
    admin.firestore()
        .collection('Yelps')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let yelps = [];
            data.forEach(doc => {
                yelps.push({
                    yelpID: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(yelps);
        })
        .catch(err => console.error(err));
});

app.post('/yelp', (req, res) => {
    const newYelp = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin.firestore()
        .collection('Yelps')
        .add(newYelp)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        })
});

exports.api = functions.https.onRequest(app);