"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------

router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        res.status(501).send();
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(404).send("doctor not found")
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        res.status(501).send();
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        res.status(501).send();
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Companion.find({ doctors: { $elemMatch: { $eq: req.params.id } } })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send("companions not found");
            });
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({ doctors: { $elemMatch: { $eq: req.params.id } } })
        .then(companions => {
            for (var companion of companions) {
                // if one companion not alive
                if (!companion.alive) {
                    res.status(200).send(false);
                    return
                }
            }
            res.status(200).send(true);
        })
        .catch(err => {
            res.status(404).send("invalid parent");
            return
        });
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        res.status(501).send();
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        var companionList = []

        Companion.find({})
            .then((companions) => {
                // go through each companion
                for (var companion of companions) {
                    // if they travelled with more than 1
                    if (companion.doctors.length >= 2){
                        companionList.push(companion)
                    }
                }
                res.status(200).send(companionList);
            })
            .catch(err => {
                res.status(404).send("companions not found")
            });

        
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(404).send("companion not found")
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        res.status(501).send();
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        res.status(501).send();
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        var doctors = []

        Companion.findById(req.params.id)
            .then(async (companion) => {
                for (var docID of companion.doctors){
                    await Doctor.findById(docID)
                        .then(doc => {
                            doctors.push(doc)
                        })
                }
            })
            .then(() => {
                res.status(200).send(doctors)
            })
            .catch(err => {
                res.status(404).send("companion not found")
            });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);

        var friendList = []
        // get the companion
        Companion.findById(req.params.id)
            .then(async (companion) => {
                // get all potential friends
                await Companion.find( { id: { $ne: req.params.id } } )
                    .then(friends => {
                        // go through each potential friend
                        for (var friend of friends) {
                            // make sure no double count
                            if (friend._id == req.params.id) {
                                continue
                            }
                            // if they share at least one season
                            if (companion.seasons.some(r => friend.seasons.includes(r))) {
                                friendList.push(friend)
                            }
                        }
                    })
                    .then(() => {
                        res.status(200).send(friendList)
                    })
            })
            .catch(err => {
                res.status(404).send("companion not found")
            });
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;