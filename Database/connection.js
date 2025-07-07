import mongoose from 'mongoose'
 
let dbConnect = ()=>
{
    try{
        mongoose.connect('mongodb://127.0.0.1:27017/ForStartUp');
    }
    catch(Error)
    {
        console.log('Could Not Connect');
    }
}


export default dbConnect