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

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/yelps', (req, res) => {
    db
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

    db
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

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    let token, userId;
    db.doc(`/users/${newUser}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'This handle is already taken' });
            }
            else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' });
            }
            else {
                return res.status(500).json({ error: err.code });
            }
        })
})

exports.api = functions.https.onRequest(app);