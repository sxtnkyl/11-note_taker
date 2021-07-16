const express = require("express");
//DONT FORGET TO EXPORT router!
const router = express.Router();

const fs = require("fs");
const util = require("util");
const path = require("path");

const dbRelPath = "../db/db.json";
const dbPath = path.join(__dirname, dbRelPath);

//have to promisify DB actions to not render empty pages or use old data
//READFILE NOT READFILESYNC IT MATTERS
const asyncRead = util.promisify(fs.readFile);
const asyncWrite = util.promisify(fs.writeFileSync);

function returnData() {
  return asyncRead(dbPath, "utf8").then((data) => {
    //good practice to not directly mutate data
    let arr = [];
    let stuff = JSON.parse(data);
    //when working with results of promises, should use try-catch! promise return may not have succeeded
    try {
      arr = arr.concat(stuff);
    } catch (error) {
      //probs promise didnt return []
      console.log(error);
    }

    return arr;
  });
}

//at notes path- GET
router.get("/notes", (req, res) => {
  returnData()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => res.status(500).json(err));
});

//add note
router.post("/notes", (req, res) => {
  let noteObj = req.body;
  returnData()
    .then((data) => {
      let arr = [...data, noteObj];
      return arr;
    })
    .then((newArr) => {
      //not good practice- should next trycatch to check write
      asyncWrite(dbPath, JSON.stringify(newArr));
      return res.json(newArr);
    })
    .catch((err) => res.status(500).json(err));
});

// //remove note
router.delete("/notes/:id", (req, res) => {
  let param = req.params.id;
  //read db, find, delete, write db
  returnData()
    .then((data) => {
      let i = data.filter((obj) => obj.id !== param);
      return i;
    })
    .then((newArr) => {
      //same as line 51
      asyncWrite(dbPath, JSON.stringify(newArr));
      return res.json(newArr);
    });
});

module.exports = router;
