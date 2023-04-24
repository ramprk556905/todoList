const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");
require("dotenv").config();

const app = express();
/*
var items =["Eat","Sleep"];
var workItems = [];
*/

mongoose.connect(process.env.MONGO_DB_URL);
//mongoose.connect("mongodb+srv://ramprk97:Rmkmr0418@cluster0.x5ouqrj.mongodb.net/toDoListDB", {useNewUrlParser: true})

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to toDo List!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema)
//Item.insertMany(defaultItems)
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

async function getItems() {

  const Items = await Item.find({});
  return Items;


}


app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function(result) {
        console.log("Successfuly created DB");
      }).catch(function(err) {
        console.log(err);
      })
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(err) {
      if (!err) {
        console.log("Sucessfully removed the item");
      }
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}}).then(function(err){
      if(!err){
      }
        res.redirect("/"+listName);
    })
  }

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }).then(function(foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  })
})

app.get("/work", function(req, res) {

  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  })

})

app.post("/work", function(req, res) {

  const item = req.body.newItem;
  workItems
})

app.get("/about", function(req, res) {
  res.render("about");
});
//const Port = process.env.PORT || 3000
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running in port 3000");
});
