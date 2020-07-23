const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/yelps', (req, res) => {
    admin.firestore().collection('Yelps').get()
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
            console.error(err);
        })
});

exports.api = functions.https.onRequest(app);