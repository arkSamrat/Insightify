import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import userdata from './Database/userData.js';
import dbConnect from './Database/connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import isLoggedIn from './Middleware/Authorization.js';
import axios from 'axios';







const app=express();
const port=3000;

    const __filename=fileURLToPath(import.meta.url);
    const __dirname=path.dirname(__filename);
    
    app.use(express.static(path.join(__dirname,'views')));
    app.use(express.urlencoded({extended:true}));

    app.use(cookieParser());

    dbConnect();
    

    app.get('/',(req,res)=>
{
    res.render('LandingPage.ejs');
    });


    app.get('/register',(req,res)=>
    {
        res.render('Register.ejs');
    });

    app.get('/home',isLoggedIn,(req,res)=>
    {
        res.render('home.ejs');
    })




    app.post('/register',async (req,res)=>
    {

        let {name,username,email,password}=req.body;

        if(!name || !username || !email|| !password) return res.send('<h1> Fill everyThing First</h1>')

            try{

                const pre_user=await userdata.findOne({email});

                if(pre_user) return res.status(500).render('/login');

                let salt=await bcrypt.genSalt(10);
                let hashed_password=await bcrypt.hash(password,salt);

                const new_user=await userdata.create(
                    {
                        name,
                        username,
                        password:hashed_password,
                        email
                    }
                );
                await new_user.save();
               return res.status(500).render('login.ejs');
            }
            catch(Error )
            {
                res.status(500).send('Cannot Get Register');
            }
    })

    app.get('/login',(req,res)=>
    {
        res.render('login.ejs');
    })
    
    app.post('/login',async (req,res)=>
    {
        let {email,password}=req.body;
        if(!email || !password) return res.render('login.ejs');

        try{

            let response=await userdata.findOne({email});
            if(!response)
            {
                // {want to make a error page}
                return res.render('Register.ejs');
            }
            let is_registered=await bcrypt.compare(password,response.password);

            if(is_registered)
            {
                req.user_email=email;
                //Later Updation
                let token=jwt.sign({email},"ArpanKheer");
                if(token)
                {
                    res.cookie('token',token,
                        {
                            httpOnly:true,
                            secure:true,
                            maxAge:3600000
                        }
                    );
                }
                return res.render('home.ejs');
            }
        }catch(Error)
        {
            return res.send('<h1>There is problem in logiing....</h1>')
        }
    });

    app.get('/logout',(req,res)=>
    {
        res.clearCookie('token');
        res.render('login.ejs');
    })

     app.get('/Evaluation',(req,res)=>
    {
        res.render('travel_chooser.ejs');
    })
    app.post('/predict', async (req, res) => {
        
        try {
            const data = req.body;
            
            const response = await axios.post('http://127.0.0.1:5000/predict', data);
            const prediction=response.data.prediction;
            res.render('will_purchase_travelling.ejs',{prediction});
          } catch (err) {
           // console.error(err.message);
            res.status(500).send('Prediction failed.');
          }
      });
      

    app.get('/disease_predictor',isLoggedIn,(req,res)=>
    {
       return res.render('Disease_predictor.ejs');
    });
    
    app.post('/predictionForm', async (req, res) => {
        
        try {
            let data = req.body;
            let gender=data.gender;
            if(gender=='Male') data.Gender=0;
            else data.Gender=1;
            //console.log(data)
            const response = await axios.post('http://127.0.0.1:5000/predict_disease', data);
            const prediction=response.data.prediction;
            
            res.render('have_disease.ejs',{prediction});
          } catch (err) {
           // console.log(err.message);
            res.status(500).send('Prediction failed.');
          }
      });
      



    app.get('/medicine_predictor',isLoggedIn,(req,res)=>
    {
        res.render('medicine_predict.ejs');
    })

    app.post('/medicine_predict',async(req,res)=>
    {
        let data=req.body;
        if(!data) return res.render('home.ejs');

        try{
            if(data.Gender=='Male') data.Gender=0;
            else data.Gender=1;
            const response=await axios.post('http://127.0.0.1:5000/predict_medicine', data);
            res.render('medicine_result.ejs',{prediction:response.data.prediction});
        }
        catch(Exception)
        {
            return res.send('Cannot Predict');
        }
        
    });


    app.get('/crowd_predictor',(req,res)=>
{
        res.render('CrowdPrediction.ejs')
})
app.post("/submit", async (req, res) => {

    try {

        const {
            Place,
            State,
            DateTime,
            Weather,
            Event,
            Region,
            Transportation_Type
        } = req.body;

        const response = await axios.post(
            "http://127.0.0.1:5000/predict_crowd",
            {
                Place,
                State,
                Date: DateTime,
                Weather,
                Event,
                Region,
                Transportation_Type
            }
        );
        console.log(response.data)
        res.render("crowd_result.ejs",{prediction:response.data.prediction});

    } catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }

});

    app.listen(port,()=>
    {
    console.log(`app is listenting at port ${port}`)
    })


