'use strict';


const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/update',
    { useNewUrlParser: true, useUnifiedTopology: true });


const amroschema = new mongoose.Schema({
    label: String,
    image: String,
    ingredientLines: Array,
})
const amroModel = mongoose.model('ahmads', amroschema);

const server = express();
server.use(cors());
server.use(express.json());

const PORT = process.env.PORT;

server.get('/getData', getallDAta);
server.post('/sendData', sendDataTo);
server.get('/favoiterData', getfavoiterData);
server.delete('/deleteData/:id', deleteDatahandler);
server.put('/updatedata/:id', updatedataHander);


function getallDAta(req, res) {
    // console.log(req.query);
    const data = req.query.data;
    const url = `https://api.edamam.com/search?q=${data}&app_id=${process.env.FOOD_APP_ID}&app_key=${process.env.FOOD_APP_KEY}`;

    axios.get(url).then(result => {
        const recipeAray = result.data.hits.map((recipe, idx) => {
            // console.log(recipe);
            return new Recipe(recipe);
        })
        res.send(recipeAray);
    })
}
function sendDataTo(req, res) {

    const { label, image, ingredientLines } = req.body;
    const hello = new amroModel({
        label: label,
        image: image,
        ingredientLines: ingredientLines,
    })
    hello.save();

}
function getfavoiterData(req, res) {
    amroModel.find({}, (erro, data) => {
        res.send(data);
    })
}
function deleteDatahandler(req, res) {
    // console.log(req.params);
    const id = req.params.id;
    amroModel.remove({ _id: id }, (error, data) => {
        amroModel.find({}, (error, afterDelet) => {
            res.send(afterDelet);
        })
    })
}
function updatedataHander(req, res) {
    // console.log(req.body);
    const id = req.params.id;
    const { recipeName, recipeImage } = req.body;

    amroModel.findOne({ _id: id }, (error, data) => {
        data.label = recipeName,
            data.image = recipeImage,
            data.save().then(() => {
                amroModel.find({}, (error, finalData) => {
                    res.send(finalData);
                })
            })

    })

}







class Recipe {
    constructor(recipe) {
        this.label = recipe.recipe.label;
        this.image = recipe.recipe.image;
        this.ingredientLines = recipe.recipe.ingredientLines;

    }
}



server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})

