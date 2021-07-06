const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

//  DATABASE CONNECTION AND SCHEMA
mongoose.connect("mongodb://localhost:27017/DoListDB",{useUnifiedTopology:true,useNewUrlParser:true});
const itemSchema = mongoose.Schema({name : String});
const Item = mongoose.model('Item',itemSchema);
const listSchema = mongoose.Schema({name: String, items: [itemSchema]});
const List = mongoose.model('List',listSchema);


app.get('/', (req,res) => {
    List.find( {} , (err,list) => {
        if(!err){
            res.render('home',{List:list,n:list.length});
        }
    });
});

app.post('/', (req,res) => {
    const ListName = req.body.newList;
    List.findOne( {name:ListName} , (err,list) => {
        if(err){
            console.log(err);
        }else{
            if(!list){
                const list = new List({
                    name : ListName,
                    items: []
                });
                list.save((err)=>{
                    if(err) {
                        res.render('error');
                    }
                });
            }
            res.redirect('/lists/'+ListName);
        }
    });
});


app.post('/delete', (req,res) => {
    const toBeDeleted = req.body.del;
    List.findByIdAndDelete( toBeDeleted , (err) => {
        if(!err){
            res.redirect('/');
        }
    });
});


app.get('/lists/:listName', (req,res) => {
    const ListName = req.params.listName;
    List.findOne({name:ListName},(err,list)=> {
        if(err){
            res.render('error');
        }else{
            if(list){
                res.render('list',{ListTitle:ListName,Items:list.items,n:list.items.length});
            }else{
                res.render('error');
            }
        }
    });
});

app.post('/lists/:listName', (req,res) => {
    const item = req.body.newitem;
    const listName = req.body.list;
    const newItem = new Item({name:item});
    List.findOne({name:listName},function(err,foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect('/lists/'+listName);
    })
});

app.post('/lists/delete/:listName', (req, res) => {
    const toBeDeleted = req.body.checkbox;
    const listName = req.params.listName;
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:toBeDeleted}}}, (err,list) => {
        if(!err)
        res.redirect('/lists/'+listName);
    });
});

app.listen(3000,function(){
    console.log("Server is running");
});
