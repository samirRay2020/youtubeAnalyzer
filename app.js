require('dotenv').config()
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express()
const cors = require('cors');
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());
const apiKey = process.env.APIKEY;
const mongoUrl = 'mongodb://localhost:27017/wordDB'

//connect mongoDB
mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
},err=>{
   if(err) console.log(err);
   console.log("Mongo Connected succesfully");
});

//schema for data
let wordSchema = new mongoose.Schema({
    like:[String],
    dislike:[String],
    count:Number,
    countneg:Number,
    status:Number
});

//initialize collection
const Words = new mongoose.model('words',wordSchema);

app.post('/', function (req, res) {

    const id = req.body.url.split("v=")[1];
    //youtube comment api
    const url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key="+apiKey+"&videoId="+id+"&maxResults=1000"
    
    let pos = 0,neg=0,overall=0,i,titr = 0,itr = 0;
    //get statistics
    axios.get("https://www.googleapis.com/youtube/v3/videos?id="+id+"&key="+apiKey+"&part=statistics")
                .then(response => {
             let stat = response.data.items[0].statistics;
         
             //get comments
         axios.get(url).then(async response => { 
        
            function func1(callback){
                for(i=0;i<response.data.items.length;i++){
                    let splittedData = response.data.items[i].snippet.topLevelComment.snippet.textDisplay.split(' ');
                            
                     titr += splittedData.length;   
                    for(let j=0;j<splittedData.length;j++){
                        //search in database        
                        Words.findOne({'like':splittedData[j]},async function(err,found){        
                            if(found) {   
                                pos++;
                                    callback({pos:pos,neg:neg});                      
                            }else if(!found){
                                    callback({});
                            }
                        });
                    
                        Words.findOne({'dislike':splittedData[j]},async function(err,found){                       
                         if(found) {
                            neg++;  
                            callback({pos:pos,neg:neg});
                         }else if(!found){
                             callback({});
                         }
                        
                        })
                    }
                } 
                
            }
           //call callback
           func1(async function(ans){            
                        itr++;  
                       if(ans.pos!=undefined && ans.neg!=undefined){ 
                            if(ans.pos>ans.neg){
                                overall = 50;   
                            }else 
                                overall = 0;
                        }
                            
                            if(titr*2 == itr){
                                if(stat.viewCount>1000000){
                                    overall+=25;
                                }
                                if(stat.likeCount>15000){
                                    overall+=25;
                                }
                                 //return the response
                                 if(overall==100) res.send("EXCELLENT");
                                 else if(overall==50 || overall==75) res.send("GOOD");
                                 else if(overall<50) res.send("BAD"); 
                            }    
              
                        });

                })
                .catch(error => {
                    console.log(error);
                });
            
    })
    .catch(error => {
         console.log(error);
    }); 
})
 
app.listen(3000);

